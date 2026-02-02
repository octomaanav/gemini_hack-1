import { useAccessibility } from './accessibility/AccessibilityProvider';
import { useLanguage } from './i18n/LanguageProvider';
import { useI18n } from './i18n/useI18n';

export const GlobalControlsBar = () => {
  const {
    focusMode,
    largeText,
    reduceMotion,
    captionsOn,
    signsOn,
    toggleFocusMode,
    toggleLargeText,
    toggleReduceMotion,
    toggleCaptions,
    toggleSigns,
  } = useAccessibility();
  const { language, setLanguage } = useLanguage();
  const { t } = useI18n();

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('controls.contentSettings')}</span>
          <button
            onClick={toggleFocusMode}
            aria-pressed={focusMode}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              focusMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t('controls.focus')}
          </button>
          <button
            onClick={toggleLargeText}
            aria-pressed={largeText}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              largeText ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t('controls.largeText')}
          </button>
          <button
            onClick={toggleCaptions}
            aria-pressed={captionsOn}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              captionsOn ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t('controls.captions')}
          </button>
          <button
            onClick={toggleSigns}
            aria-pressed={signsOn}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              signsOn ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t('controls.signs')}
          </button>
          <button
            onClick={toggleReduceMotion}
            aria-pressed={reduceMotion}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
              reduceMotion ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {t('controls.calmMotion')}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('controls.language')}</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'en' | 'es' | 'hi')}
            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm"
          >
            <option value="en">US English 🇺🇸</option>
            <option value="es">ES Espanol 🇪🇸</option>
            <option value="hi">IN Hindi 🇮🇳</option>
          </select>
        </div>
      </div>
    </div>
  );
};
