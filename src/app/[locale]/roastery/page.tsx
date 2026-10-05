import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { isLocale, locales } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';
import { buildPageMetadata } from '@/lib/metadata';
import { getPublishedMenu } from '@/features/menu/repository/published-menu-repository';
import { MenuReadStatus } from '@/features/menu/components/menu-read-status';
import {
  getRoasteryBeanProducts,
  getRoasteryCoffeePicks,
  getRoasteryMedia,
  getRoasteryOrigins,
} from '@/features/roastery/selectors';
import { RoasteryBeans } from '@/sections/roastery/roastery-beans';
import { RoasteryHero } from '@/sections/roastery/roastery-hero';
import { RoasteryOrigins } from '@/sections/roastery/roastery-origins';
import { RoasteryProcess } from '@/sections/roastery/roastery-process';
import { RoasteryVisit } from '@/sections/roastery/roastery-visit';

export const dynamic = 'force-dynamic';

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
    description: metadata('roastery.description'),
    locale,
    page: 'roastery',
    siteUrl: businessProfile.siteUrl,
    title: metadata('roastery.title'),
  });
}

export default async function RoasteryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = await getTranslations({ locale, namespace: 'Roastery' });
  const footer = await getTranslations({ locale, namespace: 'Footer' });
  const snapshot = await getPublishedMenu().catch(() => null);
  const items = snapshot?.items ?? [];
  const coffeePicks = getRoasteryCoffeePicks(items, 3);

  return (
    <main>
      <RoasteryHero
        copy={{
          action: copy('hero.action'),
          description: copy('hero.description'),
          eyebrow: copy('hero.eyebrow'),
          title: copy('hero.title'),
        }}
        locale={locale}
        media={getRoasteryMedia('roaster-machine')}
      />
      <RoasteryProcess
        copy={{
          eyebrow: copy('process.eyebrow'),
          mediaAlt: copy('process.mediaAlt'),
          mediaNote: copy('process.mediaNote'),
          steps: [
            {
              body: copy('process.stepOneBody'),
              title: copy('process.stepOneTitle'),
            },
            {
              body: copy('process.stepTwoBody'),
              title: copy('process.stepTwoTitle'),
            },
            {
              body: copy('process.stepThreeBody'),
              title: copy('process.stepThreeTitle'),
            },
          ],
          title: copy('process.title'),
        }}
        media={getRoasteryMedia('roasting-process')}
      />
      {!snapshot && <MenuReadStatus locale={locale} unavailable />}
      <RoasteryOrigins
        copy={{
          empty: copy('origins.empty'),
          eyebrow: copy('origins.eyebrow'),
          title: copy('origins.title'),
        }}
        origins={getRoasteryOrigins(items)}
      />
      <section
        className="bg-[var(--navido-paper)] py-[var(--section-gap)]"
        data-roastery-section="coffee-picks"
      >
        <div className="mx-auto grid w-full max-w-[1200px] gap-4 px-5 sm:grid-cols-3 md:px-6">
          {coffeePicks.map((item) => (
            <article
              className="border border-[var(--navido-rule)] p-6"
              key={item.id}
            >
              <p className="text-lg">{item.name[locale]}</p>
              <a
                className="mt-5 inline-flex border-b border-current pb-1 text-sm font-semibold"
                href={`/${locale}/menu`}
              >
                {copy('beans.action')}
              </a>
            </article>
          ))}
        </div>
      </section>
      <RoasteryBeans
        copy={{
          action: copy('beans.action'),
          empty: copy('beans.empty'),
          title: copy('beans.title'),
        }}
        items={getRoasteryBeanProducts(items)}
        locale={locale}
      />
      <RoasteryVisit
        address={businessProfile.address}
        callHref={conversionLinks.call}
        copy={{
          address: copy('visit.address'),
          call: copy('visit.call'),
          directions: copy('visit.directions'),
          hours: copy('visit.hours'),
          title: copy('visit.title'),
        }}
        daily={footer('daily')}
        hours={businessProfile.openingHours.timeRange}
        mapsHref={conversionLinks.maps}
        phone={businessProfile.phoneDisplay}
      />
    </main>
  );
}
