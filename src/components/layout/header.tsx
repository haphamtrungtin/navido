import { LocaleLink } from '@/components/navigation/locale-link';
import { LanguageSwitcher } from '@/components/navigation/language-switcher';
import {
  navigationItems,
  type NavigationCopy,
  siteName,
} from '@/lib/site-config';
import type { Locale } from '@/i18n/types';

import { Container } from './container';
import { MobileNavigation } from './mobile-navigation';

type HeaderProps = Readonly<{
  copy: NavigationCopy;
  locale: Locale;
}>;

export function Header({ copy, locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--navido-rule)] bg-[color:rgb(252_249_241_/_96%)] backdrop-blur-sm">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <LocaleLink
          className="text-sm font-semibold tracking-[0.1em] text-[var(--navido-ink)]"
          href="/"
          locale={locale}
        >
          {siteName}
        </LocaleLink>

        <div className="hidden items-center gap-10 md:flex">
          <nav aria-label={copy.primary} className="flex items-center gap-6">
            {navigationItems.map((item) => (
              <LocaleLink
                className="border-b border-transparent py-1 text-sm text-[var(--navido-muted-ink)] hover:border-current hover:text-[var(--navido-ink)]"
                href={item.href}
                key={item.key}
                locale={locale}
              >
                {copy[item.key]}
              </LocaleLink>
            ))}
          </nav>
          <LanguageSwitcher label={copy.language} locale={locale} />
        </div>

        <MobileNavigation copy={copy} locale={locale} />
      </Container>
    </header>
  );
}
