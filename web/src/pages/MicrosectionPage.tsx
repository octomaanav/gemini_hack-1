import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MathText } from '../components/MathText';
import { StoryPlayer } from '../components/StoryPlayer';
import type { 
  Microsection, 
  ArticleMicrosection, 
  VideoMicrosection, 
  QuizMicrosection, 
  PracticeMicrosection,
  ArticleContent,
  StoryAsset,
  StoryAudioSlide
} from '../types';
import { useLanguage } from '../components/i18n/LanguageProvider';
import { useI18n } from '../components/i18n/useI18n';
import { useAccessibility } from '../components/accessibility/AccessibilityProvider';
import { useAccessibility } from '../components/accessibility/AccessibilityProvider';

// Article Viewer Component
const ArticleViewer: React.FC<{ content: ArticleContent; t: (key: any) => string }> = ({ content, t }) => {
  return (
    <div className="prose prose-slate max-w-none">
      {/* Introduction */}
      {content.introduction && (
        <div className="text-lg text-slate-600 mb-8 leading-relaxed">
          <MathText text={content.introduction} />
        </div>
      )}

      {/* Core Concepts */}
      {content.coreConcepts.map((concept, i) => (
        <div key={i} className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{concept.conceptTitle}</h2>
          <div className="text-slate-700 mb-4 leading-relaxed">
            <MathText text={concept.explanation} />
          </div>
          {concept.example && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
                <p className="font-semibold text-blue-800 mb-1">{t('micro.example')}</p>
              <div className="text-blue-900">
                <MathText text={concept.example} />
              </div>
            </div>
          )}
          {concept.diagramImageUrl && (
            <div className="my-4 rounded-xl overflow-hidden border border-slate-200">
              <img 
                src={concept.diagramImageUrl} 
                alt={concept.diagramDescription || `Diagram for ${concept.conceptTitle}`}
                className="w-full max-w-lg"
              />
              {concept.diagramDescription && (
                <p className="text-sm text-slate-500 p-3 bg-slate-50">{concept.diagramDescription}</p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      {content.summary.length > 0 && (
        <div className="bg-slate-100 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3">{t('micro.keyTakeaways')}</h3>
          <ul className="space-y-2">
            {content.summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-slate-700"><MathText text={point} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Check Questions */}
      {content.quickCheckQuestions.length > 0 && (
        <div className="border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t('micro.quickCheck')}</h3>
          <div className="space-y-4">
            {content.quickCheckQuestions.map((q, i) => (
              <details key={i} className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-medium text-slate-800">
                      <MathText text={q.question} />
                    </span>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </div>
                </summary>
                <div className="ml-9 pl-3 border-l-2 border-green-300 py-2 text-green-800">
                  <MathText text={q.answer} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Video Viewer Component
const VideoViewer: React.FC<{
  content: VideoMicrosection['content'];
  story?: StoryAsset | null;
  onGenerateStory?: () => void;
  isStoryLoading?: boolean;
  audioSlides?: StoryAudioSlide[];
  onRegenerateAudio?: () => void;
  t: (key: any) => string;
}> = ({ content, story, onGenerateStory, isStoryLoading, audioSlides, onRegenerateAudio, t }) => {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop() 
        : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (!content.url && story?.status === 'ready') {
    return (
      <StoryPlayer
        story={story}
        autoPlay={false}
        audioSlides={audioSlides}
        onRegenerateAudio={onRegenerateAudio}
        isAudioLoading={isStoryLoading}
      />
    );
  }

  return (
    <div>
      <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6">
        {content.url ? (
          <iframe
            src={getEmbedUrl(content.url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={content.title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <div className="text-center mb-4">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{t('micro.videoNotAvailable')}</p>
            </div>
            {onGenerateStory && (
              <button
                onClick={onGenerateStory}
                className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100"
              >
                {isStoryLoading ? t('micro.generatingStory') : t('micro.generateStory')}
              </button>
            )}
          </div>
        )}
      </div>
      
      {content.description && (
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600">{content.description}</p>
        </div>
      )}
      
      {content.transcript && (
        <details className="mt-6 border border-slate-200 rounded-xl">
          <summary className="p-4 cursor-pointer font-medium text-slate-700 hover:bg-slate-50">
            📄 {t('micro.viewTranscript')}
          </summary>
          <div className="p-4 pt-0 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {content.transcript}
          </div>
        </details>
      )}
    </div>
  );
};

// Quiz Viewer Component
const QuizViewer: React.FC<{ content: QuizMicrosection['content']; t: (key: any) => string }> = ({ content, t }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, answer: string | number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    return content.questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
  }, [submitted, content.questions, answers]);

  return (
    <div>
      {content.description && (
        <div className="text-slate-600 mb-6">
          <MathText text={content.description} />
        </div>
      )}
      
      {content.timeLimit && !submitted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-center gap-2 text-amber-800">
          <span>⏱️</span>
          <span>{t('micro.timeLimit')}: {content.timeLimit} minutes</span>
        </div>
      )}

      {showResults && (
        <div className={`rounded-xl p-6 mb-6 ${score === content.questions.length ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className={`text-xl font-bold mb-2 ${score === content.questions.length ? 'text-green-800' : 'text-blue-800'}`}>
            {score === content.questions.length ? '🎉 Perfect Score!' : `You scored ${score}/${content.questions.length}`}
          </h3>
          <p className={score === content.questions.length ? 'text-green-700' : 'text-blue-700'}>
            {score === content.questions.length 
              ? 'Great job! You got all questions correct.'
              : `Review the questions below to see the correct answers.`
            }
          </p>
        </div>
      )}

      <div className="space-y-6">
        {content.questions.map((question, qIndex) => {
          const isCorrect = submitted && answers[question.id] === question.correctAnswer;
          const isWrong = submitted && answers[question.id] !== undefined && answers[question.id] !== question.correctAnswer;
          
          return (
            <div 
              key={question.id} 
              className={`border rounded-xl p-5 ${isCorrect ? 'border-green-300 bg-green-50' : isWrong ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-slate-100 text-slate-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold">
                  {qIndex + 1}
                </span>
                <div className="flex-1">
                          <div className="font-medium text-slate-900">
                            <MathText text={question.question} />
                          </div>
                  {question.points && (
                    <span className="text-xs text-slate-400 mt-1">{question.points} points</span>
                  )}
                </div>
              </div>

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2 ml-10">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[question.id] === optIndex;
                    const isCorrectOption = submitted && question.correctAnswer === optIndex;
                    
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswer(question.id, optIndex)}
                        disabled={submitted}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isCorrectOption 
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : isSelected && isWrong
                              ? 'border-red-500 bg-red-100 text-red-800'
                              : isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="flex gap-3 ml-10">
                  {['True', 'False'].map((option) => {
                    const value = option.toLowerCase();
                    const isSelected = answers[question.id] === value;
                    const isCorrectOption = submitted && question.correctAnswer === value;
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswer(question.id, value)}
                        disabled={submitted}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          isCorrectOption 
                            ? 'border-green-500 bg-green-100 text-green-800'
                            : isSelected && isWrong
                              ? 'border-red-500 bg-red-100 text-red-800'
                              : isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {submitted && question.explanation && (
                <div className="mt-3 ml-10 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <span className="font-medium">Explanation: </span>
                  {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < content.questions.length}
          className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all ${
            Object.keys(answers).length >= content.questions.length
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
};

// Practice Viewer Component
const PracticeViewer: React.FC<{ content: PracticeMicrosection['content']; t: (key: any) => string }> = ({ content, t }) => {
  return <QuizViewer content={{ id: content.id, title: content.title, description: content.description, questions: content.questions }} t={t} />;
};

// API response type for microsection endpoint
interface MicrosectionApiResponse {
  chapter: {
    chapterId: string;
    chapterTitle: string;
  };
  section: {
    id: string;
    slug: string;
    title: string;
  };
  microsection: Microsection;
  contentKey?: string | null;
  contentVersion?: number | null;
  navigation: {
    sectionMicrosections: {
      id: string;
      type: string;
      title: string;
    }[];
    currentIndex: number;
  };
}

export function MicrosectionPage() {
  const navigate = useNavigate();
  const { classId, subjectId, chapterSlug, sectionSlug, microsectionId } = useParams<{
    classId: string;
    subjectId: string;
    chapterSlug: string;
    sectionSlug: string;
    microsectionId: string;
  }>();
  
  useAuth(); // Still call to ensure authentication
  const [data, setData] = useState<MicrosectionApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<StoryAsset | null>(null);
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storyAudioSlides, setStoryAudioSlides] = useState<StoryAudioSlide[] | null>(null);
  const [isStoryQueued, setIsStoryQueued] = useState(false);
  const [contentKey, setContentKey] = useState<string | null>(null);
  const [contentVersion, setContentVersion] = useState<number | null>(null);
  const { language } = useLanguage();
  const { t } = useI18n();
  const { signsOn } = useAccessibility();

  useEffect(() => {
    const fetchMicrosection = async () => {
      if (!classId || !subjectId || !chapterSlug || !sectionSlug || !microsectionId) {
        setError('Missing required parameters');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/api/lessons/structured/${classId}/${subjectId}/${chapterSlug}/${sectionSlug}/${microsectionId}?lang=${language}`
        );
        
        if (!response.ok) {
          throw new Error('Content not found');
        }
        
        const responseData: MicrosectionApiResponse = await response.json();
        setData(responseData);
        setContentKey(responseData.contentKey || null);
        setContentVersion(responseData.contentVersion ?? null);
      } catch (err) {
        console.error('Error fetching microsection:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMicrosection();
  }, [classId, subjectId, chapterSlug, sectionSlug, microsectionId, language]);

  useEffect(() => {
    setStory(null);
    setStoryError(null);
    setStoryAudioSlides(null);
    setIsStoryQueued(false);
    preloadStory();
  }, [classId, subjectId, chapterSlug, sectionSlug, microsectionId, contentKey, contentVersion, language]);

  const mapStoryV2ToAsset = (payload: any) => {
    const slides = (payload.slides || []).map((slide: any) => {
      const index = Number(slide.index);
      return {
        id: `slide-${index}`,
        index,
        title: `Slide ${index}`,
        narration: slide.caption || '',
        caption: slide.caption || '',
        imagePrompt: '',
        imageUrl: slide.imageUrl || undefined,
        signKeywords: Array.isArray(slide.signKeywords) ? slide.signKeywords : undefined,
      };
    });

    const audioSlides: StoryAudioSlide[] = (payload.slides || [])
      .filter((slide: any) => slide.audioUrl)
      .map((slide: any) => {
        const index = Number(slide.index);
        return {
          slideId: `slide-${index}`,
          narration: slide.caption || '',
          caption: slide.caption || '',
          audioUrl: slide.audioUrl,
        };
      });

    const storyAsset: StoryAsset = {
      id: contentKey || 'story',
      storyKey: contentKey || 'story',
      classId: classId || '',
      subjectId: subjectId || '',
      chapterSlug: chapterSlug || '',
      sectionSlug: sectionSlug || '',
      microsectionId: microsectionId || null,
      status: payload.status === 'ready' ? 'ready' : 'pending',
      renderType: 'slides',
      slides,
    };

    return { storyAsset, audioSlides, status: payload.status };
  };

  const signKeywords = useMemo(() => {
    if (!data?.microsection) return [];
    const stop = new Set(['the','and','for','with','that','this','from','into','your','you','are','was','were','have','has','had','about','than','then','them','they','their','there','what','when','where','which','how','why','a','an','of','to','in','on','at','as','by','or','be','is','it']);
    const pool: string[] = [];
    const addText = (text?: string) => {
      if (!text) return;
      const words = text
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter((w) => w.length > 3 && !stop.has(w));
      pool.push(...words);
    };

    const micro = data.microsection as any;
    addText(micro.title);
    addText(data.section?.title);
    if (micro.content?.introduction) addText(micro.content.introduction);
    if (Array.isArray(micro.content?.coreConcepts)) {
      micro.content.coreConcepts.forEach((c: any) => addText(c?.conceptTitle));
    }
    if (Array.isArray(micro.content?.summary)) {
      micro.content.summary.forEach((s: any) => addText(String(s)));
    }
    if (micro.content?.description) addText(micro.content.description);

    const unique: string[] = [];
    for (const word of pool) {
      if (!unique.includes(word)) unique.push(word);
      if (unique.length >= 8) break;
    }
    return unique;
  }, [data]);

  const fetchStory = async () => {
    if (!contentKey) return;
    setIsStoryLoading(true);
    setStoryError(null);
    setIsStoryQueued(false);
    try {
      const response = await fetch(
        `http://localhost:8000/api/story_v2/${encodeURIComponent(contentKey)}?version=${contentVersion || ''}&locale=${language}`
      );
      if (!response.ok) {
        throw new Error('Failed to load story');
      }
      const storyData = await response.json();
      const { storyAsset, audioSlides, status } = mapStoryV2ToAsset(storyData);
      if (status === 'queued') {
        setStory(null);
        setStoryAudioSlides(null);
        setIsStoryQueued(true);
      } else {
        setStory(storyAsset);
        setStoryAudioSlides(audioSlides);
      }
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : 'Failed to load story');
    } finally {
      setIsStoryLoading(false);
    }
  };

  const preloadStory = async () => {
    if (!contentKey) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/story_v2/${encodeURIComponent(contentKey)}?version=${contentVersion || ''}&locale=${language}`
      );
      if (!response.ok) {
        setStory(null);
        return;
      }
      const storyData = await response.json();
      const { storyAsset, audioSlides, status } = mapStoryV2ToAsset(storyData);
      if (status === 'ready') {
        setStory(storyAsset);
        setStoryAudioSlides(audioSlides);
      } else {
        setStory(null);
        setStoryAudioSlides(null);
        setIsStoryQueued(true);
      }
    } catch (err) {
      console.warn('Story preload failed', err);
    }
  };

  useEffect(() => {
    const handleStoryOpen = () => {
      fetchStory();
    };

    window.addEventListener('story-open', handleStoryOpen as EventListener);
    return () => {
      window.removeEventListener('story-open', handleStoryOpen as EventListener);
    };
  }, [data, classId, subjectId, chapterSlug, sectionSlug]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!data) return;
    
    const { navigation, section } = data;
    const newIndex = direction === 'prev' 
      ? navigation.currentIndex - 1 
      : navigation.currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < navigation.sectionMicrosections.length) {
      const nextMicrosection = navigation.sectionMicrosections[newIndex];
      navigate(`/${classId}/${subjectId}/${chapterSlug}/${section.slug}/${nextMicrosection.id}`);
    } else if (direction === 'prev') {
      // Go back to chapter page
      navigate(`/${classId}/${subjectId}/${chapterSlug}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || t('micro.error')}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('micro.back')}
          </button>
        </div>
      </div>
    );
  }

  const { microsection, navigation, section } = data;

  const getTypeLabel = () => {
    switch (microsection.type) {
      case 'article': return t('micro.type.article');
      case 'video': return t('micro.type.story');
      case 'quiz': return t('micro.type.quiz');
      case 'practice': return t('micro.type.practice');
      default: return t('micro.type.article');
    }
  };

  const getTypeColor = () => {
    switch (microsection.type) {
      case 'article': return 'text-blue-600 bg-blue-50';
      case 'video': return 'text-purple-600 bg-purple-50';
      case 'quiz': return 'text-green-600 bg-green-50';
      case 'practice': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const hasPrev = navigation.currentIndex > 0;
  const hasNext = navigation.currentIndex < navigation.sectionMicrosections.length - 1;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/${classId}/${subjectId}/${chapterSlug}`)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Back to chapter"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-0.5">{section.title}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor()}`}>
                  {getTypeLabel()}
                </span>
                {microsection.estimatedMinutes && (
                  <span className="text-xs text-slate-400">
                    {microsection.estimatedMinutes} min
                  </span>
                )}
              </div>
              <h1 className="font-bold text-lg text-slate-900">{microsection.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 focus-mode-surface">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={fetchStory}
            className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 disabled:opacity-60"
            disabled={isStoryLoading || !contentKey}
          >
            {isStoryLoading || isStoryQueued ? t('micro.generatingStory') : t('micro.storyMode')}
          </button>
          {storyError && (
            <span className="text-sm text-red-600">{storyError}</span>
          )}
        </div>

        {(isStoryLoading || isStoryQueued) && (
          <div className="mb-8 p-4 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
            {t('micro.generatingStory')}
          </div>
        )}

        {story && story.status === 'ready' && microsection.type !== 'video' && (
          <div className="mb-10">
            <StoryPlayer
              story={story}
              autoPlay={false}
              audioSlides={storyAudioSlides || []}
              onRegenerateAudio={fetchStory}
              isAudioLoading={isStoryLoading}
            />
          </div>
        )}
        {signsOn && signKeywords.length > 0 && (
          <div className="mb-10 border border-slate-200 rounded-2xl p-4 bg-white">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">{t('controls.signs')}</div>
            <div className="flex flex-wrap gap-3">
              {signKeywords.map((keyword) => {
                const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const src = `/signs/${slug}.png`;
                return (
                  <div key={keyword} className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                    <img
                      src={src}
                      alt={`Sign for ${keyword}`}
                      className="w-10 h-10 object-contain"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.style.display = 'none';
                      }}
                    />
                    <span className="text-sm text-slate-700">{keyword}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {!story && microsection.type !== 'video' && (
          <div className="mb-10 border border-slate-200 rounded-2xl p-6 bg-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{t('micro.storyMode')}</h3>
                <p className="text-sm text-slate-600">
                  {isStoryQueued ? t('micro.generatingStory') : t('micro.storyNotReady')}
                </p>
              </div>
              <button
                onClick={fetchStory}
                className="px-4 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100"
                disabled={!contentKey}
              >
                {isStoryLoading ? t('micro.generatingStory') : t('micro.generateStory')}
              </button>
            </div>
          </div>
        )}

        {microsection.type === 'article' && (
          <ArticleViewer content={(microsection as ArticleMicrosection).content} t={t} />
        )}
        {microsection.type === 'video' && (
          <VideoViewer
            content={(microsection as VideoMicrosection).content}
            story={story}
            onGenerateStory={fetchStory}
            isStoryLoading={isStoryLoading}
            audioSlides={storyAudioSlides || []}
            onRegenerateAudio={fetchStory}
            t={t}
          />
        )}
        {microsection.type === 'quiz' && (
          <QuizViewer content={(microsection as QuizMicrosection).content} t={t} />
        )}
        {microsection.type === 'practice' && (
          <PracticeViewer content={(microsection as PracticeMicrosection).content} t={t} />
        )}
      </main>

      {null}

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => handleNavigate('prev')}
            className={`px-4 py-2 font-medium flex items-center gap-2 rounded-lg ${
              hasPrev 
                ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
            disabled={!hasPrev}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('micro.previous')}
          </button>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-1">
            {navigation.sectionMicrosections.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === navigation.currentIndex 
                    ? 'bg-blue-600' 
                    : idx < navigation.currentIndex 
                      ? 'bg-green-500' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => hasNext ? handleNavigate('next') : navigate(`/${classId}/${subjectId}/${chapterSlug}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            {hasNext ? t('micro.next') : t('micro.finish')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default MicrosectionPage;
