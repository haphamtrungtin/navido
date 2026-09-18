import type { MenuItem } from './types';

export type MenuPublicationStatus = 'draft' | 'verified' | 'hidden';

export function getMenuPublicationStatus(
  item: MenuItem,
): MenuPublicationStatus {
  const isMock =
    item.sourceCategoryCode.trim() === 'MOCK_BEANS' ||
    /\bmock\b/i.test(item.sourceName);

  return isMock ? 'hidden' : 'draft';
}
