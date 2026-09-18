import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { businessProfile } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';
import { VisitActions } from '@/sections/visit/visit-actions';
import { VisitInformation } from '@/sections/visit/visit-information';

const actionCopy = {
  call: 'Call',
  directions: 'Directions',
  email: 'Email',
  facebook: 'Facebook',
  grabFood: 'GrabFood',
  instagram: 'Instagram',
  title: 'Plan your visit',
  zalo: 'Zalo',
};

const informationCopy = {
  address: 'Address',
  hours: 'Opening hours',
  phone: 'Phone',
  title: 'Visit information',
};

describe('VisitActions', () => {
  it('renders exactly the seven verified actions with correct link contracts', () => {
    render(<VisitActions copy={actionCopy} links={conversionLinks} />);

    const expectedActions = [
      ['Directions', conversionLinks.maps, true],
      ['Call', conversionLinks.call, false],
      ['GrabFood', conversionLinks.grabFood, true],
      ['Zalo', conversionLinks.zalo, true],
      ['Instagram', conversionLinks.instagram, true],
      ['Facebook', conversionLinks.facebook, true],
      ['Email', conversionLinks.email, false],
    ] as const;

    expect(screen.getAllByRole('link')).toHaveLength(expectedActions.length);

    for (const [name, href, external] of expectedActions) {
      const link = screen.getByRole('link', { name });

      expect(link).toHaveAttribute('href', href);
      if (external) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer');
      } else {
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
      }
    }

    expect(document.querySelector('[data-visit-pending]')).toBeNull();
  });
});

describe('VisitInformation', () => {
  it('links the address to Maps, displays the phone number, and shows daily hours', () => {
    const { container } = render(
      <VisitInformation
        address={businessProfile.address}
        callHref={conversionLinks.call}
        copy={informationCopy}
        daily="Daily"
        hours={businessProfile.openingHours.timeRange}
        mapsHref={conversionLinks.maps}
        phoneDisplay={businessProfile.phoneDisplay}
      />,
    );

    const address = within(container).getByRole('link', {
      name: businessProfile.address,
    });
    expect(address).toHaveAttribute('href', conversionLinks.maps);
    expect(address).toHaveAttribute('target', '_blank');
    expect(address).toHaveAttribute('rel', 'noreferrer');

    const phone = within(container).getByRole('link', {
      name: businessProfile.phoneDisplay,
    });
    expect(phone).toHaveAttribute('href', conversionLinks.call);
    expect(phone).not.toHaveAttribute('target');
    expect(phone).not.toHaveAttribute('rel');

    expect(
      within(container).getByText(
        `Daily ${businessProfile.openingHours.timeRange}`,
      ),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('a')).toHaveLength(2);
    expect(container.querySelector('[data-visit-pending]')).toBeNull();
  });
});
