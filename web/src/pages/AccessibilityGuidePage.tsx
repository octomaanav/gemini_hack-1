import { useNavigate } from 'react-router-dom';
import { useI18n } from '../components/i18n/useI18n';

const AccessibilityGuidePage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Go back"
          >
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('guide.title')}</h1>
            <p className="text-sm text-slate-500">{t('guide.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('guide.voiceCommands')}</h2>
          <p className="text-slate-600 mb-4">{t('guide.voiceIntro')}</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>{t('guide.voice.story')}</li>
            <li>{t('guide.voice.focus')}</li>
            <li>{t('guide.voice.play')}</li>
            <li>{t('guide.voice.dashboard')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('guide.readingSupport')}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>{t('guide.reading.largeText')}</li>
            <li>{t('guide.reading.story')}</li>
            <li>{t('guide.reading.keyboard')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('guide.visualFirst')}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>{t('guide.visual.captions')}</li>
            <li>{t('guide.visual.signs')}</li>
            <li>{t('guide.visual.toggle')}</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('guide.focusSupport')}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>{t('guide.focus.mode')}</li>
            <li>{t('guide.focus.slides')}</li>
            <li>{t('guide.focus.controls')}</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default AccessibilityGuidePage;
