import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/en',
}));

import { Header } from '@/components/layout/header';
import { conversionLinks } from '@/lib/conversion-links';
import type { NavigationCopy } from '@/lib/site-config';

const navigationCopy: NavigationCopy = {
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
  visit: 'Visit',
};

describe('Header', () => {
  it('offers a safe external Maps action on desktop', () => {
    render(
      <Header
        callHref={conversionLinks.call}
        copy={navigationCopy}
        locale="en"
        mapsHref={conversionLinks.maps}
      />,
    );

    const languageSwitcher = screen.getByRole('navigation', {
      name: 'Language',
    });
    const mapsLink = languageSwitcher.nextElementSibling;
    expect(mapsLink).toHaveRole('link');
    expect(mapsLink).toHaveAccessibleName('Directions');
    expect(mapsLink).toHaveAttribute('href', conversionLinks.maps);
    expect(mapsLink).toHaveAttribute('target', '_blank');
    expect(mapsLink).toHaveAttribute('rel', 'noreferrer');
  });
});
