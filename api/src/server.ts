import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./db/index.js";
import { seed } from "./db/seed.js";
import { seedLessons } from "./db/seedLessons.js";
import { startWorkerLoop } from "./worker/index.js";
import { createApp } from "./app.js";

const app = createApp();

// Start DB-backed worker loop in this process (no Redis)
if (process.env.WORKER_IN_PROCESS !== "false") {
  startWorkerLoop().catch((err) => {
    console.error("[worker] failed to start", err);
  });
}

async function startServer() {
  const PORT = process.env.PORT || 8000;

  const requiredEnvVars = [
    "DATABASE_URL",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.trim() === ""
  );

  if (missingEnvVars.length > 0) {
    console.error("Missing required environment variables!");
    console.error(
      `The following environment variables are not set: ${missingEnvVars.join(", ")}`
    );
    console.error(
      "Please set these variables in your .env file or environment."
    );
    process.exit(1);
  }

  console.log("All required environment variables are set");

  if (!process.env.GEMINI_API_KEY) {
    console.warn("[api] GEMINI_API_KEY not set. AI generation features will run in fallback/test mode where available.");
  }

  // Database connection check
  try {
    await db.execute(sql`SELECT 1`);
    console.log("Connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
    console.error("Could not connect to database. Did you run docker compose up?");
    process.exit(1);
  }

  // Seed database with default data (curricula, classes, subjects, chapters)
  try {
    console.log("Seeding database...");
    await seed();
    console.log("Basic seed data created");
  } catch (error) {
    console.error("Error creating default seed data!");
    console.error(error);
    process.exit(1);
  }

  // Seed lessons from JSON files
  try {
    console.log("Seeding lessons from JSON files...");
    await seedLessons();
    console.log("Lesson seeding complete");
  } catch (error) {
    console.warn("Lesson seeding failed or skipped (this is optional):", error);
    // Don't exit - lesson seeding is optional
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
