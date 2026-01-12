// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

export interface UserProfile {
  curriculumId: string;
  classId: string;
  chapterIds: string[];
  disabilities: string[];
}

export interface User {
  user_id: string;
  email: string;
  name: string;
  profile?: UserProfile | null;
  curriculumId?: string | null;
  classId?: string | null;
  isProfileComplete: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// =============================================================================
// CURRICULUM & EDUCATION TYPES (DB entities)
// =============================================================================

export interface CurriculumEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt?: Date | string;
}

export interface ClassEntity {
  id: string;
  curriculumId: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt?: Date | string;
}

// Keep GradeEntity as alias for backward compatibility
export type GradeEntity = ClassEntity;

export interface SubjectEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt?: Date | string;
}

export interface GradeSubjectEntity {
  id: string;
  classId: string;
  subjectId: string;
  description?: string;
  createdAt?: Date | string;
}

export interface ChapterEntity {
  id: string;
  gradeSubjectId: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt?: Date | string;
}

export interface LessonEntity {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  sortOrder: number;
  content: LessonContent;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// =============================================================================
// CURRICULUM API RESPONSE TYPES
// =============================================================================

export interface CurriculumWithGrades extends CurriculumEntity {
  grades: GradeEntity[];
}

export interface GradeWithSubjects extends GradeEntity {
  subjects: SubjectEntity[];
}

export interface SubjectWithChapters extends SubjectEntity {
  gradeSubjectId: string;
  chapters: ChapterEntity[];
}

export interface ChapterWithLessons extends ChapterEntity {
  lessons: LessonEntity[];
}

// =============================================================================
// UNIT & SECTION TYPES (for parsing)
// =============================================================================

export interface UnitSection {
  sectionId: string;
  title: string;
  description: string;
  learningGoals: string[];
}

export interface Unit {
  unitTitle: string;
  unitDescription: string;
  sections: UnitSection[];
}

export type Book = Unit[];

// =============================================================================
// LESSON & CONTENT TYPES
// =============================================================================

export interface CoreConcept {
  conceptTitle: string;
  explanation: string;
  example: string;
  diagramDescription: string;
}

export interface QuickCheckQuestion {
  question: string;
  answer: string;
}

export interface LessonContent {
  introduction: string;
  coreConcepts: CoreConcept[];
  summary: string[];
  quickCheckQuestions: QuickCheckQuestion[];
}

export interface Lesson {
  sectionId: string;
  title: string;
  lessonContent: LessonContent;
}

export interface UnitLessons {
  unitTitle: string;
  unitDescription: string;
  lessons: Lesson[];
}

// =============================================================================
// PARSING TYPES
// =============================================================================

export interface TOCSection {
  sectionId: string;
  title: string;
  page?: number;
}

export interface ChapterInfo {
  title: string;
  startPage: number;
  tocSections: TOCSection[] | null;
}

export interface Section {
  sectionId: string;
  title: string;
  description: string;
  learningGoals: string[];
}

export interface ParsedUnit {
  unitTitle: string;
  unitDescription: string;
  sections: Section[];
}

export interface ChaptersResponse {
  chapters: ChapterInfo[];
}

export interface FullParseResponse {
  success: boolean;
  totalUnits: number;
  units: ParsedUnit[];
}
