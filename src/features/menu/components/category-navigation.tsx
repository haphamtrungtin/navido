'use client';

import { useEffect, useState } from 'react';

import type { MenuCategory } from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';

type CategoryNavigationProps = Readonly<{
  categories: readonly MenuCategory[];
  label: string;
  locale: Locale;
  variant?: 'desktop' | 'mobile';
}>;

export function CategoryNavigation({
  categories,
  label,
  locale,
  variant = 'desktop',
}: CategoryNavigationProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? '',
  );

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);
        if (activeEntry?.target.id) setActiveCategoryId(activeEntry.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    );

    const sectionTargets = categories
      .map((category) => document.getElementById(category.id))
      .filter((target): target is HTMLElement => target !== null);
    const targets =
      sectionTargets.length > 0
        ? sectionTargets
        : categories
            .map((category) =>
              document.querySelector<HTMLAnchorElement>(
                `a[href="#${category.id}"]`,
              ),
            )
            .filter((target): target is HTMLAnchorElement => target !== null);

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [categories]);

  return (
    <nav
      aria-label={label}
      className="min-w-0"
      data-menu-desktop-category-nav={variant === 'desktop' ? '' : undefined}
      data-menu-mobile-category-nav={variant === 'mobile' ? '' : undefined}
    >
      <ul
        className={
          variant === 'mobile'
            ? 'flex h-12 items-stretch gap-x-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
            : 'space-y-1'
        }
      >
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <li
              className={variant === 'mobile' ? 'shrink-0' : ''}
              key={category.id}
            >
              <a
                aria-current={isActive ? 'location' : undefined}
                className={[
                  variant === 'mobile'
                    ? 'block h-12 max-w-52 truncate border-b py-3 text-xs uppercase leading-5'
                    : 'block border-l-2 py-1.5 pl-3 text-xs uppercase leading-5',
                  isActive
                    ? 'border-[var(--navido-ink)] font-semibold text-[var(--navido-ink)]'
                    : 'border-transparent text-[var(--navido-muted-ink)] hover:border-current hover:text-[var(--navido-ink)]',
                ].join(' ')}
                href={`#${category.id}`}
              >
                {getLocalizedValue(category.name, locale)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
