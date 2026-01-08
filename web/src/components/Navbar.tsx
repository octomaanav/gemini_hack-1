import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

interface NavbarProps {
  currentProfile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
  studentProfiles: StudentProfile[];
}

export const Navbar = ({ currentProfile, onProfileChange, studentProfiles }: NavbarProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log('Navbar render - user:', user);

  const handleProfileChange = (profileId: string) => {
    const profile = studentProfiles.find(p => p.id === profileId);
    if (profile) onProfileChange(profile);
  };

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-primary-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary-500 via-primary-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-base font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">
              Accessible Learning Platform
            </h1>
          </div>

          {/* Profile Info & Switcher */}
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-sm font-semibold text-surface-900">{currentProfile.name}</p>
              <p className="text-xs text-surface-600">
                {currentProfile.grade} • {currentProfile.disabilityType.charAt(0).toUpperCase() + currentProfile.disabilityType.slice(1)} • 
                Pace: {currentProfile.preferences.pace}
              </p>
            </div>
            
            <select
              value={currentProfile.id}
              onChange={(e) => handleProfileChange(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-primary-300 rounded-lg font-semibold text-surface-900 cursor-pointer hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              {studentProfiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="text-sm">{user?.name || 'User'}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-200 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Homepage
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
