import { getTranslations } from 'next-intl/server';

import { locales } from '@/i18n/types';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalizedHomePage() {
  const translations = await getTranslations('Home');

  return (
    <main>
      <h1>{translations('title')}</h1>
      <p>{translations('description')}</p>
    </main>
  );
}
