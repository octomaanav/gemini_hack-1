import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import {
  extractChaptersWithGemini,
  parseFullTextbook,
  type ChapterInfo,
} from "../utils/parsing/parseSource.js";

const parseSourceRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * GET /api/parse/chapters
 * Extract just the chapter list from a PDF (quick operation)
 */
parseSourceRouter.post("/chapters", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: "Upload a PDF file with field name 'file'" });
    }
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const chapters = await extractChaptersWithGemini(file.buffer);
    return res.json({ chapters });
  } catch (error) {
    console.error("Error extracting chapters:", error);
    res.status(500).json({ error: "Failed to extract chapters from PDF" });
  }
});

/**
 * POST /api/parse/full
 * Parse the entire textbook into units with sections and learning goals
 * 
 * Requires:
 * - file: PDF file (multipart form-data)
 * - chapters: JSON string of chapters array from /chapters endpoint (form field)
 * 
 * Example chapters format:
 * [
 *   {"title": "Chapter 1", "startPage": 1, "tocSections": [...]},
 *   {"title": "Chapter 2", "startPage": 25, "tocSections": null}
 * ]
 */
parseSourceRouter.post("/full", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: "Upload a PDF file with field name 'file'" });
    }
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    // Get chapters from request body
    const chaptersJson = req.body.chapters;
    if (!chaptersJson) {
      return res.status(400).json({ 
        error: "Missing 'chapters' field. First call /chapters endpoint to get the chapters array, then pass it here." 
      });
    }

    let chapters: ChapterInfo[];
    try {
      chapters = typeof chaptersJson === 'string' ? JSON.parse(chaptersJson) : chaptersJson;
      
      if (!Array.isArray(chapters) || chapters.length === 0) {
        return res.status(400).json({ error: "'chapters' must be a non-empty array" });
      }
      
      // Validate chapter structure
      for (const chapter of chapters) {
        if (!chapter.title || typeof chapter.startPage !== 'number') {
          return res.status(400).json({ 
            error: "Each chapter must have 'title' (string) and 'startPage' (number)" 
          });
        }
      }
    } catch (parseError) {
      return res.status(400).json({ error: "Invalid JSON in 'chapters' field" });
    }

    console.log(`Starting full textbook parse for ${file.originalname} with ${chapters.length} chapters...`);
    const units = await parseFullTextbook(file.buffer, chapters);
    
    return res.json({ 
      success: true,
      totalUnits: units.length,
      units 
    });
  } catch (error) {
    console.error("Error parsing textbook:", error);
    res.status(500).json({ error: "Failed to parse the textbook" });
  }
});

export default parseSourceRouter;