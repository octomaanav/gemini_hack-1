import { db } from "../db/index.js";
import {
  contentVersions,
  contentTranslations,
  storyPlans,
  storySlides,
  storyAudio,
  brailleExports,
  derivedArtifacts,
} from "../db/schema.js";
import { eq, and, desc, inArray } from "drizzle-orm";
import { claimJob, enqueueJob, markJobFailed, markJobSucceeded } from "../utils/jobQueue.js";
import { sha256Json, sha256Text } from "../utils/hash.js";
import { callGeminiJson, hasGeminiApiKey } from "../utils/gemini.js";
import { synthesizeSpeech } from "../utils/tts.js";
import { saveBufferFile } from "../utils/storage.js";
import { generateImage } from "../utils/imageGen.js";
import { convertMixedLesson } from "../utils/braille/parseLesson.js";
import { formatToBRF } from "../utils/braille/toBRF.js";
import { extractMicrosectionRawText } from "../utils/artifacts/textExtract.js";
import { makeArtifactKey } from "../utils/artifacts/key.js";
import { resolveContentKeysForScope } from "../utils/artifacts/scope.js";
import crypto from "node:crypto";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getCanonical = async (contentKey: string, version: number) => {
  const rows = await db
    .select()
    .from(contentVersions)
    .where(and(eq(contentVersions.contentKey, contentKey), eq(contentVersions.version, version)))
    .limit(1);
  return rows[0];
};

const getTranslation = async (contentKey: string, version: number, locale: string) => {
  const rows = await db
    .select()
    .from(contentTranslations)
    .where(and(
      eq(contentTranslations.contentKey, contentKey),
      eq(contentTranslations.version, version),
      eq(contentTranslations.locale, locale)
    ))
    .limit(1);
  return rows[0];
};

const buildStoryPlan = async (payload: any, locale: string) => {
  const prompt = `Create a story plan (max 8 slides) for this lesson. Return ONLY JSON.
Include fields: style, slides[{index, caption, imagePrompt, onScreenText}].
Locale: ${locale}

Payload:
${JSON.stringify(payload)}
`;
  return callGeminiJson(prompt);
};

const getDerivedArtifact = async (cacheKey: string) => {
  const [row] = await db
    .select()
    .from(derivedArtifacts)
    .where(eq(derivedArtifacts.cacheKey, cacheKey))
    .limit(1);
  return row;
};

const setArtifactFailed = async (id: string, errorJson: any) => {
  await db
    .update(derivedArtifacts)
    .set({
      status: "FAILED",
      errorJson,
      updatedAt: new Date(),
    })
    .where(eq(derivedArtifacts.id, id));
};

const setArtifactReady = async (id: string, update: Partial<typeof derivedArtifacts.$inferInsert>) => {
  await db
    .update(derivedArtifacts)
    .set({
      ...update,
      status: "READY",
      errorJson: null,
      updatedAt: new Date(),
    })
    .where(eq(derivedArtifacts.id, id));
};

const safeKeyPart = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "x";

const getBestPayloads = async (contentKeys: string[], version: number, locale?: string) => {
  if (contentKeys.length === 0) return [];
  const rows = await db
    .select()
    .from(contentVersions)
    .where(inArray(contentVersions.contentKey, contentKeys))
    .orderBy(desc(contentVersions.version));

  // Pick highest version <= target; fallback to highest overall for that key.
  const byKey = new Map<string, any[]>();
  for (const row of rows) {
    const arr = byKey.get(row.contentKey) || [];
    arr.push(row);
    byKey.set(row.contentKey, arr);
  }

  const out: Array<{ contentKey: string; version: number; payload: any; payloadHash: string }> = [];
  for (const key of contentKeys) {
    const candidates = byKey.get(key) || [];
    if (candidates.length === 0) continue;
    const preferred = candidates.find((c) => c.version <= version) || candidates[0];

    let payload = preferred.payloadJson;
    if (locale && locale !== preferred.canonicalLocale) {
      const translated = await getTranslation(key, preferred.version, locale);
      if (translated?.translatedPayloadJson) {
        payload = translated.translatedPayloadJson;
      }
    }
    out.push({ contentKey: key, version: preferred.version, payload, payloadHash: preferred.payloadHash });
  }
  return out;
};

