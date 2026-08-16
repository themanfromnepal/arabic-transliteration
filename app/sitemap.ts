import type { MetadataRoute } from 'next';

import { SITE_ROUTES, SITE_URL } from '@/src/lib/site';

// Generated into the static export as /sitemap.xml.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === '/' ? '' : route}`,
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.6,
  }));
}
