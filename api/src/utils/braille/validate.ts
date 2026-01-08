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

    const { stdout, stderr } = await execPromise(
      `lou_translate ${tableFile} < ${inputFile} > ${outputFile}`
    );

    if (stderr) {
      console.warn('Liblouis translation warning:', stderr);
    }

    const { stdout: braille } = await execPromise(`cat ${outputFile}`);

    await unlink(inputFile).catch(() => {});
    await unlink(outputFile).catch(() => {});

    return {
      braille: braille.trim(),
      success: true,
    };
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
