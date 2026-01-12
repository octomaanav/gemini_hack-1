import { Router } from "express";
import { db } from "../db/index.js";
import { 
  curricula, 
  classes, 
  subjects, 
  gradeSubjects, 
  chapters,
  lessons
} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { ParsedUnit, UnitLessons } from "../../types/index.js";

const adminRouter = Router();

/**
 * POST /api/admin/subjects
 * Create a subject if it doesn't exist
 */
adminRouter.post("/subjects", async (req, res) => {
  try {
    const { slug, name, description } = req.body;

    if (!slug || !name) {
      return res.status(400).json({ error: "slug and name are required" });
    }

    // Check if subject exists
    const [existingSubject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, slug))
      .limit(1);

    if (existingSubject) {
      return res.json(existingSubject);
    }

    // Create subject
    const [newSubject] = await db
      .insert(subjects)
      .values({
        slug,
        name,
        description: description || name,
      })
      .returning();

    res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Failed to create subject" });
  }
});

/**
 * POST /api/admin/grade-subjects
 * Link a subject to a grade (create grade_subject entry)
 */
adminRouter.post("/grade-subjects", async (req, res) => {
  try {
    const { classId, subjectId, description } = req.body;

    if (!classId || !subjectId) {
      return res.status(400).json({ error: "classId and subjectId are required" });
    }

    // Check if link exists
    const [existingLink] = await db
      .select()
      .from(gradeSubjects)
      .where(and(
        eq(gradeSubjects.classId, classId),
        eq(gradeSubjects.subjectId, subjectId)
      ))
      .limit(1);

    if (existingLink) {
      return res.json(existingLink);
    }

    // Create link
    const [newLink] = await db
      .insert(gradeSubjects)
      .values({
        classId,
        subjectId,
        description,
      })
      .returning();

    res.status(201).json(newLink);
  } catch (error) {
    console.error("Error creating class-subject link:", error);
    res.status(500).json({ error: "Failed to create class-subject link" });
  }
});

/**
 * POST /api/admin/chapters
 * Create a chapter for a grade-subject
 */
adminRouter.post("/chapters", async (req, res) => {
  try {
    const { gradeSubjectId, slug, name, description, sortOrder } = req.body;

    if (!gradeSubjectId || !slug || !name) {
      return res.status(400).json({ error: "gradeSubjectId, slug, and name are required" });
    }

    // Check if chapter exists
    const [existingChapter] = await db
      .select()
      .from(chapters)
      .where(and(
        eq(chapters.gradeSubjectId, gradeSubjectId),
        eq(chapters.slug, slug)
      ))
      .limit(1);

    if (existingChapter) {
      return res.json(existingChapter);
    }

    // Create chapter
    const [newChapter] = await db
      .insert(chapters)
      .values({
        gradeSubjectId,
        slug,
        name,
        description: description || name,
        sortOrder: sortOrder || 1,
      })
      .returning();

    res.status(201).json(newChapter);
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({ error: "Failed to create chapter" });
  }
});

/**
 * POST /api/admin/bulk-import
 * Bulk import chapters and lessons from parsed textbook data
 * 
 * Body:
 * {
 *   classId: string,
 *   subjectSlug: string,
 *   subjectName: string,
 *   units: ParsedUnit[],    // from the parsing endpoint
 *   lessons?: UnitLessons[] // from the lessons/generate endpoint (optional)
 * }
 */
