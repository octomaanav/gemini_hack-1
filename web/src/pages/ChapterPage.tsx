import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { StructuredChapter, StructuredSection, Microsection, MicrosectionType, ArticleMicrosection } from '../types';
import { useI18n } from '../components/i18n/useI18n';
import { useLanguage } from '../components/i18n/LanguageProvider';

// Icon components for different microsection types
const ArticleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QuizIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PracticeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const getMicrosectionIcon = (type: MicrosectionType) => {
  switch (type) {
    case 'article': return <ArticleIcon />;
    case 'video': return <VideoIcon />;
    case 'quiz': return <QuizIcon />;
    case 'practice': return <PracticeIcon />;
    default: return <ArticleIcon />;
  }
};

const getMicrosectionColor = (type: MicrosectionType) => {
  switch (type) {
    case 'article': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', hover: 'hover:bg-blue-100' };
    case 'video': return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', hover: 'hover:bg-purple-100' };
    case 'quiz': return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', hover: 'hover:bg-green-100' };
    case 'practice': return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', hover: 'hover:bg-amber-100' };
    default: return { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-600', hover: 'hover:bg-slate-100' };
  }
};

export function ChapterPage() {
  const navigate = useNavigate();
  const { classId, subjectId, chapterSlug } = useParams<{
    classId: string;
    subjectId: string;
    chapterSlug: string;
  }>();
  const { t } = useI18n();
  const { language } = useLanguage();

  const getMicrosectionLabel = (type: MicrosectionType) => {
    switch (type) {
      case 'article': return t('micro.type.article');
      case 'video': return t('micro.type.story');
      case 'quiz': return t('micro.type.quiz');
      case 'practice': return t('micro.type.practice');
      default: return t('micro.type.article');
    }
  };
  
  useAuth(); // Ensure user is authenticated
  const [chapter, setChapter] = useState<StructuredChapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!classId || !subjectId || !chapterSlug) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the structured curriculum JSON data
        const response = await fetch(
          `http://localhost:8000/api/lessons/structured/${classId}/${subjectId}/${chapterSlug}?lang=${language}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch chapter data');
        
        const chapterData: StructuredChapter = await response.json();
        setChapter(chapterData);
        
        // Auto-expand first section
        if (chapterData.sections.length > 0) {
          setExpandedSections(new Set([chapterData.sections[0].id]));
        }
        
      } catch (err) {
        console.error('Error fetching chapter data:', err);
        setError(err instanceof Error ? err.message : t('chapter.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterData();
  }, [classId, subjectId, chapterSlug, language]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleMicrosectionClick = (section: StructuredSection, microsection: Microsection) => {
    navigate(`/${classId}/${subjectId}/${chapterSlug}/${section.slug}/${microsection.id}`);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('chapter.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Chapter not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const sections = chapter.sections;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">
                {subjectId?.replace(/-/g, ' ')}
              </p>
              <h1 className="font-bold text-lg text-slate-900">{chapter.chapterTitle}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8 focus-mode-surface">
        {/* Chapter Description */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">{chapter.chapterTitle}</h2>
          <p className="text-blue-100">{chapter.chapterDescription}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {sections.length} sections
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {sections.reduce((sum, s) => sum + s.microsections.length, 0)} lessons
            </span>
          </div>
          <div className="mt-4" />
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-sm">
                      {sectionIndex + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-900">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{section.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {section.microsections.length} items
                    </span>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Microsections List */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-2">
                    {section.microsections.map((microsection) => {
                      const typeColors = getMicrosectionColor(microsection.type);
                      
                      return (
                        <button
                          key={microsection.id}
                          onClick={() => handleMicrosectionClick(section, microsection)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border ${typeColors.border} ${typeColors.bg} ${typeColors.hover} transition-all text-left`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors.icon} bg-white shadow-sm`}>
                            {getMicrosectionIcon(microsection.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate">{microsection.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${typeColors.icon} font-medium`}>
                                {getMicrosectionLabel(microsection.type)}
                              </span>
                              {microsection.estimatedMinutes && (
                                <span className="text-xs text-slate-400">
                                  • {microsection.estimatedMinutes} min
                                </span>
                              )}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {null}
    </div>
  );
}

export default ChapterPage;
