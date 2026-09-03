import normalizedMenu from '@/features/menu/data/normalized-menu.generated.json';
import type { MenuCategory, MenuItem } from '@/features/menu/domain/types';

import type { MenuRepository } from './menu-repository';

type GeneratedMenu = {
  categories: MenuCategory[];
  items: MenuItem[];
};

const generatedMenu: GeneratedMenu = normalizedMenu;
const categories = Object.freeze([...generatedMenu.categories]);
const itemsByCategory = new Map<string, readonly MenuItem[]>();

for (const category of categories) {
  itemsByCategory.set(
    category.id,
    Object.freeze(
      generatedMenu.items.filter((item) => item.categoryId === category.id),
    ),
  );
}

export const localMenuRepository: MenuRepository = {
  getCategories: () => categories,
  getItemsByCategory: (categoryId) => itemsByCategory.get(categoryId) ?? [],
};
