import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.thedatadot.com"),
  title: "The Data Dot | IT Support, Cybersecurity & Cloud Solutions",
  description:
    "Professional IT support, cybersecurity, cloud, and technology solutions for modern businesses.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "The Data Dot | IT Support, Cybersecurity & Cloud Solutions",
    description:
      "Professional IT support, cybersecurity, cloud, and technology solutions for modern businesses.",
    url: "https://www.thedatadot.com",
    siteName: "The Data Dot",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "The Data Dot Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "The Data Dot",
  url: "https://www.thedatadot.com",
  logo: "https://www.thedatadot.com/logo.png",
  image: "https://www.thedatadot.com/icon-512.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-6380488373",
    contactType: "customer service",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
        <CookieConsentBanner />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
