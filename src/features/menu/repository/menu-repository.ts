import type { MenuCategory, MenuItem } from '@/features/menu/domain/types';

export interface MenuRepository {
  getCategories(): readonly MenuCategory[];
  getItemsByCategory(categoryId: string): readonly MenuItem[];
}
