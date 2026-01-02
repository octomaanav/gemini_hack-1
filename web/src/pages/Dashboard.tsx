import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AccessibilitySettings {
  voiceNarration: boolean;
  captions: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
  contrastMode: boolean;
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    voiceNarration: false,
    captions: true,
    textSize: 'normal',
    contrastMode: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user
    fetch('http://localhost:8000/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    fetch('http://localhost:8000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        navigate('/login');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/20 to-secondary-50/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-surface-600 text-base font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const textSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  }[accessibility.textSize];

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className={`min-h-screen ${accessibility.contrastMode ? 'bg-surface-900' : 'bg-gradient-to-br from-surface-50 via-primary-50/20 to-secondary-50/20'} ${textSizeClass}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${accessibility.contrastMode ? 'bg-surface-900 border-surface-700' : 'bg-white/80 backdrop-blur-md border-primary-100/50'} border-b transition-colors duration-150`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-base font-bold">L</span>
            </div>
            <span className={`text-xl font-bold ${accessibility.contrastMode ? 'text-white' : 'bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent'}`}>LearnHub</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAccessibility(!showAccessibility)}
              className={`p-2.5 rounded-xl cursor-pointer transition-all duration-150 font-semibold ${
                accessibility.contrastMode 
                  ? 'hover:bg-surface-800 text-surface-300' 
                  : 'hover:bg-primary-100 text-primary-600'
              } ${showAccessibility ? (accessibility.contrastMode ? 'bg-surface-700' : 'bg-primary-100') : ''}`}
              aria-label="Accessibility settings"
              title="Accessibility settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 text-sm font-bold rounded-lg cursor-pointer transition-all duration-150 ${
                accessibility.contrastMode 
                  ? 'text-surface-300 hover:bg-surface-800 border border-surface-700' 
                  : 'text-surface-700 hover:bg-surface-100/70 border border-surface-200'
              }`}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Accessibility Panel */}
        {showAccessibility && (
          <div className={`border-t ${accessibility.contrastMode ? 'border-surface-700 bg-surface-800' : 'border-primary-100/50 bg-white/50 backdrop-blur-sm'} transition-colors duration-150`}>
            <div className="max-w-6xl mx-auto px-6 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setAccessibility({ ...accessibility, voiceNarration: !accessibility.voiceNarration })}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 font-semibold ${
                    accessibility.voiceNarration
                      ? 'border-primary-500 bg-primary-100 text-primary-800 shadow-md'
                      : accessibility.contrastMode 
                        ? 'border-surface-600 text-surface-300 hover:border-surface-500 hover:bg-surface-700/50' 
                        : 'border-primary-200/50 text-surface-600 hover:border-primary-300 hover:bg-primary-50/60'
                  }`}
                >
                  <div className="text-2xl mb-1">🔊</div>
                  <div className="font-bold text-sm">Voice</div>
                  <div className="text-xs opacity-70 font-medium">{accessibility.voiceNarration ? 'On' : 'Off'}</div>
                </button>

                <button
                  onClick={() => setAccessibility({ ...accessibility, captions: !accessibility.captions })}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 font-semibold ${
                    accessibility.captions
                      ? 'border-secondary-500 bg-secondary-100 text-secondary-800 shadow-md'
                      : accessibility.contrastMode 
                        ? 'border-surface-600 text-surface-300 hover:border-surface-500 hover:bg-surface-700/50' 
                        : 'border-secondary-200/50 text-surface-600 hover:border-secondary-300 hover:bg-secondary-50/60'
                  }`}
                >
                  <div className="text-2xl mb-1">💬</div>
                  <div className="font-bold text-sm">Captions</div>
                  <div className="text-xs opacity-70 font-medium">{accessibility.captions ? 'On' : 'Off'}</div>
                </button>

                <div className={`p-4 rounded-2xl border-2 ${accessibility.contrastMode ? 'border-surface-600' : 'border-accent-200/50'}`}>
                  <div className="text-2xl mb-1">📏</div>
                  <div className={`font-bold text-sm mb-2 ${accessibility.contrastMode ? 'text-surface-300' : 'text-surface-700'}`}>Text size</div>
                  <div className="flex gap-1.5">
                    {(['normal', 'large', 'xlarge'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setAccessibility({ ...accessibility, textSize: size })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 ${
                          accessibility.textSize === size
                            ? 'bg-accent-600 text-white shadow-md'
                            : accessibility.contrastMode 
                              ? 'bg-surface-700 text-surface-300 hover:bg-surface-600' 
                              : 'bg-accent-100/60 text-accent-700 hover:bg-accent-100'
                        }`}
                      >
                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setAccessibility({ ...accessibility, contrastMode: !accessibility.contrastMode })}
                  className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 font-semibold ${
                    accessibility.contrastMode
                      ? 'border-primary-600 bg-primary-900/50 text-primary-300 shadow-md'
                      : 'border-tertiary-200/50 text-surface-600 hover:border-tertiary-300 hover:bg-tertiary-50/60'
                  }`}
                >
                  <div className="text-2xl mb-1">◐</div>
                  <div className="font-bold text-sm">Contrast</div>
                  <div className="text-xs opacity-70 font-medium">{accessibility.contrastMode ? 'High' : 'Normal'}</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className={`text-4xl font-black ${accessibility.contrastMode ? 'text-white' : 'bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent'}`}>
            Welcome back, {firstName}! 
          </h1>
          <p className={`mt-1 ${accessibility.contrastMode ? 'text-surface-400' : 'text-surface-600'}`}>
            Ready to continue learning?
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Lesson Card */}
            <div className={`rounded-2xl p-6 shadow-card ${accessibility.contrastMode ? 'bg-surface-800 border border-surface-700' : 'bg-white border border-surface-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-medium uppercase tracking-wide ${accessibility.contrastMode ? 'text-primary-400' : 'text-primary-600'}`}>
                    Continue Learning
                  </span>
                  <h2 className={`mt-1 text-xl font-semibold ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>
                    Introduction to Fractions
                  </h2>
                  <p className={`mt-1 text-sm ${accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}`}>
                    Using pizza slices to understand parts of a whole
                  </p>
                </div>
                <span className="text-3xl">🍕</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className={accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}>Progress</span>
                  <span className={`font-medium ${accessibility.contrastMode ? 'text-surface-300' : 'text-surface-700'}`}>60%</span>
                </div>
                <div className={`h-2 rounded-full ${accessibility.contrastMode ? 'bg-surface-700' : 'bg-surface-100'}`}>
                  <div className="h-2 rounded-full bg-primary-600 transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 shadow-button hover:shadow-elevated cursor-pointer transition-all duration-150 flex items-center justify-center gap-2">
                Continue lesson
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Learning Path */}
            <div className={`rounded-2xl p-6 shadow-card ${accessibility.contrastMode ? 'bg-surface-800 border border-surface-700' : 'bg-white border border-surface-200'}`}>
              <h3 className={`text-lg font-semibold mb-6 ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>
                Your learning path
              </h3>

              <div className="space-y-4">
                {/* Completed */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>Numbers & Counting</div>
                    <div className={`text-sm ${accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}`}>Completed</div>
                  </div>
                  <span className="text-success-600 text-sm font-medium">100%</span>
                </div>

                {/* Current */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 ring-2 ring-primary-600 ring-offset-2">
                    <span className="text-lg">🍕</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>Fractions</div>
                    <div className={`text-sm ${accessibility.contrastMode ? 'text-primary-400' : 'text-primary-600'}`}>In progress</div>
                  </div>
                  <span className="text-primary-600 text-sm font-medium">60%</span>
                </div>

                {/* Locked */}
                <div className="flex items-center gap-4 opacity-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accessibility.contrastMode ? 'bg-surface-700' : 'bg-surface-100'}`}>
                    <svg className={`w-5 h-5 ${accessibility.contrastMode ? 'text-surface-500' : 'text-surface-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${accessibility.contrastMode ? 'text-surface-400' : 'text-surface-600'}`}>Decimals</div>
                    <div className={`text-sm ${accessibility.contrastMode ? 'text-surface-500' : 'text-surface-400'}`}>Complete Fractions first</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 opacity-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accessibility.contrastMode ? 'bg-surface-700' : 'bg-surface-100'}`}>
                    <svg className={`w-5 h-5 ${accessibility.contrastMode ? 'text-surface-500' : 'text-surface-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${accessibility.contrastMode ? 'text-surface-400' : 'text-surface-600'}`}>Money & Finance</div>
                    <div className={`text-sm ${accessibility.contrastMode ? 'text-surface-500' : 'text-surface-400'}`}>Locked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className={`rounded-2xl p-6 shadow-card ${accessibility.contrastMode ? 'bg-surface-800 border border-surface-700' : 'bg-white border border-surface-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>
                Your progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}>Lessons completed</span>
                  <span className={`font-semibold ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}>Current streak</span>
                  <span className={`font-semibold ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>5 days 🔥</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={accessibility.contrastMode ? 'text-surface-400' : 'text-surface-500'}>Time this week</span>
                  <span className={`font-semibold ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>2h 15m</span>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className={`rounded-2xl p-6 shadow-card ${accessibility.contrastMode ? 'bg-primary-900 border border-primary-800' : 'bg-primary-50 border border-primary-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accessibility.contrastMode ? 'bg-primary-800' : 'bg-primary-100'}`}>
                  <svg className={`w-5 h-5 ${accessibility.contrastMode ? 'text-primary-300' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`font-semibold ${accessibility.contrastMode ? 'text-white' : 'text-surface-900'}`}>
                  Need help?
                </h3>
              </div>
              <p className={`text-sm mb-4 ${accessibility.contrastMode ? 'text-primary-200' : 'text-surface-600'}`}>
                Get explanations in different ways that work for you.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button className={`p-3 rounded-xl text-center cursor-pointer transition-all duration-150 ${accessibility.contrastMode ? 'bg-primary-800 hover:bg-primary-700' : 'bg-white hover:bg-primary-100 shadow-soft hover:shadow-card'}`}>
                  <span className="text-lg">🗣</span>
                  <div className={`text-xs mt-1 ${accessibility.contrastMode ? 'text-primary-200' : 'text-surface-600'}`}>Explain</div>
                </button>
                <button className={`p-3 rounded-xl text-center cursor-pointer transition-all duration-150 ${accessibility.contrastMode ? 'bg-primary-800 hover:bg-primary-700' : 'bg-white hover:bg-primary-100 shadow-soft hover:shadow-card'}`}>
                  <span className="text-lg">📸</span>
                  <div className={`text-xs mt-1 ${accessibility.contrastMode ? 'text-primary-200' : 'text-surface-600'}`}>Visual</div>
                </button>
                <button className={`p-3 rounded-xl text-center cursor-pointer transition-all duration-150 ${accessibility.contrastMode ? 'bg-primary-800 hover:bg-primary-700' : 'bg-white hover:bg-primary-100 shadow-soft hover:shadow-card'}`}>
                  <span className="text-lg">🔊</span>
                  <div className={`text-xs mt-1 ${accessibility.contrastMode ? 'text-primary-200' : 'text-surface-600'}`}>Audio</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
