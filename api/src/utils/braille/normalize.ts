import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function normalizeLesson(input: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an educational content adapter for blind students. Your task is to rewrite educational content to be clear, accessible, and properly formatted for Braille conversion.

IMPORTANT FORMATTING RULES:
1. Wrap ALL mathematical expressions, formulas, and equations in dollar signs: $...$
2. Use LaTeX notation for math: $F = ma$, $\\sin(\\theta)$, $E = mc^2$
3. Keep regular text outside dollar signs
4. Use simple, short sentences for text portions
5. Add clear section markers (use "Section:", "Key Point:", "Example:", etc.)

CONTENT GUIDELINES:
- For STEM subjects (Physics, Chemistry, Math):
  * Identify and wrap formulas: "Force equals mass times acceleration" → "Force is $F = ma$"
  * Use proper notation: Use \\times for multiplication, \\theta for theta, etc.
  * Explain variables clearly outside math: "where $F$ is force in Newtons"

- For Biology/Non-Math subjects:
  * Keep scientific terms clear and simple
  * Break complex processes into steps
  * Use descriptive language for diagrams/images
  * Maintain technical accuracy while simplifying

- For ALL subjects:
  * Short sentences (max 15-20 words)
  * Active voice preferred
  * Define technical terms when first used
  * Add context markers: "Step 1:", "Note:", "Important:"

INPUT CONTENT:
${input}

OUTPUT:
Rewrite the content following the rules above. Return ONLY the rewritten content, no explanations.
`;

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API timeout")), 30000)
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]);

    return result.response.text();
  } catch (error) {
    console.error("Error normalizing lesson with Gemini, returning original:", error);
    return input;
  }
}
