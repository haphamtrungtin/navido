import type { MetadataRoute } from 'next';

import { buildRobots } from '@/lib/metadata';
import { initialVisitBusinessConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return buildRobots(initialVisitBusinessConfig.siteUrl);
}
