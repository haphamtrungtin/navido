import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { conversionLinks } from '@/lib/conversion-links';
import { VisitMap } from '@/sections/visit/visit-map';

describe('VisitMap', () => {
  it('links the map card safely while retaining its local image and caption', () => {
    const { container } = render(
      <VisitMap
        alt="Map of NAVIDO"
        caption="Plan your route with Google Maps."
        href={conversionLinks.maps}
        linkLabel="Open Google Maps"
        title="Map"
      />,
    );

    const mapLink = screen.getByRole('link', { name: 'Open Google Maps' });
    expect(mapLink).toHaveAttribute('href', conversionLinks.maps);
    expect(mapLink).toHaveAttribute('target', '_blank');
    expect(mapLink).toHaveAttribute('rel', 'noreferrer');
    expect(screen.getByRole('img', { name: 'Map of NAVIDO' })).toHaveAttribute(
      'src',
      expect.stringContaining('visit-map-placeholder.jpg'),
    );
    expect(screen.getByText('Plan your route with Google Maps.')).toBeVisible();
    expect(container.querySelector('[data-visit-pending]')).toBeNull();
  });
});
