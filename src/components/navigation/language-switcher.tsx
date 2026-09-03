'use client';

import { usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/types';
import { localeOptions } from '@/lib/site-config';

import { LocaleLink } from './locale-link';

type LanguageSwitcherProps = Readonly<{
  label?: string;
  locale: Locale;
}>;

export function LanguageSwitcher({
  label = 'Language',
  locale,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="flex items-center gap-3 text-xs font-medium tracking-[0.08em]"
    >
      {localeOptions.map((option) => (
        <LocaleLink
          aria-current={option.code === locale ? 'page' : undefined}
          className="border-b border-transparent pb-1 text-[var(--navido-muted-ink)] hover:border-current hover:text-[var(--navido-ink)] aria-[current=page]:border-current aria-[current=page]:text-[var(--navido-ink)]"
          href={pathname}
          key={option.code}
          locale={option.code}
        >
          {option.label}
        </LocaleLink>
      ))}
    </nav>
  );
}
