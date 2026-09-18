import { businessProfile, externalDestinations } from './business-profile';

export const conversionLinks = {
  call: `tel:${businessProfile.phoneE164}`,
  email: `mailto:${businessProfile.email}`,
  ...externalDestinations,
} as const;

export type ConversionLinks = typeof conversionLinks;
