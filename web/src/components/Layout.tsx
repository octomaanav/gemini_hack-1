import { ReactNode } from 'react';
import { Navbar } from './Navbar';

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

interface LayoutProps {
  children: ReactNode;
  studentProfiles: StudentProfile[];
  currentProfile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
}

export const Layout = ({ 
  children, 
  studentProfiles, 
  currentProfile, 
  onProfileChange 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-surface-50 via-primary-50/20 to-secondary-50/20">
      <Navbar 
        currentProfile={currentProfile}
        onProfileChange={onProfileChange}
        studentProfiles={studentProfiles}
      />
      {children}
    </div>
  );
};
