import { describe, expect, it } from 'vitest';

import {
  businessProfile,
  externalDestinations,
} from '@/lib/business-profile';

describe('verified NAVIDO business profile', () => {
  it('stores the owner-approved identity and visit facts', () => {
    expect(businessProfile).toEqual({
      displayName: 'NAVIDO Specialty Coffee',
      address:
        '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh',
      openingHours: '07:00–22:00 hằng ngày',
      phoneDisplay: '0368 979 361',
      phoneE164: '+84368979361',
      email: 'navidocf@gmail.com',
      siteUrl: null,
    });
  });

  it('stores only verified external destinations', () => {
    expect(externalDestinations).toEqual({
      maps:
        'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
      grabFood:
        'https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA',
      facebook:
        'https://www.facebook.com/navidocoffeetea?locale=vi_VN',
      instagram: 'https://www.instagram.com/navidocoffee/?hl=en',
      zalo: 'https://zalo.me/84368979361',
    });
  });

  it('does not invent a production domain or roaster specification', () => {
    expect(businessProfile.siteUrl).toBeNull();
    expect(JSON.stringify({ businessProfile, externalDestinations })).not.toMatch(
      /vercel\.app|roasterModel|batchCapacity|5–15/i,
    );
  });
});
