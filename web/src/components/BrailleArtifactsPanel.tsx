import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from '../utils/api';

type ArtifactStatus = 'PENDING' | 'READY' | 'FAILED';

type DerivedArtifact = {
  id: string;
  scopeType: string;
  scopeId: string;
  contentVersion: number;
  locale: string;
  artifactType: string;
  status: ArtifactStatus;
  s3Key?: string | null;
  metaJson?: any;
  errorJson?: any;
  createdAt?: string;
  updatedAt?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export function BrailleArtifactsPanel(props: {
  microsectionContentKey: string | null;
  lessonScopeId: string;
  chapterScopeId: string;
  locale: string;
}) {
  const { microsectionContentKey, lessonScopeId, chapterScopeId, locale } = props;

  const [previewScope, setPreviewScope] = useState<'microsection' | 'lesson'>('microsection');
  const [previewArtifact, setPreviewArtifact] = useState<DerivedArtifact | null>(null);
  const [exportArtifact, setExportArtifact] = useState<DerivedArtifact | null>(null);
  const [exportKind, setExportKind] = useState<'lesson' | 'chapter'>('lesson');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const previewScopeInfo = useMemo(() => {
    if (previewScope === 'microsection') {
      return microsectionContentKey
        ? { scopeType: 'MICROSECTION' as const, scopeId: microsectionContentKey }
        : null;
    }
    return { scopeType: 'LESSON' as const, scopeId: lessonScopeId };
  }, [previewScope, microsectionContentKey, lessonScopeId]);

  const exportScopeInfo = useMemo(() => {
    if (exportKind === 'lesson') return { scopeType: 'LESSON' as const, scopeId: lessonScopeId };
    return { scopeType: 'CHAPTER' as const, scopeId: chapterScopeId };
  }, [exportKind, lessonScopeId, chapterScopeId]);

  const pollArtifact = useCallback(async (artifactId: string, onUpdate: (a: DerivedArtifact, downloadUrl?: string | null) => void) => {
    stopRef.current = false;
    const delays = [1000, 2000, 3000, 5000, 8000, 10000];
    for (const d of delays) {
      if (stopRef.current) return;
      await sleep(d);
      const r = await fetch(apiUrl(`/api/artifacts/${artifactId}`), { credentials: 'include' });
      if (!r.ok) continue;
      const j = await r.json();
      const artifact: DerivedArtifact = j.artifact;
      onUpdate(artifact, j.downloadUrl ?? null);
      if (artifact.status === 'READY' || artifact.status === 'FAILED') return;
    }
  }, []);

  const generatePreview = useCallback(async () => {
    setError(null);
    if (!previewScopeInfo) {
      setError('Deterministic content key is not available for this microsection yet.');
      return;
    }

    setIsBusy(true);
    try {
      const r = await fetch(apiUrl('/api/artifacts/braille/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...previewScopeInfo, locale }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to queue braille preview');
      setPreviewArtifact(j.artifact);
      if (j.status === 'PENDING') {
        await pollArtifact(j.artifactId, (a) => setPreviewArtifact(a));
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to generate preview');
    } finally {
      setIsBusy(false);
    }
  }, [previewScopeInfo, locale, pollArtifact]);

  // Voice agent / OS integration (no mouse required)
  useEffect(() => {
    const handler = () => void generatePreview();
    window.addEventListener('braille-open', handler as EventListener);
    return () => window.removeEventListener('braille-open', handler as EventListener);
  }, [generatePreview]);

  const exportBrf = useCallback(async () => {
    setError(null);
    setIsBusy(true);
    try {
      const r = await fetch(apiUrl('/api/artifacts/braille/export'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...exportScopeInfo, locale }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to queue BRF export');
      setExportArtifact(j.artifact);

      const handleReady = async (a: DerivedArtifact, downloadUrl?: string | null) => {
        setExportArtifact(a);
        if (a.status !== 'READY') return;

        const url = downloadUrl || a.metaJson?.publicUrl || null;
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = exportKind === 'lesson' ? 'lesson.brf' : 'chapter.brf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        // Fallback: if export is embedded (rare), download text.
        const text = a.metaJson?.brfText;
        if (typeof text === 'string' && text.length > 0) {
          downloadText(exportKind === 'lesson' ? 'lesson.brf' : 'chapter.brf', text);
        }
      };

      if (j.status === 'PENDING') {
        await pollArtifact(j.artifactId, handleReady);
      } else {
        await handleReady(j.artifact);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to export BRF');
    } finally {
      setIsBusy(false);
    }
  }, [exportScopeInfo, exportKind, locale, pollArtifact]);

  const previewText = previewArtifact?.metaJson?.previewText;
  const warnings: string[] = previewArtifact?.metaJson?.validation?.warnings || [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Braille</h3>
          <p className="text-sm text-slate-600">Generate deterministic preview and BRF exports (cached by version + locale).</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-slate-700">
          Preview scope:
          <select
            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={previewScope}
            onChange={(e) => setPreviewScope(e.target.value as any)}
          >
            <option value="microsection" disabled={!microsectionContentKey}>This microsection</option>
            <option value="lesson">Whole lesson</option>
          </select>
        </label>

        <button
          onClick={generatePreview}
          disabled={isBusy}
          className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {previewArtifact?.status === 'PENDING' ? 'Generating…' : 'Generate Preview'}
        </button>

        <label className="text-sm text-slate-700 ml-auto">
          Export:
          <select
            className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            value={exportKind}
            onChange={(e) => setExportKind(e.target.value as any)}
          >
            <option value="lesson">BRF (Lesson)</option>
            <option value="chapter">BRF (Chapter)</option>
          </select>
        </label>
        <button
          onClick={exportBrf}
          disabled={isBusy}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
        >
          {exportArtifact?.status === 'PENDING' ? 'Exporting…' : 'Export BRF'}
        </button>
      </div>

      {previewArtifact && (
        <div className="mb-3 text-sm text-slate-600">
          Preview status: <span className="font-semibold text-slate-900">{previewArtifact.status}</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="font-semibold mb-1">Nemeth/BRF checks</div>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {typeof previewText === 'string' && previewText.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm font-semibold text-slate-800">Preview</div>
            <button
              className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
              onClick={() => navigator.clipboard.writeText(previewText)}
            >
              Copy
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-900 overflow-auto max-h-72">
            {previewText}
          </pre>
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          Generate a preview to see braille here.
        </div>
      )}
    </section>
  );
}
