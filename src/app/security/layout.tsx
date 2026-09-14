import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance | The Data Dot",
  description:
    "Enterprise-grade cybersecurity, Zero Trust architecture, threat protection, data encryption, and regulatory compliance from The Data Dot.",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
