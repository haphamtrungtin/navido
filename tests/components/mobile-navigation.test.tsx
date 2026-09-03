import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
}));

import { MobileNavigation } from '@/components/layout/mobile-navigation';

afterEach(cleanup);

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

  it('keeps Tab and Shift+Tab focus inside the open navigation panel', async () => {
    const user = userEvent.setup();

    render(<MobileNavigation locale="en" />);

    const appRoot = document.body.firstElementChild as HTMLElement;
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    const closeButton = screen.getByRole('button', {
      name: 'Close navigation',
    });
    const lastLocaleLink = screen.getByRole('link', { name: 'KO' });

    expect(appRoot).toHaveAttribute('inert');

    lastLocaleLink.focus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(lastLocaleLink).toHaveFocus();
  });

  it('restores focus to the trigger after closing with the close button', async () => {
    const user = userEvent.setup();

    render(<MobileNavigation locale="en" />);

    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    const appRoot = document.body.firstElementChild as HTMLElement;
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close navigation' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(appRoot).not.toHaveAttribute('inert');
  });
});
