import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { buildPageMetadata } from '@/lib/metadata';
import { SpaceCallout } from '@/sections/our-space/space-callout';
import { SpaceHero } from '@/sections/our-space/space-hero';
import { SpaceStory } from '@/sections/our-space/space-story';

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
    description: metadata('ourSpace.description'),
    locale,
    page: 'ourSpace',
    siteUrl: businessProfile.siteUrl,
    title: metadata('ourSpace.title'),
  });
}

export default async function OurSpacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const translations = await getTranslations({ locale, namespace: 'OurSpace' });
  const stories = [
    {
      imageSrc: '/images/navido/space/navido_space_warm_dining_corner_02.webp',
      key: 'morning-light' as const,
      translationKey: 'morningLight' as const,
    },
    {
      imageSrc: '/images/navido/space/navido_space_private_room_01.jpeg',
      key: 'quiet-table' as const,
      translationKey: 'quietTable' as const,
    },
    {
      imageSrc: '/images/navido/space/navido_space_arch_seating_01.png',
      key: 'downstairs' as const,
      translationKey: 'downstairs' as const,
    },
    {
      imageSrc: '/images/navido/space/navido_space_warm_dining_corner_01.png',
      key: 'upstairs' as const,
      translationKey: 'upstairs' as const,
    },
  ];

  return (
    <main>
      <SpaceHero
        copy={{
          body: translations('hero.body'),
          eyebrow: translations('hero.eyebrow'),
          imageAlt: translations('hero.imageAlt'),
          title: translations('title'),
        }}
      />
      {stories.map((story, index) => (
        <SpaceStory
          index={index}
          key={story.key}
          story={{
            body: translations(`${story.translationKey}.body`),
            eyebrow: translations(`${story.translationKey}.eyebrow`),
            imageAlt: translations(`${story.translationKey}.imageAlt`),
            imageSrc: story.imageSrc,
            key: story.key,
            title: translations(`${story.translationKey}.title`),
          }}
        />
      ))}
      <SpaceCallout
        copy={{
          action: translations('callout.action'),
          body: translations('callout.body'),
          eyebrow: translations('callout.eyebrow'),
          title: translations('callout.title'),
        }}
        locale={locale}
      />
    </main>
  );
}
