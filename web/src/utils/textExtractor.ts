import type { Lesson } from '../types';

/**
 * Converts LaTeX/math notation to readable text for TTS
 * Handles: $...$, $$...$$, \(...\), \[...\], and common LaTeX commands
 */
export const stripMathNotation = (text: string): string => {
  if (!text) return '';
  
  let cleaned = text;
  
  // Convert fractions: \frac{a}{b} -> "a over b"
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2');
  
  // Convert square roots: \sqrt{x} -> "square root of x"
  cleaned = cleaned.replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1');
  cleaned = cleaned.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1 root of $2');
  
  // Convert powers: x^2 -> "x squared", x^n -> "x to the power of n"
  cleaned = cleaned.replace(/\^\{([^}]+)\}/g, ' to the power of $1');
  cleaned = cleaned.replace(/\^(\d+)/g, (_match, num) => {
    const n = parseInt(num);
    if (n === 2) return ' squared';
    if (n === 3) return ' cubed';
    return ` to the power of ${num}`;
  });
  
  // Convert subscripts: x_1 -> "x sub 1"
  cleaned = cleaned.replace(/_\{([^}]+)\}/g, ' sub $1');
  cleaned = cleaned.replace(/_(\d+)/g, ' sub $1');
  
  // Convert Greek letters
  const greekLetters: Record<string, string> = {
    'alpha': 'alpha', 'beta': 'beta', 'gamma': 'gamma', 'delta': 'delta',
    'epsilon': 'epsilon', 'zeta': 'zeta', 'eta': 'eta', 'theta': 'theta',
    'iota': 'iota', 'kappa': 'kappa', 'lambda': 'lambda', 'mu': 'mu',
    'nu': 'nu', 'xi': 'xi', 'pi': 'pi', 'rho': 'rho', 'sigma': 'sigma',
    'tau': 'tau', 'upsilon': 'upsilon', 'phi': 'phi', 'chi': 'chi',
    'psi': 'psi', 'omega': 'omega',
    'Alpha': 'Alpha', 'Beta': 'Beta', 'Gamma': 'Gamma', 'Delta': 'Delta',
    'Theta': 'Theta', 'Lambda': 'Lambda', 'Pi': 'Pi', 'Sigma': 'Sigma',
    'Phi': 'Phi', 'Omega': 'Omega'
  };
  
  for (const [latex, name] of Object.entries(greekLetters)) {
    cleaned = cleaned.replace(new RegExp(`\\\\${latex}\\b`, 'g'), name);
  }
  
  // Convert common math operators and symbols
  cleaned = cleaned.replace(/\\times/g, ' times ');
  cleaned = cleaned.replace(/\\cdot/g, ' dot ');
  cleaned = cleaned.replace(/\\div/g, ' divided by ');
  cleaned = cleaned.replace(/\\pm/g, ' plus or minus ');
  cleaned = cleaned.replace(/\\mp/g, ' minus or plus ');
  cleaned = cleaned.replace(/\\leq/g, ' less than or equal to ');
  cleaned = cleaned.replace(/\\geq/g, ' greater than or equal to ');
  cleaned = cleaned.replace(/\\neq/g, ' not equal to ');
  cleaned = cleaned.replace(/\\approx/g, ' approximately equal to ');
  cleaned = cleaned.replace(/\\equiv/g, ' equivalent to ');
  cleaned = cleaned.replace(/\\propto/g, ' proportional to ');
  
  // Convert infinity
  cleaned = cleaned.replace(/\\infty/g, ' infinity ');
  
  // Convert summation and products
  cleaned = cleaned.replace(/\\sum/g, ' sum ');
  cleaned = cleaned.replace(/\\prod/g, ' product ');
  cleaned = cleaned.replace(/\\int/g, ' integral ');
  
  // Convert vectors: \vec{v} -> "vector v"
  cleaned = cleaned.replace(/\\vec\{([^}]+)\}/g, 'vector $1');
  
  // Convert text commands: \text{text} -> "text"
  cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, '$1');
  
  // Convert common functions
  cleaned = cleaned.replace(/\\sin/g, ' sine ');
  cleaned = cleaned.replace(/\\cos/g, ' cosine ');
  cleaned = cleaned.replace(/\\tan/g, ' tangent ');
  cleaned = cleaned.replace(/\\log/g, ' log ');
  cleaned = cleaned.replace(/\\ln/g, ' natural log ');
  cleaned = cleaned.replace(/\\exp/g, ' exponential ');
  
  // Convert limits: \lim_{x \to a} -> "limit as x approaches a"
  cleaned = cleaned.replace(/\\lim_\{([^}]+)\}/g, 'limit as $1');
  
  // Handle escaped backslashes first (common in stored LaTeX)
  cleaned = cleaned.replace(/\\\\/g, ' '); // Double backslashes become space
  
  // Remove inline math delimiters but keep content: $...$ and \(...\)
  cleaned = cleaned.replace(/\$([^$]+)\$/g, '$1');
  cleaned = cleaned.replace(/\\?\(([^)]+)\\?\)/g, '$1');
  
  // Remove display math delimiters but keep content: $$...$$ and \[...\]
  cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, '$1');
  cleaned = cleaned.replace(/\\?\[([^\]]+)\\?\]/g, '$1');
  
  // Remove remaining LaTeX commands that we haven't handled (keep text content)
  cleaned = cleaned.replace(/\\[a-zA-Z]+\{([^}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\[a-zA-Z]+/g, ' '); // Replace standalone commands with space
  cleaned = cleaned.replace(/\\[^a-zA-Z]/g, ''); // Remove escaped special chars
  
  // Convert common math symbols to words
  cleaned = cleaned.replace(/×/g, ' times ');
  cleaned = cleaned.replace(/÷/g, ' divided by ');
  cleaned = cleaned.replace(/±/g, ' plus or minus ');
  cleaned = cleaned.replace(/∞/g, ' infinity ');
  cleaned = cleaned.replace(/∑/g, ' sum ');
  cleaned = cleaned.replace(/∏/g, ' product ');
  cleaned = cleaned.replace(/∫/g, ' integral ');
  cleaned = cleaned.replace(/√/g, ' square root ');
  cleaned = cleaned.replace(/∆/g, ' delta ');
  cleaned = cleaned.replace(/∇/g, ' nabla ');
  cleaned = cleaned.replace(/≤/g, ' less than or equal to ');
  cleaned = cleaned.replace(/≥/g, ' greater than or equal to ');
  cleaned = cleaned.replace(/≠/g, ' not equal to ');
  cleaned = cleaned.replace(/≈/g, ' approximately ');
  cleaned = cleaned.replace(/≡/g, ' equivalent to ');
  
  // Clean up extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Remove leading/trailing punctuation issues
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');
  
  return cleaned;
};

/**
 * Extracts all readable text from a lesson for TTS
 */
export const extractLessonText = (lesson: Lesson): string => {
  const parts: string[] = [];
  
  // Title
  parts.push(lesson.title);
  
  // Introduction
  if (lesson.lessonContent.introduction) {
    parts.push('Introduction:', stripMathNotation(lesson.lessonContent.introduction));
  }
  
  // Core concepts
  lesson.lessonContent.coreConcepts.forEach((concept, index) => {
    parts.push(`Concept ${index + 1}: ${concept.conceptTitle}`);
    if (concept.explanation) {
      parts.push(stripMathNotation(concept.explanation));
    }
    if (concept.example) {
      parts.push('Example:', stripMathNotation(concept.example));
    }
    if (concept.diagramDescription) {
      parts.push('Diagram description:', concept.diagramDescription);
    }
  });
  
  // Summary
  if (lesson.lessonContent.summary.length > 0) {
    parts.push('Summary:');
    lesson.lessonContent.summary.forEach((point, index) => {
      parts.push(`Point ${index + 1}: ${stripMathNotation(point)}`);
    });
  }
  
  // Quick check questions
  if (lesson.lessonContent.quickCheckQuestions.length > 0) {
    parts.push('Quick check questions:');
    lesson.lessonContent.quickCheckQuestions.forEach((q, index) => {
      parts.push(`Question ${index + 1}: ${stripMathNotation(q.question)}`);
      parts.push(`Answer: ${stripMathNotation(q.answer)}`);
    });
  }
  
  return parts.join('. ');
};

/**
 * Extracts raw text from an ArticleContent (keeps LaTeX for braille parsing)
 */
export const extractArticleRawText = (content: ArticleContent): string => {
  const parts: string[] = [];

  if (content.introduction) {
    parts.push(content.introduction);
  }

  content.coreConcepts.forEach((concept) => {
    parts.push(concept.conceptTitle);
    if (concept.explanation) parts.push(concept.explanation);
    if (concept.example) parts.push(`Example: ${concept.example}`);
    if (concept.diagramDescription) parts.push(`Diagram: ${concept.diagramDescription}`);
  });

  if (content.summary.length > 0) {
    parts.push('Summary:');
    content.summary.forEach((point) => parts.push(point));
  }

  if (content.quickCheckQuestions.length > 0) {
    parts.push('Quick check questions:');
    content.quickCheckQuestions.forEach((q) => {
      parts.push(`Question: ${q.question}`);
      parts.push(`Answer: ${q.answer}`);
    });
  }

  return parts.join('\n');
};
