import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT Services | The Data Dot",
  description:
    "Comprehensive IT services for your business needs: Managed IT, Cybersecurity, Cloud & Microsoft 365, Networks, Backup & Disaster Recovery, and IT Consulting.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
