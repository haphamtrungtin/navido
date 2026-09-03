import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';
import { SpaceCallout } from '@/sections/our-space/space-callout';
import { SpaceHero } from '@/sections/our-space/space-hero';
import { SpaceStory } from '@/sections/our-space/space-story';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
      imageSrc: '/images/stitch/space-morning-light.jpg',
      key: 'morning-light' as const,
      translationKey: 'morningLight' as const,
    },
    {
      imageSrc: '/images/stitch/space-quiet-table.jpg',
      key: 'quiet-table' as const,
      translationKey: 'quietTable' as const,
    },
    {
      imageSrc: '/images/stitch/space-downstairs.jpg',
      key: 'downstairs' as const,
      translationKey: 'downstairs' as const,
    },
    {
      imageSrc: '/images/stitch/space-upstairs.jpg',
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
