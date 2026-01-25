import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set in environment variables");
}

/**
 * Generate an image using Gemini's Imagen model
 * @param prompt The description/prompt for the image
 * @param numberOfImages Number of images to generate (1-4, default: 1)
 * @returns Array of base64-encoded image data
 */
export const generateImage = async (
  prompt: string,
  numberOfImages: number = 1
): Promise<string[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt is required");
  }

  if (numberOfImages < 1 || numberOfImages > 4) {
    throw new Error("numberOfImages must be between 1 and 4");
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });

    console.log(`Generating ${numberOfImages} image(s) with prompt: "${prompt.substring(0, 100)}..."`);

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images were generated");
    }

    const imageData: string[] = [];
    for (const generatedImage of response.generatedImages) {
      if (generatedImage.image?.imageBytes) {
        imageData.push(generatedImage.image.imageBytes);
      }
    }

    if (imageData.length === 0) {
      throw new Error("Generated images but no image bytes found");
    }

    console.log(`✓ Successfully generated ${imageData.length} image(s)`);
    return imageData;
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image: Unknown error");
  }
};

/**
 * Generate a single image and return it as base64 data URL
 * @param prompt The description/prompt for the image
 * @returns Base64 data URL (data:image/png;base64,...)
 */
export const generateImageAsDataUrl = async (
  prompt: string
): Promise<string> => {
  const images = await generateImage(prompt, 1);
  if (images.length === 0) {
    throw new Error("No image was generated");
  }
  return `data:image/png;base64,${images[0]}`;
};
