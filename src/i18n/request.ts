import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';
import { isLocale, type Locale } from './types';

const dictionaryLoaders: Record<
  Locale,
  () => Promise<Record<string, unknown>>
> = {
  vi: () => import('../../messages/vi.json').then((module) => module.default),
  en: () => import('../../messages/en.json').then((module) => module.default),
  ko: () => import('../../messages/ko.json').then((module) => module.default),
};

export default getRequestConfig(
  async ({ locale: explicitLocale, requestLocale }) => {
    const requestedLocale = explicitLocale ?? (await requestLocale);
    const locale =
      typeof requestedLocale === 'string' && isLocale(requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;

    return {
      locale,
      messages: await dictionaryLoaders[locale](),
    };
  },
);
