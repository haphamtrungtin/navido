import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { isLocale, locales } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';
import { buildPageMetadata } from '@/lib/metadata';
import { VisitActions } from '@/sections/visit/visit-actions';
import { VisitInformation } from '@/sections/visit/visit-information';
import { VisitMap } from '@/sections/visit/visit-map';

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
    description: metadata('visit.description'),
    locale,
    page: 'visit',
    siteUrl: businessProfile.siteUrl,
    title: metadata('visit.title'),
  });
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const visit = await getTranslations({ locale, namespace: 'Visit' });
  const footer = await getTranslations({ locale, namespace: 'Footer' });

  return (
    <main>
      <section
        className="py-[var(--section-gap)]"
        data-visit-section="introduction"
      >
        <Container>
          <div className="grid gap-10 md:grid-cols-8 md:items-center md:gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="md:col-span-3 lg:col-span-4 lg:col-start-2">
              <Eyebrow>{visit('eyebrow')}</Eyebrow>
              <h1 className="mt-4 max-w-xl text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
                {visit('title')}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
                {visit('introduction')}
              </p>
            </div>
            <div className="md:col-span-5 lg:col-span-6 lg:col-start-7">
              <EditorialImage
                alt={visit('exteriorAlt')}
                aspect="16 / 9"
                objectPosition="center"
                priority
                sizes="(min-width: 1024px) 48vw, (min-width: 768px) 60vw, 100vw"
                src="/images/navido/space/navido_space_exterior_building_02.jpg"
              />
            </div>
          </div>
        </Container>
      </section>

      <section
        className="border-y border-[var(--navido-rule)] py-[var(--section-gap)]"
        data-visit-section="details"
      >
        <Container>
          <div className="grid gap-12 md:grid-cols-8 md:gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="md:col-span-4 lg:col-span-4 lg:col-start-2">
              <VisitInformation
                address={businessProfile.address}
                callHref={conversionLinks.call}
                copy={{
                  address: visit('address'),
                  hours: visit('hours'),
                  phone: visit('phone'),
                  title: visit('informationTitle'),
                }}
                daily={footer('daily')}
                hours={businessProfile.openingHours.timeRange}
                mapsHref={conversionLinks.maps}
                phoneDisplay={businessProfile.phoneDisplay}
              />
            </div>
            <div className="md:col-span-4 lg:col-span-4">
              <VisitActions
                copy={{
                  call: visit('call'),
                  directions: visit('directions'),
                  email: visit('email'),
                  facebook: visit('facebook'),
                  grabFood: visit('grabFood'),
                  instagram: visit('instagram'),
                  title: visit('actionsTitle'),
                  zalo: visit('zalo'),
                }}
                links={conversionLinks}
              />
            </div>
            <div className="md:col-span-8 lg:col-span-3">
              <VisitMap
                alt={visit('mapAlt')}
                caption={visit('mapCaption')}
                href={conversionLinks.maps}
                linkLabel={visit('openGoogleMaps')}
                title={visit('mapTitle')}
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
