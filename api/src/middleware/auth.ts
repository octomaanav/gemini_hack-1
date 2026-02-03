import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized. Please log in." });
};


/**
 * Middleware to check if user is an admin
 * Reads allowed emails from admins.json in the project root
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    console.log("[isAdmin] Checking admin access...");

    if (!req.isAuthenticated()) {
        console.log("[isAdmin] User not authenticated");
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const userEmail = (req.user as any)?.email;
    console.log("[isAdmin] User email:", userEmail);

    try {
        const adminFilePath = path.join(process.cwd(), "admins.json");
        console.log("[isAdmin] Reading from:", adminFilePath);

        if (!fs.existsSync(adminFilePath)) {
            console.warn("[isAdmin] admins.json not found. Blocking admin access.");
            return res.status(403).json({ error: "Forbidden. Admin configuration missing." });
        }

        const fileContent = fs.readFileSync(adminFilePath, "utf-8");
        const adminEmails: string[] = JSON.parse(fileContent);
        console.log("[isAdmin] Allowed emails:", adminEmails);

        // Validate that it's an array
        if (!Array.isArray(adminEmails)) {
            console.error("[isAdmin] admins.json is not an array");
            return res.status(500).json({ error: "Invalid admin configuration" });
        }

        const normalizedAdminEmails = adminEmails.map(e => e.trim().toLowerCase());
        const normalizedUserEmail = userEmail?.toLowerCase();
        console.log("[isAdmin] Checking if", normalizedUserEmail, "is in", normalizedAdminEmails);

        if (normalizedUserEmail && normalizedAdminEmails.includes(normalizedUserEmail)) {
            console.log("[isAdmin] ✓ Access granted");
            return next();
        }

        console.log("[isAdmin] ✗ Email not in admin list");
    } catch (error) {
        console.error("[isAdmin] Error reading admins.json:", error);
        return res.status(500).json({ error: "Internal Server Error during auth check" });
    }

    res.status(403).json({ error: "Forbidden. Admin access required." });
};
