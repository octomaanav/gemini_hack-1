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

export function parseLesson(lesson: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let currentIndex = 0;
  
  // Regular expressions for different math delimiters
  const patterns = [
    { regex: /\$\$([^\$]+)\$\$/g, type: "display" },  // $$...$$
    { regex: /\$([^\$]+)\$/g, type: "inline" },        // $...$
    { regex: /\\\[([^\]]+)\\\]/g, type: "display" },   // \[...\]
    { regex: /\\\(([^\)]+)\\\)/g, type: "inline" },    // \(...\)
  ];
  
  // Find all math expressions with their positions
  const mathMatches: Array<{ start: number; end: number; content: string; original: string }> = [];
  
  for (const pattern of patterns) {
    let match;
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(lesson)) !== null) {
      mathMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        original: match[0],
      });
    }
  }
  
  // Sort by position
  mathMatches.sort((a, b) => a.start - b.start);
  
  // Extract segments
  for (const mathMatch of mathMatches) {
    // Add text before this math expression
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
    
    // Add the math expression
    segments.push({
      type: "math",
      content: mathMatch.content,
      original: mathMatch.original,
    });
    
    currentIndex = mathMatch.end;
  }
  
  // Add remaining text
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
  
  // If no math found, treat entire text as text
  if (segments.length === 0) {
    segments.push({
      type: "text",
      content: lesson.trim(),
      original: lesson.trim(),
    });
  }
  
  return segments;
}

/**
 * Clean LaTeX notation for Nemeth conversion
 * Converts LaTeX commands to readable math
 */
function cleanLatexForNemeth(latex: string): string {
  let cleaned = latex;
  
  // Common LaTeX commands
  const replacements: Record<string, string> = {
    '\\times': '*',
    '\\cdot': '*',
    '\\div': '/',
    '\\frac': '',  // Handle separately
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
    cleaned = cleaned.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), replacement);
  }
  
  // Handle fractions: \frac{a}{b} -> (a/b)
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
  
  // Handle square roots: \sqrt{x} -> sqrt(x)
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  
  // Remove remaining braces
  cleaned = cleaned.replace(/[{}]/g, '');
  
  // Remove backslashes
  cleaned = cleaned.replace(/\\/g, '');
  
  return cleaned.trim();
}

/**
 * Convert a mixed lesson (text + math) to Braille
 */
export async function convertMixedLesson(lesson: string): Promise<MixedBrailleResult> {
  try {
    const segments = parseLesson(lesson);
    const convertedSegments = [];
    let fullBraille = "";
    let englishOnly = "";
    const mathOnly: string[] = [];
    
    for (const segment of segments) {
      if (segment.type === "text") {
        // Convert text to English Braille
        const result = await textToBraille(segment.content, "en-us-g2");
        convertedSegments.push({
          type: "text" as const,
          original: segment.original,
          braille: result.braille,
        });
        fullBraille += result.braille + "⠀"; // Add space
        englishOnly += segment.content + " ";
      } else {
        // Convert math to Nemeth Braille
        const cleanedMath = cleanLatexForNemeth(segment.content);
        const result = await textToBraille(cleanedMath, "nemeth");
        
        // Add Nemeth indicators (⠼ is number indicator, we'll use it as a simple marker)
        const nemethBraille = "⠸⠩" + result.braille + "⠸⠱"; // Nemeth opening/closing
        
        convertedSegments.push({
          type: "math" as const,
          original: segment.original,
          braille: nemethBraille,
        });
        fullBraille += nemethBraille + "⠀"; // Add space
        mathOnly.push(segment.original + " = " + cleanedMath);
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

