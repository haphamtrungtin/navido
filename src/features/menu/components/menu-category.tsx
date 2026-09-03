import type {
  MenuCategory as MenuCategoryType,
  MenuItem,
} from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';

import { MenuItemRow } from './menu-item-row';

type MenuCategoryProps = Readonly<{
  category: MenuCategoryType;
  items: readonly MenuItem[];
  locale: Locale;
}>;

export function MenuCategory({ category, items, locale }: MenuCategoryProps) {
  return (
    <section
      className="scroll-mt-32"
      data-menu-category={category.id}
      id={category.id}
    >
      <h2 className="border-b border-[var(--navido-ink)] pb-3 text-2xl font-light leading-tight sm:text-3xl">
        {getLocalizedValue(category.name, locale)}
      </h2>
      <ul className="mt-3">
        {items.map((item) => (
          <MenuItemRow item={item} key={item.id} locale={locale} />
        ))}
      </ul>
    </section>
  );
}
