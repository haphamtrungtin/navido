'use client';

import { useEffect, useState } from 'react';

import type { MenuCategory } from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';

type CategoryNavigationProps = Readonly<{
  categories: readonly MenuCategory[];
  label: string;
  locale: Locale;
}>;

export function CategoryNavigation({
  categories,
  label,
  locale,
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
    <nav aria-label={label} className="min-w-0">
      <ul className="flex h-12 items-stretch gap-x-5 overflow-x-auto md:block md:h-auto md:space-y-1 md:overflow-visible">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;

          return (
            <li className="shrink-0 md:shrink" key={category.id}>
              <a
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'block h-12 max-w-52 truncate border-b py-3 text-sm leading-5 md:h-auto md:max-w-none md:overflow-visible md:text-clip md:whitespace-normal md:break-words md:py-2',
                  isActive
                    ? 'border-[var(--navido-ink)] text-[var(--navido-ink)]'
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
