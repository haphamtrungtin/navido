import type { MetadataRoute } from 'next';

import { businessProfile } from '@/lib/business-profile';
import { buildRobots } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  return buildRobots(businessProfile.siteUrl);
}
