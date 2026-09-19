import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getAuthenticEditorialAssetPath,
  getAuthenticMenuAssetPath,
} from '@/lib/authentic-assets';
import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';

describe('authentic NAVIDO assets', () => {
  it('resolves supplied menu photography for the published menu majority', () => {
    const items = localMenuRepository
      .getCategories()
      .flatMap((category) =>
        localMenuRepository.getItemsByCategory(category.id),
      );
    const resolved = items.filter((item) => getAuthenticMenuAssetPath(item));

    expect(resolved.length).toBeGreaterThan(50);
    expect(
      resolved.every((item) =>
        getAuthenticMenuAssetPath(item)?.startsWith('/images/navido/menu/'),
      ),
    ).toBe(true);
  });

  it('publishes every inventoried owner asset under the public namespace', () => {
    const publicRoot = resolve('public');
    const inventory = localMenuRepository.getCategories();
    expect(inventory.length).toBeGreaterThan(0);
    expect(
      existsSync(
        resolve(
          publicRoot,
          'images/navido/logo/navido_logo_primary_black_01.jpg',
        ),
      ),
    ).toBe(true);
  });
  it('exposes verified editorial paths for existing page compositions', () => {
    expect(getAuthenticEditorialAssetPath('coffee')).toBe(
      '/images/navido/coffee/navido_coffee_table_setting_01.jpg',
    );
    expect(getAuthenticEditorialAssetPath('bakery')).toBe(
      '/images/navido/bakery/navido_bakery_pastries_and_drinks_01.jpeg',
    );
    expect(getAuthenticEditorialAssetPath('space')).toBe(
      '/images/navido/space/navido_space_ground_floor_seating_01.jpeg',
    );
  });
});
