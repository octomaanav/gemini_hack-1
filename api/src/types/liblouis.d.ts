declare module 'liblouis' {
  interface TranslationResult {
    braille: string;
  }

  export function translate(table: string, text: string): Promise<TranslationResult>;
  export function backTranslate(table: string, braille: string): Promise<string>;
}

