import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn().mockResolvedValue({
    Footer: {
      address: 'Address',
      daily: 'Daily',
      email: 'Email',
      facebook: 'Facebook',
      grabFood: 'Order on GrabFood',
      hours: 'Hours',
      instagram: 'Instagram',
      maps: 'Open Google Maps',
      phone: 'Phone',
      zalo: 'Zalo',
    },
    Navigation: {
      about: 'About',
      call: 'Call',
      closeMenu: 'Close navigation',
      directions: 'Directions',
      home: 'Home',
      language: 'Language',
      menu: 'Menu',
      openMenu: 'Open navigation',
      ourSpace: 'Our space',
      primary: 'Primary navigation',
      roastery: 'Roastery',
      visit: 'Visit',
    },
  }),
  getRequestConfig: <T>(createRequestConfig: T) => createRequestConfig,
  setRequestLocale: vi.fn(),
}));

import HomeRedirect from '@/app/(root)/page';
import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout';
import { generateStaticParams as generatePageStaticParams } from '@/app/[locale]/page';
import { getLocalizedValue, isLocale } from '@/i18n/types';
import requestConfig from '@/i18n/request';
import { redirect } from 'next/navigation';

import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';
import viMessages from '../../messages/vi.json';

const dictionaries = [enMessages, viMessages, koMessages] as const;
const pendingCopy = /being confirmed|đang được xác nhận|확인 중/i;

function nestedLeafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    nestedLeafPaths(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
}

afterEach(cleanup);

describe('i18n locale contracts', () => {
  it('recognizes supported locales only', () => {
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('falls back to Vietnamese when a localized value is empty', () => {
    expect(
      getLocalizedValue({ vi: 'Cà phê', en: 'Coffee', ko: '' }, 'ko'),
    ).toBe('Cà phê');
  });

  it('generates locale paths and sets the localized document language', async () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'vi' },
      { locale: 'en' },
      { locale: 'ko' },
    ]);
    expect(generatePageStaticParams()).toEqual(generateStaticParams());

    const layout = await LocaleLayout({
      children: createElement('main'),
      params: Promise.resolve({ locale: 'ko' }),
    });

    expect(layout.type).toBe('html');
    expect(layout.props.lang).toBe('ko');
    expect(layout.props.children.type).toBe('body');

    render(layout.props.children.props.children);
    const directionLinks = screen.getAllByRole('link', {
      name: /^Directions$/,
    });
    expect(directionLinks).toHaveLength(2);
    for (const directionLink of directionLinks) {
      expect(directionLink).toHaveAttribute(
        'href',
        'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
      );
    }
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'NAVIDO Specialty Coffee',
    );
    expect(screen.getByRole('contentinfo').querySelectorAll('a')).toHaveLength(
      7,
    );
  });

  it('redirects the unlocalized root to Vietnamese', () => {
    HomeRedirect();

    expect(redirect).toHaveBeenCalledWith('/vi');
  });

  it('keeps every translated dictionary nested-key compatible with English', () => {
    const englishShape = nestedLeafPaths(enMessages).sort();

    expect(nestedLeafPaths(viMessages).sort()).toEqual(englishShape);
    expect(nestedLeafPaths(koMessages).sort()).toEqual(englishShape);
    expect(viMessages.Navigation.home).toBe('Trang chủ');
    expect(viMessages.Common.learnMore).toBe('Xem thêm');
    expect(koMessages.Navigation.home).toBe('홈');
    expect(koMessages.Common.learnMore).toBe('더 알아보기');
  });

  it('contains no provisional copy in visit-related localized content', () => {
    for (const messages of dictionaries) {
      const visitContent = [
        messages.Home.location,
        messages.Visit,
        messages.Footer,
        messages.Metadata.visit,
      ];

      expect(JSON.stringify(visitContent)).not.toMatch(pendingCopy);
    }
  });

  it('honors an explicitly requested locale when loading messages', async () => {
    const config = await requestConfig({
      locale: 'ko',
      requestLocale: Promise.resolve('vi'),
    });

    expect(config.locale).toBe('ko');
    expect(config.messages).toEqual(koMessages);
  });
});
