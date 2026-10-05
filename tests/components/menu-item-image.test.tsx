import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuItemRow } from '@/features/menu/components/menu-item-row';
describe('public item image and description', () => {
  it('keeps name and price readable after a photo fails', () => {
    render(
      <ul>
        <MenuItemRow
          locale="vi"
          item={{
            id: 'one',
            categoryId: 'new',
            name: { vi: 'Món', en: 'Dish', ko: 'Dish' },
            priceVnd: 50000,
            sortOrder: 0,
            imageUrl: '/images/navido/menu/bad.webp',
            description: { vi: 'Mô tả', en: 'Description', ko: 'Description' },
          }}
        />
      </ul>,
    );
    expect(screen.getByText('Mô tả')).toBeVisible();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('Món')).toBeVisible();
    expect(screen.getByText(/50.000/)).toBeVisible();
  });
});
