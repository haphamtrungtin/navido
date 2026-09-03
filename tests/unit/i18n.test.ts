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

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import HomeRedirect from '@/app/(root)/page';
import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout';
import {
  dynamic as localePageDynamic,
  generateStaticParams as generatePageStaticParams,
} from '@/app/[locale]/page';
import { getLocalizedValue, isLocale } from '@/i18n/types';
import { redirect } from 'next/navigation';

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
});
