export function formatToBRF(braille: string): string {
  const MAX_LINE = 40;
  const MAX_PAGE = 25;
  const lines: string[] = [];

  let current = "";
  const words = braille.split("⠀");

  for (const word of words) {
    const brailleLength = (str: string) => 
      [...str].filter(c => c >= '\u2800' && c <= '\u28FF').length;
    
    const currentLen = brailleLength(current);
    const wordLen = brailleLength(word);
    
    if (currentLen + wordLen + 1 <= MAX_LINE) {
      current += (current ? "⠀" : "") + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);

  const pages: string[] = [];
  for (let i = 0; i < lines.length; i += MAX_PAGE) {
    const page = lines.slice(i, i + MAX_PAGE).join("\n");
    pages.push(page);
  }

  return pages.join("\f\n");
}