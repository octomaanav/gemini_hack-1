import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/db/index.js";
import { enqueueJob, markJobFailed } from "../src/utils/jobQueue.js";
import { generationJobs } from "../src/db/schema.js";
import { eq, sql } from "drizzle-orm";

test("enqueueJob re-queues a failed idempotent job", async (t) => {
  if (!process.env.DATABASE_URL) {
    t.skip("DATABASE_URL not set");
    return;
  }
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    t.skip("DB not reachable");
    return;
  }
  const idempotencyKey = `test-idem-${Date.now()}`;
  const job = await enqueueJob({
    jobType: "BRAILLE_PREVIEW_GENERATE",
    contentKey: "lh:v3:test",
    version: 1,
    locale: "en-US",
    idempotencyKey,
  });
  await markJobFailed(job.id, "boom");

  const re = await enqueueJob({
    jobType: "BRAILLE_PREVIEW_GENERATE",
    contentKey: "lh:v3:test",
    version: 1,
    locale: "en-US",
    idempotencyKey,
  });

  const [row] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, re.id))
    .limit(1);

  assert.ok(row);
  assert.equal(row.status, "queued");
  assert.equal(row.error, null);
});
