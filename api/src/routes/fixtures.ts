import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { chapters, classes, gradeSubjects, lessons, subjects, userChapters, users } from "../db/schema.js";

/**
 * Test-only endpoints used by integration/E2E tests.
 * Mounted at /api/test only when NODE_ENV === "test".
 */
const fixturesRouter = Router();

fixturesRouter.get("/fixture", async (req, res) => {
  const email = (req.header("x-test-user-email") || "test@example.com").toLowerCase();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return res.status(404).json({ error: `No user found for ${email}. Run: (cd api && npm run seed:testuser)` });
  }

  const [uc] = await db
    .select({
      chapterId: userChapters.chapterId,
    })
    .from(userChapters)
    .where(eq(userChapters.userId, user.id))
    .limit(1);
  if (!uc) {
    return res.status(404).json({ error: `User ${email} has no chapters. Run seed:testuser.` });
  }

  const [ctx] = await db
    .select({
      classId: classes.id,
      subjectSlug: subjects.slug,
      chapterSlug: chapters.slug,
      chapterId: chapters.id,
    })
    .from(chapters)
    .innerJoin(gradeSubjects, eq(gradeSubjects.id, chapters.gradeSubjectId))
    .innerJoin(classes, eq(classes.id, gradeSubjects.classId))
    .innerJoin(subjects, eq(subjects.id, gradeSubjects.subjectId))
    .where(eq(chapters.id, uc.chapterId))
    .limit(1);

  if (!ctx) {
    return res.status(404).json({ error: "Fixture chapter not found." });
  }

  const [section] = await db
    .select({
      slug: lessons.slug,
      content: lessons.content,
    })
    .from(lessons)
    .where(eq(lessons.chapterId, ctx.chapterId))
    .orderBy(asc(lessons.sortOrder))
    .limit(1);

  const microsections = (section?.content as any)?.microsections as Array<{ id?: string }> | undefined;
  const microId = microsections?.[0]?.id;
  if (!section || !section.slug || !microId) {
    return res.status(404).json({ error: "Fixture section/microsection not found. Seed lessons first." });
  }

  // Return a route compatible with React Router. Playwright's baseURL resolves it.
  const route = `/${ctx.classId}/${ctx.subjectSlug}/${ctx.chapterSlug}/${section.slug}/${microId}`;
  return res.json({ route });
});

export default fixturesRouter;

