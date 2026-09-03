import { defineRouting } from 'next-intl/routing';

import { locales } from './types';

export const routing = defineRouting({
  locales,
  defaultLocale: 'vi',
  localePrefix: 'always',
});
