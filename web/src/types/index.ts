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
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  user: User;
}

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// CURRICULUM & EDUCATION TYPES
// =============================================================================

export interface CurriculumEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt?: string;
}

export interface GradeEntity {
  id: string;
  curriculumId: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt?: string;
}

export interface SubjectEntity {
  id: string;
  slug: string;
  name: string;
  description: string;
  createdAt?: string;
}

export interface ChapterEntity {
  id: string;
  gradeSubjectId: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt?: string;
}

export interface LessonEntity {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  sortOrder: number;
  content: LessonContent;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface AccessibilityOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

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

// =============================================================================
// DASHBOARD TYPES
// =============================================================================

export interface Chapter {
  id: string;
  title: string;
  progress?: number;
}

// =============================================================================
// SETUP PAGE TYPES
// =============================================================================

export type SetupStep = 'accessibility' | 'curriculum' | 'grade' | 'chapters';

export interface SetupStepInfo {
  id: SetupStep;
  title: string;
  subtitle: string;
}

export interface UserSetupData {
  disabilities: string[];
  curriculumId: string;
  classId: string;
  chapterIds: string[];
}
