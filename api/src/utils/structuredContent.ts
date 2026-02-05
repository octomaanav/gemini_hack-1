import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { classes, curricula } from "../db/schema.js";
import type { StructuredChapter } from "../../types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const resolveClassToFilePrefix = async (classIdOrSlug: string): Promise<string | null> => {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(classIdOrSlug);
  if (!isUUID) return classIdOrSlug;

  const [classEntity] = await db
    .select({
      classSlug: classes.slug,
      curriculumSlug: curricula.slug,
    })
    .from(classes)
    .innerJoin(curricula, eq(curricula.id, classes.curriculumId))
    .where(eq(classes.id, classIdOrSlug))
    .limit(1);

  if (!classEntity) return null;
  const classSlugForFile = classEntity.classSlug.replace("-", "");
  return `${classEntity.curriculumSlug}_${classSlugForFile}`;
};

export const loadStructuredChaptersForSubject = async (
  classIdOrSlug: string,
  subjectSlug: string
): Promise<StructuredChapter[] | null> => {
  const filePrefix = await resolveClassToFilePrefix(classIdOrSlug);
  if (!filePrefix) return null;

  const dataPath = path.join(__dirname, "../../data/lessons", `${filePrefix}_${subjectSlug}.json`);
  if (!fs.existsSync(dataPath)) {
    return null;
  }
  const raw = await fs.promises.readFile(dataPath, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? (parsed as StructuredChapter[]) : null;
};

