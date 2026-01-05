import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

type Section = {
  id: string;
  section: string;
  content: string;
  summary: string;
  diagramSummary?: string;
  diagrams?: string[];
};

type Chapter = {
  chapter: string;
  Sections: Section[];
  chapterSummary?: string;
  chapterContent?: string;
  dynamicIdeas?: string[];
  labels?: string[];
  language?: string;
};

const CHAPTER_HEADING = /^\s*(chapter|unit|section)\s+(\d+)\s*[:.\-]?\s*(.+)?$/i;
const SECTION_HEADING = /^\s*(\d+\.\d+(?:\.\d+)?)\s*[:.\-]?\s*(.+)?$/;
const normalizeLine = (line: string) => line.replace(/\s+/g, " ").trim();
const stripTrailingPageNumber = (title: string) => title.replace(/\s*\d+\s*$/, "").trim();
const hasLetters = (value: string) => /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/.test(value);
const normalizeTitleForMatch = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeKey = (value: string) => normalizeTitleForMatch(value).replace(/\s+/g, " ").trim();

const extractTocChapters = (lines: string[]) => {
  const chapters: Array<{ number: string; title: string }> = [];
  const startIndex = lines.findIndex((line) => line.toLowerCase() === "contents");
  if (startIndex === -1) return chapters;

  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (/^appendix|^answers|^glossary|^index/i.test(line)) break;

    const normalized = line.replace(/\.{2,}/g, " ").replace(/\s+/g, " ").trim();
    const match = normalized.match(/^(chapter|unit|section)\s+(\d+)\s+(.+)\s+(\d{1,4})$/i);
    if (match) {
      const number = match[2];
      const rawTitle = stripTrailingPageNumber(match[3]);
      if (rawTitle) {
        chapters.push({ number, title: rawTitle });
      }
    }
  }

  return chapters;
};

const looksLikeSectionHeading = (line: string, match: RegExpMatchArray) => {
  const title = (match[2] || "").trim();
  if (!title) return false;
  if (!hasLetters(title)) return false;
  const numericParts = match[1].split(".").map((part) => Number(part));
  if (numericParts.some((part) => Number.isNaN(part))) return false;
  if (numericParts[0] > 50 || numericParts[1] > 50) return false;
  if (title.length > 120) return false;
  if (line.length > 140) return false;
  return true;
};

const extractDiagramRefs = (line: string) => {
  const matches = line.match(/(fig(?:ure)?\.?\s*\d+(?:\.\d+)?)/gi);
  return matches ? matches.map((match) => match.trim()) : [];
};

const summarize = (content: string) => {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentenceMatch = cleaned.match(/.*?[.!?](\s|$)/);
  const summary = sentenceMatch ? sentenceMatch[0] : cleaned;
  return summary.slice(0, 220).trim();
};

