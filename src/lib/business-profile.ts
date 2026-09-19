import { getConfiguredSiteUrl } from './site-url';

export type BusinessProfile = Readonly<{
  displayName: string;
  address: string;
  openingHours: Readonly<{
    openDaily: true;
    timeRange: '07:00–22:00';
  }>;
  phoneDisplay: string;
  phoneE164: `+${number}`;
  email: `${string}@${string}`;
  siteUrl: string | null;
}>;

export type ExternalDestinations = Readonly<{
  maps: string;
  grabFood: string;
  facebook: string;
  instagram: string;
  zalo: string;
}>;

export const businessProfile: BusinessProfile = {
  displayName: 'NAVIDO Specialty Coffee',
  address:
    '23 Khu Phố Nam Quang 1, Phú Mỹ Hưng, phường Tân Hưng, TP. Hồ Chí Minh',
  openingHours: { openDaily: true, timeRange: '07:00–22:00' },
  phoneDisplay: '0368 979 361',
  phoneE164: '+84368979361',
  email: 'navidocf@gmail.com',
  siteUrl: getConfiguredSiteUrl(),
};

export const externalDestinations: ExternalDestinations = {
  maps: 'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
  grabFood:
    'https://food.grab.com/vn/vi/restaurant/navido-coffee-roaster-delivery/5-C7WALGCHALJKRA',
  facebook: 'https://www.facebook.com/navidocoffeetea?locale=vi_VN',
  instagram: 'https://www.instagram.com/navidocoffee/?hl=en',
  zalo: 'https://zalo.me/84368979361',
};
