
const basicToBrailleMap: Record<string, string> = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
  'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
  'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
  'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
  'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
  'z': '⠵', ' ': '⠀',
  '0': '⠼⠚', '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙',
  '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊',
  '.': '⠲', ',': '⠂', '?': '⠦', '!': '⠖', ':': '⠒',
  ';': '⠆', '-': '⠤', '+': '⠬', '=': '⠶', '/': '⠌',
  '*': '⠡', '(': '⠐⠣', ')': '⠐⠜', '\n': '⠀\n'
};

// Nemeth Code specific mappings for mathematical notation
const nemethMap: Record<string, string> = {
  ...basicToBrailleMap,
  '+': '⠬',      // Plus
  '-': '⠤',      // Minus
  '=': '⠶',      // Equals
  '*': '⠡',      // Multiply
  '×': '⠡',      // Multiply (×)
  '÷': '⠌',      // Divide
  '/': '⠌',      // Divide (/)
  '(': '⠐⠣',    // Open parenthesis
  ')': '⠐⠜',    // Close parenthesis
  '[': '⠈⠣',    // Open bracket
  ']': '⠈⠜',    // Close bracket
  '<': '⠐⠅',    // Less than
  '>': '⠨⠂',    // Greater than
  '≤': '⠐⠅⠱',  // Less than or equal
  '≥': '⠨⠂⠱',  // Greater than or equal
  '²': '⠘⠆',    // Squared
  '³': '⠘⠒',    // Cubed
  '√': '⠜',      // Square root
  '^': '⠘',      // Exponent indicator
  '_': '⠰',      // Subscript indicator
  '%': '⠨⠴',    // Percent
  '∞': '⠠⠿',    // Infinity
  'π': '⠨⠏',    // Pi
  
  // Greek letters (lowercase)
  'α': '⠨⠁',    // Alpha
  'β': '⠨⠃',    // Beta
  'γ': '⠨⠛',    // Gamma
  'δ': '⠨⠙',    // Delta
  'ε': '⠨⠑',    // Epsilon
  'θ': '⠨⠹',    // Theta
  'λ': '⠨⠇',    // Lambda
  'μ': '⠨⠍',    // Mu
  'ν': '⠨⠝',    // Nu
  'ρ': '⠨⠗',    // Rho
  'σ': '⠨⠎',    // Sigma
  'τ': '⠨⠞',    // Tau
  'φ': '⠨⠋',    // Phi
  'ω': '⠨⠺',    // Omega
  
  // Greek letters (uppercase)
  'Δ': '⠠⠨⠙',  // Delta (uppercase)
  'Σ': '⠠⠨⠎',  // Sigma (uppercase)
  'Ω': '⠠⠨⠺',  // Omega (uppercase)
};

// Common mathematical functions with their Nemeth representations
const nemethFunctions: Record<string, string> = {
  'sin': '⠎⠊⠝',
  'cos': '⠉⠕⠎',
  'tan': '⠞⠁⠝',
  'cot': '⠉⠕⠞',
  'sec': '⠎⠑⠉',
  'csc': '⠉⠎⠉',
  'log': '⠇⠕⠛',
  'ln': '⠇⠝',
  'exp': '⠑⠭⠏',
  'sqrt': '⠜',
  'arcsin': '⠁⠗⠉⠎⠊⠝',
  'arccos': '⠁⠗⠉⠉⠕⠎',
  'arctan': '⠁⠗⠉⠞⠁⠝',
  'sinh': '⠎⠊⠝⠓',
  'cosh': '⠉⠕⠎⠓',
  'tanh': '⠞⠁⠝⠓',
  'lim': '⠇⠊⠍',
  'max': '⠍⠁⠭',
  'min': '⠍⠊⠝',
};

const brailleToBasicMap: Record<string, string> = Object.fromEntries(
  Object.entries(basicToBrailleMap).map(([k, v]) => [v, k])
);

export async function validateBraille(
  braille: string,
  table: "en-us-g2" | "nemeth"
): Promise<{ backTranslated: string; isValid: boolean; error?: string }> {
  try {
    // Check if string contains braille unicode range
    const braillePattern = /[\u2800-\u28FF]/;
    const isValid = braillePattern.test(braille);

    // Simple back-translation
    let backTranslated = "";
    for (const char of braille) {
      if (char === '\n') {
        backTranslated += '\n';
      } else if (brailleToBasicMap[char]) {
        backTranslated += brailleToBasicMap[char];
      } else if (char >= '\u2800' && char <= '\u28FF') {
        backTranslated += '?'; // Unknown braille character
      } else {
        backTranslated += char; // Keep non-braille characters
      }
    }

    return {
      backTranslated: backTranslated || "[Empty braille string]",
      isValid,
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

// Convert text to braille using basic mapping
export async function textToBraille(
  text: string,
  table: "en-us-g2" | "nemeth"
): Promise<{ braille: string; success: boolean; error?: string }> {
  try {
    let braille = "";
    
    // Use Nemeth map for mathematical content, basic map for English
    const charMap = table === "nemeth" ? nemethMap : basicToBrailleMap;
    
    if (table === "nemeth") {
      // For Nemeth, process mathematical functions first
      let processedText = text;
      
      // Replace Greek letter names with their symbols
      const greekNames: Record<string, string> = {
        'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
        'epsilon': 'ε', 'theta': 'θ', 'lambda': 'λ', 'mu': 'μ',
        'nu': 'ν', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ',
        'phi': 'φ', 'omega': 'ω', 'pi': 'π'
      };
      
      // Replace "theta" -> "θ", etc.
      for (const [name, symbol] of Object.entries(greekNames)) {
        const regex = new RegExp(`\\b${name}\\b`, 'gi');
        processedText = processedText.replace(regex, symbol);
      }
      
      // Process the text with function and symbol awareness
      let i = 0;
      while (i < processedText.length) {
        let matched = false;
        
        // Try to match mathematical functions
        for (const [func, brailleFunc] of Object.entries(nemethFunctions)) {
          if (processedText.substring(i, i + func.length).toLowerCase() === func.toLowerCase()) {
            braille += brailleFunc;
            i += func.length;
            matched = true;
            break;
          }
        }
        
        if (!matched) {
          const char = processedText[i].toLowerCase();
          if (charMap[char]) {
            braille += charMap[char];
          } else if (charMap[processedText[i]]) {
            // Check original case for special symbols
            braille += charMap[processedText[i]];
          } else if (processedText[i].match(/[A-Z]/)) {
            // Capital letter indicator + letter
            braille += '⠨' + (charMap[char] || '⠀');
          } else {
            // Unknown character - add space
            braille += '⠀';
          }
          i++;
        }
      }
    } else {
      // English Braille - simple character-by-character conversion
      const lowerText = text.toLowerCase();
      for (const char of lowerText) {
        if (charMap[char]) {
          braille += charMap[char];
        } else if (char.match(/[A-Z]/)) {
          // Capital letter indicator + letter
          braille += '⠨' + (charMap[char.toLowerCase()] || '⠀');
        } else {
          // Unknown character - keep as is or skip
          braille += '⠀'; // Space for unknown characters
        }
      }
    }

    return {
      braille,
      success: true,
    };
  } catch (error) {
    console.error("Braille translation error:", error);
    return {
      braille: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
