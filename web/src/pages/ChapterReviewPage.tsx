import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChapterInfo, TOCSection } from '../types/parsing';
import { getFile } from '../utils/fileStorage';

function ChapterReviewPage() {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<{ chapterIdx: number; sectionIdx: number } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedChapters = sessionStorage.getItem('parsedChapters');
    const storedFileName = sessionStorage.getItem('uploadedFileName');
    
    if (!storedChapters) {
      navigate('/parse');
      return;
    }

    setChapters(JSON.parse(storedChapters));
    setFileName(storedFileName || 'Unknown file');
  }, [navigate]);

  const updateChapter = (index: number, updates: Partial<ChapterInfo>) => {
    setChapters(prev => prev.map((ch, i) => i === index ? { ...ch, ...updates } : ch));
  };

  const deleteChapter = (index: number) => {
    if (confirm('Are you sure you want to delete this chapter?')) {
      setChapters(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addChapter = () => {
    const newChapter: ChapterInfo = {
      title: 'New Chapter',
      startPage: chapters.length > 0 ? chapters[chapters.length - 1].startPage + 10 : 1,
      tocSections: null
    };
    setChapters(prev => [...prev, newChapter]);
    setExpandedChapter(chapters.length);
    setEditingChapter(chapters.length);
  };

  const addSection = (chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    const sections = chapter.tocSections || [];
    const newSection: TOCSection = {
      sectionId: `${chapterIndex + 1}.${sections.length + 1}`,
      title: 'New Section',
      page: chapter.startPage
    };
    updateChapter(chapterIndex, {
      tocSections: [...sections, newSection]
    });
  };

  const updateSection = (chapterIndex: number, sectionIndex: number, updates: Partial<TOCSection>) => {
    const chapter = chapters[chapterIndex];
    if (!chapter.tocSections) return;
    
    const newSections = chapter.tocSections.map((sec, i) => 
      i === sectionIndex ? { ...sec, ...updates } : sec
    );
    updateChapter(chapterIndex, { tocSections: newSections });
  };

  const deleteSection = (chapterIndex: number, sectionIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (!chapter.tocSections) return;
    
    const newSections = chapter.tocSections.filter((_, i) => i !== sectionIndex);
    updateChapter(chapterIndex, { 
      tocSections: newSections.length > 0 ? newSections : null 
    });
  };

  const handleStartParsing = async () => {
    setIsParsing(true);
    setError(null);
    setParseProgress(0);

    try {
      // Get file from IndexedDB
      const file = await getFile('uploadedPDF');
      if (!file) {
        setError('File not found. Please upload again.');
        setIsParsing(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chapters', JSON.stringify(chapters));

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + Math.random() * 10, 90));
      }, 1000);

      const parseResponse = await fetch('http://localhost:8000/api/parse/full', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setParseProgress(100);

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse content');
      }

      const data = await parseResponse.json();
      
      // Store parsed content and navigate
      sessionStorage.setItem('parsedUnits', JSON.stringify(data.units));
      navigate('/parse/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/30 to-secondary-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary-100/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/parse')}
                className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-surface-900">Review Chapters</h1>
                <p className="text-sm text-surface-500">{fileName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-600">
                {chapters.length} chapters found
              </span>
              <button
                onClick={addChapter}
                className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.map((chapter, chapterIdx) => (
            <div 
              key={chapterIdx}
              className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm"
            >
              {/* Chapter Header */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-50 transition-colors"
                onClick={() => setExpandedChapter(expandedChapter === chapterIdx ? null : chapterIdx)}
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold">
                  {chapterIdx + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  {editingChapter === chapterIdx ? (
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapterIdx, { title: e.target.value })}
                      onBlur={() => setEditingChapter(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingChapter(null)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-1 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-semibold text-surface-900 truncate">{chapter.title}</h3>
                  )}
                  <p className="text-sm text-surface-500">
                    Page {chapter.startPage} • {chapter.tocSections?.length || 0} sections
                  </p>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    value={chapter.startPage}
                    onChange={(e) => updateChapter(chapterIdx, { startPage: parseInt(e.target.value) || 1 })}
                    className="w-20 px-2 py-1 text-sm border border-surface-300 rounded-lg text-center"
                    min={1}
                  />
                  <button
                    onClick={() => setEditingChapter(chapterIdx)}
                    className="p-2 hover:bg-surface-100 rounded-lg text-surface-500 hover:text-surface-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteChapter(chapterIdx)}
                    className="p-2 hover:bg-red-50 rounded-lg text-surface-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg 
                    className={`w-5 h-5 text-surface-400 transition-transform ${expandedChapter === chapterIdx ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Sections (Expanded) */}
              {expandedChapter === chapterIdx && (
                <div className="border-t border-surface-200 bg-surface-50 p-4">
                  {chapter.tocSections && chapter.tocSections.length > 0 ? (
                    <div className="space-y-2">
                      {chapter.tocSections.map((section, sectionIdx) => (
                        <div 
                          key={sectionIdx}
                          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-200"
                        >
                          <span className="text-sm font-mono text-primary-600 w-12">
                            {section.sectionId}
                          </span>
                          
                          {editingSection?.chapterIdx === chapterIdx && editingSection?.sectionIdx === sectionIdx ? (
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(chapterIdx, sectionIdx, { title: e.target.value })}
                              onBlur={() => setEditingSection(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingSection(null)}
                              className="flex-1 px-2 py-1 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              autoFocus
                            />
                          ) : (
                            <span className="flex-1 text-sm text-surface-700">{section.title}</span>
                          )}
                          
                          <input
                            type="number"
                            value={section.page || ''}
                            onChange={(e) => updateSection(chapterIdx, sectionIdx, { page: parseInt(e.target.value) || undefined })}
                            className="w-16 px-2 py-1 text-sm border border-surface-300 rounded text-center"
                            placeholder="Page"
                            min={1}
                          />
                          
                          <button
                            onClick={() => setEditingSection({ chapterIdx, sectionIdx })}
                            className="p-1.5 hover:bg-surface-100 rounded text-surface-400 hover:text-surface-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteSection(chapterIdx, sectionIdx)}
                            className="p-1.5 hover:bg-red-50 rounded text-surface-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-surface-500 text-center py-4">
                      No sections found in TOC. Sections will be auto-generated during parsing.
                    </p>
                  )}
                  
                  <button
                    onClick={() => addSection(chapterIdx)}
                    className="mt-3 w-full py-2 border-2 border-dashed border-surface-300 rounded-lg text-sm text-surface-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    + Add Section
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Parse Button */}
        <div className="mt-10 flex flex-col items-center">
          {isParsing ? (
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-surface-700">Parsing content...</span>
                <span className="text-sm text-surface-500">{Math.round(parseProgress)}%</span>
              </div>
              <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-300"
                  style={{ width: `${parseProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-surface-500 text-center">
                This may take a few minutes depending on the number of chapters...
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleStartParsing}
                disabled={chapters.length === 0}
                className={`
                  px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-200
                  flex items-center gap-3
                  ${chapters.length > 0
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl'
                    : 'bg-surface-200 text-surface-400 cursor-not-allowed'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Full Parsing
              </button>
              <p className="mt-3 text-sm text-surface-500">
                This will extract learning goals for all {chapters.length} chapters
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ChapterReviewPage;
