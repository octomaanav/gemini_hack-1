export type SupportedLanguage = 'en' | 'es' | 'hi';

const STORAGE_KEY = 'preferred-language';

export const getDefaultLanguage = (): SupportedLanguage => {
  return 'en';
};

export const loadLanguagePreference = (): SupportedLanguage => {
  if (typeof window === 'undefined') return getDefaultLanguage();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'es' || raw === 'hi' || raw === 'en') {
    return raw;
  }
  return getDefaultLanguage();
};

export const saveLanguagePreference = (language: SupportedLanguage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, language);
  window.dispatchEvent(new CustomEvent('language-preference-updated'));
};
