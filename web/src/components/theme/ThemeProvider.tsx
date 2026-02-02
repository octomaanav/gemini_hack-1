import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'preferred-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

const loadTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
};

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeMode>(loadTheme());

  useEffect(() => {
    if (user?.profile?.theme === 'dark' || user?.profile?.theme === 'light') {
      const profileTheme = user.profile.theme as ThemeMode;
      setThemeState(profileTheme);
      window.localStorage.setItem(STORAGE_KEY, profileTheme);
    }
  }, [user]);

  useEffect(() => {
    applyThemeToDocument(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme);
      window.dispatchEvent(new CustomEvent('theme-preference-updated'));
    }
  }, [theme]);

  useEffect(() => {
    const handler = () => setThemeState(loadTheme());
    window.addEventListener('theme-preference-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('theme-preference-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setTheme = async (next: ThemeMode) => {
    setThemeState(next);
    if (user) {
      try {
        await fetch('http://localhost:8000/api/auth/preferences', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: next })
        });
      } catch {
        // Ignore persistence errors; localStorage already updated.
      }
    }
  };

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};
