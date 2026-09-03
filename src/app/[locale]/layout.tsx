import '../globals.css';

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

import { documentFontClassName } from '@/app/fonts';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { isLocale, locales } from '@/i18n/types';
import type { FooterCopy, NavigationCopy } from '@/lib/site-config';

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });
  const navigation = messages.Navigation as NavigationCopy;
  const footer = messages.Footer as FooterCopy;

  return (
    <html lang={locale}>
      <body
        className={`${documentFontClassName} min-h-screen bg-[var(--navido-paper)] text-[var(--navido-ink)]`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header copy={navigation} locale={locale} />
          {children}
          <Footer copy={footer} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
