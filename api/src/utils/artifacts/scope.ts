import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  chapters,
  classes,
  contentVersions,
  curricula,
  gradeSubjects,
  subjects,
} from "../../db/schema.js";
import { loadStructuredChaptersForSubject } from "../structuredContent.js";
import { buildMicrosectionContentKey, parseGradeValue } from "../contentKey.js";
import type { ArtifactScopeType } from "./key.js";

export const parseLessonScopeId = (scopeId: string) => {
  // lh:lesson:{classId}:{subjectSlug}:{chapterSlug}:{sectionSlug}
  const parts = scopeId.split(":");
  if (parts.length < 6) return null;
  if (parts[0] !== "lh" || parts[1] !== "lesson") return null;
  const [, , classId, subjectSlug, chapterSlug, sectionSlug] = parts;
  if (!classId || !subjectSlug || !chapterSlug || !sectionSlug) return null;
  return { classId, subjectSlug, chapterSlug, sectionSlug };
};

export const parseChapterScopeId = (scopeId: string) => {
  // lh:chapter:{classId}:{subjectSlug}:{chapterSlug}
  const parts = scopeId.split(":");
  if (parts.length < 5) return null;
  if (parts[0] !== "lh" || parts[1] !== "chapter") return null;
  const [, , classId, subjectSlug, chapterSlug] = parts;
  if (!classId || !subjectSlug || !chapterSlug) return null;
  return { classId, subjectSlug, chapterSlug };
};

export const resolveChapterIdForStructuredScope = async (classId: string, subjectSlug: string, chapterSlug: string) => {
  const [subject] = await db.select().from(subjects).where(eq(subjects.slug, subjectSlug)).limit(1);
  if (!subject) return null;

  const [gradeSubject] = await db
    .select()
    .from(gradeSubjects)
    .where(and(eq(gradeSubjects.classId, classId), eq(gradeSubjects.subjectId, subject.id)))
    .limit(1);
  if (!gradeSubject) return null;

  const [chapter] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.gradeSubjectId, gradeSubject.id), eq(chapters.slug, chapterSlug)))
    .limit(1);

  return chapter?.id || null;
};

export const resolveContentKeysForScope = async (input: {
  scopeType: ArtifactScopeType;
  scopeId: string;
}): Promise<{
  contentKeys: string[];
  chapterIdForAccess?: string | null;
}> => {
  if (input.scopeType === "MICROSECTION") {
    return { contentKeys: [input.scopeId], chapterIdForAccess: null };
  }

  if (input.scopeType === "LESSON") {
    const parsed = parseLessonScopeId(input.scopeId);
    if (!parsed) throw new Error("invalid_lesson_scope_id");
    const { classId, subjectSlug, chapterSlug, sectionSlug } = parsed;

    const structured = await loadStructuredChaptersForSubject(classId, subjectSlug);
    if (!structured) throw new Error("structured_content_not_found");
    const chapterIndex = structured.findIndex((c) => c.chapterId === chapterSlug);
    if (chapterIndex < 0) throw new Error("chapter_not_found");
    const chapter = structured[chapterIndex];
    const sectionIndex = chapter.sections.findIndex((s) => s.slug === sectionSlug);
    if (sectionIndex < 0) throw new Error("section_not_found");
    const section = chapter.sections[sectionIndex];

    const [classRow] = await db
      .select({ classSlug: classes.slug, curriculumId: classes.curriculumId })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);
    if (!classRow) throw new Error("class_not_found");
    const gradeValue = parseGradeValue(classRow.classSlug);
    if (!gradeValue) throw new Error("grade_parse_failed");
    const [curr] = await db
      .select({ slug: curricula.slug })
      .from(curricula)
      .where(eq(curricula.id, classRow.curriculumId))
      .limit(1);
    if (!curr) throw new Error("curriculum_not_found");

    const contentKeys = section.microsections.map((_, idx) =>
      buildMicrosectionContentKey({
        curriculumSlug: curr.slug,
        curriculumId: classRow.curriculumId,
        gradeValue,
        subjectSlug,
        chapterIndex1: chapterIndex + 1,
        sectionIndex1: sectionIndex + 1,
        microIndex1: idx + 1,
      })
    );

    const chapterIdForAccess = await resolveChapterIdForStructuredScope(classId, subjectSlug, chapterSlug);
    return { contentKeys, chapterIdForAccess };
  }

  if (input.scopeType === "CHAPTER") {
    const parsed = parseChapterScopeId(input.scopeId);
    if (!parsed) throw new Error("invalid_chapter_scope_id");
    const { classId, subjectSlug, chapterSlug } = parsed;

    const structured = await loadStructuredChaptersForSubject(classId, subjectSlug);
    if (!structured) throw new Error("structured_content_not_found");
    const chapterIndex = structured.findIndex((c) => c.chapterId === chapterSlug);
    if (chapterIndex < 0) throw new Error("chapter_not_found");
    const chapter = structured[chapterIndex];

    const [classRow] = await db
      .select({ classSlug: classes.slug, curriculumId: classes.curriculumId })
      .from(classes)
      .where(eq(classes.id, classId))
      .limit(1);
    if (!classRow) throw new Error("class_not_found");
    const gradeValue = parseGradeValue(classRow.classSlug);
    if (!gradeValue) throw new Error("grade_parse_failed");
    const [curr] = await db
      .select({ slug: curricula.slug })
      .from(curricula)
      .where(eq(curricula.id, classRow.curriculumId))
      .limit(1);
    if (!curr) throw new Error("curriculum_not_found");

    const contentKeys: string[] = [];
    for (let sIdx = 0; sIdx < chapter.sections.length; sIdx++) {
      const section = chapter.sections[sIdx];
      for (let mIdx = 0; mIdx < section.microsections.length; mIdx++) {
        contentKeys.push(
          buildMicrosectionContentKey({
            curriculumSlug: curr.slug,
            curriculumId: classRow.curriculumId,
            gradeValue,
            subjectSlug,
            chapterIndex1: chapterIndex + 1,
            sectionIndex1: sIdx + 1,
            microIndex1: mIdx + 1,
          })
        );
      }
    }

    const chapterIdForAccess = await resolveChapterIdForStructuredScope(classId, subjectSlug, chapterSlug);
    return { contentKeys, chapterIdForAccess };
  }

  throw new Error("invalid_scope_type");
};

export const resolveContentVersionForKeys = async (contentKeys: string[]): Promise<number> => {
  if (contentKeys.length === 0) return 0;
  const rows = await db
    .select({ version: contentVersions.version })
    .from(contentVersions)
    .where(inArray(contentVersions.contentKey, contentKeys))
    .orderBy(desc(contentVersions.version));
  let max = 0;
  for (const row of rows) {
    if (row.version > max) max = row.version;
  }
  return max;
};

