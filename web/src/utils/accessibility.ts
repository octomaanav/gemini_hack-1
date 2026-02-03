import type { AccessibilityPreferences } from '../types';

const STORAGE_KEY = 'accessibility-preferences';

export const loadAccessibilityPreferences = (): AccessibilityPreferences => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AccessibilityPreferences;
  } catch {
    return {};
  }
};

export const saveAccessibilityPreferences = (prefs: AccessibilityPreferences, emitEvent = true) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  if (emitEvent) {
    window.dispatchEvent(new CustomEvent('accessibility-preferences-updated'));
  }
};

export const syncAccessibilityFromProfile = (profile?: AccessibilityPreferences | null) => {
  if (!profile) return;

  const current = loadAccessibilityPreferences();
  const merged: AccessibilityPreferences = {
    ...current,
    ...profile,
  };

  saveAccessibilityPreferences(merged);
};
