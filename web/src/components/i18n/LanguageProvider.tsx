import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SupportedLanguage } from '../../utils/language';
import { loadLanguagePreference, saveLanguagePreference } from '../../utils/language';
import { useAuth } from '../../hooks/useAuth';

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<SupportedLanguage>(loadLanguagePreference());

  useEffect(() => {
    if (user?.profile?.language) {
      const profileLang = user.profile.language as SupportedLanguage;
      setLanguageState(profileLang);
      saveLanguagePreference(profileLang);
    }
  }, [user]);

  useEffect(() => {
    const handler = () => {
      setLanguageState(loadLanguagePreference());
    };

    window.addEventListener('language-preference-updated', handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('language-preference-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setLanguage = async (next: SupportedLanguage) => {
    setLanguageState(next);
    saveLanguagePreference(next);

    if (user) {
      try {
        await fetch('http://localhost:8000/api/auth/preferences', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: next })
        });
      } catch (error) {
        console.warn('Failed to persist language preference', error);
      }
    }
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
};
