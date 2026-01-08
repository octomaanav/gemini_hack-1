import { useState } from 'react';

// Subject and Chapter Types
interface Chapter {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: Chapter[];
}

interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  disabilityType: 'blind' | 'deaf' | 'neurodivergent';
  preferences: {
    pace: 'slow' | 'medium' | 'fast';
    verbosity: 'concise' | 'moderate' | 'detailed';
  };
}

interface DashboardProps {
  currentProfile: StudentProfile;
}

// Hard-coded subjects and chapters
const SUBJECTS: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    chapters: [
      { id: 'motion', title: 'Motion in a Straight Line' },
      { id: 'laws', title: 'Laws of Motion' },
      { id: 'work-energy', title: 'Work, Energy and Power' }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '📐',
    chapters: [
      { id: 'sets', title: 'Sets and Functions' },
      { id: 'trigonometry', title: 'Trigonometric Functions' },
      { id: 'calculus', title: 'Introduction to Calculus' }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    chapters: [
      { id: 'structure', title: 'Structure of Atom' },
      { id: 'states', title: 'States of Matter' },
      { id: 'equilibrium', title: 'Chemical Equilibrium' }
    ]
  }
];

function Dashboard({ currentProfile }: DashboardProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>('physics');
  const [selectedChapter, setSelectedChapter] = useState<string>('motion');
  const [selectedSubject, setSelectedSubject] = useState<string>('physics');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  const showNextStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    newExpanded.add(stepIndex + 1);
    setExpandedSteps(newExpanded);
  };

  const handleDownloadBRF = () => {
    alert('Downloading BRF file for Braille embosser...');
  };

  const handlePrintBraille = () => {
    alert('Sending to Braille embosser...');
  };

  // Render content based on student profile
  const renderContent = () => {
    if (selectedChapter === 'motion' && selectedSubject === 'physics') {
      return renderMotionContent();
    }
    return (
      <div className="text-center py-12 text-surface-500">
        <p>Select a chapter from the sidebar to view content.</p>
      </div>
    );
  };

  const renderMotionContent = () => {
    switch (currentProfile.disabilityType) {
      case 'blind':
        return renderBlindView();
      case 'deaf':
        return renderDeafView();
      case 'neurodivergent':
        return renderNeurodivergentView();
      default:
        return null;
    }
  };

  // Blind Student View
  const renderBlindView = () => (
    <div className="space-y-6">
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-2xl font-bold text-surface-900 mb-4">Motion in a Straight Line</h2>
        
        <div className="space-y-6">
          {/* Section 1: Definition */}
          <section>
            <h3 className="text-xl font-semibold text-primary-700 mb-3">1. Definition of Displacement</h3>
            <div className="bg-surface-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
              <p className="text-surface-800 leading-relaxed mb-4">
                Displacement is the change in position of an object. It is a vector quantity with both magnitude and direction.
              </p>
              <p className="text-surface-800 leading-relaxed mb-4">
                If an object moves from position x₁ to position x₂, the displacement is given by:
              </p>
              <div className="bg-white p-4 rounded-lg border border-surface-300 font-mono text-lg">
                <p className="text-surface-900 mb-2">Displacement = x₂ - x₁</p>
                <p className="text-primary-700 text-sm mt-3 font-sans">Braille (Nemeth Code):</p>
                <p className="text-primary-900 mt-1">,displ&lt;em5t = ,x;2 - ,x;1</p>
              </div>
            </div>
          </section>

          {/* Section 2: Derivation */}
          <section>
            <h3 className="text-xl font-semibold text-primary-700 mb-3">2. Derivation: Equation of Motion</h3>
            <div className="bg-surface-50 border-l-4 border-secondary-500 p-4 rounded-r-lg">
              <p className="text-surface-800 leading-relaxed mb-4">
                Step 1: Start with the definition of acceleration.
              </p>
              <div className="bg-white p-4 rounded-lg border border-surface-300 font-mono mb-4">
                <p className="text-surface-900">a = (v - u) / t</p>
                <p className="text-secondary-700 text-sm mt-2 font-sans">Braille:</p>
                <p className="text-secondary-900">,a = (,v - ,u) / ,t</p>
              </div>

              <p className="text-surface-800 leading-relaxed mb-4">
                Step 2: Multiply both sides by t.
              </p>
              <div className="bg-white p-4 rounded-lg border border-surface-300 font-mono mb-4">
                <p className="text-surface-900">at = v - u</p>
                <p className="text-secondary-700 text-sm mt-2 font-sans">Braille:</p>
                <p className="text-secondary-900">,a,t = ,v - ,u</p>
              </div>

              <p className="text-surface-800 leading-relaxed mb-4">
                Step 3: Rearrange to get the first equation of motion.
              </p>
              <div className="bg-white p-4 rounded-lg border border-surface-300 font-mono">
                <p className="text-surface-900 font-bold">v = u + at</p>
                <p className="text-secondary-700 text-sm mt-2 font-sans">Braille:</p>
                <p className="text-secondary-900 font-bold">,v = ,u + ,a,t</p>
              </div>
            </div>
          </section>

          {/* Section 3: Numerical Example */}
          <section>
            <h3 className="text-xl font-semibold text-primary-700 mb-3">3. Numerical Example</h3>
            <div className="bg-surface-50 border-l-4 border-accent-500 p-4 rounded-r-lg">
              <p className="text-surface-800 leading-relaxed mb-4">
                <strong>Problem:</strong> A car starts from rest and accelerates at 2 meters per second squared for 5 seconds. 
                Calculate its final velocity.
              </p>
              
              <p className="text-surface-800 leading-relaxed mb-3">
                <strong>Given:</strong>
              </p>
              <ul className="list-none space-y-2 mb-4 text-surface-800">
                <li>• Initial velocity, u = 0 meters per second</li>
                <li>• Acceleration, a = 2 meters per second squared</li>
                <li>• Time, t = 5 seconds</li>
              </ul>

              <p className="text-surface-800 leading-relaxed mb-3">
                <strong>Solution:</strong>
              </p>
              <div className="bg-white p-4 rounded-lg border border-surface-300 font-mono mb-3">
                <p className="text-surface-900">Using v = u + at</p>
                <p className="text-surface-900">v = 0 + (2)(5)</p>
                <p className="text-surface-900">v = 10 meters per second</p>
                <p className="text-accent-700 text-sm mt-3 font-sans">Braille:</p>
                <p className="text-accent-900">,v = ,u + ,a,t</p>
                <p className="text-accent-900">,v = #0 + (#2)(#5)</p>
                <p className="text-accent-900 font-bold">,v = #10 ,m/,s</p>
              </div>

              <p className="text-surface-800 leading-relaxed">
                <strong>Answer:</strong> The final velocity is 10 meters per second.
              </p>
            </div>
          </section>
        </div>

        {/* Braille-specific action buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleDownloadBRF}
            className="flex-1 px-6 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-button transition-all duration-150 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download BRF File
          </button>
          <button
            onClick={handlePrintBraille}
            className="flex-1 px-6 py-4 bg-secondary-600 text-white font-semibold rounded-xl hover:bg-secondary-700 shadow-button transition-all duration-150 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print via Braille Embosser
          </button>
        </div>
      </div>
    </div>
  );

  // Deaf Student View
  const renderDeafView = () => (
    <div className="space-y-6">
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
        <h2 className="text-2xl font-bold text-surface-900 mb-6 flex items-center gap-3">
          <span>⚛️</span>
          Motion in a Straight Line
        </h2>

        {/* Key Concept Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-5 text-center">
            <div className="text-4xl mb-3">📍</div>
            <h4 className="font-bold text-primary-900 mb-2">Displacement</h4>
            <p className="text-sm text-primary-700">Change in position</p>
          </div>
          <div className="bg-secondary-50 border-2 border-secondary-200 rounded-xl p-5 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h4 className="font-bold text-secondary-900 mb-2">Velocity</h4>
            <p className="text-sm text-secondary-700">Speed with direction</p>
          </div>
          <div className="bg-accent-50 border-2 border-accent-200 rounded-xl p-5 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h4 className="font-bold text-accent-900 mb-2">Acceleration</h4>
            <p className="text-sm text-accent-700">Rate of change</p>
          </div>
        </div>

        {/* Simplified Content */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 border-l-4 border-primary-600">
            <div className="flex items-start gap-4">
              <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">1</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary-900 mb-3">What is Displacement?</h3>
                <ul className="space-y-2 text-surface-800">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Distance between start and end points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Has both size and direction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>Can be positive or negative</span>
                  </li>
                </ul>
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-primary-300">
                  <p className="text-sm font-semibold text-primary-700 mb-2">Formula:</p>
                  <p className="text-2xl font-bold text-surface-900">Δx = x₂ - x₁</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl p-6 border-l-4 border-secondary-600">
            <div className="flex items-start gap-4">
              <div className="bg-secondary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">2</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-secondary-900 mb-3">First Equation of Motion</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border-2 border-secondary-300">
                    <p className="text-sm text-secondary-700 mb-1">Start with:</p>
                    <p className="text-xl font-bold text-surface-900">a = (v - u) / t</p>
                  </div>
                  <div className="text-center text-2xl text-secondary-600">⬇️</div>
                  <div className="bg-white rounded-lg p-4 border-2 border-secondary-300">
                    <p className="text-sm text-secondary-700 mb-1">Rearrange to get:</p>
                    <p className="text-2xl font-bold text-secondary-900">v = u + at</p>
                  </div>
                </div>
                <div className="mt-4 bg-secondary-100 rounded-lg p-3">
                  <p className="text-sm text-secondary-800">
                    <strong>Where:</strong> v = final speed, u = start speed, a = acceleration, t = time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl p-6 border-l-4 border-accent-600">
            <div className="flex items-start gap-4">
              <div className="bg-accent-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">3</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-accent-900 mb-3">Example Problem 🚗</h3>
                
                <div className="bg-white rounded-lg p-4 border-2 border-accent-300 mb-4">
                  <p className="font-semibold text-accent-800 mb-3">A car accelerates from rest:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-accent-50 p-3 rounded-lg">
                      <p className="text-accent-600 font-semibold">Start speed (u)</p>
                      <p className="text-xl font-bold text-surface-900">0 m/s</p>
                    </div>
                    <div className="bg-accent-50 p-3 rounded-lg">
                      <p className="text-accent-600 font-semibold">Acceleration (a)</p>
                      <p className="text-xl font-bold text-surface-900">2 m/s²</p>
                    </div>
                    <div className="bg-accent-50 p-3 rounded-lg col-span-2">
                      <p className="text-accent-600 font-semibold">Time (t)</p>
                      <p className="text-xl font-bold text-surface-900">5 seconds</p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent-600 text-white rounded-lg p-4 text-center">
                  <p className="text-sm mb-2">Final Speed (v)</p>
                  <p className="text-3xl font-bold">10 m/s</p>
                  <p className="text-xs mt-2 opacity-90">Using: v = 0 + (2 × 5)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Neurodivergent Student View
  const renderNeurodivergentView = () => {
    const steps = [
      {
        title: 'Understanding Displacement',
        content: 'Displacement tells us how far an object has moved from its starting point.',
        detail: 'Think of it like this: If you walk 5 steps forward, then 2 steps back, your displacement is 3 steps forward (not 7 steps total).',
        formula: 'Displacement = Final Position - Starting Position',
        formulaSymbols: 'Δx = x₂ - x₁'
      },
      {
        title: 'What is Acceleration?',
        content: 'Acceleration is how quickly speed changes.',
        detail: 'When a car speeds up, it accelerates. The formula connects acceleration (a), change in velocity (v-u), and time (t).',
        formula: 'Acceleration = Change in Speed ÷ Time',
        formulaSymbols: 'a = (v - u) / t'
      },
      {
        title: 'Rearranging the Formula',
        content: 'We can rearrange the equation to find final velocity.',
        detail: 'Multiply both sides by time (t): a × t = v - u. Then add starting speed (u) to both sides.',
        formula: 'Final Speed = Starting Speed + (Acceleration × Time)',
        formulaSymbols: 'v = u + at'
      },
      {
        title: 'Solving an Example',
        content: 'Let\'s apply what we learned with a real problem.',
        detail: 'A car starts from rest (0 m/s) and speeds up at 2 m/s² for 5 seconds. What\'s its final speed?',
        formula: 'v = 0 + (2 × 5) = 10 m/s',
        formulaSymbols: 'Answer: 10 meters per second'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-surface-900">Motion in a Straight Line</h2>
            <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg border border-primary-200">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-primary-700">Step-by-step mode</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-surface-600">Your progress</span>
              <span className="text-sm font-bold text-primary-600">{expandedSteps.size} of {steps.length} steps</span>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${(expandedSteps.size / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isExpanded = expandedSteps.has(index);
              const isAccessible = expandedSteps.has(index - 1) || index === 0;
              
              return (
                <div 
                  key={index}
                  className={`border-2 rounded-xl transition-all duration-300 ${
                    isExpanded 
                      ? 'border-primary-400 bg-primary-50 shadow-lg' 
                      : isAccessible
                      ? 'border-surface-200 bg-white hover:border-primary-200'
                      : 'border-surface-100 bg-surface-50 opacity-60'
                  }`}
                >
                  <button
                    onClick={() => isAccessible && toggleStep(index)}
                    disabled={!isAccessible}
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isExpanded 
                          ? 'bg-primary-600 text-white'
                          : isAccessible
                          ? 'bg-surface-200 text-surface-700'
                          : 'bg-surface-100 text-surface-400'
                      }`}>
                        {isExpanded ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${
                          isExpanded ? 'text-primary-900' : 'text-surface-900'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isExpanded ? 'text-primary-700' : 'text-surface-600'
                        }`}>
                          {step.content}
                        </p>
                      </div>
                    </div>
                    {isAccessible && (
                      <svg 
                        className={`w-6 h-6 text-surface-400 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="pl-16 space-y-4">
                        {/* Detailed explanation */}
                        <div className="bg-white rounded-lg p-4 border border-primary-200">
                          <p className="text-surface-800 leading-relaxed">{step.detail}</p>
                        </div>

                        {/* Formula highlight */}
                        <div className="bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg p-5 border-2 border-primary-300">
                          <p className="text-sm font-semibold text-primary-700 mb-2">Key Formula:</p>
                          <p className="text-lg font-bold text-surface-900 mb-1">{step.formula}</p>
                          <p className="text-xl font-mono font-bold text-primary-800 mt-3">{step.formulaSymbols}</p>
                          
                          {/* Pattern highlight for equations */}
                          {index === 2 && (
                            <div className="mt-4 pt-4 border-t border-primary-200">
                              <p className="text-sm text-primary-700 mb-2">Notice the pattern:</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-3 py-1 bg-primary-200 rounded-lg font-mono font-bold">v</span>
                                <span className="text-primary-600">=</span>
                                <span className="px-3 py-1 bg-secondary-200 rounded-lg font-mono font-bold">u</span>
                                <span className="text-primary-600">+</span>
                                <span className="px-3 py-1 bg-accent-200 rounded-lg font-mono font-bold">at</span>
                              </div>
                              <p className="text-xs text-surface-600 mt-2">Final = Start + Change</p>
                            </div>
                          )}
                        </div>

                        {/* Show next step button */}
                        {index < steps.length - 1 && !expandedSteps.has(index + 1) && (
                          <button
                            onClick={() => showNextStep(index)}
                            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-150 flex items-center justify-center gap-2 shadow-button"
                          >
                            Show Next Step
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Completion message */}
          {expandedSteps.size === steps.length && (
            <div className="mt-6 bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-300 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-success-900 mb-2">Great job!</h3>
              <p className="text-success-700">You've completed all steps. Take your time to review before moving on.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Left Sidebar - Navigation */}
        <aside className="w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-4 sticky top-24">
            <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wide mb-4 px-2">Subjects</h2>
            <nav className="space-y-2">
              {SUBJECTS.map(subject => (
                <div key={subject.id}>
                  <button
                    onClick={() => {
                      setExpandedSubject(expandedSubject === subject.id ? null : subject.id);
                      setSelectedSubject(subject.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-150 ${
                      selectedSubject === subject.id
                        ? 'bg-primary-100 text-primary-900 font-semibold'
                        : 'text-surface-700 hover:bg-surface-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{subject.icon}</span>
                      <span>{subject.name}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedSubject === subject.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedSubject === subject.id && (
                    <div className="mt-1 ml-4 space-y-1">
                      {subject.chapters.map(chapter => (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            setSelectedChapter(chapter.id);
                            setSelectedSubject(subject.id);
                          }}
                          className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-all duration-150 ${
                            selectedChapter === chapter.id && selectedSubject === subject.id
                              ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                              : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                          }`}
                        >
                          {chapter.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>

        {/* Right Sidebar - Metadata Panel */}
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-5 sticky top-24">
            <h2 className="text-sm font-bold text-surface-500 uppercase tracking-wide mb-4">Content Info</h2>
            
            <div className="space-y-4">
              {/* Source */}
              <div>
                <p className="text-xs font-semibold text-surface-600 mb-1">Original Source</p>
                <p className="text-sm font-medium text-surface-900">AI-Generated from NCERT</p>
              </div>

              {/* Transforms Applied */}
              <div>
                <p className="text-xs font-semibold text-surface-600 mb-2">Accessibility Transforms</p>
                <div className="space-y-2">
                  {currentProfile.disabilityType === 'blind' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-surface-700">Nemeth Braille conversion</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-surface-700">Text structure optimization</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span className="text-surface-700">No visual-only references</span>
                      </div>
                    </>
                  )}
                  {currentProfile.disabilityType === 'deaf' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                        <span className="text-surface-700">Text simplification</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                        <span className="text-surface-700">Visual chunking</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                        <span className="text-surface-700">Icon-based navigation</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                        <span className="text-surface-700">No audio references</span>
                      </div>
                    </>
                  )}
                  {currentProfile.disabilityType === 'neurodivergent' && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-surface-700">Progressive disclosure</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-surface-700">Pattern highlighting</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-surface-700">Step-by-step pacing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        <span className="text-surface-700">Math normalization</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Learning Preferences */}
              <div className="pt-4 border-t border-surface-200">
                <p className="text-xs font-semibold text-surface-600 mb-2">Your Preferences</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">Learning Pace</span>
                    <span className="font-semibold text-surface-900 capitalize">{currentProfile.preferences.pace}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">Detail Level</span>
                    <span className="font-semibold text-surface-900 capitalize">{currentProfile.preferences.verbosity}</span>
                  </div>
                </div>
              </div>

              {/* Profile indicator */}
              <div className="pt-4 border-t border-surface-200">
                <div className={`p-3 rounded-lg ${
                  currentProfile.disabilityType === 'blind' 
                    ? 'bg-primary-50 border border-primary-200'
                    : currentProfile.disabilityType === 'deaf'
                    ? 'bg-secondary-50 border border-secondary-200'
                    : 'bg-accent-50 border border-accent-200'
                }`}>
                  <p className="text-xs font-semibold text-surface-600 mb-1">Optimized for</p>
                  <p className={`text-sm font-bold capitalize ${
                    currentProfile.disabilityType === 'blind' 
                      ? 'text-primary-700'
                      : currentProfile.disabilityType === 'deaf'
                      ? 'text-secondary-700'
                      : 'text-accent-700'
                  }`}>
                    {currentProfile.disabilityType} Students
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

export default Dashboard;
