import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('@/features/catalog/actions', () => ({
  saveMenuItem: async () => ({ error: 'conflict' }),
  saveMenuCategory: vi.fn(async () => ({ error: 'conflict' })),
  setMenuAvailability: async () => ({ error: 'conflict' }),
}));
import { ItemForm } from '@/features/catalog/components/item-form';
import { CategoryForm } from '@/features/catalog/components/category-form';
import { AvailabilityForm } from '@/features/catalog/components/availability-form';
import { saveMenuCategory } from '@/features/catalog/actions';
import type { CatalogActionState, CatalogItem } from '@/features/catalog/types';
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
  beforeEach(() => {
    vi.mocked(saveMenuCategory)
      .mockReset()
      .mockResolvedValue({ error: 'conflict' });
  });
  it('disables category draft editing during a pending save', async () => {
    let resolveSave!: (value: CatalogActionState) => void;
    vi.mocked(saveMenuCategory).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );
    render(
      <CategoryForm
        category={{
          id: 'coffee',
          version: 1,
          name: { vi: 'Original', en: '', ko: '' },
          sortOrder: 1,
          sourceCategoryCodes: [],
          updatedAt: '2026-10-05',
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Lưu danh mục' }));
    expect(screen.getByRole('button', { name: 'Đang lưu…' })).toBeDisabled();
    expect(screen.getByLabelText('Tên tiếng Việt')).toBeDisabled();
    expect(screen.getByLabelText('Thứ tự danh mục')).toBeDisabled();
    await act(async () => resolveSave({ error: 'conflict' }));
    expect(screen.getByLabelText('Tên tiếng Việt')).toBeEnabled();
  });
  it('clears new-category inputs after a successful creation', async () => {
    vi.mocked(saveMenuCategory).mockResolvedValueOnce({ error: null });
    render(<CategoryForm />);
    await userEvent.type(
      screen.getByLabelText('Tên tiếng Việt'),
      'New category',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Thêm danh mục' }),
    );
    expect(screen.getByLabelText('Tên tiếng Việt')).toHaveValue('');
  });
  it('advances category version after each saved draft is reflected by the server', async () => {
    vi.mocked(saveMenuCategory).mockResolvedValue({ error: null });
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
    await userEvent.type(input, '  First save  ');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu danh mục' }));
    rerender(
      <CategoryForm
        category={{
          ...category,
          version: 2,
          name: { ...category.name, vi: 'First save' },
        }}
      />,
    );
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('2');
    await userEvent.clear(input);
    await userEvent.type(input, 'Second save');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu danh mục' }));
    expect(
      vi.mocked(saveMenuCategory).mock.calls[1]?.[1].get('expectedVersion'),
    ).toBe('2');
    rerender(
      <CategoryForm
        category={{
          ...category,
          version: 3,
          name: { ...category.name, vi: 'Second save' },
        }}
      />,
    );
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('3');
    expect(input).toHaveValue('Second save');
  });
  it('preserves the complete category draft when a concurrent translation changes', async () => {
    const category = {
      id: 'coffee',
      version: 1,
      name: { vi: 'Original', en: 'Original English', ko: '' },
      sortOrder: 1,
      sourceCategoryCodes: [],
      updatedAt: '2026-10-05',
    };
    const { rerender, container } = render(
      <CategoryForm category={category} />,
    );
    await userEvent.type(screen.getByLabelText('Tên tiếng Việt'), ' draft');
    rerender(
      <CategoryForm
        category={{
          ...category,
          version: 2,
          name: { ...category.name, en: 'Concurrent English' },
        }}
      />,
    );
    expect(screen.getByLabelText('Tên tiếng Việt')).toHaveValue(
      'Original draft',
    );
    expect(screen.getByLabelText('Tên tiếng Anh')).toHaveValue(
      'Original English',
    );
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('1');
  });
  it('does not advance the category draft version when only names match', () => {
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
    rerender(
      <CategoryForm category={{ ...category, version: 2, sortOrder: 2 }} />,
    );
    expect(screen.getByLabelText('Thứ tự danh mục')).toHaveValue(1);
    expect(
      container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('1');
  });
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
