import type { BusinessProfile, ExternalDestinations } from './business-profile';

type LocalBusinessStructuredData = Readonly<Record<string, unknown>>;

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

function splitAddress(address: string) {
  const parts = address.split(',').map((part) => part.trim());
  const addressLocality = parts.at(-1) ?? address;
  const streetAddress = parts.slice(0, -1).join(', ');

  return { addressLocality, streetAddress };
}

function splitHours(timeRange: string) {
  const [opens, closes] = timeRange.split(/[^0-9:]+/).filter(Boolean);

  return { closes, opens };
}

export function buildLocalBusinessStructuredData(
  profile: BusinessProfile,
  destinations: ExternalDestinations,
): LocalBusinessStructuredData {
  const { addressLocality, streetAddress } = splitAddress(profile.address);
  const { closes, opens } = splitHours(profile.openingHours.timeRange);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
      addressLocality,
      streetAddress,
    },
    email: profile.email,
    hasMap: destinations.maps,
    name: profile.displayName,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      closes,
      dayOfWeek: daysOfWeek,
      opens,
    },
    sameAs: [destinations.facebook, destinations.instagram],
    telephone: profile.phoneE164,
  };

  if (profile.siteUrl !== null) {
    const origin = new URL(profile.siteUrl).origin;
    data['@id'] = `${origin}/#cafe`;
    data.url = origin;
  }

  return data;
}
