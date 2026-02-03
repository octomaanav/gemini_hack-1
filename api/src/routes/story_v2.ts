import { Router } from "express";
import { db } from "../db/index.js";
import {
  storyPlans,
  storySlides,
  storyAudio,
  contentVersions,
} from "../db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import { enqueueJob } from "../utils/jobQueue.js";
import { sha256Text } from "../utils/hash.js";
import { normalizeLocale } from "./story.js";

const storyV2Router = Router();

const buildId = (parts: string[]) => sha256Text(parts.join("|"));

storyV2Router.get("/:contentKey", async (req, res) => {
  const { contentKey } = req.params;
  const locale = normalizeLocale((req.query.locale as string) || "en");
  const versionParam = Number(req.query.version || 0);

  const versions = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentKey, contentKey))
    .orderBy(desc(contentVersions.version))
    .limit(versionParam > 0 ? 1000 : 1);

  const canonical = versionParam > 0
    ? versions.find((row) => row.version === versionParam)
    : versions[0];

  if (!canonical) {
    return res.status(404).json({ error: "not_found" });
  }

  const [plan] = await db
    .select()
    .from(storyPlans)
    .where(and(
      eq(storyPlans.contentKey, contentKey),
      eq(storyPlans.version, canonical.version),
      eq(storyPlans.locale, locale)
    ))
    .limit(1);

  if (!plan) {
    await enqueueJob({
      jobType: "build_story_plan",
      contentKey,
      version: canonical.version,
      locale,
      idempotencyKey: buildId(["build_story_plan", contentKey, String(canonical.version), locale, canonical.payloadHash]),
    });
    return res.json({
      plan: null,
      slides: [],
      status: "queued",
      version: canonical.version,
      locale,
    });
  }

  const slides = await db
    .select()
    .from(storySlides)
    .where(and(
      eq(storySlides.contentKey, contentKey),
      eq(storySlides.version, canonical.version),
      eq(storySlides.locale, locale)
    ))
    .orderBy(storySlides.slideIndex);

  const audios = await db
    .select()
    .from(storyAudio)
    .where(and(
      eq(storyAudio.contentKey, contentKey),
      eq(storyAudio.version, canonical.version),
      eq(storyAudio.locale, locale)
    ));

  const audioByIndex = new Map<number, string>();
  audios.forEach((a) => {
    audioByIndex.set(a.slideIndex, a.audioPath || "");
  });

  const enriched = slides.map((slide) => ({
    index: slide.slideIndex,
    caption: slide.caption,
    imageUrl: slide.imagePath,
    audioUrl: audioByIndex.get(slide.slideIndex) || null,
  }));

  // Enqueue missing assets
  for (const slide of slides) {
    if (!slide.imagePath) {
      await enqueueJob({
        jobType: "generate_story_image",
        contentKey,
        version: canonical.version,
        locale,
        slideIndex: slide.slideIndex,
        idempotencyKey: buildId([
          "generate_story_image",
          contentKey,
          String(canonical.version),
          locale,
          String(slide.slideIndex),
          slide.promptHash,
        ]),
      });
    }
    if (!audioByIndex.get(slide.slideIndex)) {
      await enqueueJob({
        jobType: "generate_story_audio",
        contentKey,
        version: canonical.version,
        locale,
        slideIndex: slide.slideIndex,
        idempotencyKey: buildId([
          "generate_story_audio",
          contentKey,
          String(canonical.version),
          locale,
          String(slide.slideIndex),
          slide.captionHash,
          "default",
        ]),
      });
    }
  }

  res.json({
    plan: plan.planJson,
    slides: enriched,
    status: "ready",
    version: canonical.version,
    locale,
  });
});

export default storyV2Router;
