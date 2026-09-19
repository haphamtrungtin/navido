import type { Metadata, MetadataRoute } from 'next';

import { locales, type Locale } from '@/i18n/types';

export const pagePaths = {
  about: '/about',
  home: '/',
  menu: '/menu',
  ourSpace: '/our-space',
  roastery: '/roastery',
  visit: '/visit',
} as const;

export type MetadataPage = keyof typeof pagePaths;

type PageMetadataInput = Readonly<{
  description: string;
  locale: Locale;
  page: MetadataPage;
  siteUrl: string | null;
  title: string;
}>;

function getVerifiedOrigin(siteUrl: string) {
  return new URL(siteUrl).origin;
}

export function getLocalizedPath(locale: Locale, page: MetadataPage) {
  const pathname = pagePaths[page];

  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export function getAbsoluteLocalizedUrl(
  siteUrl: string,
  locale: Locale,
  page: MetadataPage,
) {
  return new URL(
    getLocalizedPath(locale, page),
    getVerifiedOrigin(siteUrl),
  ).toString();
}

export function buildPageMetadata({
  description,
  locale,
  page,
  siteUrl,
  title,
}: PageMetadataInput): Metadata {
  const metadata: Metadata = { description, title };

  if (siteUrl === null) {
    return metadata;
  }

  metadata.alternates = {
    canonical: getAbsoluteLocalizedUrl(siteUrl, locale, page),
    languages: Object.fromEntries(
      locales.map((alternateLocale) => [
        alternateLocale,
        getAbsoluteLocalizedUrl(siteUrl, alternateLocale, page),
      ]),
    ),
  };

  return metadata;
}

export function buildSitemap(siteUrl: string | null): MetadataRoute.Sitemap {
  if (siteUrl === null) {
    return [];
  }

  return locales.flatMap((locale) =>
    (Object.keys(pagePaths) as MetadataPage[]).map((page) => ({
      url: getAbsoluteLocalizedUrl(siteUrl, locale, page),
    })),
  );
}

export function buildRobots(siteUrl: string | null): MetadataRoute.Robots {
  const robots: MetadataRoute.Robots = {
    rules: { allow: '/', userAgent: '*' },
  };

  if (siteUrl !== null) {
    robots.sitemap = new URL(
      '/sitemap.xml',
      getVerifiedOrigin(siteUrl),
    ).toString();
  }

  return robots;
}
