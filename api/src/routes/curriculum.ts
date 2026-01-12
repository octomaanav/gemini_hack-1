import { Router } from "express";
import { db } from "../db/index.js";
import { curricula, classes, subjects, gradeSubjects, chapters } from "../db/schema.js";
import { eq } from "drizzle-orm";

const curriculumRouter = Router();

/**
 * GET /api/curriculum
 * Returns all curricula with their classes
 */
curriculumRouter.get("/", async (req, res) => {
  try {
    const allCurricula = await db
      .select()
      .from(curricula)
      .orderBy(curricula.name);

    const result = await Promise.all(
      allCurricula.map(async (curriculum) => {
        const curriculumClasses = await db
          .select()
          .from(classes)
          .where(eq(classes.curriculumId, curriculum.id))
          .orderBy(classes.sortOrder);

        return {
          ...curriculum,
          grades: curriculumClasses, // Keep 'grades' key for frontend compatibility
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching curricula:", error);
    res.status(500).json({ error: "Failed to fetch curricula" });
  }
});

/**
 * GET /api/curriculum/:curriculumId
 * Returns a single curriculum with classes
 */
curriculumRouter.get("/:curriculumId", async (req, res) => {
  try {
    const { curriculumId } = req.params;

    const [curriculum] = await db
      .select()
      .from(curricula)
      .where(eq(curricula.id, curriculumId))
      .limit(1);

    if (!curriculum) {
      return res.status(404).json({ error: "Curriculum not found" });
    }

    const curriculumClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.curriculumId, curriculum.id))
      .orderBy(classes.sortOrder);

    res.json({
      ...curriculum,
      grades: curriculumClasses, // Keep 'grades' key for frontend compatibility
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    res.status(500).json({ error: "Failed to fetch curriculum" });
  }
});

/**
 * GET /api/curriculum/:curriculumId/grades/:classId/subjects
 * Returns all subjects with their chapters for a specific class
 */
curriculumRouter.get("/:curriculumId/grades/:classId/subjects", async (req, res) => {
  try {
    const { curriculumId, classId } = req.params;

    // Verify class belongs to curriculum
    const [classItem] = await db
      .select()
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);

    if (!classItem || classItem.curriculumId !== curriculumId) {
      return res.status(404).json({ error: "Class not found in this curriculum" });
    }

    // Get subjects for this class with gradeSubjectId
    const gradeSubjectsList = await db
      .select({
        id: subjects.id,
        slug: subjects.slug,
        name: subjects.name,
        description: subjects.description,
        gradeSubjectId: gradeSubjects.id,
      })
      .from(gradeSubjects)
      .innerJoin(subjects, eq(subjects.id, gradeSubjects.subjectId))
      .where(eq(gradeSubjects.classId, classId))
      .orderBy(subjects.name);

    // Get chapters for each subject
    const result = await Promise.all(
      gradeSubjectsList.map(async (subject) => {
        const subjectChapters = await db
          .select({
            id: chapters.id,
            gradeSubjectId: chapters.gradeSubjectId,
            slug: chapters.slug,
            name: chapters.name,
            description: chapters.description,
            sortOrder: chapters.sortOrder,
          })
          .from(chapters)
          .where(eq(chapters.gradeSubjectId, subject.gradeSubjectId))
          .orderBy(chapters.sortOrder);

        return {
          ...subject,
          chapters: subjectChapters,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

/**
 * GET /api/curriculum/subjects/all
 * Returns all subjects (useful for admin/reference)
 */
curriculumRouter.get("/subjects/all", async (req, res) => {
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
 * GET /api/curriculum/by-slug/:slug
 * Returns curriculum by slug (cbse, icse, ib, state)
 */
curriculumRouter.get("/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const [curriculum] = await db
      .select()
      .from(curricula)
      .where(eq(curricula.slug, slug))
      .limit(1);

    if (!curriculum) {
      return res.status(404).json({ error: "Curriculum not found" });
    }

    const curriculumClasses = await db
      .select()
      .from(classes)
      .where(eq(classes.curriculumId, curriculum.id))
      .orderBy(classes.sortOrder);

    res.json({
      ...curriculum,
      grades: curriculumClasses, // Keep 'grades' key for frontend compatibility
    });
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    res.status(500).json({ error: "Failed to fetch curriculum" });
  }
});

export default curriculumRouter;
