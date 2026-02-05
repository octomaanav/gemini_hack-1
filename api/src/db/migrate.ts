import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index.js";

async function runMigrate() {
    console.log("Running migrations...");
    try {
        // This will look for the 'drizzle' folder in the project root
        // Ensure that your build process copies this folder or it exists in the working directory
        await migrate(db, { migrationsFolder: "drizzle" });
        console.log("Migrations completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigrate();