const validateNemethSegments = (segments: Array<{ type: string; braille: string }>) => {
  const warnings: string[] = [];
  for (const seg of segments) {
    if (seg.type !== "math") continue;
    const b = seg.braille || "";
    if (!b.startsWith("⠸⠩") || !b.endsWith("⠸⠱")) {
      warnings.push("Nemeth delimiters missing on a math segment.");
    }
    if (b.length < 6) {
      warnings.push("Math segment braille output is unexpectedly short.");
    }
  }
  return { ok: warnings.length === 0, warnings };
};

const makeFallbackStoryPlan = (input: { seed: string; title: string; objectives: string[]; locale: string }) => {
  const slides = Array.from({ length: 6 }).map((_, i) => {
    const idx = i + 1;
    const objective = input.objectives[i % Math.max(input.objectives.length, 1)] || "Understand the concept";
    return {
      index: idx,
      objective,
      caption: `Slide ${idx}: ${objective}`.slice(0, 80),
      narration: `Let's learn: ${objective}.`,
      imagePrompt: `Kid-safe educational illustration. Seed ${input.seed}. Objective: ${objective}.`,
      onScreenText: "",
    };
  });
  return {
    storySeed: input.seed,
    locale: input.locale,
    slideCount: slides.length,
    title: input.title,
    scenes: slides,
  };
};

const makeSilentWav = (durationMs: number, sampleRate = 24000) => {
  const samples = Math.max(1, Math.floor((durationMs / 1000) * sampleRate));
  const dataSize = samples * 2; // 16-bit mono
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  const pcm = Buffer.alloc(dataSize); // silence
  return Buffer.concat([header, pcm]);
};

