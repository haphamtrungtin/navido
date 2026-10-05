import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MenuList } from '@/features/catalog/components/menu-list';
import type { CatalogCategory, CatalogItem } from '@/features/catalog/types';

vi.mock('@/features/catalog/actions', () => ({
  setMenuAvailability: async () => ({ error: null }),
}));
afterEach(cleanup);
const category: CatalogCategory = {
  id: 'coffee',
  version: 1,
  name: { vi: 'Cà phê', en: '', ko: '' },
  sortOrder: 1,
  sourceCategoryCodes: [],
  updatedAt: '2026-10-05',
};
const item: CatalogItem = {
  id: 'coffee/special',
  version: 1,
  name: { vi: 'Signature', en: '', ko: '' },
  categoryId: 'coffee',
  priceVnd: 50000,
  sortOrder: 1,
  publicationStatus: 'archived',
  isAvailable: false,
  needsReview: true,
  netWeightGram: null,
  sourceRow: null,
  sourceName: null,
  sourceCategoryCode: null,
  reviewNotes: [],
  updatedAt: '2026-10-05',
  updatedBy: null,
};
describe('private menu list', () => {
  it('lets staff view archived and sold-out items without owner creation controls', () => {
    render(
      <MenuList
        categories={[category]}
        items={[item]}
        role="staff"
        filters={{}}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Thêm món' })).toBeNull();
    expect(
      screen.getByText(/Website đọc menu đã công bố từ DB/),
    ).toBeInTheDocument();
    const row = screen.getByRole('link', { name: 'Signature' }).closest('tr')!;
    expect(within(row).getByText('Lưu trữ')).toBeInTheDocument();
    expect(within(row).getByText('Tạm hết')).toBeInTheDocument();
    expect(within(row).getByText('Cần rà soát')).toBeInTheDocument();
    expect(
      within(row).getByRole('button', { name: 'Đánh dấu còn bán' }),
    ).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Signature' })).toHaveAttribute(
      'href',
      '/admin/menu/coffee%2Fspecial',
    );
  });
  it('retains the active GET filters and clearly explains an empty result', () => {
    const { container } = render(
      <MenuList
        categories={[category]}
        items={[]}
        role="owner"
        filters={{
          query: 'cà phê',
          categoryId: 'coffee',
          publicationStatus: 'archived',
          needsReview: true,
        }}
      />,
    );
    expect(screen.getByLabelText('Tìm món')).toHaveValue('cà phê');
    expect(screen.getByLabelText('Danh mục')).toHaveValue('coffee');
    expect(screen.getByLabelText('Trạng thái')).toHaveValue('archived');
    expect(screen.getByLabelText('Cần rà soát')).toBeChecked();
    expect(container.querySelector('form')).toHaveAttribute('method', 'get');
    expect(container.querySelector('form')).toHaveAttribute(
      'action',
      '/admin/menu',
    );
    expect(
      screen.getByText('Không có món phù hợp bộ lọc.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thêm món' })).toHaveAttribute(
      'href',
      '/admin/menu/new',
    );
  });
});
