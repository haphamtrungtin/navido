import normalizedMenu from '@/features/menu/data/normalized-menu.generated.json';
import { getMenuPublicationStatus } from '@/features/menu/domain/publication';
import type { MenuCategory, MenuItem } from '@/features/menu/domain/types';

import type { MenuRepository } from './menu-repository';

type GeneratedMenu = {
  categories: MenuCategory[];
  items: MenuItem[];
};

const generatedMenu: GeneratedMenu = normalizedMenu;
const publishedItems = generatedMenu.items.filter(
  (item) => getMenuPublicationStatus(item) !== 'hidden',
);
const categories = Object.freeze(
  generatedMenu.categories.filter((category) =>
    publishedItems.some((item) => item.categoryId === category.id),
  ),
);
const itemsByCategory = new Map<string, readonly MenuItem[]>();

for (const category of categories) {
  itemsByCategory.set(
    category.id,
    Object.freeze(
      publishedItems.filter((item) => item.categoryId === category.id),
    ),
  );
}

export const localMenuRepository: MenuRepository = {
  getCategories: () => categories,
  getItemsByCategory: (categoryId) => itemsByCategory.get(categoryId) ?? [],
};