export const processJob = async (job: any) => {
  const { jobType, contentKey, version, locale, slideIndex } = job;
  // ---------------------------------------------------------------------------
  // v3 Derived Artifacts (BRAILLE_* + STORY_*)
  // ---------------------------------------------------------------------------
  if (
    jobType === "BRAILLE_PREVIEW_GENERATE" ||
    jobType === "BRAILLE_BRF_GENERATE" ||
    jobType === "STORY_PLAN_GENERATE" ||
    jobType === "STORY_SLIDES_GENERATE" ||
    jobType === "STORY_AUDIO_GENERATE"
  ) {
    const artifact = await getDerivedArtifact(contentKey);
    if (!artifact) return;
    if (artifact.status === "READY") return;

    try {
      // Resolve source content keys for the scope.
      const metaKeys = (artifact.metaJson as any)?.contentKeys || (artifact.metaJson as any)?.source?.contentKeys;
      const contentKeys: string[] = Array.isArray(metaKeys) ? metaKeys : (await resolveContentKeysForScope({
        scopeType: artifact.scopeType,
        scopeId: artifact.scopeId,
      } as any)).contentKeys;

      if (jobType === "BRAILLE_PREVIEW_GENERATE" || jobType === "BRAILLE_BRF_GENERATE") {
        const payloads = await getBestPayloads(contentKeys, artifact.contentVersion, artifact.locale);
        const sourceText = payloads.map((p) => extractMicrosectionRawText(p.payload)).join("\n\n").trim();
        const sourceHash = sha256Text(sourceText);

        const converted = await convertMixedLesson(sourceText);
        if (!converted.success) {
          throw new Error("braille_conversion_failed");
        }

        const validation = validateNemethSegments(converted.segments as any);

        if (jobType === "BRAILLE_PREVIEW_GENERATE") {
          await setArtifactReady(artifact.id, {
            metaJson: {
              ...(artifact.metaJson as any),
              contentKeys,
              sourceHash,
              validation,
              previewText: converted.fullBraille,
              segments: converted.segments,
            },
          });
          return;
        }

        const brfText = formatToBRF(converted.fullBraille);
        const safeScope = safeKeyPart(`${artifact.scopeType}_${artifact.scopeId}`);
        const key = `derived/${safeScope}/v${artifact.contentVersion}/${artifact.locale}/braille/export.brf`;
        const saved = await saveBufferFile(Buffer.from(brfText, "utf-8"), key, "text/plain; charset=utf-8");
        await setArtifactReady(artifact.id, {
          s3Bucket: saved.bucket || null,
          s3Key: saved.key,
          mimeType: saved.mimeType || "text/plain",
          sizeBytes: saved.sizeBytes || brfText.length,
          metaJson: {
            ...(artifact.metaJson as any),
            contentKeys,
            sourceHash,
            validation,
            publicUrl: saved.publicUrl,
          },
        });
        return;
      }

      if (jobType === "STORY_PLAN_GENERATE") {
        const payloads = await getBestPayloads(contentKeys, artifact.contentVersion, artifact.locale);
        const first = payloads[0];
        const title = String((first?.payload?.meta?.title) || "Lesson");
        const objectives = Array.isArray((first?.payload as any)?.learningObjectives)
          ? ((first?.payload as any).learningObjectives as string[]).slice(0, 8)
          : [];
        const seed = String((artifact.metaJson as any)?.seed?.variantSeed || (artifact.metaJson as any)?.seed?.baseSeed || "");

        let plan: any = null;
        let promptText: string | null = null;

        if (hasGeminiApiKey()) {
          const sourceText = payloads.map((p) => extractMicrosectionRawText(p.payload)).join("\n\n").slice(0, 6000);
          promptText = `You are a deterministic story compiler.
Seed: ${seed}
Locale: ${artifact.locale}

Build a story plan (JSON only) that teaches the lesson.
Return JSON with:
- storySeed
- slideCount (max 8)
- learningObjectives (array)
- scenes: [{ index, objective, caption, narration, imagePrompt, onScreenText }]

Lesson source text:
${JSON.stringify(sourceText)}
`;
          plan = await callGeminiJson<any>(promptText);
        }

        if (!plan) {
          plan = makeFallbackStoryPlan({ seed: seed || "0", title, objectives, locale: artifact.locale });
        }

        const planHash = sha256Json(plan);
        await setArtifactReady(artifact.id, {
          metaJson: {
            ...(artifact.metaJson as any),
            contentKeys,
            model: hasGeminiApiKey() ? "gemini" : "fallback",
            prompt: promptText,
            plan,
            planHash,
          },
        });

        // Chain: enqueue slides generation.
        const slidesKey = makeArtifactKey({
          scopeType: artifact.scopeType as any,
          scopeId: artifact.scopeId,
          version: artifact.contentVersion,
          locale: artifact.locale,
          artifactType: "STORY_SLIDES",
          variantId: artifact.variantId,
        });
        const slides = await getDerivedArtifact(slidesKey);
        if (slides && slides.status !== "READY") {
          await enqueueJob({
            jobType: "STORY_SLIDES_GENERATE",
            contentKey: slidesKey,
            version: artifact.contentVersion,
            locale: artifact.locale,
            scope: artifact.scopeType,
            format: "STORY_SLIDES",
            idempotencyKey: sha256Text(["STORY_SLIDES_GENERATE", slidesKey].join("|")),
          });
        }
        return;
      }

      if (jobType === "STORY_SLIDES_GENERATE") {
        // Find plan
        const planKey = makeArtifactKey({
          scopeType: artifact.scopeType as any,
          scopeId: artifact.scopeId,
          version: artifact.contentVersion,
          locale: artifact.locale,
          artifactType: "STORY_PLAN",
          variantId: artifact.variantId,
        });
        const planArtifact = await getDerivedArtifact(planKey);
        const plan = (planArtifact?.metaJson as any)?.plan;
        if (!planArtifact || planArtifact.status !== "READY" || !plan?.scenes) {
          throw new Error("plan_not_ready");
        }

        const safeScope = safeKeyPart(`${artifact.scopeType}_${artifact.scopeId}`);
        const slidesOut: any[] = [];
        const scenes = Array.isArray(plan.scenes) ? plan.scenes : [];
        const seed = String((planArtifact.metaJson as any)?.seed?.variantSeed || "");

        for (const scene of scenes.slice(0, 8)) {
          const idx = Number(scene.index) || (slidesOut.length + 1);
          const caption = String(scene.caption || `Slide ${idx}`);
          const rawPrompt = String(scene.imagePrompt || caption);
          const prompt = `Kid-safe educational comic illustration. No text. Seed ${seed}. ${rawPrompt}`;

          let mime = "image/svg+xml";
          let buf: Buffer;
          if (hasGeminiApiKey()) {
            const [imgB64] = await generateImage(prompt, 1);
            buf = Buffer.from(imgB64, "base64");
            mime = "image/png";
          } else {
            const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1280\" height=\"720\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0%\" stop-color=\"#0ea5e9\"/><stop offset=\"100%\" stop-color=\"#a78bfa\"/></linearGradient></defs><rect width=\"100%\" height=\"100%\" fill=\"url(#g)\"/><circle cx=\"220\" cy=\"180\" r=\"120\" fill=\"#ffffff22\"/><circle cx=\"1100\" cy=\"560\" r=\"180\" fill=\"#00000022\"/></svg>`;
            buf = Buffer.from(svg, "utf-8");
          }

          const key = `derived/${safeScope}/v${artifact.contentVersion}/${artifact.locale}/story/${artifact.variantId}/slides/slide_${String(idx).padStart(2, "0")}.${mime === "image/png" ? "png" : "svg"}`;
          const saved = await saveBufferFile(buf, key, mime);
          slidesOut.push({
            slideIndex: idx,
            caption,
            imageUrl: saved.publicUrl,
            imageKey: saved.key,
            imageMime: mime,
            checksum: sha256Text(buf.toString("base64")),
          });
        }

        await setArtifactReady(artifact.id, {
          metaJson: {
            ...(artifact.metaJson as any),
            slides: slidesOut,
            provider: { image: hasGeminiApiKey() ? "gemini-imagen" : "fallback" },
          },
        });

        // Chain: enqueue audio generation.
        const audioKey = makeArtifactKey({
          scopeType: artifact.scopeType as any,
          scopeId: artifact.scopeId,
          version: artifact.contentVersion,
          locale: artifact.locale,
          artifactType: "STORY_AUDIO",
          variantId: artifact.variantId,
        });
        const audioArtifact = await getDerivedArtifact(audioKey);
        if (audioArtifact && audioArtifact.status !== "READY") {
          await enqueueJob({
            jobType: "STORY_AUDIO_GENERATE",
            contentKey: audioKey,
            version: artifact.contentVersion,
            locale: artifact.locale,
            scope: artifact.scopeType,
            format: "STORY_AUDIO",
            idempotencyKey: sha256Text(["STORY_AUDIO_GENERATE", audioKey].join("|")),
          });
        }
        return;
      }

      if (jobType === "STORY_AUDIO_GENERATE") {
        const planKey = makeArtifactKey({
          scopeType: artifact.scopeType as any,
          scopeId: artifact.scopeId,
          version: artifact.contentVersion,
          locale: artifact.locale,
          artifactType: "STORY_PLAN",
          variantId: artifact.variantId,
        });
        const planArtifact = await getDerivedArtifact(planKey);
        const plan = (planArtifact?.metaJson as any)?.plan;
        if (!planArtifact || planArtifact.status !== "READY" || !plan?.scenes) {
          throw new Error("plan_not_ready");
        }

        const safeScope = safeKeyPart(`${artifact.scopeType}_${artifact.scopeId}`);
        const scenes = Array.isArray(plan.scenes) ? plan.scenes : [];
        const audioOut: any[] = [];

        for (const scene of scenes.slice(0, 8)) {
          const idx = Number(scene.index) || (audioOut.length + 1);
          const narration = String(scene.narration || scene.caption || `Slide ${idx}`);
          let buf: Buffer;
          let provider = "fallback";
          let durationMs = Math.max(3500, narration.split(/\s+/).filter(Boolean).length * 400);
          if (hasGeminiApiKey()) {
            buf = await synthesizeSpeech(narration, { languageCode: artifact.locale });
            provider = "gemini";
          } else {
            buf = makeSilentWav(durationMs);
          }

          const key = `derived/${safeScope}/v${artifact.contentVersion}/${artifact.locale}/story/${artifact.variantId}/audio/slide_${String(idx).padStart(2, "0")}.wav`;
          const saved = await saveBufferFile(buf, key, "audio/wav");
          audioOut.push({
            slideIndex: idx,
            narration,
            caption: String(scene.caption || narration),
            audioUrl: saved.publicUrl,
            audioKey: saved.key,
            mimeType: "audio/wav",
            durationMs,
            checksum: sha256Text(buf.toString("base64")),
          });
        }

        await setArtifactReady(artifact.id, {
          metaJson: {
            ...(artifact.metaJson as any),
            slides: audioOut,
            provider: { tts: hasGeminiApiKey() ? "gemini-tts" : "fallback" },
          },
        });
        return;
      }
    } catch (err: any) {
      await setArtifactFailed(artifact.id, { message: err?.message || String(err), jobType });
      throw err;
    }
  }

  if (jobType === "translate_content") {
    const canonical = await getCanonical(contentKey, version);
    if (!canonical) return;
    const prompt = `Translate the payload to ${locale}. Return ONLY JSON.
Payload:
${JSON.stringify(canonical.payloadJson)}
`;
    const translated = await callGeminiJson(prompt);
    const translatedHash = sha256Json(translated);
    await db
      .insert(contentTranslations)
      .values({
        contentKey,
        version,
        locale: locale!,
        translatedPayloadJson: translated,
        translatedHash,
        model: "gemini",
      })
      .onConflictDoNothing();
    return;
  }

  if (jobType === "build_story_plan") {
    const canonical = await getCanonical(contentKey, version);
    if (!canonical) return;
    const payload = locale && locale !== canonical.canonicalLocale
      ? (await getTranslation(contentKey, version, locale))?.translatedPayloadJson || canonical.payloadJson
      : canonical.payloadJson;
    const plan = await buildStoryPlan(payload, locale || canonical.canonicalLocale);
    const planHash = sha256Json(plan);
    await db
      .insert(storyPlans)
      .values({
        contentKey,
        version,
        locale: locale || canonical.canonicalLocale,
        planJson: plan,
        planHash,
        model: "gemini",
      })
      .onConflictDoNothing();

    for (const slide of plan.slides || []) {
      const promptHash = sha256Text(slide.imagePrompt || "");
      const captionHash = sha256Text(slide.caption || "");
      await db
        .insert(storySlides)
        .values({
          contentKey,
          version,
          locale: locale || canonical.canonicalLocale,
          slideIndex: slide.index,
          prompt: slide.imagePrompt || "",
          promptHash,
          caption: slide.caption || "",
          captionHash,
        })
        .onConflictDoNothing();
    }
    return;
  }

  if (jobType === "generate_story_image") {
    const [slide] = await db
      .select()
      .from(storySlides)
      .where(and(
        eq(storySlides.contentKey, contentKey),
        eq(storySlides.version, version),
        eq(storySlides.locale, locale!),
        eq(storySlides.slideIndex, slideIndex!)
      ))
      .limit(1);
    if (!slide || slide.imagePath) return;
    const [imgB64] = await generateImage(slide.prompt, 1);
    const key = `generated/${contentKey}/${version}/${locale}/story/slide_${slideIndex}.png`;
    const saved = await saveBufferFile(Buffer.from(imgB64, "base64"), key, "image/png");
    await db
      .update(storySlides)
      .set({
        imagePath: saved.publicUrl,
        imageMime: "image/png",
        imageHash: sha256Text(imgB64),
        updatedAt: new Date(),
      })
      .where(eq(storySlides.id, slide.id));
    return;
  }

  if (jobType === "generate_story_audio") {
    const [slide] = await db
      .select()
      .from(storySlides)
      .where(and(
        eq(storySlides.contentKey, contentKey),
        eq(storySlides.version, version),
        eq(storySlides.locale, locale!),
        eq(storySlides.slideIndex, slideIndex!)
      ))
      .limit(1);
    if (!slide) return;
    const audio = await synthesizeSpeech(slide.caption, { languageCode: locale! });
    const key = `generated/${contentKey}/${version}/${locale}/audio/slide_${slideIndex}.wav`;
    const saved = await saveBufferFile(audio, key);
    await db
      .insert(storyAudio)
      .values({
        contentKey,
        version,
        locale: locale!,
        slideIndex: slideIndex!,
        voiceId: "default",
        ttsProvider: "gemini",
        audioPath: saved.publicUrl,
        audioMime: "audio/wav",
        audioHash: sha256Text(audio.toString("base64")),
      })
      .onConflictDoNothing();
    return;
  }

  if (jobType === "build_braille_export") {
    const canonical = await getCanonical(contentKey, version);
    if (!canonical) return;
    const payload = locale && locale !== canonical.canonicalLocale
      ? (await getTranslation(contentKey, version, locale))?.translatedPayloadJson || canonical.payloadJson
      : canonical.payloadJson;
    const sourceText = typeof payload === "string" ? payload : JSON.stringify(payload);
    const braille = await convertMixedLesson(sourceText);
    const scope = job.scope || "microsection";
    const format = job.format || "full";
    const brfText = formatToBRF(braille.fullBraille || "");
    await db
      .insert(brailleExports)
      .values({
        contentKey,
        version,
        locale: locale || canonical.canonicalLocale,
        scope,
        format,
        brailleText: format === "brf" ? brfText : (braille.fullBraille || ""),
        brailleHash: sha256Text(format === "brf" ? brfText : (braille.fullBraille || "")),
      })
      .onConflictDoNothing();
    return;
  }
};

export const startWorkerLoop = async () => {
  while (true) {
    const job = await claimJob();
    if (!job) {
      await sleep(500);
      continue;
    }
    try {
      await processJob(job);
      await markJobSucceeded(job.id);
    } catch (error) {
      await markJobFailed(job.id, error instanceof Error ? error.message : String(error));
    }
  }
};