const parseSourceText = (text: string): Chapter[] => {
  const lines = text.split(/\r?\n/).map(normalizeLine).filter(Boolean);
  const tocChapters = extractTocChapters(lines);
  const chapters: Chapter[] = [];
  const chapterMap = new Map<string, Chapter>();

  for (const tocChapter of tocChapters) {
    const chapterTitle = `Chapter ${tocChapter.number}: ${tocChapter.title}`.replace(/\s+/g, " ").trim();
    const chapter: Chapter = { chapter: chapterTitle, Sections: [] };
    chapters.push(chapter);
    chapterMap.set(tocChapter.number, chapter);
  }

  let currentChapter: Chapter | null = null;
  let currentSection: Section | null = null;
  let currentBuffer: string[] = [];

  const flushSection = () => {
    if (!currentSection) return;
    const content = currentBuffer.join(" ");
    currentSection.content = content;
    currentSection.summary = summarize(content);
    currentBuffer = [];
  };

  const startChapter = (title: string) => {
    if (currentSection) flushSection();
    currentSection = null;
    currentChapter = { chapter: title, Sections: [] };
    chapters.push(currentChapter);
  };

  const startSection = (id: string, title: string) => {
    if (!currentChapter) {
      currentChapter = { chapter: "Chapter 1", Sections: [] };
      chapters.push(currentChapter);
    }
    if (currentSection) flushSection();
    currentSection = { id, section: title, content: "", summary: "", diagrams: [] };
    currentChapter.Sections.push(currentSection);
  };

  for (const line of lines) {
    const chapterMatch = line.match(CHAPTER_HEADING);
    if (chapterMatch) {
      const label = chapterMatch[1];
      const number = chapterMatch[2];
      const rawTitle = chapterMatch[3] ? chapterMatch[3] : "";
      const cleanTitle = stripTrailingPageNumber(rawTitle);
      const title = cleanTitle ? `: ${cleanTitle}` : "";
      const headingTitle = `${label} ${number}${title}`.replace(/\s+/g, " ").trim();

      if (tocChapters.length > 0) {
        const tocChapter = tocChapters.find((entry) => entry.number === number);
        if (tocChapter) {
          const tocTitle = normalizeTitleForMatch(tocChapter.title);
          const headingNormalized = normalizeTitleForMatch(cleanTitle);
          if (!headingNormalized || tocTitle.includes(headingNormalized) || headingNormalized.includes(tocTitle)) {
            currentChapter = chapterMap.get(number) || null;
            if (!currentChapter) {
              currentChapter = { chapter: headingTitle, Sections: [] };
              chapters.push(currentChapter);
              chapterMap.set(number, currentChapter);
            } else {
              currentChapter.chapter = `Chapter ${number}: ${tocChapter.title}`.trim();
            }
            continue;
          }
        }
      } else {
        startChapter(headingTitle);
        continue;
      }
    }

    const sectionMatch = line.match(SECTION_HEADING);
    if (sectionMatch && looksLikeSectionHeading(line, sectionMatch)) {
      const id = sectionMatch[1];
      const title = sectionMatch[2] || `Section ${id}`;
      startSection(id, title);
      continue;
    }

    if (!currentSection) {
      startSection("1.1", "Introduction");
    }

    const diagrams = extractDiagramRefs(line);
    if (diagrams.length && currentSection.diagrams) {
      currentSection.diagrams.push(...diagrams);
    }
    currentBuffer.push(line);
  }

  if (currentSection) flushSection();

  return chapters;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const PARSE_CHUNK_CHARS = Number(process.env.GEMINI_PARSE_CHUNK_CHARS || "12000");
const PARSE_CHUNK_OVERLAP = Number(process.env.GEMINI_PARSE_CHUNK_OVERLAP || "1500");

const stripJsonFence = (value: string) => {
  const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch) return fencedMatch[1].trim();
  return value.trim();
};

