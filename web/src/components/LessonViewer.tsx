import React, { useEffect, useMemo, useRef } from "react";
import { MathText } from "./MathText";
import type { UnitLessons } from "../types";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { extractLessonText } from "../utils/textExtractor";


interface LessonViewerProps {
  book: UnitLessons[];
  autoStartNarration?: boolean;
}

// Using custom MathText that loads MathJax from CDN, no external hooks

const LessonViewerContent: React.FC<{ book: UnitLessons[]; autoStartNarration?: boolean }> = ({ 
  book, 
  autoStartNarration = false 
}) => {
  const [selectedUnitIdx] = React.useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = React.useState(0);
  const unit = book[selectedUnitIdx];
  const lesson = unit.lessons[selectedLessonIdx];
  
  // TTS for lesson narration
  const {
    speak,
    pause: pauseTTS,
    resume: resumeTTS,
    stop: stopTTS,
    isPlaying,
    isPaused,
  } = useTextToSpeech({ rate: 1 });
  
  const autoStartRef = useRef(autoStartNarration);
  
  // Extract lesson text for narration
  const lessonText = useMemo(() => {
    if (!lesson) return '';
    return extractLessonText(lesson);
  }, [lesson]);

  console.log(lesson);

  
  // Auto-start narration if requested
  useEffect(() => {
    if (autoStartRef.current && lessonText && !isPlaying && !isPaused) {
      autoStartRef.current = false; // Only auto-start once
      speak(lessonText);
    }
  }, [lessonText, isPlaying, isPaused, speak]);
  
  // Stop narration when lesson changes
  useEffect(() => {
    stopTTS();
  }, [selectedLessonIdx, stopTTS]);

  // Listen for voice commands from CommandExecutor
  useEffect(() => {
    const handleLessonControl = (event: CustomEvent) => {
      const { action } = event.detail;
      
      switch (action) {
        case 'play':
          if (lessonText && !isPlaying) {
            speak(lessonText);
          }
          break;
        case 'pause':
          if (isPlaying) {
            pauseTTS();
          }
          break;
        case 'resume':
          if (isPaused) {
            resumeTTS();
          }
          break;
        case 'stop':
          stopTTS();
          break;
        case 'next':
          if (selectedLessonIdx < unit.lessons.length - 1) {
            setSelectedLessonIdx(selectedLessonIdx + 1);
          }
          break;
        case 'previous':
          if (selectedLessonIdx > 0) {
            setSelectedLessonIdx(selectedLessonIdx - 1);
          }
          break;
        default:
          console.warn('Unknown action:', action);
      }
    };

    window.addEventListener('lesson-control', handleLessonControl as EventListener);
    return () => {
      window.removeEventListener('lesson-control', handleLessonControl as EventListener);
    };
  }, [lessonText, isPlaying, isPaused, speak, pauseTTS, resumeTTS, stopTTS, selectedLessonIdx, unit.lessons.length]);

  return (
      <div style={{ display: "flex", height: "100vh", background: "#f8fafc" }}>
        {/* Sidebar */}
        <div style={{ width: 340, background: "#fff", borderRight: "1px solid #e5e7eb", padding: 24, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{unit.unitTitle}</div>
          <div style={{ color: "#64748b", fontSize: 15, marginBottom: 24 }}>{unit.unitDescription}</div>
          <div>
            {unit.lessons.map((l, idx) => (
              <div
                key={l.sectionId}
                onClick={() => setSelectedLessonIdx(idx)}
                style={{
                  background: idx === selectedLessonIdx ? "#f1f5f9" : undefined,
                  borderRadius: 6,
                  padding: "10px 14px",
                  marginBottom: 6,
                  cursor: "pointer",
                  fontWeight: idx === selectedLessonIdx ? 600 : 400,
                  color: idx === selectedLessonIdx ? "#2563eb" : "#0f172a",
                  borderLeft: idx === selectedLessonIdx ? "3px solid #2563eb" : "3px solid transparent",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {l.title}
              </div>
            ))}
          </div>
        </div>
        {/* Main Content */}
        <div style={{ flex: 1, padding: 40, overflowY: "auto" }}>
          {/* Playback Controls */}
          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 24, 
            padding: 16,
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: 14, color: '#64748b', marginRight: 'auto' }}>
              {isPlaying && !isPaused && '▶️ Playing'}
              {isPaused && '⏸️ Paused'}
              {!isPlaying && !isPaused && '⏹️ Stopped'}
            </div>
            <button
              onClick={() => speak(lessonText)}
              disabled={isPlaying && !isPaused}
              style={{
                padding: '8px 16px',
                background: isPlaying && !isPaused ? '#cbd5e1' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: isPlaying && !isPaused ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ▶️ Play
            </button>
            <button
              onClick={pauseTTS}
              disabled={!isPlaying || isPaused}
              style={{
                padding: '8px 16px',
                background: !isPlaying || isPaused ? '#cbd5e1' : '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: !isPlaying || isPaused ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ⏸️ Pause
            </button>
            <button
              onClick={resumeTTS}
              disabled={!isPaused}
              style={{
                padding: '8px 16px',
                background: !isPaused ? '#cbd5e1' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: !isPaused ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ▶️ Resume
            </button>
            <button
              onClick={stopTTS}
              disabled={!isPlaying && !isPaused}
              style={{
                padding: '8px 16px',
                background: !isPlaying && !isPaused ? '#cbd5e1' : '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: !isPlaying && !isPaused ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              ⏹️ Stop
            </button>
            <div style={{ fontSize: 12, color: '#94a3b8', marginLeft: 12 }}>
              💡 Say "play", "pause", "resume", "stop"
            </div>
          </div>
          
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{lesson.title}</div>
          <div style={{ fontSize: 18, color: "#334155", marginBottom: 24 }}>
            <MathText text={lesson.lessonContent.introduction} />
          </div>
          <div>
            {lesson.lessonContent.coreConcepts.map((concept, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{concept.conceptTitle}</div>
                <div style={{ fontSize: 16, color: "#334155", marginBottom: 6 }}>
                  <MathText text={concept.explanation} />
                </div>
                <div style={{ fontSize: 15, color: "#475569", marginBottom: 4 }}>
                  <b>Example:</b> <MathText text={concept.example} />
                </div>
                <div style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                  <b>Diagram:</b> {concept.diagramDescription}
                </div>
                {concept.diagramImageUrl && (
                  <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img 
                      src={concept.diagramImageUrl} 
                      alt={concept.diagramDescription || `Diagram for ${concept.conceptTitle}`}
                      style={{ width: '100%', maxWidth: 500, height: 'auto', display: 'block' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Summary</div>
            <ul style={{ marginLeft: 20 }}>
              {lesson.lessonContent.summary.map((point, i) => (
                <li key={i} style={{ fontSize: 15, color: "#334155", marginBottom: 2 }}>
                  <MathText text={point} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Quick Check Questions</div>
            <ul style={{ marginLeft: 20 }}>
              {lesson.lessonContent.quickCheckQuestions.map((q, i) => (
                <li key={i} style={{ fontSize: 15, color: "#334155", marginBottom: 8 }}>
                  <b>Q:</b> <MathText text={q.question} />
                  <br />
                  <b>A:</b> <MathText text={q.answer} />
                </li>
              ))}
            </ul>
          </div>

          {/* Images Section */}
          {lesson.lessonContent.images && lesson.lessonContent.images.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Images</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {lesson.lessonContent.images.map((image, i) => (
                  <div key={image.id || i} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 8, 
                    overflow: 'hidden',
                    background: '#fff'
                  }}>
                    <img 
                      src={image.url} 
                      alt={image.alt || image.title || 'Lesson image'} 
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    {(image.title || image.caption) && (
                      <div style={{ padding: 12 }}>
                        {image.title && (
                          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{image.title}</div>
                        )}
                        {image.caption && (
                          <div style={{ fontSize: 13, color: '#64748b' }}>{image.caption}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {lesson.lessonContent.videos && lesson.lessonContent.videos.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Videos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {lesson.lessonContent.videos.map((video, i) => (
                  <div key={video.id || i} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 8, 
                    overflow: 'hidden',
                    background: '#fff'
                  }}>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      {!video.url ? (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}>
                          No video URL provided
                        </div>
                      ) : video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                        <iframe
                          src={video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%',
                            border: 'none'
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                        />
                      ) : video.url.includes('vimeo.com') ? (
                        <iframe
                          src={video.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%',
                            border: 'none'
                          }}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={video.title}
                        />
                      ) : (
                        <video
                          src={video.url}
                          controls
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%'
                          }}
                          title={video.title}
                        />
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{video.title}</div>
                      {video.description && (
                        <div style={{ fontSize: 14, color: '#64748b' }}>{video.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes Section */}
          {lesson.lessonContent.quizzes && lesson.lessonContent.quizzes.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Quizzes</div>
              {lesson.lessonContent.quizzes.map((quiz, quizIdx) => (
                <div key={quiz.id || quizIdx} style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 8, 
                  padding: 16,
                  marginBottom: 16,
                  background: '#fff'
                }}>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{quiz.title}</div>
                  {quiz.description && (
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>{quiz.description}</div>
                  )}
                  {quiz.timeLimit && (
                    <div style={{ fontSize: 13, color: '#f59e0b', marginBottom: 12 }}>
                      ⏱️ Time Limit: {quiz.timeLimit} minutes
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quiz.questions.map((question, qIdx) => (
                      <div key={question.id || qIdx} style={{ 
                        padding: 12, 
                        background: '#f8fafc', 
                        borderRadius: 6,
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>
                          {qIdx + 1}. <MathText text={question.question} />
                        </div>
                        {question.type === 'multiple-choice' && question.options && (
                          <div style={{ marginLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {question.options.map((option, optIdx) => (
                              <div key={optIdx} style={{ 
                                fontSize: 14, 
                                padding: '6px 10px',
                                background: '#fff',
                                borderRadius: 4,
                                border: '1px solid #e2e8f0'
                              }}>
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'true-false' && (
                          <div style={{ marginLeft: 16, display: 'flex', gap: 12 }}>
                            <div style={{ fontSize: 14, padding: '6px 16px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>True</div>
                            <div style={{ fontSize: 14, padding: '6px 16px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>False</div>
                          </div>
                        )}
                        {question.points && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                            Points: {question.points}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes Section */}
          {lesson.lessonContent.notes && lesson.lessonContent.notes.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Notes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lesson.lessonContent.notes.map((note, i) => (
                  <div key={note.id || i} style={{ 
                    border: '1px solid #fbbf24', 
                    borderRadius: 8, 
                    padding: 16,
                    background: '#fffbeb'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#92400e' }}>
                      📝 {note.title}
                    </div>
                    <div style={{ fontSize: 14, color: '#78350f', whiteSpace: 'pre-wrap' }}>
                      <MathText text={note.content} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export const LessonViewer: React.FC<LessonViewerProps> = ({ book, autoStartNarration }) => {
  return <LessonViewerContent book={book} autoStartNarration={autoStartNarration} />;
};
