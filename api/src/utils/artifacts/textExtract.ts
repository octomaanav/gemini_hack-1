type AnyRecord = Record<string, any>;

const isRecord = (v: any): v is AnyRecord => !!v && typeof v === "object" && !Array.isArray(v);

export const extractMicrosectionRawText = (payload: any): string => {
  if (!isRecord(payload)) return String(payload || "");

  const parts: string[] = [];
  const meta = isRecord(payload.meta) ? payload.meta : {};
  if (typeof meta.title === "string" && meta.title.trim()) {
    parts.push(meta.title.trim());
  }

  const content = isRecord(payload.content) ? payload.content : {};
  const practice = isRecord(payload.practice) ? payload.practice : {};

  // Article-like content
  if (typeof content.introduction === "string" && content.introduction.trim()) {
    parts.push(content.introduction.trim());
  }
  if (Array.isArray(content.coreConcepts)) {
    for (const concept of content.coreConcepts) {
      if (!isRecord(concept)) continue;
      if (typeof concept.conceptTitle === "string" && concept.conceptTitle.trim()) {
        parts.push(concept.conceptTitle.trim());
      }
      if (typeof concept.explanation === "string" && concept.explanation.trim()) {
        parts.push(concept.explanation.trim());
      }
      if (typeof concept.example === "string" && concept.example.trim()) {
        parts.push(`Example: ${concept.example.trim()}`);
      }
      if (typeof concept.diagramDescription === "string" && concept.diagramDescription.trim()) {
        parts.push(`Diagram: ${concept.diagramDescription.trim()}`);
      }
    }
  }
  if (Array.isArray(content.summary) && content.summary.length > 0) {
    parts.push("Summary:");
    for (const p of content.summary) {
      if (typeof p === "string" && p.trim()) parts.push(p.trim());
    }
  }
  if (Array.isArray(content.quickCheckQuestions) && content.quickCheckQuestions.length > 0) {
    parts.push("Quick check questions:");
    for (const q of content.quickCheckQuestions) {
      if (!isRecord(q)) continue;
      if (typeof q.question === "string" && q.question.trim()) parts.push(`Question: ${q.question.trim()}`);
      if (typeof q.answer === "string" && q.answer.trim()) parts.push(`Answer: ${q.answer.trim()}`);
    }
  }

  // Quiz/Practice-like content
  const questions = Array.isArray(practice.questions) ? practice.questions : [];
  if (questions.length > 0) {
    parts.push("Questions:");
    for (const q of questions) {
      if (!isRecord(q)) continue;
      if (typeof q.question === "string" && q.question.trim()) parts.push(q.question.trim());
      if (Array.isArray(q.options) && q.options.length > 0) {
        parts.push(`Options: ${q.options.map((o: any) => String(o)).join(", ")}`);
      }
      if (typeof q.correctAnswer === "string" || typeof q.correctAnswer === "number") {
        parts.push(`Answer: ${String(q.correctAnswer)}`);
      }
      if (typeof q.explanation === "string" && q.explanation.trim()) {
        parts.push(`Explanation: ${q.explanation.trim()}`);
      }
    }
  }

  return parts.filter(Boolean).join("\n");
};

