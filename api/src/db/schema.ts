import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { UserProfile, LessonContent, UnitLessons } from "../../types/index.js";

// =============================================================================
// USERS TABLE
// =============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  
  // Profile data stored as JSONB for flexibility
  profile: jsonb("profile").$type<UserProfile>(),
  
  // Denormalized fields for quick access/filtering
  curriculumId: uuid("curriculum_id").references(() => curricula.id),
  classId: uuid("class_id").references(() => classes.id),
  
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// =============================================================================
// CURRICULA TABLE (Education Boards: CBSE, ICSE, IB, State)
// =============================================================================

export const curricula = pgTable("curricula", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'cbse', 'icse', 'ib', 'state'
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// CLASSES TABLE (Class levels per curriculum)
// =============================================================================

export const classes = pgTable("classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  curriculumId: uuid("curriculum_id").references(() => curricula.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").notNull(), // 'class-9', 'class-10', etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSlugPerCurriculum: unique().on(table.curriculumId, table.slug),
}));

// =============================================================================
// SUBJECTS TABLE (All unique subjects)
// =============================================================================

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'physics', 'chemistry', etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================================================================
// GRADE_SUBJECTS TABLE (Junction: which subjects are available for which grade)
// =============================================================================

export const gradeSubjects = pgTable("grade_subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  classId: uuid("class_id").references(() => classes.id, { onDelete: "cascade" }).notNull(),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  description: text("description"), // Optional class-specific description
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSubjectPerClass: unique().on(table.classId, table.subjectId),
}));

// =============================================================================
// CHAPTERS TABLE (Chapters/Courses within a subject for a specific grade)
// =============================================================================

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  gradeSubjectId: uuid("grade_subject_id").references(() => gradeSubjects.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSlugPerGradeSubject: unique().on(table.gradeSubjectId, table.slug),
}));

// =============================================================================
// LESSONS TABLE (Educational content for each chapter)
// =============================================================================

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull(),
  
  // Rich content stored as JSONB
  content: jsonb("content").$type<LessonContent>().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueSlugPerChapter: unique().on(table.chapterId, table.slug),
}));

// =============================================================================
// USER_CHAPTERS TABLE (Which chapters a user has selected to study)
// =============================================================================

export const userChapters = pgTable("user_chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueChapterPerUser: unique().on(table.userId, table.chapterId),
}));

// =============================================================================
// RELATIONS
// =============================================================================

export const curriculaRelations = relations(curricula, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  curriculum: one(curricula, {
    fields: [classes.curriculumId],
    references: [curricula.id],
  }),
  gradeSubjects: many(gradeSubjects),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  gradeSubjects: many(gradeSubjects),
}));

export const gradeSubjectsRelations = relations(gradeSubjects, ({ one, many }) => ({
  class: one(classes, {
    fields: [gradeSubjects.classId],
    references: [classes.id],
  }),
  subject: one(subjects, {
    fields: [gradeSubjects.subjectId],
    references: [subjects.id],
  }),
  chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  gradeSubject: one(gradeSubjects, {
    fields: [chapters.gradeSubjectId],
    references: [gradeSubjects.id],
  }),
  lessons: many(lessons),
  userChapters: many(userChapters),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  curriculum: one(curricula, {
    fields: [users.curriculumId],
    references: [curricula.id],
  }),
  class: one(classes, {
    fields: [users.classId],
    references: [classes.id],
  }),
  userChapters: many(userChapters),
}));

export const userChaptersRelations = relations(userChapters, ({ one }) => ({
  user: one(users, {
    fields: [userChapters.userId],
    references: [users.id],
  }),
  chapter: one(chapters, {
    fields: [userChapters.chapterId],
    references: [chapters.id],
  }),
}));
