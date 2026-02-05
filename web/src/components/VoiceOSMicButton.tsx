import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import { executeVoiceOSAction } from '../services/voiceOS/executeAction';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from './i18n/LanguageProvider';

type VoiceCommandResponse = {
  action: string | null;
  args: any;
  intent: string;
  speakBackText?: string | null;
};

const HISTORY_KEY = 'voiceos-history';

function pushHistory(item: string) {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [item, ...(Array.isArray(arr) ? arr : []).filter((x) => x !== item)].slice(0, 20);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function VoiceOSMicButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language || 'en-US';
    recognitionRef.current = rec;

    rec.onresult = (event: any) => {
      const t = String(event?.results?.[0]?.[0]?.transcript || '').trim();
      setTranscript(t);
      setIsListening(false);
    };
    rec.onerror = (event: any) => {
      setError(event?.error || 'Speech recognition error');
      setIsListening(false);
    };
    rec.onend = () => {
      setIsListening(false);
    };
  }, [language]);

  const runTranscript = useCallback(async (t: string) => {
    if (!t) return;
    setError(null);
    try {
      const r = await fetch(apiUrl('/api/voice/command'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          transcript: t,
          locale: language,
          context: { route: location.pathname },
        }),
      });
      const j: VoiceCommandResponse = await r.json();
      if (!r.ok) throw new Error((j as any).error || 'Failed to process voice command');
      if (!j.action) throw new Error(j.speakBackText || 'Unknown command');

      pushHistory(t);
      const result = await executeVoiceOSAction({
        action: j.action as any,
        args: j.args,
        navigate,
        user,
        locale: language,
      });
      if (!result.ok) throw new Error(result.message || 'Command failed');
    } catch (e: any) {
      setError(e?.message || 'Command failed');
    }
  }, [language, location.pathname, navigate, user]);

  useEffect(() => {
    if (transcript) void runTranscript(transcript);
  }, [transcript, runTranscript]);

  const toggle = useCallback(() => {
    setError(null);
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec.stop();
      setIsListening(false);
      return;
    }
    setTranscript('');
    setIsListening(true);
    try {
      rec.start();
    } catch {
      // Some browsers throw if called twice quickly
    }
  }, [isListening]);

  const label = useMemo(() => {
    if (!isSupported) return 'Voice OS unavailable';
    if (isListening) return 'Listening…';
    return 'Voice OS';
  }, [isSupported, isListening]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {(isListening || transcript) && (
        <div className="pointer-events-auto max-w-xs rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-3 text-sm text-slate-800 shadow-xl">
          <div className="text-xs font-semibold text-slate-500 mb-1">Voice OS</div>
          <div className="whitespace-pre-wrap">{isListening ? 'Listening…' : transcript}</div>
        </div>
      )}
      {error && (
        <div className="pointer-events-auto max-w-xs rounded-2xl border border-red-200 bg-red-50/90 backdrop-blur p-3 text-sm text-red-800 shadow-xl">
          {error}
        </div>
      )}

      <button
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-2xl border border-white/20 transition-all ${isListening
          ? 'bg-slate-900 text-white scale-105'
          : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:scale-105'
          }`}
        onClick={toggle}
        aria-label={label}
        title="Voice OS (speech-to-command)"
      >
        <svg className="w-7 h-7 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v10m0 0a3 3 0 003-3V4a3 3 0 00-6 0v4a3 3 0 003 3zm0 0v4m-4 0h8m-4 0v6" />
        </svg>
      </button>
    </div>
  );
}

