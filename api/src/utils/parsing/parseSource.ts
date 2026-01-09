import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { callGeminiJson } from "../gemini.js";

// Section listed in TOC (before full parsing)
export interface TOCSection {
  sectionId: string;
  title: string;
  page?: number;
}

// Basic chapter info from TOC with optional sections
export interface ChapterInfo {
  title: string;
  startPage: number;
  tocSections: TOCSection[] | null; // null if sections not listed in TOC
}

// Section within a unit/chapter (after full parsing)
export interface Section {
  sectionId: string;
  title: string;
  description: string;
  learningGoals: string[];
}

// Full parsed unit structure
export interface ParsedUnit {
  unitTitle: string;
  unitDescription: string;
  sections: Section[];
}

interface TOCCandidate {
  pageNum: number;
  score: number;
  text: string;
}

/**
 * Score a page to determine how likely it is to be a TOC page.
 * Higher score = more likely to be TOC.
 */
function scoreTOCPage(pageText: string): number {
  let score = 0;
  const lowerText = pageText.toLowerCase();
  
  // Strong indicators: "Table of Contents" or "Contents" as a standalone heading
  // Check if it appears near the start or as a prominent phrase
  if (/^[\s]*table\s+of\s+contents/i.test(pageText) || 
      /\n[\s]*table\s+of\s+contents/i.test(pageText)) {
    score += 50;
  } else if (/^[\s]*contents[\s]*$/im.test(pageText) || 
             /\n[\s]*contents[\s]*\n/i.test(pageText)) {
    score += 40;
  } else if (lowerText.includes("table of contents")) {
    score += 30;
  } else if (lowerText.includes("contents")) {
    score += 10;
  }
  
  // Count page number patterns (lines ending with numbers, or "... 23" patterns)
  // TOC pages typically have many such patterns
  const pageNumberPatterns = pageText.match(/\.{2,}\s*\d+|\s+\d{1,4}\s*$/gm) || [];
  score += Math.min(pageNumberPatterns.length * 5, 40); // Cap at 40 points
  
  // Count entries that look like chapter/unit listings
  const chapterPatterns = pageText.match(/chapter\s+\d+|unit\s+\d+|lesson\s+\d+|\d+\.\s+[A-Z]/gi) || [];
  score += Math.min(chapterPatterns.length * 8, 32); // Cap at 32 points
  
  // Penalize if the page has very long paragraphs (likely content, not TOC)
  const avgWordsPerLine = pageText.split('\n').reduce((acc, line) => {
    const words = line.trim().split(/\s+/).length;
    return acc + words;
  }, 0) / Math.max(pageText.split('\n').length, 1);
  
  if (avgWordsPerLine > 15) {
    score -= 20; // Likely a content page, not TOC
  }
  
  // Bonus if many lines have similar structure (typical of TOC)
  const lines = pageText.split('\n').filter(l => l.trim().length > 0);
  const linesWithNumbers = lines.filter(l => /\d+\s*$/.test(l.trim())).length;
  if (lines.length > 5 && linesWithNumbers / lines.length > 0.3) {
    score += 25; // More than 30% of lines end with numbers
  }
  
  return score;
}

export async function extractTOCText(
  buffer: Buffer,
  maxPagesToScan = 40,
  maxTocPagesToExtract = 30
): Promise<string> {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const candidates: TOCCandidate[] = [];
  const minScoreThreshold = 25; // Minimum score to be considered a TOC candidate

  // Scan first N pages and score each one
  for (let pageNum = 1; pageNum <= Math.min(maxPagesToScan, pdf.numPages); pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    
    // Also get text with newlines preserved for better pattern matching
    const pageTextWithNewlines = content.items.map((item: any) => {
      // pdfjs items have transform info; use hasEOL or check for significant Y changes
      return item.str + (item.hasEOL ? '\n' : ' ');
    }).join("");

    const score = scoreTOCPage(pageTextWithNewlines);
    
    if (score >= minScoreThreshold) {
      candidates.push({ pageNum, score, text: pageText });
      console.log(`Page ${pageNum} scored ${score} as potential TOC`);
    }
  }

  if (candidates.length === 0) {
    throw new Error("Could not find Table of Contents page. No pages matched TOC patterns.");
  }

  // Sort by score (highest first) and pick the best candidate
  candidates.sort((a, b) => b.score - a.score);
  const bestCandidate = candidates[0];
  
  console.log(`Selected page ${bestCandidate.pageNum} as TOC start (score: ${bestCandidate.score})`);

  // Extract pages starting from TOC
  const tocPages: string[] = [];
  const pagesToExtract = Math.min(maxTocPagesToExtract, pdf.numPages - bestCandidate.pageNum + 1);

  for (let i = 0; i < pagesToExtract; i++) {
    const pageNum = bestCandidate.pageNum + i;
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    tocPages.push(pageText);
  }

  console.log(`Extracted ${tocPages.length} pages starting from TOC (page ${bestCandidate.pageNum})`);
  return tocPages.join("\n\n");
}

