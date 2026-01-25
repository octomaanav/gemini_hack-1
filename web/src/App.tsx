import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ChapterReviewPage from './pages/ChapterReviewPage';
import ParseResultPage from './pages/ParseResultPage';
import UserSetupPage from './pages/UserSetupPage';
import { LessonPage } from './pages/LessonPage';
import { ChapterPage } from './pages/ChapterPage';
import { MicrosectionPage } from './pages/MicrosectionPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUploadPage from './pages/AdminUploadPage';
import AdminChapterReviewPage from './pages/AdminChapterReviewPage';
import AdminLessonEditorPage from './pages/AdminLessonEditorPage';
import { VoiceAgentProvider } from './components/VoiceAgentProvider';
import { VoiceAgentControls } from './components/VoiceAgentControls';

function App() {
  return (
    <Router>
      <VoiceAgentProvider>
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
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Chapter page - shows sections within a chapter (structured style) */}
          <Route 
            path="/:classId/:subjectId/:chapterSlug" 
            element={<ChapterPage />} 
          />
          {/* Microsection page - individual content (article, video, quiz, practice) */}
          <Route 
            path="/:classId/:subjectId/:chapterSlug/:sectionSlug/:microsectionId" 
            element={<MicrosectionPage />} 
          />
          {/* Legacy lesson page - fallback */}
          <Route 
            path="/:classId/:subjectId/:unit/lesson" 
            element={<LessonPage />} 
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/upload" element={<AdminUploadPage />} />
          <Route path="/admin/review" element={<AdminChapterReviewPage />} />
          <Route path="/admin/editor" element={<AdminLessonEditorPage />} />
          <Route path="/admin/editor/:lessonId" element={<AdminLessonEditorPage />} />
        </Routes>
        <VoiceAgentControls />
      </VoiceAgentProvider>
    </Router>
  );
}

export default App;
