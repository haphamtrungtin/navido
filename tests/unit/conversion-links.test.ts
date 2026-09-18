import { describe, expect, it } from 'vitest';

import { businessProfile, externalDestinations } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';

describe('NAVIDO conversion links', () => {
  it('derives native links from verified profile facts', () => {
    expect(conversionLinks.call).toBe(`tel:${businessProfile.phoneE164}`);
    expect(conversionLinks.email).toBe(`mailto:${businessProfile.email}`);
  });

  it('exposes every verified external destination without rewriting it', () => {
    expect(conversionLinks.maps).toBe(externalDestinations.maps);
    expect(conversionLinks.grabFood).toBe(externalDestinations.grabFood);
    expect(conversionLinks.facebook).toBe(externalDestinations.facebook);
    expect(conversionLinks.instagram).toBe(externalDestinations.instagram);
    expect(conversionLinks.zalo).toBe(externalDestinations.zalo);
  });
});