export async function extractChaptersWithGemini(buffer: Buffer): Promise<ChapterInfo[]> {
  const tocText = await extractTOCText(buffer);
  
  const prompt = `You are a PDF parsing assistant. Below is the text extracted from a textbook's Table of Contents (TOC) section. It may span multiple pages.

Your task:
1. Identify ALL chapters/units listed in the TOC - make sure you don't miss any or create duplicates
2. Extract the chapter title and its starting page number
3. For EACH chapter, check if the TOC lists sub-sections/topics under it. If sections ARE listed, include them. If NOT listed, set tocSections to null.
4. Return ONLY valid JSON in this exact format:

{
  "chapters": [
    {
      "title": "Chapter 1: Physical World",
      "startPage": 1,
      "tocSections": [
        {"sectionId": "1.1", "title": "What is Physics?", "page": 1},
        {"sectionId": "1.2", "title": "Scope and Excitement of Physics", "page": 3}
      ]
    },
    {
      "title": "Chapter 2: Units and Measurements",
      "startPage": 16,
      "tocSections": null
    },
    {
      "title": "Chapter 3: Motion in a Straight Line",
      "startPage": 35,
      "tocSections": [
        {"sectionId": "3.1", "title": "Position, Path Length and Displacement", "page": 35},
        {"sectionId": "3.2", "title": "Average Velocity and Average Speed", "page": 38}
      ]
    }
  ]
}

CRITICAL Rules:
- Extract EVERY chapter in sequential order (Chapter 1, 2, 3, 4... or Unit 1, 2, 3...)
- Do NOT skip any chapters - if you see Chapter 1, 2, 4 you are missing Chapter 3
- Do NOT duplicate chapters - each chapter should appear exactly once
- Page numbers must be integers
- tocSections should be an array of sections IF they are explicitly listed in the TOC under that chapter
- tocSections should be null if the TOC does NOT list sub-sections for that chapter
- sectionId should match the numbering in the TOC (e.g., "1.1", "1.2" or "2.1", "2.2")
- Include "Preface", "Introduction", "Appendix", "Answers" etc. as separate entries if they appear
- Stop parsing when you detect the TOC has ended (e.g., when actual chapter content starts)
- Return ONLY the JSON object, no other text

TOC Text:
${tocText}`;

  const result = await callGeminiJson<{ chapters: ChapterInfo[] }>(prompt);
  
  if (!result || !result.chapters || result.chapters.length === 0) {
    throw new Error("Failed to extract chapters from TOC using Gemini");
  }

  // Validate and deduplicate chapters
  const seenTitles = new Set<string>();
  const uniqueChapters: ChapterInfo[] = [];
  
  for (const chapter of result.chapters) {
    // Normalize title for comparison
    const normalizedTitle = chapter.title.toLowerCase().trim();
    
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueChapters.push(chapter);
    } else {
      console.warn(`Duplicate chapter detected and removed: "${chapter.title}"`);
    }
  }

  // Sort by startPage to ensure correct order
  uniqueChapters.sort((a, b) => a.startPage - b.startPage);

  console.log(`Gemini extracted ${uniqueChapters.length} unique chapters`);
  return uniqueChapters;
}

/**
 * Extract text for a specific page range from PDF
 */
