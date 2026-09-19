import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/',
}));

import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { conversionLinks } from '@/lib/conversion-links';

const defaultNavigationCopy = {
  about: 'About',
  call: 'Call',
  closeMenu: 'Close navigation',
  directions: 'Directions',
  home: 'Home',
  language: 'Language',
  menu: 'Menu',
  openMenu: 'Open navigation',
  ourSpace: 'Our space',
  primary: 'Primary navigation',
  roastery: 'Roastery',
  visit: 'Visit',
};

afterEach(cleanup);

describe('MobileNavigation', () => {
  it('includes conversion anchors in server-rendered markup before hydration', () => {
    const markup = renderToString(
      <MobileNavigation
        callHref={conversionLinks.call}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

    expect(markup).toContain('mobile-conversion-bar');
    expect(markup).toContain(conversionLinks.call);
    expect(markup).toContain(conversionLinks.maps.replaceAll('&', '&amp;'));
  });

  it('offers equal call and directions actions only while navigation is closed', async () => {
    const user = userEvent.setup();

    render(
      <MobileNavigation
        callHref={conversionLinks.call}
        copy={defaultNavigationCopy}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

    const conversionBar = screen.getByTestId('mobile-conversion-bar');
    expect(conversionBar).toBeVisible();
    expect(conversionBar).toHaveClass('grid-cols-2');
    expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute(
      'href',
      conversionLinks.call,
    );
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute(
      'href',
      conversionLinks.maps,
    );
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute(
      'rel',
      'noreferrer',
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    expect(
      screen.queryByTestId('mobile-conversion-bar'),
    ).not.toBeInTheDocument();
  });

  it('moves focus into its panel and restores it after Escape closes the panel', async () => {
    const user = userEvent.setup();

    render(
      <MobileNavigation
        callHref={conversionLinks.call}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

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

    render(
      <MobileNavigation
        callHref={conversionLinks.call}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

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

    render(
      <MobileNavigation
        callHref={conversionLinks.call}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    const appRoot = document.body.firstElementChild as HTMLElement;
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Close navigation' }));

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(appRoot).not.toHaveAttribute('inert');
  });
});
