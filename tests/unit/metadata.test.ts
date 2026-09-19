import { describe, expect, it } from 'vitest';

import {
  buildPageMetadata,
  buildRobots,
  buildSitemap,
  pagePaths,
} from '@/lib/metadata';

describe('localized discovery metadata', () => {
  it('keeps Korean page copy as genuine localized text', () => {
    const metadata = buildPageMetadata({
      description: 'NAVIDO의 커피와 공간, 함께하는 시간을 소개합니다.',
      locale: 'ko',
      page: 'about',
      siteUrl: null,
      title: 'NAVIDO 소개',
    });

    expect(metadata.title).toBe('NAVIDO 소개');
    expect(metadata.description).toBe(
      'NAVIDO의 커피와 공간, 함께하는 시간을 소개합니다.',
    );
  });

  it('creates localized canonical and alternate URLs from a verified origin', () => {
    const metadata = buildPageMetadata({
      description: 'Discover NAVIDO.',
      locale: 'en',
      page: 'ourSpace',
      siteUrl: 'https://www.navido.example',
      title: 'Our space | NAVIDO',
    });

    expect(metadata.alternates).toEqual({
      canonical: 'https://www.navido.example/en/our-space',
      languages: {
        en: 'https://www.navido.example/en/our-space',
        ko: 'https://www.navido.example/ko/our-space',
        vi: 'https://www.navido.example/vi/our-space',
      },
    });
  });

  it('omits canonical and alternate URLs when no production origin is verified', () => {
    const metadata = buildPageMetadata({
      description: 'Discover NAVIDO.',
      locale: 'vi',
      page: 'menu',
      siteUrl: null,
      title: 'Thực đơn | NAVIDO',
    });

    expect(metadata).not.toHaveProperty('alternates');
    expect(JSON.stringify(metadata)).not.toMatch(
      /example\.com|localhost|vercel\.app/i,
    );
  });

  it('normalizes every localized page path consistently', () => {
    expect(pagePaths).toEqual({
      about: '/about',
      home: '/',
      menu: '/menu',
      ourSpace: '/our-space',
      roastery: '/roastery',
      visit: '/visit',
    });

    expect(
      buildPageMetadata({
        description: 'Roasted in-house at NAVIDO.',
        locale: 'vi',
        page: 'roastery',
        siteUrl: null,
        title: 'XÆ°á»Ÿng rang | NAVIDO',
      }),
    ).toMatchObject({
      title: 'XÆ°á»Ÿng rang | NAVIDO',
      description: 'Roasted in-house at NAVIDO.',
    });
    for (const [page, pathname] of Object.entries(pagePaths)) {
      const metadata = buildPageMetadata({
        description: 'Description',
        locale: 'en',
        page: page as keyof typeof pagePaths,
        siteUrl: 'https://www.navido.example/',
        title: 'Title',
      });
      const expectedPath = pathname === '/' ? '/en' : `/en${pathname}`;

      expect(metadata.alternates?.canonical).toBe(
        `https://www.navido.example${expectedPath}`,
      );
    }
  });

  it('does not invent sitemap URLs and allows crawling without a sitemap URL', () => {
    expect(buildSitemap(null)).toEqual([]);
    expect(buildRobots(null)).toEqual({
      rules: { allow: '/', userAgent: '*' },
    });
  });
});
