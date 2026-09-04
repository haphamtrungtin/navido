import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';
import { AboutIntroduction } from '@/sections/about/about-introduction';
import { AboutTheme } from '@/sections/about/about-theme';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const translations = await getTranslations({ locale, namespace: 'About' });
  const themes = [
    { imageSrc: '/images/stitch/about-pour-over.jpg', key: 'coffee' as const },
    { imageSrc: '/images/stitch/about-pastry.jpg', key: 'food' as const },
    { imageSrc: '/images/stitch/about-space.jpg', key: 'space' as const },
    {
      imageSrc: '/images/stitch/about-community.jpg',
      key: 'community' as const,
    },
  ];

  return (
    <main>
      <AboutIntroduction
        copy={{
          body: translations('introduction.body'),
          eyebrow: translations('introduction.eyebrow'),
          imageAlt: translations('introduction.imageAlt'),
          title: translations('title'),
        }}
      />
      {themes.map((theme) => (
        <AboutTheme
          key={theme.key}
          theme={{
            body: translations(`${theme.key}.body`),
            eyebrow: translations(`${theme.key}.eyebrow`),
            imageAlt: translations(`${theme.key}.imageAlt`),
            imageSrc: theme.imageSrc,
            key: theme.key,
            title: translations(`${theme.key}.title`),
          }}
        />
      ))}
    </main>
  );
}
