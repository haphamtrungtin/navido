import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('@/features/catalog/actions', () => ({
  saveMenuItem: async () => ({ error: 'conflict' }),
  saveMenuCategory: async () => ({ error: 'conflict' }),
  setMenuAvailability: async () => ({ error: 'conflict' }),
}));
import { ItemForm } from '@/features/catalog/components/item-form';
import { CategoryForm } from '@/features/catalog/components/category-form';
import { AvailabilityForm } from '@/features/catalog/components/availability-form';
import type { CatalogItem } from '@/features/catalog/types';
afterEach(cleanup);
const item: CatalogItem = {
  id: 'coffee-a',
  version: 2,
  name: { vi: 'Cà phê', en: '', ko: '' },
  categoryId: 'coffee',
  priceVnd: 50000,
  sortOrder: 1,
  publicationStatus: 'draft',
  isAvailable: true,
  netWeightGram: null,
  needsReview: true,
  sourceRow: 2,
  sourceName: 'Coffee',
  sourceCategoryCode: 'COFFEE',
  reviewNotes: ['generated-translation:en'],
  updatedAt: '2026-10-05',
  updatedBy: null,
};
describe('catalog edit forms', () => {
  it('retains the category draft version across refreshed props', async () => {
    const category = {
      id: 'coffee',
      version: 1,
      name: { vi: 'Original', en: '', ko: '' },
      sortOrder: 1,
      sourceCategoryCodes: [],
      updatedAt: '2026-10-05',
    };
    const { rerender, container } = render(
      <CategoryForm category={category} />,
    );
    const input = screen.getByLabelText('Tên tiếng Việt');
    await userEvent.clear(input);
    await userEvent.type(input, 'Unsaved draft');
    rerender(
      <CategoryForm
        category={{
          ...category,
          version: 2,
          name: { ...category.name, vi: 'Concurrent update' },
        }}
      />,
    );
    expect(input).toHaveValue('Unsaved draft');
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('1');
  });
  it('retains the item draft version across refreshed props', async () => {
    const { rerender, container } = render(
      <ItemForm item={item} categories={[]} />,
    );
    const input = screen.getByLabelText('Tên tiếng Việt');
    await userEvent.clear(input);
    await userEvent.type(input, 'Unsaved draft');
    rerender(<ItemForm item={{ ...item, version: 3 }} categories={[]} />);
    expect(input).toHaveValue('Unsaved draft');
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('2');
  });
  it('shows source metadata read-only and asks to reload on conflict', async () => {
    render(
      <ItemForm
        item={item}
        categories={[
          {
            id: 'coffee',
            version: 1,
            name: { vi: 'Cà phê', en: '', ko: '' },
            sortOrder: 1,
            sourceCategoryCodes: [],
            updatedAt: '2026-10-05',
          },
        ]}
      />,
    );
    expect(screen.getByLabelText('Tên tiếng Việt')).toHaveValue('Cà phê');
    expect(screen.getByLabelText('Giá (VND)')).toHaveValue(50000);
    expect(screen.getByText(/Dòng nguồn: 2/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Lưu món' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('tải lại');
  });
  it('availability mutation exposes errors without editing price', async () => {
    render(<AvailabilityForm item={item} />);
    expect(screen.queryByLabelText('Giá (VND)')).toBeNull();
    await userEvent.click(
      screen.getByRole('button', { name: 'Đánh dấu tạm hết' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('tải lại');
  });
});
