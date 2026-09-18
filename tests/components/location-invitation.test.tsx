import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocationInvitation } from '@/sections/home/location-invitation';

describe('LocationInvitation', () => {
  it('renders verified location facts and the localized Visit link', () => {
    render(
      <LocationInvitation
        address="23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh"
        copy={{
          action: 'Visit information',
          body: 'A place for in-house roasted coffee, signature drinks, and unhurried meals.',
          eyebrow: 'Visit NAVIDO',
          imageAlt: 'NAVIDO coffee space',
          title: 'Visit NAVIDO in Phú Mỹ Hưng',
        }}
        daily="Daily"
        hours="07:00–22:00"
        locale="en"
      />,
    );

    expect(
      screen.getByText(
        '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh',
      ),
    ).toBeVisible();
    expect(screen.getByText('07:00–22:00')).toBeVisible();
    expect(screen.getByText('Daily')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Visit information' }),
    ).toHaveAttribute('href', '/en/visit');
  });
});
