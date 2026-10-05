import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getPublishedMenu } from '@/features/menu/repository/published-menu-repository';
import { MenuReadStatus } from '@/features/menu/components/menu-read-status';
import { isLocale, locales } from '@/i18n/types';
import { businessProfile } from '@/lib/business-profile';
import { buildPageMetadata } from '@/lib/metadata';
import { HomeHero } from '@/sections/home/home-hero';
import { HomeIntroduction } from '@/sections/home/home-introduction';
import { LocationInvitation } from '@/sections/home/location-invitation';
import { SignatureHighlights } from '@/sections/home/signature-highlights';

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
    description: metadata('home.description'),
    locale,
    page: 'home',
    siteUrl: businessProfile.siteUrl,
    title: metadata('home.title'),
  });
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
  const footerTranslations = await getTranslations({
    locale,
    namespace: 'Footer',
  });
  const snapshot = await getPublishedMenu().catch(() => null);
  const signatureItems =
    snapshot?.items
      .filter((item) => item.categoryId === 'signature')
      .slice(0, 3) ?? [];

  return (
    <main>
      <HomeHero
        copy={{
          description: translations('hero.description'),
          eyebrow: translations('hero.eyebrow'),
          menuAction: translations('hero.menuAction'),
          title: translations('title'),
          visitAction: translations('hero.visitAction'),
        }}
        locale={locale}
      />
      <HomeIntroduction
        copy={{
          body: translations('introduction.body'),
          eyebrow: translations('introduction.eyebrow'),
          imageAlt: translations('introduction.imageAlt'),
          title: translations('introduction.title'),
        }}
      />
      {snapshot && signatureItems.length > 0 ? (
        <SignatureHighlights
          copy={{
            action: translations('signature.action'),
            body: translations('signature.body'),
            eyebrow: translations('signature.eyebrow'),
            imageAlts: [
              translations('signature.imageAltOne'),
              translations('signature.imageAltTwo'),
              translations('signature.imageAltThree'),
            ],
            title: translations('signature.title'),
          }}
          items={signatureItems}
          locale={locale}
        />
      ) : (
        <MenuReadStatus locale={locale} unavailable={!snapshot} />
      )}
      <LocationInvitation
        address={businessProfile.address}
        copy={{
          action: translations('location.action'),
          body: translations('location.body'),
          eyebrow: translations('location.eyebrow'),
          imageAlt: translations('location.imageAlt'),
          title: translations('location.title'),
        }}
        daily={footerTranslations('daily')}
        hours={businessProfile.openingHours.timeRange}
        locale={locale}
      />
    </main>
  );
}
