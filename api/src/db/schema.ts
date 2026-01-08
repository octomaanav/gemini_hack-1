import { pgTable, serial, text, timestamp, boolean, uuid, json } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  user_id: uuid("user_id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  disabilities: json("disabilities"),
  grade: text("grade"),
  curriculum: text("curriculum"),
  subjects: json("subjects"),
  isProfileComplete: boolean("is_profile_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

