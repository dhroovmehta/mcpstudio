import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mcpstudio.vercel.app';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: '2026-03-21',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: '2026-03-21',
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: '2026-03-21',
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Blog pages
  const blogSlugs = [
    'best-mcp-development-tools',
    'build-mcp-server-guide',
  ];

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: '2026-03-21',
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}
