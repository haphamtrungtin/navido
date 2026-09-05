import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';
import { isLocale, locales } from '@/i18n/types';
import { buildPageMetadata } from '@/lib/metadata';
import { initialVisitBusinessConfig } from '@/lib/site-config';
import { HomeHero } from '@/sections/home/home-hero';
import { HomeIntroduction } from '@/sections/home/home-introduction';
import { LocationInvitation } from '@/sections/home/location-invitation';
import { SignatureHighlights } from '@/sections/home/signature-highlights';

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
    description: metadata('home.description'),
    locale,
    page: 'home',
    siteUrl: initialVisitBusinessConfig.siteUrl,
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
  const signatureItems = localMenuRepository
    .getItemsByCategory('signature')
    .slice(0, 3);

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
      <LocationInvitation
        copy={{
          action: translations('location.action'),
          body: translations('location.body'),
          eyebrow: translations('location.eyebrow'),
          imageAlt: translations('location.imageAlt'),
          title: translations('location.title'),
        }}
        locale={locale}
      />
    </main>
  );
}
