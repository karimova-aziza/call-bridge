export const LANGS = {
  en: { label: "English", name: "English", voice: "en-US" },
  ru: { label: "Русский", name: "Russian", voice: "ru-RU" },
  uz: { label: "O'zbekcha", name: "Uzbek", voice: "uz-UZ" },
} as const;

export type LangCode = keyof typeof LANGS;

export const LANG_CODES = Object.keys(LANGS) as LangCode[];

export function isLang(x: string): x is LangCode {
  return LANG_CODES.includes(x as LangCode);
}
