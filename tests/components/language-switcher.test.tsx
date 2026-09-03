import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/vi/our-space',
}));

import { LanguageSwitcher } from '@/components/navigation/language-switcher';

describe('LanguageSwitcher', () => {
  it('preserves the current localized route when choosing another locale', () => {
    render(<LanguageSwitcher locale="vi" />);

    expect(screen.getByRole('link', { name: 'EN' })).toHaveAttribute(
      'href',
      '/en/our-space',
    );
    expect(screen.getByRole('link', { name: 'KO' })).toHaveAttribute(
      'href',
      '/ko/our-space',
    );
    expect(screen.getByRole('link', { name: 'VI' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
