import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set in environment variables");
}

/**
 * Strip markdown JSON fences from response
 */
const stripJsonFence = (value: string): string => {
  const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch) return fencedMatch[1].trim();
  // Also try plain code fence
  const plainFence = value.match(/```\s*([\s\S]*?)```/);
  if (plainFence) return plainFence[1].trim();
  return value.trim();
};

/**
 * Fix LaTeX backslash escaping for JSON parsing.
 * Gemini often outputs LaTeX like \vec{F} but JSON requires \\ for backslashes.
 * This function escapes unescaped backslashes in string values.
 */
const fixLatexEscaping = (jsonStr: string): string => {
  // Match content inside JSON string values and escape unescaped backslashes
  return jsonStr.replace(/"([^"]*)"/g, (match, content: string) => {
    // Replace single backslashes (not already escaped) with double backslashes
    const fixed = content.replace(/\\(?![\\\"nrtbfu])/g, '\\\\');
    return `"${fixed}"`;
  });
};

/**
 * Attempt to fix common JSON issues from LLM output
 */
const fixCommonJsonIssues = (jsonStr: string): string => {
  let fixed = jsonStr;
  
  // Remove any trailing commas before ] or }
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix unescaped newlines in strings (common LLM issue)
  fixed = fixed.replace(/"([^"]*)\n([^"]*)"/g, (match, before, after) => {
    return `"${before}\\n${after}"`;
  });
  
  // Try to close unclosed arrays/objects at the end
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/]/g) || []).length;
  
  // Add missing closing brackets/braces
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    fixed += ']';
  }
  for (let i = 0; i < openBraces - closeBraces; i++) {
    fixed += '}';
  }
  
  return fixed;
};

/**
 * Safely parse JSON, stripping fences and fixing common issues
 */
export const safeJsonParse = <T = unknown>(value: string): T | null => {
  const stripped = stripJsonFence(value);
  
  // Try parsing strategies in order of preference
  const strategies = [
    // 1. Direct parse
    () => JSON.parse(stripped),
    // 2. Fix LaTeX escaping
    () => JSON.parse(fixLatexEscaping(stripped)),
    // 3. Fix common JSON issues
    () => JSON.parse(fixCommonJsonIssues(stripped)),
    // 4. Fix both LaTeX and common issues
    () => JSON.parse(fixCommonJsonIssues(fixLatexEscaping(stripped))),
  ];
  
  for (const strategy of strategies) {
    try {
      return strategy() as T;
    } catch {
      // Try next strategy
    }
  }
  
  // Log the problematic JSON for debugging
  console.error("JSON parse error: All parsing strategies failed");
  console.error("Raw response (first 500 chars):", stripped.substring(0, 500));
  console.error("Raw response (last 500 chars):", stripped.substring(Math.max(0, stripped.length - 500)));
  return null;
};

/**
 * Check if Gemini API key is configured
 */
export const hasGeminiApiKey = (): boolean => {
  return !!GEMINI_API_KEY;
};

/**
 * Call Gemini API with a prompt and return raw text response
 * @param prompt The prompt to send to Gemini
 * @param model Optional model name (defaults to env GEMINI_MODEL or gemini-2.0-flash-exp)
 * @returns Raw text response from Gemini
 */
export const callGemini = async (prompt: string, model?: string): Promise<string | null> => {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: model || DEFAULT_MODEL });
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text || null;
  } catch (err) {
    console.error("Gemini API call failed:", err);
    throw err;
  }
};

/**
 * Call Gemini API and parse the response as JSON
 * @param prompt The prompt to send to Gemini (should request JSON output)
 * @param model Optional model name (defaults to env GEMINI_MODEL or gemini-2.0-flash-exp)
 * @param retries Number of retries if JSON parsing fails (default: 2)
 * @returns Parsed JSON object of type T, or null if parsing fails
 */
export const callGeminiJson = async <T = unknown>(
  prompt: string, 
  model?: string,
  retries: number = 2
): Promise<T | null> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      console.log(`Retrying Gemini JSON call (attempt ${attempt + 1}/${retries + 1})...`);
    }
    
    const text = await callGemini(prompt, model);
    if (!text) {
      lastError = new Error("Empty response from Gemini");
      continue;
    }
    
    const parsed = safeJsonParse<T>(text);
    if (parsed !== null) {
      return parsed;
    }
    
    lastError = new Error("Failed to parse JSON response");
  }
  
  console.error(`All ${retries + 1} attempts to get valid JSON failed`);
  return null;
};
