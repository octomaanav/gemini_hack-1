import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ChapterReviewPage from './pages/ChapterReviewPage';
import ParseResultPage from './pages/ParseResultPage';
import UserSetupPage from './pages/UserSetupPage';
import { LessonViewerPage } from './pages/LessonViewerPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Student Profile Types
type DisabilityType = 'blind' | 'deaf' | 'neurodivergent';

interface LearningPreferences {
  pace: 'slow' | 'medium' | 'fast';
  verbosity: 'concise' | 'moderate' | 'detailed';
}

interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  disabilityType: DisabilityType;
  preferences: LearningPreferences;
}

const STUDENT_PROFILES: StudentProfile[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    grade: 'Class 11',
    disabilityType: 'blind',
    preferences: { pace: 'medium', verbosity: 'detailed' }
  },
  {
    id: '2',
    name: 'Rohan Kumar',
    grade: 'Class 11',
    disabilityType: 'deaf',
    preferences: { pace: 'medium', verbosity: 'concise' }
  },
  {
    id: '3',
    name: 'Aarav Patel',
    grade: 'Class 11',
    disabilityType: 'neurodivergent',
    preferences: { pace: 'slow', verbosity: 'moderate' }
  }
];

function App() {
  const { user, isProfileComplete } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<StudentProfile>(STUDENT_PROFILES[0]);

  // Map backend user profile to the UI StudentProfile shape
  useEffect(() => {
    if (!user || !isProfileComplete) return;

    const mappedProfile: StudentProfile = {
      id: user.user_id,
      name: user.name,
      grade: user.grade || STUDENT_PROFILES[0].grade,
      disabilityType: (user.disabilities?.[0] as DisabilityType) || STUDENT_PROFILES[0].disabilityType,
      preferences: {
        pace: 'medium',
        verbosity: 'moderate'
      }
    };

    setCurrentProfile(mappedProfile);
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/parse" element={<UploadPage />} />
        <Route path="/parse/review" element={<ChapterReviewPage />} />
        <Route path="/parse/result" element={<ParseResultPage />} />
        <Route 
          path="/setup" 
          element={
            <ProtectedRoute>
              <UserSetupPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requireSetup={true}>
              <Layout 
                studentProfiles={STUDENT_PROFILES}
                currentProfile={currentProfile}
                onProfileChange={setCurrentProfile}
              >
                <Dashboard currentProfile={currentProfile} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lesson-viewer" 
          element={
            <LessonViewerPage />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
