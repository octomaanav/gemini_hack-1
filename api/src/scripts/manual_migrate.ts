import "dotenv/config";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("Adding password column...");
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password text`);
        console.log("Adding salt column...");
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS salt text`);
        console.log("Done.");
    } catch (err) {
        console.error("Migration failed:", err);
    }
    process.exit(0);
}

run();
