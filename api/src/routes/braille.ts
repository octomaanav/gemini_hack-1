import { Router } from "express";
import { normalizeLesson } from "../utils/braille/normalize.js";
import { textToBraille } from "../utils/braille/validate.js";
import { formatToBRF } from "../utils/braille/toBRF.js";
import { convertMixedLesson } from "../utils/braille/parseLesson.js";

const brailleRouter = Router();

brailleRouter.post("/convert", async (req, res) => {
  try {
    const { lesson, normalize } = req.body;

    if (!lesson) {
      return res.status(400).json({ 
        error: "Lesson content is required",
        example: { 
          lesson: "The formula for force is $F = ma$ where F is force in Newtons." 
        }
      });
    }

    // Optionally normalize with Gemini first
    let processedLesson = lesson;
    if (normalize === true) {
      processedLesson = await normalizeLesson(lesson);
    }

    const result = await convertMixedLesson(processedLesson);

    if (!result.success) {
      return res.status(500).json({
        error: "Failed to convert mixed lesson",
      });
    }

    const brf = formatToBRF(result.fullBraille);

    res.json({
      success: true,
      original: lesson,
      normalized: normalize ? processedLesson : undefined,
      segments: result.segments.map(seg => ({
        type: seg.type,
        original: seg.original,
        braille: seg.braille,
        description: seg.type === "text" ? "English Braille (Grade 2)" : "Nemeth Code (Math)"
      })),
      fullBraille: result.fullBraille,
      englishTextOnly: result.englishOnly,
      mathExpressionsFound: result.mathOnly,
      brf,
      stats: {
        totalSegments: result.segments.length,
        textSegments: result.segments.filter(s => s.type === "text").length,
        mathSegments: result.segments.filter(s => s.type === "math").length,
        brailleLength: result.fullBraille.length,
      }
    });
  } catch (error) {
    console.error("Error converting lesson:", error);
    res.status(500).json({
      error: "Failed to convert lesson",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


brailleRouter.post("/nemeth", async (req, res) => {
  try {
    const { text, expression } = req.body;
    const mathText = text || expression;

    if (!mathText) {
      return res.status(400).json({ 
        error: "Text or expression is required",
        example: { text: "sin(theta) = opposite / hypotenuse" }
      });
    }

    const result = await textToBraille(mathText, "nemeth");

    if (!result.success) {
      return res.status(500).json({
        error: "Nemeth translation failed",
        message: result.error,
      });
    }

    res.json({
      success: true,
      originalExpression: mathText,
      nemethBraille: result.braille,
      format: "Nemeth Code (Mathematical Braille)"
    });
  } catch (error) {
    console.error("Error translating to Nemeth:", error);
    res.status(500).json({
      error: "Failed to translate to Nemeth Code",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default brailleRouter;

