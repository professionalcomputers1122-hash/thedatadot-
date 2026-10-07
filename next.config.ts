import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      // Common legacy aliases & WordPress migration redirects
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/policies",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/policies",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/policies",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/policies",
        permanent: true,
      },
      {
        source: "/data-recovery-services",
        destination: "/data-recovery",
        permanent: true,
      },
      {
        source: "/hard-drive-recovery",
        destination: "/data-recovery",
        permanent: true,
      },
      {
        source: "/ssd-recovery",
        destination: "/data-recovery",
        permanent: true,
      },
      {
        source: "/raid-recovery",
        destination: "/data-recovery",
        permanent: true,
      },
      {
        source: "/cyber-security",
        destination: "/security",
        permanent: true,
      },
      {
        source: "/cybersecurity",
        destination: "/security",
        permanent: true,
      },
      {
        source: "/cloud-solutions",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/managed-it-services",
        destination: "/services",
        permanent: true,
      },
      // Legacy WordPress feeds, archives, and sample pages
      {
        source: "/sample-page",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/feed",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/feed/:path*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/category/:slug*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/tag/:slug*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/author/:slug*",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
