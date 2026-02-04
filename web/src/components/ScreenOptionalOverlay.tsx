import { useAccessibility } from './accessibility/AccessibilityProvider';
import { useVoiceAgent } from './VoiceAgentProvider';
import { useI18n } from './i18n/useI18n';

export const ScreenOptionalOverlay = () => {
  const { screenOptional, focusMode, toggleFocusMode } = useAccessibility();
  const { isListening, isSupported, toggleListening } = useVoiceAgent();
  const { t } = useI18n();

  if (!screenOptional) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] w-[min(96vw,720px)]">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${isListening ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200'}`}>
            {isListening ? '●' : '○'} Voice
          </span>
          <span className="text-xs text-slate-500">{t('guide.voiceCommands')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('story-open'))}
            className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100"
          >
            {t('micro.storyMode')}
          </button>
          <button
            onClick={toggleFocusMode}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
              focusMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t('controls.focus')}
          </button>
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
              isListening ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isListening ? 'Mute' : 'Voice'}
          </button>
        </div>
      </div>
    </div>
  );
};
