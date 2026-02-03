import { Router } from "express";
import { db } from "../db/index.js";
import { contentVersions, contentTranslations } from "../db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import { enqueueJob } from "../utils/jobQueue.js";
import { sha256Text } from "../utils/hash.js";

const contentRouter = Router();

const normalizeLocale = (locale?: string) => {
  if (!locale) return "en";
  const cleaned = locale.trim().toLowerCase();
  if (cleaned.startsWith("es")) return "es";
  if (cleaned.startsWith("hi")) return "hi";
  return "en";
};

contentRouter.get("/:contentKey", async (req, res) => {
  const { contentKey } = req.params;
  const locale = normalizeLocale(req.query.locale as string | undefined);
  const versionParam = Number(req.query.version || 0);

  const canonicalRows = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.contentKey, contentKey))
    .orderBy(desc(contentVersions.version))
    .limit(versionParam > 0 ? 1000 : 1);

  const canonical = versionParam > 0
    ? canonicalRows.find((row) => row.version === versionParam)
    : canonicalRows[0];

  if (!canonical) {
    return res.status(404).json({ error: "not_found" });
  }

  if (locale === canonical.canonicalLocale || locale === "en") {
    return res.json({
      payload: canonical.payloadJson,
      version: canonical.version,
      locale,
      cache: "canonical",
    });
  }

  const [translation] = await db
    .select()
    .from(contentTranslations)
    .where(and(
      eq(contentTranslations.contentKey, contentKey),
      eq(contentTranslations.version, canonical.version),
      eq(contentTranslations.locale, locale)
    ))
    .limit(1);

  if (translation) {
    return res.json({
      payload: translation.translatedPayloadJson,
      version: canonical.version,
      locale,
      cache: "translation",
    });
  }

  const idempotencyKey = [
    "translate_content",
    contentKey,
    canonical.version,
    locale,
    canonical.payloadHash,
  ].join("|");

  await enqueueJob({
    jobType: "translate_content",
    contentKey,
    version: canonical.version,
    locale,
    idempotencyKey: sha256Text(idempotencyKey),
  });

  return res.json({
    payload: canonical.payloadJson,
    version: canonical.version,
    locale,
    cache: "canonical_fallback",
    translationStatus: "queued",
  });
});

export default contentRouter;
