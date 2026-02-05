export const parseGradeValue = (classSlug: string): number | null => {
  const m = String(classSlug || "").match(/(\d{1,2})/);
  if (!m) return null;
  const v = Number(m[1]);
  return Number.isFinite(v) ? v : null;
};

export const buildMicrosectionContentKey = (input: {
  curriculumSlug: string;
  curriculumId: string;
  gradeValue: number;
  subjectSlug: string;
  chapterIndex1: number; // 1-based
  sectionIndex1: number; // 1-based
  microIndex1: number; // 1-based
}): string => {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `curr:${input.curriculumSlug}:${input.curriculumId}:grade${input.gradeValue}:${input.subjectSlug}:ch${pad2(input.chapterIndex1)}:ms${pad2(input.sectionIndex1)}${pad2(input.microIndex1)}`;
};

