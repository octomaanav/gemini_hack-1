import { Router } from "express";
import { db } from "../db/index.js";
import { curricula, classes, subjects, gradeSubjects, chapters, contentTranslations } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { callGeminiJson, hasGeminiApiKey } from "../utils/gemini.js";
import { sha256Json } from "../utils/hash.js";

const curriculumRouter = Router();

const normalizeLocale = (locale?: string) => {
  if (!locale) return "en-US";
  const cleaned = locale.trim();
  if (cleaned.toLowerCase().startsWith("es")) return "es-ES";
  if (cleaned.toLowerCase().startsWith("hi")) return "hi-IN";
  return "en-US";
};

const buildContentKey = (parts: Record<string, string>) => {
  return Object.entries(parts)
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
};

const translatePayload = async (payload: unknown, locale: string, contentKey: string, contentType: string) => {
  const [cached] = await db
    .select()
    .from(contentTranslations)
    .where(and(
      eq(contentTranslations.contentKey, contentKey),
      eq(contentTranslations.version, 1),
      eq(contentTranslations.locale, locale),
    ))
    .limit(1);

  if (cached?.translatedPayloadJson) {
    return cached.translatedPayloadJson;
  }

  if (!hasGeminiApiKey()) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `Translate the following curriculum payload into ${locale}.
Return ONLY valid JSON. Preserve all keys and structure. Only translate user-facing strings.

Payload:
${JSON.stringify(payload)}
`;

  const translated = await callGeminiJson(prompt);

  await db
    .insert(contentTranslations)
    .values({
      contentKey,
      version: 1, // Default version
      locale,
      translatedPayloadJson: translated as any,
      translatedHash: sha256Json(translated),
      model: "gemini",
    })
    .onConflictDoNothing();

  return translated;
};

/**
 * GET /api/curriculum
 * Returns all curricula with their classes
 */
curriculumRouter.get("/", async (req, res) => {
  try {
    const locale = normalizeLocale(req.query.lang as string | undefined);
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

    if (!locale.startsWith("en")) {
      const translated = await translatePayload(result, locale, "curriculum:list", "curriculum_list");
      return res.json(translated);
    }

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
    const locale = normalizeLocale(req.query.lang as string | undefined);

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

    const payload = {
      ...curriculum,
      grades: curriculumClasses, // Keep 'grades' key for frontend compatibility
    };

    if (!locale.startsWith("en")) {
      const translated = await translatePayload(payload, locale, `curriculum:${curriculumId}`, "curriculum");
      return res.json(translated);
    }

    res.json(payload);
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
    const locale = normalizeLocale(req.query.lang as string | undefined);

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

    if (!locale.startsWith("en")) {
      const translated = await translatePayload(
        result,
        locale,
        buildContentKey({ curriculumId, classId }),
        "subjects_with_chapters"
      );
      return res.json(translated);
    }

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
    const locale = normalizeLocale(req.query.lang as string | undefined);

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

    const payload = {
      ...curriculum,
      grades: curriculumClasses, // Keep 'grades' key for frontend compatibility
    };

    if (!locale.startsWith("en")) {
      const translated = await translatePayload(payload, locale, `curriculum:slug:${slug}`, "curriculum");
      return res.json(translated);
    }

    res.json(payload);
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    res.status(500).json({ error: "Failed to fetch curriculum" });
  }
});

export default curriculumRouter;
