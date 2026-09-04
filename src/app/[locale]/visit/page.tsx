import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { isLocale, locales } from '@/i18n/types';
import { initialVisitBusinessConfig } from '@/lib/site-config';
import { VisitActions } from '@/sections/visit/visit-actions';
import { VisitInformation } from '@/sections/visit/visit-information';
import { VisitMap } from '@/sections/visit/visit-map';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
                src="/images/stitch/visit-exterior.jpg"
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
                config={initialVisitBusinessConfig}
                copy={{
                  address: visit('address'),
                  addressPending: visit('addressPending'),
                  hours: visit('hours'),
                  hoursPending: visit('hoursPending'),
                  phone: visit('phone'),
                  phonePending: visit('phonePending'),
                  title: visit('informationTitle'),
                }}
              />
            </div>
            <div className="md:col-span-4 lg:col-span-4">
              <VisitActions
                config={initialVisitBusinessConfig}
                copy={{
                  directions: visit('directions'),
                  directionsPending: visit('directionsPending'),
                  facebook: visit('facebook'),
                  facebookPending: visit('facebookPending'),
                  grab: visit('grab'),
                  grabPending: visit('grabPending'),
                  instagram: visit('instagram'),
                  instagramPending: visit('instagramPending'),
                  title: visit('actionsTitle'),
                }}
              />
            </div>
            <div className="md:col-span-8 lg:col-span-3">
              <VisitMap
                alt={visit('mapAlt')}
                caption={visit('mapPending')}
                title={visit('mapTitle')}
              />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
