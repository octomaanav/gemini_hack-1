import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  derivedArtifacts,
  microsections,
  userChapters,
  users,
} from "../db/schema.js";
import { isAuthenticated } from "../middleware/auth.js";
import { sha256Text } from "../utils/hash.js";
import { enqueueJob } from "../utils/jobQueue.js";
import { makeArtifactKey, type ArtifactScopeType, type ArtifactType } from "../utils/artifacts/key.js";
import {
  parseChapterScopeId,
  parseLessonScopeId,
  resolveChapterIdForStructuredScope,
  resolveContentKeysForScope,
  resolveContentVersionForKeys,
} from "../utils/artifacts/scope.js";
import { getDownloadUrlForKey, storageConfig } from "../utils/storage.js";

const artifactsRouter = Router();
artifactsRouter.use(isAuthenticated);

type BraillePreviewBody = { scopeType: ArtifactScopeType; scopeId: string; locale: string };
type BrailleExportBody = { scopeType: "LESSON" | "CHAPTER"; scopeId: string; locale: string };

const normalizeLocale = (locale?: string) => {
  if (!locale) return "en-US";
  const cleaned = locale.trim();
  if (cleaned.toLowerCase().startsWith("es")) return "es-ES";
  if (cleaned.toLowerCase().startsWith("hi")) return "hi-IN";
  return cleaned;
};

const getAuthedUserId = async (req: any): Promise<string> => {
  const direct = req.user?.id;
  if (direct) return direct;
  const email = req.user?.email;
  if (!email) throw new Error("not_authenticated");
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!row?.id) throw new Error("not_authenticated");
  return row.id;
};

const hasChapterAccess = async (userId: string, chapterId: string): Promise<boolean> => {
  const [row] = await db
    .select({ id: userChapters.id })
    .from(userChapters)
    .where(and(eq(userChapters.userId, userId), eq(userChapters.chapterId, chapterId)))
    .limit(1);
  return !!row?.id;
};

