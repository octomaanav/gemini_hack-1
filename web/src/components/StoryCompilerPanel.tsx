import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from '../utils/api';
import { StoryPlayer } from './StoryPlayer';

type ArtifactStatus = 'PENDING' | 'READY' | 'FAILED';

type ArtifactRef = { id: string; status: ArtifactStatus };

type Variant = {
  variantId: string;
  createdAt: string;
  plan: ArtifactRef;
  slides: ArtifactRef | null;
  audio: ArtifactRef | null;
};

type DerivedArtifact = {
  id: string;
  artifactType: string;
  status: ArtifactStatus;
  metaJson?: any;
  errorJson?: any;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pollDelays = [800, 1200, 2000, 3000, 5000, 8000, 10000];

async function fetchArtifact(id: string) {
  const r = await fetch(apiUrl(`/api/artifacts/${id}`), { credentials: 'include' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Failed to fetch artifact');
  return j.artifact as DerivedArtifact;
}

export function StoryCompilerPanel(props: { lessonScopeId: string; locale: string }) {
  const { lessonScopeId, locale } = props;

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<DerivedArtifact | null>(null);
  const [slides, setSlides] = useState<DerivedArtifact | null>(null);
  const [audio, setAudio] = useState<DerivedArtifact | null>(null);

  const stopRef = useRef(false);

  const loadVariants = useCallback(async (preferVariantId?: string | null) => {
    const r = await fetch(apiUrl(`/api/story/variants?lessonId=${encodeURIComponent(lessonScopeId)}&locale=${encodeURIComponent(locale)}`), {
      credentials: 'include',
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Failed to load variants');
    const list = (j.variants || []) as Variant[];
    setVariants(list);
    const next = preferVariantId || list[0]?.variantId || null;
    setSelectedVariantId(next);
    return list;
  }, [lessonScopeId, locale]);

  const pollArtifact = useCallback(async (id: string, setter: (a: DerivedArtifact) => void) => {
    stopRef.current = false;
    for (const d of pollDelays) {
      if (stopRef.current) return;
      await sleep(d);
      const a = await fetchArtifact(id);
      setter(a);
      if (a.status === 'READY' || a.status === 'FAILED') return;
    }
  }, []);

  const loadSelectedArtifacts = useCallback(async (variantId: string, list: Variant[]) => {
    const v = list.find((x) => x.variantId === variantId);
    if (!v) return;
    setPlan(null); setSlides(null); setAudio(null);

    const p = await fetchArtifact(v.plan.id);
    setPlan(p);
    if (p.status === 'PENDING') void pollArtifact(v.plan.id, setPlan);

    if (v.slides) {
      const s = await fetchArtifact(v.slides.id);
      setSlides(s);
      if (s.status === 'PENDING') void pollArtifact(v.slides.id, setSlides);
    }
    if (v.audio) {
      const a = await fetchArtifact(v.audio.id);
      setAudio(a);
      if (a.status === 'PENDING') void pollArtifact(v.audio.id, setAudio);
    }
  }, [pollArtifact]);

  useEffect(() => {
    setError(null);
    setVariants([]);
    setSelectedVariantId(null);
    setPlan(null);
    setSlides(null);
    setAudio(null);
    stopRef.current = true;

    (async () => {
      try {
        const list = await loadVariants();
        const v = list[0]?.variantId;
        if (v) await loadSelectedArtifacts(v, list);
      } catch (e: any) {
        // No variants yet is fine.
      }
    })();
  }, [lessonScopeId, locale, loadVariants, loadSelectedArtifacts]);

  useEffect(() => {
    if (!selectedVariantId) return;
    void loadSelectedArtifacts(selectedVariantId, variants);
  }, [selectedVariantId, variants, loadSelectedArtifacts]);

  const compile = useCallback(async (reuseLatest: boolean) => {
    setError(null);
    setIsBusy(true);
    try {
      const r = await fetch(apiUrl('/api/story/compile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId: lessonScopeId, locale, reuseLatest }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to compile story');
      const list = await loadVariants(j.variantId);
      if (j.variantId) {
        await loadSelectedArtifacts(j.variantId, list);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to compile story');
    } finally {
      setIsBusy(false);
    }
  }, [lessonScopeId, locale, loadVariants, loadSelectedArtifacts]);

  // Voice agent / OS integration (no mouse required)
  useEffect(() => {
    const handler = () => void compile(true);
    window.addEventListener('story-open', handler as EventListener);
    return () => window.removeEventListener('story-open', handler as EventListener);
  }, [compile]);

  const regenerate = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      const r = await fetch(apiUrl('/api/story/regenerate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId: lessonScopeId, locale }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to regenerate story');
      const list = await loadVariants(j.variantId);
      if (j.variantId) {
        await loadSelectedArtifacts(j.variantId, list);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to regenerate story');
    } finally {
      setIsBusy(false);
    }
  }, [lessonScopeId, locale, loadVariants, loadSelectedArtifacts]);

  const combinedStory = useMemo(() => {
    const scenes = plan?.metaJson?.plan?.scenes;
    const slideAssets = slides?.metaJson?.slides;
    if (!Array.isArray(scenes) || !Array.isArray(slideAssets)) return null;

    const audioSlides = Array.isArray(audio?.metaJson?.slides) ? audio?.metaJson?.slides : [];
    const audioByIndex = new Map<number, any>();
    audioSlides.forEach((s: any) => audioByIndex.set(Number(s.slideIndex), s));

    const merged = scenes.map((scene: any) => {
      const idx = Number(scene.index);
      const asset = slideAssets.find((s: any) => Number(s.slideIndex) === idx);
      const a = audioByIndex.get(idx);
      return {
        id: `slide-${idx}`,
        index: idx,
        title: String(scene.objective || scene.caption || `Slide ${idx}`),
        narration: String(a?.narration || scene.narration || scene.caption || ''),
        caption: String(a?.caption || scene.caption || ''),
        imageUrl: asset?.imageUrl || null,
        signKeywords: [],
      };
    });

    const audioForPlayer = audioSlides.map((s: any) => ({
      slideId: `slide-${Number(s.slideIndex)}`,
      narration: String(s.narration || ''),
      caption: String(s.caption || ''),
      audioUrl: String(s.audioUrl || ''),
    }));

    return {
      status: slides?.status === 'READY' ? 'ready' : 'pending',
      slides: merged,
      audioSlides: audioForPlayer,
    };
  }, [plan, slides, audio]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Story Compiler</h3>
          <p className="text-sm text-slate-600">Compile a deterministic slide story for this lesson. Regeneration creates a new variant.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => compile(true)}
            disabled={isBusy}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
          >
            Compile
          </button>
          <button
            onClick={regenerate}
            disabled={isBusy}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            Regenerate
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-slate-700">
          Variant:
          <select
            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={selectedVariantId || ''}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            disabled={variants.length === 0}
          >
            {variants.length === 0 ? (
              <option value="">No variants yet</option>
            ) : (
              variants.map((v) => (
                <option key={v.variantId} value={v.variantId}>
                  {v.variantId.slice(0, 8)}… • {new Date(v.createdAt).toLocaleString()}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="text-sm text-slate-600 ml-auto">
          Plan: <span className="font-semibold text-slate-900">{plan?.status || '—'}</span> • Slides:{' '}
          <span className="font-semibold text-slate-900">{slides?.status || '—'}</span> • Audio:{' '}
          <span className="font-semibold text-slate-900">{audio?.status || '—'}</span>
        </div>
      </div>

      {combinedStory && combinedStory.slides.length > 0 ? (
        <StoryPlayer
          story={{ ...(combinedStory as any), slides: combinedStory.slides }}
          autoPlay={false}
          audioSlides={combinedStory.audioSlides as any}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Compile a story to see slides here.
        </div>
      )}
    </section>
  );
}
