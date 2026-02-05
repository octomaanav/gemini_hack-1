import "dotenv/config";
import { and, asc, eq } from "drizzle-orm";
import { db } from "./index.js";
import { chapters, classes, curricula, gradeSubjects, subjects, userChapters, users } from "./schema.js";

const TEST_EMAIL = process.env.TEST_USER_EMAIL || "test@example.com";

async function main() {
  const [curr] = await db.select().from(curricula).where(eq(curricula.slug, "cbse")).limit(1);
  const [cls] = curr
    ? await db
        .select()
        .from(classes)
        .where(and(eq(classes.curriculumId, curr.id), eq(classes.slug, "class-11")))
        .limit(1)
    : [];
  const [sub] = await db.select().from(subjects).where(eq(subjects.slug, "physics")).limit(1);

  if (!curr || !cls || !sub) {
    console.error("Seed data missing; run seed + seed:lessons first.");
    process.exit(1);
  }

  const [gs] = await db
    .select()
    .from(gradeSubjects)
    .where(and(eq(gradeSubjects.classId, cls.id), eq(gradeSubjects.subjectId, sub.id)))
    .limit(1);
  if (!gs) {
    console.error("grade_subjects missing for fixture.");
    process.exit(1);
  }

  const [ch] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.gradeSubjectId, gs.id))
    .orderBy(asc(chapters.sortOrder))
    .limit(1);
  if (!ch) {
    console.error("No chapter found for fixture.");
    process.exit(1);
  }

  await db.delete(users).where(eq(users.email, TEST_EMAIL));
  const [user] = await db
    .insert(users)
    .values({
      email: TEST_EMAIL,
      name: "Test User",
      isProfileComplete: true,
      updatedAt: new Date(),
    })
    .returning();

  await db
    .insert(userChapters)
    .values({ userId: user.id, chapterId: ch.id })
    .onConflictDoNothing();

  console.log("Seeded test user:", TEST_EMAIL, "chapterId:", ch.id);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seedTestUser failed:", e);
    process.exit(1);
  });

