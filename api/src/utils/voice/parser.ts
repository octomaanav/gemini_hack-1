import { ALLOWLIST_ACTIONS, type VoiceAction } from "./allowlist.js";

export interface VoiceContext {
  route?: string;
  lessonId?: string;
  chapterId?: string;
  microsectionId?: string;
}

export interface ParsedVoiceCommand {
  intent: string;
  action: VoiceAction;
  args: Record<string, unknown>;
  speakBackText?: string;
  uiHints?: Record<string, unknown>;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseOnOff = (text: string): boolean | null => {
  if (/\b(on|enable|enabled|start|turn on)\b/.test(text)) return true;
  if (/\b(off|disable|disabled|stop|turn off)\b/.test(text)) return false;
  return null;
};

export const parseVoiceCommandDeterministic = (
  transcript: string,
  _context: VoiceContext = {}
): ParsedVoiceCommand | null => {
  const raw = String(transcript || "");
  const text = normalize(raw);
  if (!text) return null;

  // Navigation
  if (/\b(open|go to|take me to)\s+dashboard\b/.test(text)) {
    return { intent: "navigate_dashboard", action: "NAVIGATE_ROUTE", args: { route: "/dashboard" } };
  }
  if (/\b(open|go to|take me to)\s+home\b/.test(text)) {
    return { intent: "navigate_home", action: "NAVIGATE_ROUTE", args: { route: "/" } };
  }
  if (/\b(open|go to|take me to)\s+setup\b/.test(text)) {
    return { intent: "navigate_setup", action: "NAVIGATE_ROUTE", args: { route: "/setup" } };
  }
  if (/\b(open|go to|take me to)\s+accessibility\b/.test(text)) {
    return { intent: "navigate_accessibility", action: "NAVIGATE_ROUTE", args: { route: "/accessibility-guide" } };
  }

  // Next/previous
  if (/\b(next)\b/.test(text)) {
    return { intent: "next", action: "NEXT_MICROSECTION", args: {} };
  }
  if (/\b(previous|prev|back)\b/.test(text)) {
    return { intent: "previous", action: "PREV_MICROSECTION", args: {} };
  }

  // Jump within a lesson
  if (/\b(go to|open)\s+quiz\b/.test(text)) {
    return { intent: "jump_quiz", action: "JUMP_TO_TYPE", args: { type: "quiz" } };
  }
  if (/\b(go to|open)\s+practice\b/.test(text)) {
    return { intent: "jump_practice", action: "JUMP_TO_TYPE", args: { type: "practice" } };
  }
  if (/\b(go to|open)\s+article\b/.test(text)) {
    return { intent: "jump_article", action: "JUMP_TO_TYPE", args: { type: "article" } };
  }
  if (/\b(go to|open)\s+(video|story)\b/.test(text)) {
    return { intent: "jump_video", action: "JUMP_TO_TYPE", args: { type: "video" } };
  }

  // Playback: story / TTS
  if (/\b(start|play)\s+story\b/.test(text)) {
    return { intent: "story_start", action: "STORY_START", args: {} };
  }
  if (/\b(pause)\b/.test(text)) {
    return { intent: "pause", action: "STORY_PAUSE", args: {} };
  }
  if (/\b(resume|continue)\b/.test(text)) {
    return { intent: "resume", action: "STORY_RESUME", args: {} };
  }
  if (/\b(read aloud|read out loud|start reading)\b/.test(text)) {
    return { intent: "tts_start", action: "TTS_START", args: {} };
  }
  if (/\b(stop reading|stop read aloud|stop voice|stop)\b/.test(text)) {
    return { intent: "tts_stop", action: "TTS_STOP", args: {} };
  }

  // Accessibility toggles
  const acc = [
    { key: "focusMode", re: /\bfocus mode\b/ },
    { key: "largeText", re: /\b(large text|bigger text|text size)\b/ },
    { key: "captionsOn", re: /\bcaptions?\b/ },
    { key: "reduceMotion", re: /\b(reduce motion|less animation)\b/ },
    { key: "signsOn", re: /\b(signs|sign language)\b/ },
  ];
  for (const item of acc) {
    if (item.re.test(text)) {
      const value = parseOnOff(text);
      if (value === null) {
        // Toggle if on/off not explicit.
        return {
          intent: `toggle_${item.key}`,
          action: "TOGGLE_ACCESSIBILITY",
          args: { key: item.key, value: "toggle" },
        };
      }
      return {
        intent: `set_${item.key}`,
        action: "TOGGLE_ACCESSIBILITY",
        args: { key: item.key, value },
      };
    }
  }

  // Discovery
  const m = text.match(/\b(find|search)\s+(lesson|lessons)\s+(about|on)\s+(.+)$/);
  if (m && m[4]) {
    return {
      intent: "search_lessons",
      action: "SEARCH_LESSONS",
      args: { query: m[4] },
    };
  }

  // Open chapter by name (best-effort; client resolves)
  const ch = text.match(/\bopen\s+chapter\s+(.+)$/);
  if (ch && ch[1]) {
    return { intent: "open_chapter", action: "OPEN_CHAPTER", args: { name: ch[1] } };
  }

  return null;
};

export const validateAllowlistedAction = (value: any): value is VoiceAction => {
  return typeof value === "string" && ALLOWLIST_ACTIONS.has(value as VoiceAction);
};

