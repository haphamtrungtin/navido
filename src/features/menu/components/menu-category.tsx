import type { ReactNode } from 'react';

import type {
  MenuCategory as MenuCategoryType,
  MenuItem,
} from '@/features/menu/domain/types';
import type { MenuChapter } from '@/features/menu/domain/presentation';
import { getLocalizedValue, type Locale } from '@/i18n/types';

import { MenuItemRow } from './menu-item-row';

type MenuCategoryProps = Readonly<{
  category: MenuCategoryType;
  chapter: MenuChapter;
  index: number;
  items: readonly MenuItem[];
  locale: Locale;
  media?: ReactNode;
}>;

export function MenuCategory({
  category,
  chapter,
  index,
  items,
  locale,
  media,
}: MenuCategoryProps) {
  const isMediaLeft = chapter === 'media-left';
  const usesMediaGrid =
    chapter === 'signature' ||
    chapter === 'media-left' ||
    chapter === 'media-right';

  const list = (
    <ul
      className={
        chapter === 'botanical' ? 'md:grid md:grid-cols-2 md:gap-x-10' : ''
      }
    >
      {items.map((item) => (
        <MenuItemRow
          compact={chapter === 'compact'}
          item={item}
          key={item.id}
          locale={locale}
        />
      ))}
    </ul>
  );

  return (
    <section
      className="scroll-mt-36 border-t border-[var(--navido-rule)] pt-8 md:pt-10"
      data-menu-chapter={chapter}
      data-menu-category={category.id}
      id={category.id}
    >
      <div className="mb-6 flex items-end justify-between gap-6 md:mb-8">
        <div>
          <span className="mb-2 block text-[11px] uppercase text-[var(--navido-muted-ink)]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="text-2xl font-light leading-tight md:text-4xl">
            {getLocalizedValue(category.name, locale)}
          </h2>
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--navido-muted-ink)]">
          {String(items.length).padStart(2, '0')}
        </span>
      </div>

      {usesMediaGrid && media ? (
        <div className="grid items-start gap-8 md:grid-cols-12">
          <div
            className={[
              'order-2 md:col-span-7',
              isMediaLeft ? 'md:order-2' : 'md:order-1',
            ].join(' ')}
          >
            {list}
          </div>
          <div
            className={[
              'order-1',
              isMediaLeft
                ? 'md:order-1 md:col-span-5'
                : 'md:order-2 md:col-span-5',
            ].join(' ')}
          >
            {media}
          </div>
        </div>
      ) : (
        <>
          {media}
          {list}
        </>
      )}
    </section>
  );
}
