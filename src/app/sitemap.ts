import type { MetadataRoute } from 'next';

import { businessProfile } from '@/lib/business-profile';
import { buildSitemap } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(businessProfile.siteUrl);
}
