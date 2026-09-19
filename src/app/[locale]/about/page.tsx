import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { buildPageMetadata } from '@/lib/metadata';
import { AboutIntroduction } from '@/sections/about/about-introduction';
import { AboutTheme } from '@/sections/about/about-theme';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const metadata = await getTranslations({ locale, namespace: 'Metadata' });

  return buildPageMetadata({
    description: metadata('about.description'),
    locale,
    page: 'about',
    siteUrl: businessProfile.siteUrl,
    title: metadata('about.title'),
  });
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
    {
      imageSrc: '/images/navido/coffee/navido_coffee_table_setting_01.jpg',
      key: 'coffee' as const,
    },
    {
      imageSrc:
        '/images/navido/bakery/navido_bakery_pastries_and_drinks_01.jpeg',
      key: 'food' as const,
    },
    {
      imageSrc:
        '/images/navido/space/navido_space_ground_floor_seating_01.jpeg',
      key: 'space' as const,
    },
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