adminRouter.post("/bulk-import", async (req, res) => {
  try {
    console.log("=== Bulk Import Request Received ===");
    const { classId, subjectSlug, subjectName, units, lessons: generatedLessons } = req.body;

    console.log("Request body:", {
      classId,
      subjectSlug,
      subjectName,
      unitsCount: units?.length || 0,
      lessonsCount: generatedLessons?.length || 0,
    });

    if (!classId || !subjectSlug || !subjectName) {
      console.error("Missing required fields:", { classId: !!classId, subjectSlug: !!subjectSlug, subjectName: !!subjectName });
      return res.status(400).json({ 
        error: "classId, subjectSlug, and subjectName are required" 
      });
    }

    if (!Array.isArray(units) || units.length === 0) {
      console.error("Invalid units array:", { isArray: Array.isArray(units), length: units?.length || 0 });
      return res.status(400).json({ error: "units array is required and must not be empty" });
    }

    if (!Array.isArray(generatedLessons) || generatedLessons.length === 0) {
      console.warn("No generated lessons provided - will create placeholder content");
    }

    // Verify class exists
    console.log(`Bulk import: Looking for class with ID: ${classId}`);
    const [classItem] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classItem) {
      console.error(`Class not found with ID: ${classId}`);
      
      // Get list of available classes for debugging
      const allClasses = await db
        .select({
          id: classes.id,
          name: classes.name,
          slug: classes.slug,
        })
        .from(classes)
        .limit(10);
      
      console.log(`Available classes in database:`, allClasses);
      
      // Return 400 instead of 404 since the route exists, but the resource is invalid
      return res.status(400).json({ 
        error: `Class not found with ID: ${classId}. Please ensure the class exists in the database.`,
        availableClasses: allClasses,
        hint: "The class may have been deleted or the database was reset. Please go back and select a class again."
      });
    }
    
    console.log(`Found class: ${classItem.name} (${classItem.id})`);

    // 1. Create or get subject
    let [subject] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.slug, subjectSlug))
      .limit(1);

    if (!subject) {
      [subject] = await db
        .insert(subjects)
        .values({
          slug: subjectSlug,
          name: subjectName,
          description: subjectName,
        })
        .returning();
    }

    // 2. Create or get class-subject link
    let [gradeSubject] = await db
      .select()
      .from(gradeSubjects)
      .where(and(
        eq(gradeSubjects.classId, classId),
        eq(gradeSubjects.subjectId, subject.id)
      ))
      .limit(1);

    if (!gradeSubject) {
      [gradeSubject] = await db
        .insert(gradeSubjects)
        .values({
          classId,
          subjectId: subject.id,
        })
        .returning();
    }

    // 3. Create chapters from units with full lesson content
    const createdChapters: Array<{ chapter: typeof chapters.$inferSelect; lessonCount: number }> = [];

    console.log(`Creating ${units.length} chapters...`);

    for (let i = 0; i < units.length; i++) {
      const unit = units[i] as ParsedUnit;
      const chapterSlug = unit.unitTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      console.log(`[${i + 1}/${units.length}] Processing chapter: "${unit.unitTitle}"`);

      // Find matching generated lessons for this unit (if available)
      const unitLessons = generatedLessons?.find(
        (ul: UnitLessons) => ul.unitTitle === unit.unitTitle
      );

      if (unitLessons) {
        console.log(`  ✓ Found generated lessons (${unitLessons.lessons?.length || 0} lessons)`);
      } else {
        console.log(`  ⚠ No generated lessons found - creating placeholder content`);
      }

      // If no generated lessons found, create placeholder content
      const chapterContent: UnitLessons = unitLessons || {
        unitTitle: unit.unitTitle,
        unitDescription: unit.unitDescription,
        lessons: unit.sections.map((section) => ({
          sectionId: section.sectionId,
          title: section.title,
          lessonContent: {
            introduction: section.description,
            coreConcepts: section.learningGoals.map((goal, idx) => ({
              conceptTitle: `Concept ${idx + 1}`,
              explanation: goal,
              example: "",
              diagramDescription: "",
            })),
            summary: section.learningGoals,
            quickCheckQuestions: [],
          },
        })),
      };

      try {
        // Check if chapter exists
        let [chapter] = await db
          .select()
          .from(chapters)
          .where(and(
            eq(chapters.gradeSubjectId, gradeSubject.id),
            eq(chapters.slug, chapterSlug)
          ))
          .limit(1);

        if (chapter) {
          console.log(`  → Updating existing chapter: ${chapter.id}`);
          // Update existing chapter
          [chapter] = await db
            .update(chapters)
            .set({
              name: unit.unitTitle,
              description: unit.unitDescription,
            })
            .where(eq(chapters.id, chapter.id))
            .returning();
        } else {
          console.log(`  → Creating new chapter`);
          // Create new chapter
          [chapter] = await db
            .insert(chapters)
            .values({
              gradeSubjectId: gradeSubject.id,
              slug: chapterSlug,
              name: unit.unitTitle,
              description: unit.unitDescription,
              sortOrder: i + 1,
            })
            .returning();
        }

        // 4. Create individual lesson records in the lessons table
        const lessonCount = chapterContent.lessons?.length || 0;
        let createdLessonsCount = 0;
        
        if (lessonCount > 0 && chapterContent.lessons) {
          console.log(`  → Creating ${lessonCount} lesson records...`);
          
          for (let j = 0; j < chapterContent.lessons.length; j++) {
            const lesson = chapterContent.lessons[j];
            
            // Generate slug from sectionId and title
            const lessonSlug = `${lesson.sectionId}-${lesson.title}`
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            
            try {
              // Check if lesson already exists
              const [existingLesson] = await db
                .select()
                .from(lessons)
                .where(and(
                  eq(lessons.chapterId, chapter.id),
                  eq(lessons.slug, lessonSlug)
                ))
                .limit(1);
              
              if (existingLesson) {
                // Update existing lesson
                await db
                  .update(lessons)
                  .set({
                    title: lesson.title,
                    content: lesson.lessonContent,
                    sortOrder: j + 1,
                  })
                  .where(eq(lessons.id, existingLesson.id));
                createdLessonsCount++;
              } else {
                // Create new lesson
                await db
                  .insert(lessons)
                  .values({
                    chapterId: chapter.id,
                    slug: lessonSlug,
                    title: lesson.title,
                    sortOrder: j + 1,
                    content: lesson.lessonContent,
                  });
                createdLessonsCount++;
              }
            } catch (lessonError) {
              console.error(`    ✗ Failed to save lesson "${lesson.title}":`, lessonError);
              // Continue with other lessons even if one fails
            }
          }
          
          console.log(`  ✓ Created ${createdLessonsCount} lesson records`);
        }
        
        createdChapters.push({ chapter, lessonCount: createdLessonsCount });
        console.log(`  ✓ Chapter "${unit.unitTitle}" saved with ${createdLessonsCount} lessons in database`);
      } catch (dbError) {
        console.error(`  ✗ Failed to save chapter "${unit.unitTitle}":`, dbError);
        throw new Error(`Failed to save chapter "${unit.unitTitle}": ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }
    }

    console.log(`=== Bulk Import Complete: ${createdChapters.length} chapters created ===`);

    res.status(201).json({
      success: true,
      subject,
      gradeSubject,
      chapters: createdChapters,
    });
  } catch (error) {
    console.error("=== Error in Bulk Import ===", error);
    if (error instanceof Error) {
      console.error("  Error message:", error.message);
      console.error("  Error stack:", error.stack);
    }
    res.status(500).json({ 
      error: "Failed to bulk import data",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/admin/subjects
 * Get all subjects
 */
adminRouter.get("/subjects", async (req, res) => {
  try {
    const allSubjects = await db
      .select()
      .from(subjects)
      .orderBy(subjects.name);

    res.json(allSubjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

/**
 * GET /api/admin/grade-subjects/:classId
 * Get all subjects for a class
 */
adminRouter.get("/grade-subjects/:classId", async (req, res) => {
  try {
    const { classId } = req.params;

    const gradeSubjectsList = await db
      .select({
        id: gradeSubjects.id,
        classId: gradeSubjects.classId,
        subjectId: gradeSubjects.subjectId,
        subjectSlug: subjects.slug,
        subjectName: subjects.name,
        subjectDescription: subjects.description,
      })
      .from(gradeSubjects)
      .innerJoin(subjects, eq(subjects.id, gradeSubjects.subjectId))
      .where(eq(gradeSubjects.classId, classId))
      .orderBy(subjects.name);

    res.json(gradeSubjectsList);
  } catch (error) {
    console.error("Error fetching class subjects:", error);
    res.status(500).json({ error: "Failed to fetch class subjects" });
  }
});

export default adminRouter;
