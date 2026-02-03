import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execPromise = promisify(exec);

export async function textToBraille(
  text: string,
  table: "en-us-g2" | "nemeth"
): Promise<{ braille: string; success: boolean; error?: string }> {
  try {
    const tempDir = tmpdir();
    const inputFile = join(tempDir, `braille-input-${Date.now()}.txt`);
    const outputFile = join(tempDir, `braille-output-${Date.now()}.txt`);

    await writeFile(inputFile, text, 'utf-8');

    const tableFile = table === "nemeth" 
      ? 'unicode.dis,en-us-mathtext.ctb'
      : 'unicode.dis,en-us-g2.ctb';

    // Run lou_translate and capture stdout directly to avoid temp file races
    try {
      const { stdout: brailleOut, stderr } = await execPromise(
        `lou_translate ${tableFile} < ${inputFile}`
      );

      if (stderr) {
        console.warn('Liblouis translation warning:', stderr);
      }

      await unlink(inputFile).catch(() => {});

      return {
        braille: (brailleOut || '').trim(),
        success: true,
      };
    } catch (e: any) {
      // If lou_translate is not found or failed, surface a clearer message
      console.error('Liblouis forward translation failed:', e?.message || e);
      await unlink(inputFile).catch(() => {});
      return {
        braille: "",
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  } catch (error) {
    console.error("Liblouis translation error:", error);
    return {
      braille: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function validateBraille(
  braille: string,
  table: "en-us-g2" | "nemeth"
): Promise<{ backTranslated: string; isValid: boolean; error?: string }> {
  try {
    const tempDir = tmpdir();
    const inputFile = join(tempDir, `braille-validate-${Date.now()}.txt`);
    
    await writeFile(inputFile, braille, 'utf-8');

    const tableFile = table === "nemeth" 
      ? 'unicode.dis,en-us-mathtext.ctb'
      : 'unicode.dis,en-us-g2.ctb';

    const { stdout: backTranslated, stderr } = await execPromise(
      `lou_translate --backward ${tableFile} < ${inputFile}`
    );

    if (stderr) {
      console.warn('Liblouis back-translation warning:', stderr);
    }

    await unlink(inputFile).catch(() => {});

    return {
      backTranslated: backTranslated.trim() || "[Empty result]",
      isValid: backTranslated.trim().length > 0,
    };
  } catch (error) {
    console.error("Braille validation error:", error);
    return {
      backTranslated: "[Validation failed]",
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
