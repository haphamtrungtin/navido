import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { isLocale } from '@/i18n/types';

export default async function VisitPlaceholderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const visit = await getTranslations({ locale, namespace: 'Visit' });
  const pending = await getTranslations({ locale, namespace: 'Pending' });

  return (
    <main data-route-placeholder="visit">
      <Container className="py-[var(--section-gap)]">
        <Eyebrow>{pending('title')}</Eyebrow>
        <h1 className="mt-4 text-4xl font-light leading-tight sm:text-5xl">
          {visit('title')}
        </h1>
      </Container>
    </main>
  );
}