const safeJsonParse = (value: string) => {
  try {
    return JSON.parse(stripJsonFence(value));
  } catch (error) {
    return null;
  }
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const callGemini = async (prompt: string) => {
  if (!GEMINI_API_KEY) return null;
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200,
        response_mime_type: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") return null;
  return safeJsonParse(text);
};

const chunkText = (text: string, chunkSize: number, overlap: number) => {
  const paragraphs = text.split(/\n{2,}/).map((para) => para.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length > chunkSize && current) {
      chunks.push(current);
      const tail = current.slice(Math.max(0, current.length - overlap));
      current = tail ? `${tail}\n\n${paragraph}` : paragraph;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
};

const buildParsePrompt = (chunk: string, chunkIndex: number, totalChunks: number) => [
  "You are parsing a textbook PDF into structured JSON.",
  "The source can be any language; do not translate.",
  "Ignore headers, footers, page numbers, and repeated artifacts.",
  "Return ONLY valid JSON with this shape:",
  "[",
  '  { "chapter": "Chapter Name", "Sections": [',
  '      { "id": "1.1", "section": "Section name", "summary": "2-3 sentences", "diagramSummary": "", "diagrams": [] }',
  "    ] }",
  "]",
  "Use empty string for id if missing.",
  "Summaries should be concise and accurate.",
  `Chunk ${chunkIndex + 1} of ${totalChunks}.`,
  `Text:\n${chunk}`,
].join("\n");

const mergeChapters = (base: Chapter[], incoming: Chapter[]) => {
  for (const incomingChapter of incoming) {
    const chapterTitle = (incomingChapter as Chapter).chapter || "";
    if (!chapterTitle) continue;
    const chapterKey = normalizeKey(chapterTitle);
    let target = base.find((chapter) => normalizeKey(chapter.chapter) === chapterKey);
    if (!target) {
      target = {
        chapter: chapterTitle,
        Sections: [],
        chapterSummary: incomingChapter.chapterSummary,
        chapterContent: incomingChapter.chapterContent,
        dynamicIdeas: incomingChapter.dynamicIdeas,
        labels: incomingChapter.labels,
        language: incomingChapter.language,
      };
      base.push(target);
    }

    const incomingSections =
      (incomingChapter as Chapter).Sections || (incomingChapter as { sections?: Section[] }).sections || [];
    for (const incomingSection of incomingSections) {
      const sectionTitle = incomingSection.section || (incomingSection as { title?: string }).title || "";
      if (!sectionTitle) continue;
      const sectionKey = incomingSection.id
        ? `${incomingSection.id}:${normalizeKey(sectionTitle)}`
        : normalizeKey(sectionTitle);
      const existing = target.Sections.find((section) => {
        const existingKey = section.id
          ? `${section.id}:${normalizeKey(section.section)}`
          : normalizeKey(section.section);
        return existingKey === sectionKey;
      });

      if (!existing) {
        target.Sections.push({
          id: incomingSection.id || "",
          section: sectionTitle,
          content: "",
          summary: incomingSection.summary || "",
          diagramSummary: incomingSection.diagramSummary,
          diagrams: incomingSection.diagrams ? [...incomingSection.diagrams] : [],
        });
      } else {
        if (!existing.summary && incomingSection.summary) existing.summary = incomingSection.summary;
        if (!existing.diagramSummary && incomingSection.diagramSummary) {
          existing.diagramSummary = incomingSection.diagramSummary;
        }
        if (incomingSection.diagrams && existing.diagrams) {
          for (const diagram of incomingSection.diagrams) {
            if (!existing.diagrams.includes(diagram)) existing.diagrams.push(diagram);
          }
        }
      }
    }
  }
};

const parseSourceWithGemini = async (text: string) => {
  const chunks = chunkText(text, PARSE_CHUNK_CHARS, PARSE_CHUNK_OVERLAP);
  const chapters: Chapter[] = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const aiData = await callGemini(buildParsePrompt(chunk, i, chunks.length));
    if (Array.isArray(aiData)) {
      mergeChapters(chapters, aiData as Chapter[]);
    } else if (aiData && Array.isArray((aiData as { chapters?: Chapter[] }).chapters)) {
      mergeChapters(chapters, (aiData as { chapters: Chapter[] }).chapters);
    }
  }

  return chapters;
};

const buildChapterPrompt = (chapter: Chapter) => {
  const sectionTitles = chapter.Sections.map((section) => section.section).slice(0, 50);
  const sampleContent = chapter.Sections.map((section) => section.summary).join("\n\n");

  return [
    "You are summarizing a chapter from a PDF. The source can be any language.",
    "Detect the language and respond in the same language.",
    "Return ONLY valid JSON with this shape:",
    "{",
    '  "language": "string (detected language name or ISO code)",',
    '  "chapterSummary": "2-3 sentences",',
    '  "chapterContent": "1-2 short paragraphs teaching the chapter",',
    '  "dynamicIdeas": ["idea1", "idea2", "idea3"],',
    '  "labels": ["keyword1", "keyword2", "keyword3"]',
    "}",
    "Labels should help find similar content in a database.",
    `Chapter title: ${chapter.chapter}`,
    `Section titles: ${sectionTitles.join(" | ")}`,
    `Sample content:\n${sampleContent}`,
  ].join("\n");
};

const enrichChapterWithGemini = async (chapter: Chapter) => {
  const prompt = buildChapterPrompt(chapter);
  const aiData = await callGemini(prompt);
  if (!aiData) return;

  if (typeof aiData.language === "string") chapter.language = aiData.language;
  if (typeof aiData.chapterSummary === "string") chapter.chapterSummary = aiData.chapterSummary;
  if (typeof aiData.chapterContent === "string") chapter.chapterContent = aiData.chapterContent;
  if (Array.isArray(aiData.dynamicIdeas)) chapter.dynamicIdeas = aiData.dynamicIdeas;
  if (Array.isArray(aiData.labels)) chapter.labels = aiData.labels;
};

const handleParse = async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: "Upload a PDF file with field name 'file'" });
    }
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    const parsedPdf = await pdfParse(file.buffer);
    const text = parsedPdf.text;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "No text found in PDF" });
    }

    let chapters: Chapter[] = [];
    if (GEMINI_API_KEY) {
      chapters = await parseSourceWithGemini(text);
    }
    if (!chapters.length) {
      chapters = parseSourceText(text);
    }

    if (GEMINI_API_KEY) {
      for (const chapter of chapters) {
        await enrichChapterWithGemini(chapter);
      }
    }

    for (const chapter of chapters) {
      for (const section of chapter.Sections) {
        section.content = "";
      }
    }

    res.json(chapters);
  } catch (error) {
    console.error("Error parsing source:", error);
    res.status(500).json({ error: "Failed to parse the source" });
  }
};

router.post("/parse_source", upload.single("file"), handleParse);

export default router;
