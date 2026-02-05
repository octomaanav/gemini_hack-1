import { db } from "../db/index.js";
import { generationJobs } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export interface EnqueueJobInput {
  jobType: string;
  contentKey: string;
  version: number;
  locale?: string;
  slideIndex?: number;
  scope?: string;
  format?: string;
  idempotencyKey: string;
}

export interface JobRecord {
  id: string;
  jobType: string;
  contentKey: string;
  version: number;
  locale: string | null;
  slideIndex: number | null;
  scope: string | null;
  format: string | null;
  status: JobStatus;
  idempotencyKey: string;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const enqueueJob = async (input: EnqueueJobInput) => {
  const existing = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.idempotencyKey, input.idempotencyKey))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(generationJobs)
    .values({
      jobType: input.jobType,
      contentKey: input.contentKey,
      version: input.version,
      locale: input.locale,
      slideIndex: input.slideIndex,
      scope: input.scope,
      format: input.format,
      status: "queued",
      idempotencyKey: input.idempotencyKey,
    })
    .returning();

  return created;
};

export const claimJob = async (jobType?: string): Promise<JobRecord | null> => {
  const where = jobType
    ? and(eq(generationJobs.status, "queued"), eq(generationJobs.jobType, jobType))
    : eq(generationJobs.status, "queued");
  const candidates = await db
    .select()
    .from(generationJobs)
    .where(where)
    .orderBy(generationJobs.createdAt)
    .limit(1);

  if (candidates.length === 0) return null;

  const job = candidates[0];
  const [updated] = await db
    .update(generationJobs)
    .set({ status: "running", updatedAt: new Date() })
    .where(eq(generationJobs.id, job.id))
    .returning();

  return (updated || job) as unknown as JobRecord;
};

export const markJobSucceeded = async (id: string) => {
  await db
    .update(generationJobs)
    .set({ status: "succeeded", updatedAt: new Date(), error: null })
    .where(eq(generationJobs.id, id));
};

export const markJobFailed = async (id: string, error: string) => {
  await db
    .update(generationJobs)
    .set({ status: "failed", updatedAt: new Date(), error })
    .where(eq(generationJobs.id, id));
};
