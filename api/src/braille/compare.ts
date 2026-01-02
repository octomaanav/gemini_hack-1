import { exec } from 'child_process';
import { promisify } from 'util';
import { textToBraille } from './validate.js';

const execPromise = promisify(exec);

// System liblouis translation
async function systemLiblouis(text: string): Promise<string> {
  try {
    const table = 'unicode.dis,en-us-mathtext.ctb';
    const { stdout } = await execPromise(`echo '${text}' | lou_translate ${table}`);
    return stdout.trim();
  } catch (error) {
    return `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
  }
}

// Manual translator
async function manualTranslator(text: string): Promise<string> {
  const result = await textToBraille(text, 'nemeth');
  return result.braille;
}

// Test cases
const testCases = [
  // Basic arithmetic
  "x^2 + y^2 = z^2",
  "2 + 2 = 4",
  "a * b = c",
  
  // Trigonometry
  "sin(theta) = opposite / hypotenuse",
  "cos(alpha) + sin(beta) = 1",
  "tan(x) = sin(x) / cos(x)",
  
  // Physics formulas
  "F = ma",
  "E = mc^2",
  "v = v_0 + at",
  
  // Chemistry
  "H2O",
  "CO2",
  "C6H12O6",
  
  // Complex expressions
  "sqrt(a^2 + b^2)",
  "(x + y) * (x - y) = x^2 - y^2",
  "lim x->0",
  
  // Fractions and division
  "a / b = c",
  "1/2 + 1/3 = 5/6",
  
  // Greek letters
  "alpha + beta = gamma",
  "pi = 3.14159",
  "omega * tau"
];

async function runComparison() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔬 NEMETH BRAILLE COMPARISON: Manual vs System Liblouis');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    
    console.log(`\n📝 Test ${i + 1}/${testCases.length}: "${test}"`);
    console.log('─'.repeat(70));
    
    const [manual, system] = await Promise.all([
      manualTranslator(test),
      systemLiblouis(test)
    ]);
    
    console.log(`Manual:  ${manual}`);
    console.log(`System:  ${system}`);
    
    const match = manual === system;
    console.log(`Match:   ${match ? '✅ YES' : '❌ NO'}`);
    
    if (!match) {
      console.log(`Diff:    Manual has ${manual.length} chars, System has ${system.length} chars`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🏁 Comparison Complete!');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Summary
  console.log('\n📊 RECOMMENDATION:');
  console.log('System Liblouis is the OFFICIAL Nemeth standard used by:');
  console.log('  • Screen readers (JAWS, NVDA)');
  console.log('  • Braille embossers');
  console.log('  • Educational institutions');
  console.log('\n✅ Use System Liblouis for production!');
}

runComparison().catch(console.error);

