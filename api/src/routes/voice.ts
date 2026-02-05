import { Router } from "express";
import { db } from "../db/index.js";
import { users, voiceEvents } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth.js";
import { callGeminiJson, hasGeminiApiKey } from "../utils/gemini.js";
import { parseVoiceCommandDeterministic, validateAllowlistedAction, type VoiceContext } from "../utils/voice/parser.js";

const voiceRouter = Router();
voiceRouter.use(isAuthenticated);

const getAuthedUserId = async (req: any): Promise<string | null> => {
  const direct = req.user?.id;
  if (direct) return direct;
  const email = req.user?.email;
  if (!email) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return row?.id || null;
};

voiceRouter.post("/command", async (req, res) => {
  const { transcript, context, locale } = req.body as {
    transcript?: string;
    context?: VoiceContext;
    locale?: string;
  };

  const rawTranscript = String(transcript || "").trim();
  if (!rawTranscript) {
    return res.status(400).json({ error: "transcript is required" });
  }

  const userId = await getAuthedUserId(req);
  const sessionId = String((req as any).sessionID || "");

  // 1) Deterministic parser first (no model calls)
  let parsed = parseVoiceCommandDeterministic(rawTranscript, context || {});

  // 2) Optional Gemini NLU fallback (must return allowlisted actions only)
  if (!parsed && hasGeminiApiKey()) {
    const prompt = `You are a strict intent mapper for an educational webapp.
Return ONLY valid JSON, no markdown.

Task: Map this transcript into a single allowlisted action. If no match, return {"action":"NONE"}.

Allowlisted actions:
- NAVIGATE_ROUTE { route: string }
- OPEN_CHAPTER { name: string }
- NEXT_MICROSECTION {}
- PREV_MICROSECTION {}
- JUMP_TO_TYPE { type: "quiz"|"practice"|"article"|"video" }
- STORY_START {}
- STORY_PAUSE {}
- STORY_RESUME {}
- TTS_START {}
- TTS_STOP {}
- TOGGLE_ACCESSIBILITY { key: "focusMode"|"largeText"|"captionsOn"|"reduceMotion"|"signsOn", value: true|false|"toggle" }
- SEARCH_LESSONS { query: string }

Transcript: ${JSON.stringify(rawTranscript)}
Locale: ${JSON.stringify(locale || "en-US")}

Output JSON format:
{ "intent": string, "action": string, "args": object, "speakBackText"?: string }`;

    const result = await callGeminiJson<any>(prompt);
    if (result?.action && result.action !== "NONE" && validateAllowlistedAction(result.action)) {
      parsed = {
        intent: String(result.intent || "gemini_intent"),
        action: result.action,
        args: (result.args && typeof result.args === "object") ? result.args : {},
        speakBackText: typeof result.speakBackText === "string" ? result.speakBackText : undefined,
      };
    }
  }

  const response = parsed
    ? {
        action: parsed.action,
        args: parsed.args,
        intent: parsed.intent,
        speakBackText: parsed.speakBackText || null,
        uiHints: parsed.uiHints || null,
      }
    : {
        action: null,
        args: {},
        intent: "unknown",
        speakBackText: "Sorry, I didn't understand that command.",
        uiHints: null,
      };

  // Audit log (best-effort)
  try {
    await db.insert(voiceEvents).values({
      userId,
      sessionId: sessionId || null,
      transcript: rawTranscript,
      intent: response.intent,
      action: response.action,
      payloadJson: {
        context: context || {},
        locale: locale || null,
        args: response.args,
      },
    });
  } catch (e) {
    console.warn("[voice] failed to persist voice event", e);
  }

  return res.json(response);
});

export default voiceRouter;

