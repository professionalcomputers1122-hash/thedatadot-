import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Internal portal dashboards & private endpoints
        "/admin/",
        "/customer/",
        "/technician/",
        "/super-admin/",
        "/portal/",
        "/api/",
        // Legacy WordPress crawl paths
        "/wp-admin/",
        "/wp-includes/",
        "/wp-content/",
        "/xmlrpc.php",
        "/wp-login.php",
        "/*?replytocom=*",
        "/trackback/",
      ],
    },
    sitemap: "https://www.thedatadot.com/sitemap.xml",
  };
}
