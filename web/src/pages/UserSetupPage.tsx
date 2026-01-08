import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface UserSetupData {
  disabilities: string[];
  grade: string;
  curriculum: 'cbse' | 'ib' | 'state' | '';
  subjects: string[];
}

export const UserSetupPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [setupData, setSetupData] = useState<UserSetupData>({
    disabilities: [],
    grade: '',
    curriculum: '',
    subjects: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabilities = [
    { value: 'blind', label: 'Blind/Visually Impaired' },
    { value: 'deaf', label: 'Deaf/Hard of Hearing' },
    { value: 'neurodivergent', label: 'Neurodivergent (ADHD, Autism, Dyslexia, etc.)' }
  ];

  const grades = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const curricula = [
    { value: 'cbse', label: 'CBSE' },
    { value: 'ib', label: 'IB' },
    { value: 'state', label: 'State Board' }
  ];
  const subjectOptions = [
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' }
  ];

  const handleDisabilityToggle = (value: string) => {
    setSetupData(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(value)
        ? prev.disabilities.filter(d => d !== value)
        : [...prev.disabilities, value]
    }));
  };

  const handleCurriculumChange = (value: string) => {
    setSetupData(prev => ({
      ...prev,
      curriculum: value as 'cbse' | 'ib' | 'state' | ''
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setSetupData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (setupData.disabilities.length === 0) {
      setError('Please select at least one disability type');
      return;
    }
    if (!setupData.grade) {
      setError('Please select your grade');
      return;
    }
    if (!setupData.curriculum) {
      setError('Please select a curriculum');
      return;
    }
    if (setupData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          disabilities: setupData.disabilities,
          grade: setupData.grade,
          curriculum: setupData.curriculum,
          subjects: setupData.subjects
        })
      });

      const updatedUser = await response.json();
      console.log("profile",updatedUser.user.isProfileComplete)
      console.log("response",response.ok)

      if (response.ok && updatedUser.user?.isProfileComplete) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-surface-50 via-primary-50/20 to-secondary-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-surface-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-surface-50 via-primary-50/20 to-secondary-50/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-surface-600 mb-4">Please log in first</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-surface-50 via-primary-50/20 to-secondary-50/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-surface-200 p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-surface-900 mb-2">
              Welcome, {user.name}!
            </h1>
            <p className="text-surface-600">
              Let's customize your learning experience
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Disability Type */}
            <div>
              <label className="block text-lg font-semibold text-surface-900 mb-4">
                What's your disability type? (Select all that apply)
              </label>
              <div className="space-y-3">
                {disabilities.map(disability => (
                  <label key={disability.value} className="flex items-center p-4 border-2 border-surface-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all"
                    style={{
                      borderColor: setupData.disabilities.includes(disability.value) ? '#4f46e5' : 'inherit',
                      backgroundColor: setupData.disabilities.includes(disability.value) ? '#eef2ff' : 'inherit'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="disabilities"
                      value={disability.value}
                      checked={setupData.disabilities.includes(disability.value)}
                      onChange={(e) => handleDisabilityToggle(e.target.value)}
                      className="w-5 h-5 text-primary-600"
                    />
                    <span className="ml-3 text-surface-800">{disability.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-lg font-semibold text-surface-900 mb-4">
                What's your current grade?
              </label>
              <select
                value={setupData.grade}
                onChange={(e) => setSetupData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-surface-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Select a grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Curriculum */}
            <div>
              <label className="block text-lg font-semibold text-surface-900 mb-4">
                Which curriculum do you follow?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {curricula.map(curr => (
                  <label
                    key={curr.value}
                    className="p-4 border-2 border-surface-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all text-center"
                    style={{
                      borderColor: setupData.curriculum === curr.value ? '#4f46e5' : 'inherit',
                      backgroundColor: setupData.curriculum === curr.value ? '#eef2ff' : 'inherit'
                    }}
                  >
                    <input
                      type="radio"
                      name="curriculum"
                      value={curr.value}
                      checked={setupData.curriculum === curr.value}
                      onChange={(e) => handleCurriculumChange(e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="ml-2 text-surface-800 font-medium">{curr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-lg font-semibold text-surface-900 mb-4">
                Which subjects would you like to learn?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjectOptions.map(subject => (
                  <label
                    key={subject.value}
                    className="p-4 border-2 border-surface-200 rounded-lg cursor-pointer hover:border-secondary-300 hover:bg-secondary-50 transition-all flex items-center"
                    style={{
                      borderColor: setupData.subjects.includes(subject.value) ? '#7c3aed' : 'inherit',
                      backgroundColor: setupData.subjects.includes(subject.value) ? '#faf5ff' : 'inherit'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={setupData.subjects.includes(subject.value)}
                      onChange={() => handleSubjectToggle(subject.value)}
                      className="w-5 h-5 text-secondary-600"
                    />
                    <span className="ml-3 text-surface-800">{subject.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-linear-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSetupPage;
