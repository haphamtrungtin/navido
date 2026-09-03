import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const translations = await getTranslations({ locale, namespace: 'Home' });

  return (
    <main>
      <h1>{translations('title')}</h1>
      <p>{translations('description')}</p>
    </main>
  );
}
