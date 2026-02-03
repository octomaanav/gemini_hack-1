// =============================================================================
// USER & AUTHENTICATION TYPES
// =============================================================================

export interface AccessibilityPreferences {
  focusMode?: boolean;
  largeText?: boolean;
  reduceMotion?: boolean;
  captionsOn?: boolean;
  signsOn?: boolean;
}

export interface UserProfile {
  curriculumId: string;
  classId: string;
  chapterIds: string[];
  accessibility?: AccessibilityPreferences;
  language?: string;
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

// Microsection types - individual content pieces within a section
export type MicrosectionType = 'article' | 'video' | 'quiz' | 'practice';

export type MicrosectionStatus = 'not-started' | 'in-progress' | 'completed';

export interface BaseMicrosection {
  id: string;
  type: MicrosectionType;
  title: string;
  sortOrder: number;
  estimatedMinutes?: number;
}

export interface ArticleMicrosection extends BaseMicrosection {
  type: 'article';
  content: ArticleContent;
}

export interface VideoMicrosection extends BaseMicrosection {
  type: 'video';
  content: VideoContent;
}

export interface QuizMicrosection extends BaseMicrosection {
  type: 'quiz';
  content: Quiz;
}

export interface PracticeMicrosection extends BaseMicrosection {
  type: 'practice';
  content: PracticeContent;
}

export type Microsection = ArticleMicrosection | VideoMicrosection | QuizMicrosection | PracticeMicrosection;

// Article content - the main lesson/lecture content
export interface ArticleContent {
  introduction: string;
  coreConcepts: CoreConcept[];
  summary: string[];
  quickCheckQuestions: QuickCheckQuestion[];
  images?: ImageContent[];
  notes?: NoteContent[];
}

// Practice content - practice problems/exercises
export interface PracticeContent {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  allowRetry?: boolean;
  showExplanations?: boolean;
}

export interface CoreConcept {
  conceptTitle: string;
  explanation: string;
  example: string;
  diagramDescription: string;
  diagramImageUrl?: string;
}

export interface QuickCheckQuestion {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[]; // For multiple choice
  correctAnswer: string | number; // Answer or index for multiple choice
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
}

export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  url: string; // Video URL (YouTube, Vimeo, or uploaded file URL)
  thumbnailUrl?: string;
  duration?: number; // in seconds
  transcript?: string;
}

export interface ImageContent {
  id: string;
  title?: string;
  url: string; // Image URL
  alt?: string;
  caption?: string;
}

export interface NoteContent {
  id: string;
  title: string;
  content: string; // Rich text content
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// =============================================================================
// STORY MODE TYPES
// =============================================================================

export interface StorySlide {
  id: string;
  index: number;
  title: string;
  narration: string;
  caption: string;
  imagePrompt: string;
  imageUrl?: string;
  signKeywords?: string[];
}

export interface StoryAsset {
  id: string;
  storyKey: string;
  classId: string;
  subjectId: string;
  chapterSlug: string;
  sectionSlug: string;
  microsectionId?: string | null;
  status: "pending" | "ready" | "error";
  renderType: "slides" | "video";
  slides: StorySlide[];
  videoUrl?: string | null;
  error?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface StoryAudioSlide {
  slideId: string;
  narration: string;
  caption: string;
  audioUrl: string;
}

export interface StoryAudioAsset {
  id: string;
  storyId: string;
  locale: string;
  status: "pending" | "ready" | "error";
  slides: StoryAudioSlide[];
  error?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// LessonContent - legacy format for backward compatibility
export interface LessonContent {
  introduction: string;
  coreConcepts: CoreConcept[];
  summary: string[];
  quickCheckQuestions: QuickCheckQuestion[];
  // Manual content additions
  videos?: VideoContent[];
  quizzes?: Quiz[];
  images?: ImageContent[];
  notes?: NoteContent[];
}

// =============================================================================
// STRUCTURED CURRICULUM TYPES (New JSON Structure)
// =============================================================================

// Structured section - a part of a chapter containing microsections
export interface StructuredSection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  sortOrder: number;
  microsections: Microsection[];
}

// Structured chapter - top-level structure from JSON
export interface StructuredChapter {
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  sections: StructuredSection[];
}

// Array of structured chapters (the full JSON file structure)
export type StructuredCurriculum = StructuredChapter[];

// Union type for lesson content - can be either legacy format or structured section
export type LessonContentUnion = LessonContent | StructuredSection;

// Section (DB entity) - a part of a chapter containing microsections
export interface SectionEntity {
  id: string;
  chapterId: string;
  slug: string;
  title: string;
  description?: string;
  sortOrder: number;
  microsections: Microsection[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Legacy Lesson interface for backward compatibility
export interface Lesson {
  sectionId: string;
  title: string;
  lessonContent: LessonContent;
}

// Unit with sections (structured style)
export interface UnitWithSections {
  unitTitle: string;
  unitDescription: string;
  sections: SectionEntity[];
}

// Legacy UnitLessons for backward compatibility
export interface UnitLessons {
  unitTitle: string;
  unitDescription: string;
  lessons: Lesson[];
}

// Chapter with sections (structured style) - DB entity extended
export interface ChapterWithSections extends ChapterEntity {
  sections: SectionEntity[];
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
