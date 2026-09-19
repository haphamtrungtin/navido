import { describe, expect, it } from 'vitest';

import { businessProfile, externalDestinations } from '@/lib/business-profile';
import { buildLocalBusinessStructuredData } from '@/lib/structured-data';

describe('NAVIDO local business structured data', () => {
  it('emits verified store facts without inventing an origin', () => {
    const data = buildLocalBusinessStructuredData(
      businessProfile,
      externalDestinations,
    );

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'CafeOrCoffeeShop',
      name: 'NAVIDO Specialty Coffee',
      telephone: '+84368979361',
      email: 'navidocf@gmail.com',
      hasMap: externalDestinations.maps,
      sameAs: [externalDestinations.facebook, externalDestinations.instagram],
    });
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng',
      addressLocality: 'TP. Hồ Chí Minh',
      addressCountry: 'VN',
    });
    expect(data.openingHoursSpecification).toEqual({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '07:00',
      closes: '22:00',
    });
    expect(JSON.stringify(data)).not.toMatch(
      /vercel|roasterModel|batchCapacity/i,
    );
  });

  it('omits an unverified production URL', () => {
    const data = buildLocalBusinessStructuredData(
      businessProfile,
      externalDestinations,
    );

    expect(data).not.toHaveProperty('url');
    expect(data).not.toHaveProperty('@id');
  });
});
