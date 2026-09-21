import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/customer/",
        "/technician/",
        "/super-admin/",
        "/portal/",
        "/api/",
      ],
    },
    sitemap: "https://www.thedatadot.com/sitemap.xml",
  };
}
