const STORAGE_KEY = 'lang';
const SUPPORTED_LANGS = ['en', 'es'] as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

/** Reads the user's last-picked language, falling back to English. */
export function getPersistedLang(): SupportedLang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (SUPPORTED_LANGS as readonly string[]).includes(stored ?? '')
    ? (stored as SupportedLang)
    : 'en';
}

export function setPersistedLang(lang: SupportedLang): void {
  localStorage.setItem(STORAGE_KEY, lang);
}
