import type { MetadataRoute } from 'next';

import { buildSitemap } from '@/lib/metadata';
import { initialVisitBusinessConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(initialVisitBusinessConfig.siteUrl);
}
