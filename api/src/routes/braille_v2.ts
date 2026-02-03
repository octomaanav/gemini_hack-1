import { Router } from "express";
import { db } from "../db/index.js";
import { brailleExports, contentVersions } from "../db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import { enqueueJob } from "../utils/jobQueue.js";
import { sha256Text } from "../utils/hash.js";
import { normalizeLocale } from "./story.js";

const brailleV2Router = Router();

brailleV2Router.get("/:contentKey", async (req, res) => {
  const { contentKey } = req.params;
  const locale = normalizeLocale((req.query.locale as string) || "en");
  const versionParam = Number(req.query.version || 0);
  const scope = (req.query.scope as string) || "microsection";
  const format = (req.query.format as string) || "full";

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

  const [cached] = await db
    .select()
    .from(brailleExports)
    .where(and(
      eq(brailleExports.contentKey, contentKey),
      eq(brailleExports.version, canonical.version),
      eq(brailleExports.locale, locale),
      eq(brailleExports.scope, scope),
      eq(brailleExports.format, format)
    ))
    .limit(1);

  if (cached) {
    return res.json({
      contentKey,
      version: canonical.version,
      locale,
      scope,
      format,
      brailleText: cached.brailleText,
      cache: "ready",
    });
  }

  const idempotencyKey = sha256Text([
    "build_braille_export",
    contentKey,
    String(canonical.version),
    locale,
    scope,
    format,
    canonical.payloadHash,
  ].join("|"));

  await enqueueJob({
    jobType: "build_braille_export",
    contentKey,
    version: canonical.version,
    locale,
    scope,
    format,
    idempotencyKey,
  });

  return res.json({
    contentKey,
    version: canonical.version,
    locale,
    scope,
    format,
    cache: "queued",
  });
});

export default brailleV2Router;