const upsertArtifact = async (input: {
  scopeType: ArtifactScopeType;
  scopeId: string;
  contentVersion: number;
  locale: string;
  artifactType: ArtifactType;
  variantId?: string | null;
  createdByUserId: string;
  metaJson?: any;
}) => {
  const cacheKey = makeArtifactKey({
    scopeType: input.scopeType,
    scopeId: input.scopeId,
    version: input.contentVersion,
    locale: input.locale,
    artifactType: input.artifactType,
    variantId: input.variantId,
  });

  const [existing] = await db
    .select()
    .from(derivedArtifacts)
    .where(eq(derivedArtifacts.cacheKey, cacheKey))
    .limit(1);

  if (existing) {
    if (existing.status === "READY") {
      return existing;
    }
    const [updated] = await db
      .update(derivedArtifacts)
      .set({
        status: "PENDING",
        errorJson: null,
        updatedAt: new Date(),
      })
      .where(eq(derivedArtifacts.id, existing.id))
      .returning();
    return updated || existing;
  }

  const inserted = await db
    .insert(derivedArtifacts)
    .values({
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      contentVersion: input.contentVersion,
      locale: input.locale,
      artifactType: input.artifactType,
      variantId: input.variantId || null,
      cacheKey,
      status: "PENDING",
      metaJson: input.metaJson || {},
      createdByUserId: input.createdByUserId,
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) return inserted[0];

  const [row] = await db
    .select()
    .from(derivedArtifacts)
    .where(eq(derivedArtifacts.cacheKey, cacheKey))
    .limit(1);
  if (!row) throw new Error("artifact_upsert_failed");
  return row;
};

const enqueueArtifactJob = async (artifact: typeof derivedArtifacts.$inferSelect) => {
  const jobTypeByArtifact: Record<string, string> = {
    BRAILLE_PREVIEW: "BRAILLE_PREVIEW_GENERATE",
    BRAILLE_BRF: "BRAILLE_BRF_GENERATE",
  };
  const jobType = jobTypeByArtifact[artifact.artifactType];
  if (!jobType) return;

  const idempotencyKey = sha256Text([jobType, artifact.cacheKey].join("|"));
  await enqueueJob({
    jobType,
    contentKey: artifact.cacheKey,
    version: artifact.contentVersion,
    locale: artifact.locale,
    scope: artifact.scopeType,
    format: artifact.artifactType,
    idempotencyKey,
  });
};

artifactsRouter.post("/braille/preview", async (req, res) => {
  try {
    const body = req.body as BraillePreviewBody;
    const scopeType = body.scopeType;
    const scopeId = String(body.scopeId || "").trim();
    const locale = normalizeLocale(body.locale);
    if (!scopeType || !scopeId) return res.status(400).json({ error: "scopeType and scopeId are required" });

    const userId = await getAuthedUserId(req);
    const { contentKeys, chapterIdForAccess } = await resolveContentKeysForScope({ scopeType, scopeId });
    const contentVersion = await resolveContentVersionForKeys(contentKeys);
    if (contentVersion <= 0) return res.status(404).json({ error: "content_not_found" });

    // Access control: allow if the derived scope maps to a chapter user has selected.
    if (chapterIdForAccess) {
      const ok = await hasChapterAccess(userId, chapterIdForAccess);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    } else if (scopeType === "MICROSECTION") {
      const [ms] = await db
        .select({ chapterId: microsections.chapterId })
        .from(microsections)
        .where(eq(microsections.contentKey, scopeId))
        .limit(1);
      if (ms?.chapterId) {
        const ok = await hasChapterAccess(userId, ms.chapterId);
        if (!ok) return res.status(403).json({ error: "forbidden" });
      }
    }

    const artifact = await upsertArtifact({
      scopeType,
      scopeId,
      contentVersion,
      locale,
      artifactType: "BRAILLE_PREVIEW",
      createdByUserId: userId,
      metaJson: { contentKeys },
    });

    if (artifact.status !== "READY") {
      await enqueueArtifactJob(artifact);
    }

    return res.json({
      status: artifact.status,
      artifactId: artifact.id,
      cacheKey: artifact.cacheKey,
      artifact,
    });
  } catch (error) {
    console.error("braille preview error:", error);
    return res.status(500).json({ error: "failed_to_queue_braille_preview" });
  }
});

artifactsRouter.post("/braille/export", async (req, res) => {
  try {
    const body = req.body as BrailleExportBody;
    const scopeType = body.scopeType;
    const scopeId = String(body.scopeId || "").trim();
    const locale = normalizeLocale(body.locale);
    if (!scopeType || !scopeId) return res.status(400).json({ error: "scopeType and scopeId are required" });

    const userId = await getAuthedUserId(req);
    const { contentKeys, chapterIdForAccess } = await resolveContentKeysForScope({ scopeType, scopeId });
    const contentVersion = await resolveContentVersionForKeys(contentKeys);
    if (contentVersion <= 0) return res.status(404).json({ error: "content_not_found" });

    if (chapterIdForAccess) {
      const ok = await hasChapterAccess(userId, chapterIdForAccess);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    }

    const artifact = await upsertArtifact({
      scopeType,
      scopeId,
      contentVersion,
      locale,
      artifactType: "BRAILLE_BRF",
      createdByUserId: userId,
      metaJson: { contentKeys },
    });

    if (artifact.status !== "READY") {
      await enqueueArtifactJob(artifact);
    }

    return res.json({
      status: artifact.status,
      artifactId: artifact.id,
      cacheKey: artifact.cacheKey,
      artifact,
    });
  } catch (error) {
    console.error("braille export error:", error);
    return res.status(500).json({ error: "failed_to_queue_braille_export" });
  }
});

artifactsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = await getAuthedUserId(req);
    const [artifact] = await db.select().from(derivedArtifacts).where(eq(derivedArtifacts.id, id)).limit(1);
    if (!artifact) return res.status(404).json({ error: "not_found" });

    // Basic access control: creator always allowed; otherwise chapter access for MICROSECTION.
    if (artifact.createdByUserId && artifact.createdByUserId === userId) {
      // ok
    } else if (artifact.scopeType === "MICROSECTION") {
      const [ms] = await db
        .select({ chapterId: microsections.chapterId })
        .from(microsections)
        .where(eq(microsections.contentKey, artifact.scopeId))
        .limit(1);
      if (ms?.chapterId) {
        const ok = await hasChapterAccess(userId, ms.chapterId);
        if (!ok) return res.status(403).json({ error: "forbidden" });
      }
    } else if (artifact.scopeType === "LESSON") {
      const parsed = parseLessonScopeId(artifact.scopeId);
      if (!parsed) return res.status(403).json({ error: "forbidden" });
      const chapterId = await resolveChapterIdForStructuredScope(parsed.classId, parsed.subjectSlug, parsed.chapterSlug);
      if (!chapterId) return res.status(403).json({ error: "forbidden" });
      const ok = await hasChapterAccess(userId, chapterId);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    } else if (artifact.scopeType === "CHAPTER") {
      const parsed = parseChapterScopeId(artifact.scopeId);
      if (!parsed) return res.status(403).json({ error: "forbidden" });
      const chapterId = await resolveChapterIdForStructuredScope(parsed.classId, parsed.subjectSlug, parsed.chapterSlug);
      if (!chapterId) return res.status(403).json({ error: "forbidden" });
      const ok = await hasChapterAccess(userId, chapterId);
      if (!ok) return res.status(403).json({ error: "forbidden" });
    }

    let downloadUrl: string | null = null;
    if (artifact.status === "READY" && artifact.s3Key) {
      try {
        downloadUrl = await getDownloadUrlForKey(artifact.s3Key, 300);
      } catch {
        downloadUrl = null;
      }
    }

    // If this artifact references multiple files (story slides/audio), attach signed URLs in response.
    const meta: any = artifact.metaJson || {};
    if (artifact.status === "READY" && storageConfig.provider === "s3" && Array.isArray(meta.slides)) {
      const enriched = [];
      for (const slide of meta.slides) {
        if (!slide || typeof slide !== "object") {
          enriched.push(slide);
          continue;
        }
        const obj: any = { ...slide };
        if (obj.imageKey) {
          obj.imageUrl = await getDownloadUrlForKey(String(obj.imageKey), 300);
        }
        if (obj.audioKey) {
          obj.audioUrl = await getDownloadUrlForKey(String(obj.audioKey), 300);
        }
        enriched.push(obj);
      }
      meta.slides = enriched;
    }

    return res.json({ artifact: { ...artifact, metaJson: meta }, downloadUrl });
  } catch (error) {
    console.error("artifact fetch error:", error);
    return res.status(500).json({ error: "failed_to_fetch_artifact" });
  }
});

export default artifactsRouter;
