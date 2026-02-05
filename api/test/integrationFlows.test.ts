import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { db } from "../src/db/index.js";
import { seed } from "../src/db/seed.js";
import { seedLessons } from "../src/db/seedLessons.js";
import { claimJob, markJobFailed, markJobSucceeded } from "../src/utils/jobQueue.js";
import { processJob } from "../src/worker/index.js";
import { chapters, classes, curricula, gradeSubjects, lessons, subjects, userChapters, users } from "../src/db/schema.js";
import { and, eq, asc, sql } from "drizzle-orm";

const withTestAuth = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers || {});
  headers.set("x-test-user-email", "test@example.com");
  return { ...(init || {}), headers };
};

const drainJobs = async (max = 50) => {
  for (let i = 0; i < max; i++) {
    const job = await claimJob();
    if (!job) return;
    try {
      await processJob(job);
      await markJobSucceeded(job.id);
    } catch (e: any) {
      await markJobFailed(job.id, e?.message || String(e));
    }
  }
  throw new Error("job_drain_exceeded");
};

const getFixtureLesson = async () => {
  const [curr] = await db.select().from(curricula).where(eq(curricula.slug, "cbse")).limit(1);
  assert.ok(curr, "fixture curriculum cbse missing");
  const [cls] = await db
    .select()
    .from(classes)
    .where(and(eq(classes.curriculumId, curr.id), eq(classes.slug, "class-11")))
    .limit(1);
  assert.ok(cls, "fixture class-11 missing");
  const [sub] = await db.select().from(subjects).where(eq(subjects.slug, "physics")).limit(1);
  assert.ok(sub, "fixture subject physics missing");

  const [gs] = await db
    .select()
    .from(gradeSubjects)
    .where(and(eq(gradeSubjects.classId, cls.id), eq(gradeSubjects.subjectId, sub.id)))
    .limit(1);
  assert.ok(gs, "fixture gradeSubjects missing");

  const [ch] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.gradeSubjectId, gs.id))
    .orderBy(asc(chapters.sortOrder))
    .limit(1);
  assert.ok(ch, "fixture chapter missing");

  const [sec] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.chapterId, ch.id))
    .orderBy(asc(lessons.sortOrder))
    .limit(1);
  assert.ok(sec, "fixture section missing");

  const lessonScopeId = `lh:lesson:${cls.id}:physics:${ch.slug}:${sec.slug}`;
  const chapterScopeId = `lh:chapter:${cls.id}:physics:${ch.slug}`;
  return { cls, sub, gs, ch, sec, lessonScopeId, chapterScopeId };
};

test("integration: braille preview/export + story compile + voice command", async (t) => {
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
  // Ensure baseline data exists
  await seed();
  await seedLessons();

  // Ensure test user exists
  await db.delete(users).where(eq(users.email, "test@example.com"));
  const [user] = await db
    .insert(users)
    .values({ email: "test@example.com", name: "Test User", isProfileComplete: true, updatedAt: new Date() })
    .returning();

  const fixture = await getFixtureLesson();
  await db
    .insert(userChapters)
    .values({ userId: user.id, chapterId: fixture.ch.id })
    .onConflictDoNothing();

  const app = createApp();
  const server = await new Promise<import("node:http").Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Braille preview (lesson scope)
    {
      const r = await fetch(`${baseUrl}/api/artifacts/braille/preview`, withTestAuth({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scopeType: "LESSON", scopeId: fixture.lessonScopeId, locale: "en-US" }),
      }));
      assert.equal(r.status, 200);
      const j: any = await r.json();
      assert.ok(j.artifactId);
      await drainJobs();

      const g = await fetch(`${baseUrl}/api/artifacts/${j.artifactId}`, withTestAuth());
      assert.equal(g.status, 200);
      const gj: any = await g.json();
      assert.equal(gj.artifact.status, "READY");
      assert.ok(typeof gj.artifact.metaJson?.previewText === "string");
      assert.ok(gj.artifact.metaJson.previewText.length > 0);
    }

    // Braille export (lesson BRF)
    {
      const r = await fetch(`${baseUrl}/api/artifacts/braille/export`, withTestAuth({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scopeType: "LESSON", scopeId: fixture.lessonScopeId, locale: "en-US" }),
      }));
      assert.equal(r.status, 200);
      const j: any = await r.json();
      assert.ok(j.artifactId);
      await drainJobs();

      const g = await fetch(`${baseUrl}/api/artifacts/${j.artifactId}`, withTestAuth());
      const gj: any = await g.json();
      assert.equal(gj.artifact.status, "READY");
      assert.ok(gj.downloadUrl || gj.artifact.metaJson?.publicUrl);
    }

    // Story compile (worker-backed, deterministic fallback ok)
    {
      const r = await fetch(`${baseUrl}/api/story/compile`, withTestAuth({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId: fixture.lessonScopeId, locale: "en-US", reuseLatest: false }),
      }));
      assert.equal(r.status, 200);
      const j: any = await r.json();
      assert.ok(j.variantId);
      assert.ok(j.artifacts?.planId);
      await drainJobs(200);

      const variantsRes = await fetch(`${baseUrl}/api/story/variants?lessonId=${encodeURIComponent(fixture.lessonScopeId)}&locale=en-US`, withTestAuth());
      assert.equal(variantsRes.status, 200);
      const vj: any = await variantsRes.json();
      assert.ok(Array.isArray(vj.variants));
      assert.ok(vj.variants.length > 0);

      const selected = vj.variants.find((v: any) => v.variantId === j.variantId) || vj.variants[0];
      assert.ok(selected.slides?.id);
      const slidesRes = await fetch(`${baseUrl}/api/artifacts/${selected.slides.id}`, withTestAuth());
      const sj: any = await slidesRes.json();
      assert.equal(sj.artifact.status, "READY");
      assert.ok(Array.isArray(sj.artifact.metaJson?.slides));
      assert.ok(sj.artifact.metaJson.slides.length > 0);
    }

    // Voice command deterministic mapping
    {
      const r = await fetch(`${baseUrl}/api/voice/command`, withTestAuth({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: "focus mode on", locale: "en-US", context: { route: "/dashboard" } }),
      }));
      assert.equal(r.status, 200);
      const j: any = await r.json();
      assert.equal(j.action, "TOGGLE_ACCESSIBILITY");
      assert.equal(j.args.key, "focusMode");
      assert.equal(j.args.value, true);
    }
  } finally {
    server.close();
  }
});
