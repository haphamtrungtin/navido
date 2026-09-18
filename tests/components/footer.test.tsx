import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Footer } from '@/components/layout/footer';
import { businessProfile } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';
import type { FooterCopy } from '@/lib/site-config';

const footerCopy: FooterCopy = {
  address: 'Address',
  daily: 'Daily',
  email: 'Email',
  facebook: 'Facebook',
  grabFood: 'Order on GrabFood',
  hours: 'Hours',
  instagram: 'Instagram',
  maps: 'Open Google Maps',
  phone: 'Phone',
  zalo: 'Zalo',
};

afterEach(cleanup);

describe('Footer', () => {
  it('renders verified business details with native contact semantics', () => {
    render(
      <Footer
        businessProfile={businessProfile}
        conversionLinks={conversionLinks}
        copy={footerCopy}
      />,
    );

    const address = screen.getByRole('contentinfo').querySelector('address');
    expect(address).not.toBeNull();
    const contactDetails = within(address as HTMLElement);

    expect(contactDetails.getByText(businessProfile.displayName)).toBeVisible();
    expect(contactDetails.getByText(businessProfile.address)).toBeVisible();
    expect(
      contactDetails.getByText(
        `${footerCopy.daily} ${businessProfile.openingHours.timeRange}`,
      ),
    ).toBeVisible();
    expect(
      contactDetails.getByRole('link', { name: businessProfile.phoneDisplay }),
    ).toHaveAttribute('href', conversionLinks.call);
    expect(
      contactDetails.getByRole('link', { name: businessProfile.email }),
    ).toHaveAttribute('href', conversionLinks.email);
  });

  it.each([
    ['Open Google Maps', conversionLinks.maps],
    ['Order on GrabFood', conversionLinks.grabFood],
    ['Facebook', conversionLinks.facebook],
    ['Instagram', conversionLinks.instagram],
    ['Zalo', conversionLinks.zalo],
  ])('renders %s as a safe external destination', (label, href) => {
    render(
      <Footer
        businessProfile={businessProfile}
        conversionLinks={conversionLinks}
        copy={footerCopy}
      />,
    );

    const link = screen.getByRole('link', { name: label });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });
});
