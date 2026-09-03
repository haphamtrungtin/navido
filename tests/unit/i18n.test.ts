import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
    Footer: { informationPending: 'Pending' },
    Navigation: {
      about: 'About',
      closeMenu: 'Close navigation',
      home: 'Home',
      language: 'Language',
      menu: 'Menu',
      openMenu: 'Open navigation',
      ourSpace: 'Our space',
      primary: 'Primary navigation',
      visit: 'Visit',
    },
  }),
  getRequestConfig: <T>(createRequestConfig: T) => createRequestConfig,
  setRequestLocale: vi.fn(),
}));

import HomeRedirect from '@/app/(root)/page';
import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout';
import {
  dynamic as localePageDynamic,
  generateStaticParams as generatePageStaticParams,
} from '@/app/[locale]/page';
import { getLocalizedValue, isLocale } from '@/i18n/types';
import requestConfig from '@/i18n/request';
import { redirect } from 'next/navigation';

import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';
import viMessages from '../../messages/vi.json';

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

  it('generates static paths and sets the localized document language', async () => {
    expect(generateStaticParams()).toEqual([
      { locale: 'vi' },
      { locale: 'en' },
      { locale: 'ko' },
    ]);
    expect(generatePageStaticParams()).toEqual(generateStaticParams());
    expect(localePageDynamic).toBe('force-static');

    const layout = await LocaleLayout({
      children: createElement('main'),
      params: Promise.resolve({ locale: 'ko' }),
    });

    expect(layout.type).toBe('html');
    expect(layout.props.lang).toBe('ko');
    expect(layout.props.children.type).toBe('body');
  });

  it('redirects the unlocalized root to Vietnamese', () => {
    HomeRedirect();

    expect(redirect).toHaveBeenCalledWith('/vi');
  });

  it('keeps translated dictionaries schema-compatible with English', () => {
    expect(Object.keys(viMessages).sort()).toEqual(
      Object.keys(enMessages).sort(),
    );
    expect(Object.keys(koMessages).sort()).toEqual(
      Object.keys(enMessages).sort(),
    );
    expect(viMessages.Navigation.home).toBe('Trang chủ');
    expect(viMessages.Common.learnMore).toBe('Xem thêm');
    expect(koMessages.Navigation.home).toBe('홈');
    expect(koMessages.Common.learnMore).toBe('더 알아보기');
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
