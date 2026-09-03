import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
}));

import { MobileNavigation } from '@/components/layout/mobile-navigation';

describe('MobileNavigation', () => {
  it('moves focus into its panel and restores it after Escape closes the panel', async () => {
    const user = userEvent.setup();

    render(<MobileNavigation locale="en" />);

    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const firstLink = screen.getByRole('link', { name: 'Home' });
    expect(firstLink).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });
});
