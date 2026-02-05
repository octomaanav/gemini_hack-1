import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { UserProfile, CurriculumWithGrades, SubjectWithChapters } from '../types';
import { fetchCurricula, fetchSubjectsWithChapters } from '../data/curriculumData';
import { useI18n } from '../components/i18n/useI18n';
import { useLanguage } from '../components/i18n/LanguageProvider';

function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { language } = useLanguage();

  const [selectedSubject, setSelectedSubject] = useState<SubjectWithChapters | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subjectsWithChapters, setSubjectsWithChapters] = useState<SubjectWithChapters[]>([]);
  const [curricula, setCurricula] = useState<CurriculumWithGrades[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch curricula on mount
  useEffect(() => {
    fetchCurricula(language)
      .then(setCurricula)
      .catch(console.error);
  }, [language]);

  // Extract user profile and fetch subjects with chapters
  useEffect(() => {
    if (user && user.profile) {
      setUserProfile(user.profile);

      if (user.profile.curriculumId && user.profile.classId) {
        setIsLoadingData(true);
        fetchSubjectsWithChapters(user.profile.curriculumId, user.profile.classId, language)
          .then((allSubjects) => {
            // Filter chapters to only user's selected chapters
            const filteredSubjects = allSubjects
              .map(subject => ({
                ...subject,
                chapters: subject.chapters.filter(c =>
                  user.profile?.chapterIds.includes(c.id)
                )
              }))
              .filter(subject => subject.chapters.length > 0);

            setSubjectsWithChapters(filteredSubjects);
            // Auto-select first subject
            if (filteredSubjects.length > 0 && !selectedSubject) {
              setSelectedSubject(filteredSubjects[0]);
            }
          })
          .catch(console.error)
          .finally(() => setIsLoadingData(false));
      } else {
        setIsLoadingData(false);
      }
    } else {
      setIsLoadingData(false);
    }
  }, [user, language]);

  // Get chapters for selected subject
  const chapters = selectedSubject?.chapters || [];

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{t('dashboard.loginPrompt')}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('dashboard.loginButton')}
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('dashboard.setupTitle')}</h2>
          <p className="text-slate-600 mb-6">{t('dashboard.setupSubtitle')}</p>
          <button
            onClick={() => navigate('/setup')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-semibold"
          >
            {t('dashboard.setupButton')}
          </button>
        </div>
      </div>
    );
  }

  const getCurriculumName = (id: string) => {
    const curriculum = curricula.find(c => c.id === id);
    return curriculum?.name || id;
  };

  const getGradeName = (id: string) => {
    for (const curriculum of curricula) {
      const grade = curriculum.grades.find(g => g.id === id);
      if (grade) return grade.name;
    }
    return id;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                L
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-800">{t('app.name')}</h1>
                <p className="text-xs text-slate-500">
                  {getCurriculumName(userProfile.curriculumId)} • {getGradeName(userProfile.classId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Subjects */}
          <aside className="w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 px-2">
                My Subjects ({subjectsWithChapters.length})
              </h2>

              <nav className="space-y-2">
                {subjectsWithChapters.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubject(subject);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedSubject?.id === subject.id
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span>{subject.name}</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                      {subject.chapters.length}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => navigate('/setup')}
                  className="w-full p-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>+</span> Edit Chapters
                </button>
                <button
                  onClick={() => navigate('/accessibility-guide')}
                  className="w-full mt-2 p-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {t('dashboard.learningGuide')}
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedSubject ? (
              <div className="space-y-6">
                {/* Subject Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
                    <p className="text-blue-100">
                      {selectedSubject.chapters.length} {t('dashboard.chaptersSelected')}
                    </p>
                  </div>
                </div>

                {/* Chapters Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        if (selectedSubject && userProfile) {
                          navigate(`/${userProfile.classId}/${selectedSubject.slug}/${chapter.slug}`);
                        }
                      }}
                      className="p-5 bg-white rounded-xl border-2 text-left transition-all hover:shadow-lg border-slate-200 hover:border-blue-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{chapter.name}</h3>
                          <p className="text-sm text-slate-500">{chapter.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-sm text-slate-500">
                  {t('dashboard.selectChapter')}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="text-5xl mb-4">👈</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t('dashboard.selectSubject')}</h3>
                <p className="text-slate-600">
                  {t('dashboard.selectSubjectHint')}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