async function extractPagesText(
  pdf: pdfjs.PDFDocumentProxy,
  startPage: number,
  endPage: number
): Promise<string> {
  let text = "";
  for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
    if (pageNum > pdf.numPages) break;
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

/**
 * Extract text for each chapter based on Gemini-parsed chapters
 */
export async function extractChapterTexts(buffer: Buffer) {
  const chapters = await extractChaptersWithGemini(buffer);
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const chapterTexts: Record<string, string> = {};

  for (let i = 0; i < chapters.length; i++) {
    const startPage = chapters[i].startPage;
    const endPage = i + 1 < chapters.length ? chapters[i + 1].startPage - 1 : pdf.numPages;
    chapterTexts[chapters[i].title] = await extractPagesText(pdf, startPage, endPage);
  }

  return { chapters, chapterTexts };
}

/**
 * Parse a single chapter/unit into sections with learning goals using Gemini
 * @param chapterTitle - The title of the chapter
 * @param chapterText - The extracted text content of the chapter
 * @param tocSections - Optional sections from TOC to guide parsing
 */
async function parseChapterSections(
  chapterTitle: string,
  chapterText: string,
  tocSections: TOCSection[] | null = null
): Promise<ParsedUnit> {
  // Build section guidance if TOC sections are available
  let sectionGuidance = "";
  if (tocSections && tocSections.length > 0) {
    sectionGuidance = `
IMPORTANT: The Table of Contents lists the following sections for this chapter. Use these as the PRIMARY structure:
${tocSections.map(s => `- ${s.sectionId}: ${s.title}`).join('\n')}

Your sections MUST match these TOC sections. Add learning goals for each.
`;
  }

  const prompt = `You are an educational content parser. Below is the text extracted from a textbook chapter/unit.

Your task:
1. Identify the unit/chapter title and create a brief description
2. Break down the chapter into logical sections/topics
3. For each section, identify the key learning goals/objectives
${sectionGuidance}
Return ONLY valid JSON in this exact format:
{
  "unitTitle": "Unit 1: Kinematics",
  "unitDescription": "Explore the fundamentals of motion by analyzing and applying multiple representations such as words, diagrams, graphs, and equations.",
  "sections": [
    {
      "sectionId": "1.1",
      "title": "Scalars and Vectors in One Dimension",
      "description": "Introduce scalar and vector quantities and their role in describing motion in one dimension.",
      "learningGoals": [
        "Explain scalars",
        "Explain vectors",
        "Differentiate between scalar and vector quantities",
        "Understand position, distance, and displacement"
      ]
    },
    {
      "sectionId": "1.2",
      "title": "Visual Representations of Motion",
      "description": "Use diagrams and graphs to describe motion and extract physical meaning from them.",
      "learningGoals": [
        "Interpret position-time graphs",
        "Interpret velocity-time graphs",
        "Find displacement from velocity graphs"
      ]
    }
  ]
}

Rules:
- unitTitle should match or be derived from the chapter title: "${chapterTitle}"
- unitDescription should be 1-2 sentences summarizing the chapter's focus
- ${tocSections ? 'Use the TOC sections provided above as the structure' : 'Break the chapter into 2-8 logical sections based on the content'}
- Each section should have 3-8 specific, actionable learning goals
- sectionId should follow a numbering scheme (1.1, 1.2, etc. or match the textbook's numbering if visible)
- Learning goals should start with action verbs (Explain, Calculate, Interpret, Differentiate, Understand, Apply, etc.)
- Return ONLY the JSON object, no other text

Chapter Text:
${chapterText.substring(0, 15000)}`;  // Limit text to avoid token limits

  const result = await callGeminiJson<ParsedUnit>(prompt);
  
  if (!result || !result.unitTitle || !result.sections) {
    throw new Error(`Failed to parse sections for chapter: ${chapterTitle}`);
  }

  return result;
}

/**
 * Full parsing pipeline: Parse chapters into sections with learning goals
 * @param buffer - PDF file buffer
 * @param chapters - Pre-extracted chapters from the /chapters endpoint
 */
export async function parseFullTextbook(buffer: Buffer, chapters: ChapterInfo[]): Promise<ParsedUnit[]> {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;

  const parsedUnits: ParsedUnit[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const startPage = chapter.startPage;
    const endPage = i + 1 < chapters.length ? chapters[i + 1].startPage - 1 : pdf.numPages;
    
    const hasTocSections = chapter.tocSections && chapter.tocSections.length > 0;
    console.log(`Parsing chapter "${chapter.title}" (pages ${startPage}-${endPage})${hasTocSections ? ` with ${chapter.tocSections!.length} TOC sections` : ''}...`);
    
    const chapterText = await extractPagesText(pdf, startPage, endPage);
    
    try {
      const parsedUnit = await parseChapterSections(chapter.title, chapterText, chapter.tocSections);
      parsedUnits.push(parsedUnit);
      console.log(`  → Extracted ${parsedUnit.sections.length} sections`);
    } catch (error) {
      console.error(`  → Failed to parse chapter "${chapter.title}":`, error);
      // Add a placeholder for failed chapters
      parsedUnits.push({
        unitTitle: chapter.title,
        unitDescription: "Failed to parse this chapter.",
        sections: []
      });
    }
  }

  return parsedUnits;
}
