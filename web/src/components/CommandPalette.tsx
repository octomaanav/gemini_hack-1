import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import { executeVoiceOSAction } from '../services/voiceOS/executeAction';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from './i18n/LanguageProvider';

const HISTORY_KEY = 'voiceos-history';

type VoiceCommandResponse = {
  action: string | null;
  args: any;
  intent: string;
  speakBackText?: string | null;
};

function loadHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(arr) ? arr.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function pushHistory(item: string) {
  const next = [item, ...loadHistory().filter((x) => x !== item)].slice(0, 20);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function CommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>(() => (typeof window === 'undefined' ? [] : loadHistory()));
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const hotkey = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (hotkey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setError(null);
      setHistory(loadHistory());
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setValue('');
    }
  }, [open]);

  const runTranscript = useCallback(async (transcript: string) => {
    setError(null);
    setIsBusy(true);
    try {
      const r = await fetch(apiUrl('/api/voice/command'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          transcript,
          locale: language,
          context: {
            route: location.pathname,
          },
        }),
      });
      const j: VoiceCommandResponse = await r.json();
      if (!r.ok) throw new Error((j as any).error || 'Failed to process command');
      if (!j.action) throw new Error(j.speakBackText || 'Unknown command');

      pushHistory(transcript);
      setHistory(loadHistory());
      const result = await executeVoiceOSAction({
        action: j.action as any,
        args: j.args,
        navigate,
        user,
        locale: language,
      });
      if (!result.ok) throw new Error(result.message || 'Command failed');

      setOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Command failed');
    } finally {
      setIsBusy(false);
    }
  }, [language, location.pathname, navigate, user]);

  const suggestions = useMemo(() => {
    const base = [
      'open dashboard',
      'open accessibility guide',
      'next',
      'previous',
      'go to quiz',
      'go to practice',
      'start story',
      'read aloud',
      'stop reading',
      'focus mode on',
      'focus mode off',
      'large text on',
      'large text off',
      'captions on',
      'captions off',
      'reduce motion on',
      'reduce motion off',
      'signs on',
      'signs off',
      'find lesson about motion',
      'open chapter physical world',
    ];
    const query = value.trim().toLowerCase();
    if (!query) return [...history, ...base].slice(0, 12);
    return [...history, ...base].filter((s) => s.toLowerCase().includes(query)).slice(0, 12);
  }, [value, history]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="mx-auto mt-24 max-w-2xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-800">Command Palette</div>
            <div className="ml-auto text-xs text-slate-500">Cmd/Ctrl+K</div>
          </div>

          <div className="p-4">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.trim()) {
                  e.preventDefault();
                  void runTranscript(value.trim());
                }
              }}
              placeholder="Type a command…"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              aria-label="Command input"
            />

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Suggestions</div>
              <div className="grid gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="text-left rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                    disabled={isBusy}
                    onClick={() => void runTranscript(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm hover:bg-slate-50"
                onClick={() => setOpen(false)}
                disabled={isBusy}
              >
                Close
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                onClick={() => value.trim() && void runTranscript(value.trim())}
                disabled={isBusy || !value.trim()}
              >
                Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

