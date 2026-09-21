import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabaseServer";

const BASE_URL = "https://www.thedatadot.com";

const DEFAULT_BLOG_SLUGS = [
  "cybersecurity-tips",
  "cloud-solutions-benefits",
  "choose-it-partner",
  "data-backups-guide",
  "microsoft-365-security",
  "office-network-speed",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/data-recovery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/security`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/industries`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/onboarding`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogSlugs = new Set<string>(DEFAULT_BLOG_SLUGS);

  try {
    const supabase = createAdminClient();
    const { data: dbPosts } = await supabase
      .from("blog_posts")
      .select("id, status")
      .eq("status", "Published");

    if (dbPosts && Array.isArray(dbPosts)) {
      for (const post of dbPosts) {
        if (post?.id) {
          blogSlugs.add(post.id);
        }
      }
    }
  } catch (err) {
    console.warn("[sitemap.ts] Supabase fetch warning, using static fallback:", err);
  }

  const blogRoutes: MetadataRoute.Sitemap = Array.from(blogSlugs).map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
