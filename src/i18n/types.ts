export const locales = ['vi', 'en', 'ko'] as const;

export type Locale = (typeof locales)[number];
export type LocalizedText = Record<Locale, string>;

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const getLocalizedValue = (value: LocalizedText, locale: Locale) =>
  value[locale].trim() || value.vi.trim() || value.en.trim();
