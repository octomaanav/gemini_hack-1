import { apiUrl } from '../../utils/api';
import { loadAccessibilityPreferences, saveAccessibilityPreferences } from '../../utils/accessibility';
import type { SubjectWithChapters, StructuredChapter } from '../../types';
import { fetchSubjectsWithChapters } from '../../data/curriculumData';

export type VoiceOSAction =
  | 'NAVIGATE_ROUTE'
  | 'OPEN_CHAPTER'
  | 'OPEN_LESSON'
  | 'NEXT_MICROSECTION'
  | 'PREV_MICROSECTION'
  | 'JUMP_TO_TYPE'
  | 'STORY_START'
  | 'STORY_PAUSE'
  | 'STORY_RESUME'
  | 'TTS_START'
  | 'TTS_STOP'
  | 'TOGGLE_ACCESSIBILITY'
  | 'SEARCH_LESSONS';

export async function executeVoiceOSAction(input: {
  action: VoiceOSAction;
  args: any;
  navigate: (to: string) => void;
  user: any;
  locale: string;
}): Promise<{ ok: boolean; message?: string }> {
  const { action, args, navigate, user, locale } = input;

  const dispatchLessonControl = (payload: any) =>
    window.dispatchEvent(new CustomEvent('lesson-control', { detail: payload }));

  if (action === 'NAVIGATE_ROUTE') {
    const route = String(args?.route || '').trim();
    if (!route.startsWith('/')) return { ok: false, message: 'Invalid route' };
    navigate(route);
    return { ok: true };
  }

  if (action === 'NEXT_MICROSECTION') {
    dispatchLessonControl({ action: 'next' });
    return { ok: true };
  }
  if (action === 'PREV_MICROSECTION') {
    dispatchLessonControl({ action: 'previous' });
    return { ok: true };
  }
  if (action === 'JUMP_TO_TYPE') {
    const type = String(args?.type || '').trim();
    if (!type) return { ok: false, message: 'Missing type' };
    dispatchLessonControl({ action: 'jump', type });
    return { ok: true };
  }

  if (action === 'STORY_START') {
    window.dispatchEvent(new CustomEvent('story-open'));
    return { ok: true };
  }
  if (action === 'STORY_PAUSE') {
    dispatchLessonControl({ action: 'pause' });
    return { ok: true };
  }
  if (action === 'STORY_RESUME') {
    dispatchLessonControl({ action: 'resume' });
    return { ok: true };
  }

  if (action === 'TTS_START') {
    dispatchLessonControl({ action: 'play' });
    return { ok: true };
  }
  if (action === 'TTS_STOP') {
    dispatchLessonControl({ action: 'stop' });
    return { ok: true };
  }

  if (action === 'TOGGLE_ACCESSIBILITY') {
    const key = String(args?.key || '').trim();
    const value = args?.value;
    const current = loadAccessibilityPreferences() as any;
    const next = { ...current };
    if (value === 'toggle') {
      next[key] = !current[key];
    } else {
      next[key] = !!value;
    }
    saveAccessibilityPreferences(next);
    return { ok: true };
  }

  const profile = user?.profile;
  const curriculumId = profile?.curriculumId;
  const classId = profile?.classId;
  const selectedChapterIds: string[] = Array.isArray(profile?.chapterIds) ? profile.chapterIds : [];

  if (action === 'OPEN_CHAPTER') {
    if (!curriculumId || !classId) return { ok: false, message: 'Profile not set up' };
    const name = String(args?.name || '').trim().toLowerCase();
    if (!name) return { ok: false, message: 'Missing chapter name' };

    const subjects: SubjectWithChapters[] = await fetchSubjectsWithChapters(curriculumId, classId, locale);
    for (const subject of subjects) {
      const chapters = subject.chapters.filter((c) => selectedChapterIds.includes(c.id));
      const found = chapters.find((c) => c.name.toLowerCase().includes(name));
      if (found) {
        navigate(`/${classId}/${subject.slug}/${found.slug}`);
        return { ok: true };
      }
    }
    return { ok: false, message: 'Chapter not found' };
  }

  if (action === 'SEARCH_LESSONS') {
    if (!curriculumId || !classId) return { ok: false, message: 'Profile not set up' };
    const query = String(args?.query || '').trim().toLowerCase();
    if (!query) return { ok: false, message: 'Missing query' };

    const subjects: SubjectWithChapters[] = await fetchSubjectsWithChapters(curriculumId, classId, locale);
    for (const subject of subjects) {
      const chapters = subject.chapters.filter((c) => selectedChapterIds.includes(c.id));
      for (const chapter of chapters) {
        const resp = await fetch(apiUrl(`/api/lessons/structured/${classId}/${subject.slug}/${chapter.slug}`));
        if (!resp.ok) continue;
        const ch: StructuredChapter = await resp.json();
        for (const section of ch.sections) {
          const sectionMatch = section.title?.toLowerCase().includes(query);
          for (const ms of section.microsections) {
            const msMatch = ms.title?.toLowerCase().includes(query);
            if (sectionMatch || msMatch) {
              navigate(`/${classId}/${subject.slug}/${chapter.slug}/${section.slug}/${ms.id}`);
              return { ok: true };
            }
          }
        }
      }
    }
    return { ok: false, message: 'No matching lesson found' };
  }

  return { ok: false, message: 'Action not supported' };
}

