import { useLanguage } from './LanguageProvider';
import { translate, type TranslationKey } from './translations';

export const useI18n = () => {
  const { language } = useLanguage();

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    return translate(language, key, params);
  };

  return { t, language };
};
