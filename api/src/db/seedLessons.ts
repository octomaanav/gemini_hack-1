import { db } from "./index.js";
import { chapters, lessons as lessonsTable, gradeSubjects, subjects, classes, curricula } from "./schema.js";
import { eq, and } from "drizzle-orm";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { UnitLessons } from "../../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LESSONS_DATA_DIR = join(__dirname, "../../data/lessons");

/**
 * Seed lessons from JSON files in the data/lessons directory
 * 
 * Expected file structure:
 * - data/lessons/
 *   - cbse_class11_physics.json
 *   - cbse_class12_chemistry.json
 *   - icse_class9_mathematics.json
 *   - etc.
 * 
 * Each JSON file should contain an array of UnitLessons objects (one per chapter/unit):
 * [
 *   {
 *     "unitTitle": "Unit 1: Kinematics",
 *     "unitDescription": "...",
 *     "lessons": [...]
 *   },
 *   {
 *     "unitTitle": "Unit 2: Forces",
 *     "unitDescription": "...",
 *     "lessons": [...]
 *   }
 * ]
 * 
 * The filename format: {curriculum}_{class}_{subject}.json
 * Examples: cbse_class11_physics.json, icse_class9_mathematics.json
 */
export async function seedLessons() {
  console.log("Seeding lessons from JSON files...");

  try {
    let files: string[];
    try {
      files = await readdir(LESSONS_DATA_DIR);
    } catch (error) {
      console.log(`Lessons data directory not found: ${LESSONS_DATA_DIR}`);
      return;
    }

    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('.example.json'));
    
    if (jsonFiles.length === 0) {
      console.log("No JSON files found in lessons data directory.");
      return;
    }

    let processedFiles = 0;
    let processedUnits = 0;
    let processedLessons = 0;
    let errorCount = 0;

    for (const filename of jsonFiles) {
      try {
        const filePath = join(LESSONS_DATA_DIR, filename);
        const fileContent = await readFile(filePath, 'utf-8');
        const unitsArray: UnitLessons[] = JSON.parse(fileContent);

        if (!Array.isArray(unitsArray)) {
          errorCount++;
          continue;
        }

        if (unitsArray.length === 0) {
          console.warn(`Empty array in ${filename}, skipping...`);
          continue;
        }

        const nameWithoutExt = filename.replace('.json', '');
        const parts = nameWithoutExt.split('_');
        
        if (parts.length < 3) {
          console.error(`Invalid filename format in ${filename}: expected format is {curriculum}_{class}_{subject}.json`);
          errorCount++;
          continue;
        }

        const curriculumSlug = parts[0];
        const classSlug = parts[1].replace('class', 'class-');
        const subjectSlug = parts.slice(2).join('-');

        console.log(`\nProcessing ${filename}...`);
        console.log(`Curriculum: ${curriculumSlug}, Class: ${classSlug}, Subject: ${subjectSlug}`);

        const [foundClassWithCurriculum] = await db
          .select({
            classId: classes.id,
            curriculumSlug: curricula.slug,
            className: classes.name,
          })
          .from(classes)
          .innerJoin(curricula, eq(curricula.id, classes.curriculumId))
          .where(and(
            eq(classes.slug, classSlug),
            eq(curricula.slug, curriculumSlug)
          ))
          .limit(1);

        if (!foundClassWithCurriculum) {
          console.error(`Class not found: ${curriculumSlug}/${classSlug} for ${filename}`);
          errorCount++;
          continue;
        }

        // Find subject
        const [subject] = await db
          .select()
          .from(subjects)
          .where(eq(subjects.slug, subjectSlug))
          .limit(1);

        if (!subject) {
          console.error(`Subject not found: ${subjectSlug} for ${filename}`);
          errorCount++;
          continue;
        }

        let [gradeSubject] = await db
          .select()
          .from(gradeSubjects)
          .where(and(
            eq(gradeSubjects.classId, foundClassWithCurriculum.classId),
            eq(gradeSubjects.subjectId, subject.id)
          ))
          .limit(1);

        if (!gradeSubject) {
          [gradeSubject] = await db
            .insert(gradeSubjects)
            .values({
              classId: foundClassWithCurriculum.classId,
              subjectId: subject.id,
            })
            .returning();
        }

        // Process each unit in the array
        for (let unitIndex = 0; unitIndex < unitsArray.length; unitIndex++) {
          const unitLessons = unitsArray[unitIndex];

          // Validate unit structure
          if (!unitLessons.unitTitle || !Array.isArray(unitLessons.lessons)) {
            continue;
          }

          // Generate chapter slug from unit title
          const chapterSlug = unitLessons.unitTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          // Find or create chapter
          let [chapter] = await db
            .select()
            .from(chapters)
            .where(and(
              eq(chapters.gradeSubjectId, gradeSubject.id),
              eq(chapters.slug, chapterSlug)
            ))
            .limit(1);

          if (!chapter) {
            // Create chapter
            [chapter] = await db
              .insert(chapters)
              .values({
                gradeSubjectId: gradeSubject.id,
                slug: chapterSlug,
                name: unitLessons.unitTitle,
                description: unitLessons.unitDescription || '',
                sortOrder: unitIndex + 1,
              })
              .returning();
            console.log(`Created chapter: "${unitLessons.unitTitle}"`);
          } else {
            // Update existing chapter
            [chapter] = await db
              .update(chapters)
              .set({
                name: unitLessons.unitTitle,
                description: unitLessons.unitDescription || chapter.description,
                sortOrder: unitIndex + 1,
              })
              .where(eq(chapters.id, chapter.id))
              .returning();
            console.log(`Updated chapter: "${unitLessons.unitTitle}"`);
          }

          let lessonCount = 0;
          for (let j = 0; j < unitLessons.lessons.length; j++) {
            const lesson = unitLessons.lessons[j];
            
            const lessonSlug = `${lesson.sectionId}-${lesson.title}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');

            const [existingLesson] = await db
              .select()
              .from(lessonsTable)
              .where(and(
                eq(lessonsTable.chapterId, chapter.id),
                eq(lessonsTable.slug, lessonSlug)
              ))
              .limit(1);

            if (existingLesson) {
              await db
                .update(lessonsTable)
                .set({
                  title: lesson.title,
                  content: lesson.lessonContent,
                  sortOrder: j + 1,
                  updatedAt: new Date(),
                })
                .where(eq(lessonsTable.id, existingLesson.id));
            } else {
              await db
                .insert(lessonsTable)
                .values({
                  chapterId: chapter.id,
                  slug: lessonSlug,
                  title: lesson.title,
                  sortOrder: j + 1,
                  content: lesson.lessonContent,
                });
            }
            lessonCount++;
            processedLessons++;
          }

          console.log(`      → ${lessonCount} lessons processed`);
          processedUnits++;
        }

        processedFiles++;
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
        if (error instanceof Error) {
          console.error(`   ${error.message}`);
        }
        errorCount++;
      }
    }

    console.log(`Processed: ${processedFiles} file(s), ${processedUnits} unit(s), ${processedLessons} lesson(s)`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount} file(s)`);
    }
  } catch (error) {
    console.error("Lesson seeding failed:", error);
    throw error;
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLessons()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
