import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MenuPage from '@/app/[locale]/menu/page';
import HomePage from '@/app/[locale]/page';
import { parsePublishedMenu } from '@/features/menu/domain/published-menu';
const read = vi.hoisted(() => vi.fn());
vi.mock('@/features/menu/repository/published-menu-repository', () => ({
  getPublishedMenu: read,
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));
afterEach(cleanup);
const category = {
  id: 'new-category',
  name: { vi: 'Danh mục DB', en: 'DB category', ko: 'DB 카테고리' },
  sortOrder: -10,
};
const item = {
  id: 'new-item',
  categoryId: category.id,
  name: { vi: 'Món DB', en: 'DB dish', ko: 'DB 메뉴' },
  sortOrder: 0,
  priceVnd: 73500,
  isAvailable: true,
};
describe('public database consumers', () => {
  it.each(['vi', 'en', 'ko'])(
    'renders new DB category/item/price in %s without a static source row',
    async (locale) => {
      read.mockResolvedValue(
        parsePublishedMenu({ categories: [category], items: [item] }),
      );
      render(await MenuPage({ params: Promise.resolve({ locale }) }));
      expect(
        screen.getAllByText(
          locale === 'vi'
            ? 'Danh mục DB'
            : locale === 'en'
              ? 'DB category'
              : 'DB 카테고리',
        ).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getByText(
          locale === 'vi' ? 'Món DB' : locale === 'en' ? 'DB dish' : 'DB 메뉴',
        ),
      ).toBeVisible();
      expect(screen.getByText(/73[,.]500/)).toBeVisible();
    },
  );
  it('shows an unavailable status without serving old static prices', async () => {
    read.mockRejectedValue(new Error('Offline'));
    render(await MenuPage({ params: Promise.resolve({ locale: 'vi' }) }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tạm thời không tải được thực đơn',
    );
    expect(document.querySelector('[data-menu-item]')).toBeNull();
  });
  it('shows empty menu distinctly from an unavailable DB', async () => {
    read.mockResolvedValue({ categories: [], items: [] });
    render(await MenuPage({ params: Promise.resolve({ locale: 'vi' }) }));
    expect(screen.getByRole('status')).toHaveTextContent('đang được cập nhật');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('Home presents the empty state when all public signatures have been hidden', async () => {
    read.mockResolvedValue({ categories: [], items: [] });
    render(await HomePage({ params: Promise.resolve({ locale: 'vi' }) }));
    expect(screen.getByRole('status')).toHaveTextContent('đang được cập nhật');
  });
});
