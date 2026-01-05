import { textToBraille } from "./validate.js";

interface ParsedSegment {
  type: "text" | "math";
  content: string;
  original: string;
}

export interface MixedBrailleResult {
  segments: Array<{
    type: "text" | "math";
    original: string;
    braille: string;
  }>;
  fullBraille: string;
  englishOnly: string;
  mathOnly: string[];
  success: boolean;
}

function isMathLine(line: string): boolean {
  const mathIndicators = [
    /^[a-zA-Z](_\d+)?\s*=\s*/,
    /\^[\d\(\{]/,
    /[±÷×√∞≠≤≥∑∏∫]/,
    /\[.*\].*\//,
    /\b(sin|cos|tan|log|ln|sqrt|lim)\s*\(/,
    /=\s*\[/,
  ];
  
  return mathIndicators.some(pattern => pattern.test(line));
}

export function parseLesson(lesson: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let currentIndex = 0;
  
  const patterns = [
    { regex: /\$\$([^\$]+)\$\$/g, type: "display" },
    { regex: /\\\[([^\]]+)\\\]/g, type: "display" },
    { regex: /\\\(([^\)]+)\\\)/g, type: "inline" },
    { regex: /\$([^\$]+)\$/g, type: "inline" },
  ];
  
  const mathMatches: Array<{ start: number; end: number; content: string; original: string }> = [];
  
  for (const pattern of patterns) {
    let match;
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(lesson)) !== null) {
      const newMatch = {
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        original: match[0],
      };
      
      const hasOverlap = mathMatches.some(
        existing => 
          (newMatch.start >= existing.start && newMatch.start < existing.end) ||
          (newMatch.end > existing.start && newMatch.end <= existing.end) ||
          (newMatch.start <= existing.start && newMatch.end >= existing.end)
      );
      
      if (!hasOverlap) {
        mathMatches.push(newMatch);
      }
    }
  }
  
  mathMatches.sort((a, b) => a.start - b.start);
  
  for (const mathMatch of mathMatches) {
    if (mathMatch.start > currentIndex) {
      const textContent = lesson.substring(currentIndex, mathMatch.start).trim();
      if (textContent) {
        segments.push({
          type: "text",
          content: textContent,
          original: textContent,
        });
      }
    }
    
    segments.push({
      type: "math",
      content: mathMatch.content,
      original: mathMatch.original,
    });
    
    currentIndex = mathMatch.end;
  }
  
  if (currentIndex < lesson.length) {
    const textContent = lesson.substring(currentIndex).trim();
    if (textContent) {
      segments.push({
        type: "text",
        content: textContent,
        original: textContent,
      });
    }
  }
  
  if (segments.length === 0) {
    segments.push({
      type: "text",
      content: lesson.trim(),
      original: lesson.trim(),
    });
  }
  
  const processedSegments: ParsedSegment[] = [];
  
  for (const segment of segments) {
    if (segment.type === "text") {
      const lines = segment.content.split('\n');
      let currentText = "";
      
      for (const line of lines) {
        if (line.trim() && isMathLine(line)) {
          if (currentText.trim()) {
            processedSegments.push({
              type: "text",
              content: currentText.trim(),
              original: currentText.trim(),
            });
            currentText = "";
          }
          processedSegments.push({
            type: "math",
            content: line.trim(),
            original: line.trim(),
          });
        } else {
          currentText += line + '\n';
        }
      }
      
      if (currentText.trim()) {
        processedSegments.push({
          type: "text",
          content: currentText.trim(),
          original: currentText.trim(),
        });
      }
    } else {
      processedSegments.push(segment);
    }
  }
  
  return processedSegments.length > 0 ? processedSegments : segments;
}

function cleanLatexForNemeth(latex: string): string {
  let cleaned = latex;
  
  const replacements: Record<string, string> = {
    '\\times': '*',
    '\\cdot': '*',
    '\\div': '/',
    '\\frac': '',
    '\\sqrt': 'sqrt',
    '\\sin': 'sin',
    '\\cos': 'cos',
    '\\tan': 'tan',
    '\\theta': 'theta',
    '\\alpha': 'alpha',
    '\\beta': 'beta',
    '\\gamma': 'gamma',
    '\\delta': 'delta',
    '\\omega': 'omega',
    '\\lambda': 'lambda',
    '\\pi': 'pi',
    '\\mu': 'mu',
    '\\tau': 'tau',
    '\\sigma': 'sigma',
    '\\rho': 'rho',
    '\\phi': 'phi',
    '^\\circ': ' degrees',
  };
  
  for (const [latex, replacement] of Object.entries(replacements)) {
    const escapedLatex = latex.replace(/\\/g, '\\\\');
    cleaned = cleaned.replace(new RegExp(escapedLatex + '(?![a-zA-Z])', 'g'), replacement);
  }
  
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  cleaned = cleaned.replace(/[{}]/g, '');
  cleaned = cleaned.replace(/\\/g, '');
  
  return cleaned.trim();
}

export async function convertMixedLesson(lesson: string): Promise<MixedBrailleResult> {
  try {
    const segments = parseLesson(lesson);
    const convertedSegments = [];
    let englishOnly = "";
    const mathOnly: string[] = [];
    
    const braillePromises = segments.map(async (segment) => {
      if (segment.type === "text") {
        const result = await textToBraille(segment.content, "en-us-g2");
        return {
          type: "text" as const,
          original: segment.original,
          braille: result.braille,
          cleanedContent: segment.content,
        };
      } else {
        const cleanedMath = cleanLatexForNemeth(segment.content);
        const result = await textToBraille(cleanedMath, "nemeth");
        const nemethBraille = "⠸⠩" + result.braille + "⠸⠱";
        return {
          type: "math" as const,
          original: segment.original,
          braille: nemethBraille,
          cleanedContent: cleanedMath,
        };
      }
    });
    
    const processedSegments = await Promise.all(braillePromises);
    
    let fullBraille = "";
    for (const segment of processedSegments) {
      convertedSegments.push({
        type: segment.type,
        original: segment.original,
        braille: segment.braille,
      });
      
      if (segment.type === "text") {
        fullBraille += segment.braille + "⠀";
        englishOnly += segment.cleanedContent + "\n";
      } else {
        fullBraille += segment.braille + "⠀";
        mathOnly.push(segment.original + " → " + segment.braille);
      }
    }
    
    return {
      segments: convertedSegments,
      fullBraille: fullBraille.trim(),
      englishOnly: englishOnly.trim(),
      mathOnly,
      success: true,
    };
  } catch (error) {
    console.error("Error converting mixed lesson:", error);
    return {
      segments: [],
      fullBraille: "",
      englishOnly: "",
      mathOnly: [],
      success: false,
    };
  }
}
