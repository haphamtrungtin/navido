import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

import type { Locale } from '@/i18n/types';

type LocaleLinkProps = Readonly<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
    href: string;
    locale: Locale;
  }
>;

export function localizeHref(locale: Locale, href: string): string {
  const [path = '', hash] = href.split('#', 2);
  const localePrefix = /^\/(?:vi|en|ko)(?=\/|$)/;
  const normalizedPath = path.startsWith('/')
    ? path.replace(localePrefix, '')
    : `/${path}`;
  const pathname = normalizedPath === '/' ? '' : normalizedPath;

  return `/${locale}${pathname}${hash === undefined ? '' : `#${hash}`}`;
}

export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  function LocaleLink({ children, href, locale, ...props }, ref) {
    return (
      <a ref={ref} href={localizeHref(locale, href)} {...props}>
        {children}
      </a>
    );
  },
);
