import type { AnchorHTMLAttributes, ReactNode } from 'react';

import type { Locale } from '@/i18n/types';

type TextLinkProps = Readonly<
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
    href: string;
    locale: Locale;
  }
>;

function localizeHref(locale: Locale, href: string): string {
  const [path = '', hash] = href.split('#', 2);
  const localePrefix = /^\/(?:vi|en|ko)(?=\/|$)/;
  const normalizedPath = path.startsWith('/')
    ? path.replace(localePrefix, '')
    : `/${path}`;
  const pathname = normalizedPath === '/' ? '' : normalizedPath;

  return `/${locale}${pathname}${hash === undefined ? '' : `#${hash}`}`;
}

export function TextLink({
  children,
  className,
  href,
  locale,
  ...props
}: TextLinkProps) {
  const classes = [
    'inline-flex items-center border-b border-current pb-1 text-sm font-semibold text-[var(--navido-ink)] transition-colors hover:text-[var(--navido-botanical)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--navido-botanical)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a className={classes} href={localizeHref(locale, href)} {...props}>
      {children}
    </a>
  );
}
