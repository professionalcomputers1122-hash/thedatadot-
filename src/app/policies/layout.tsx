import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Policies | The Data Dot",
  description:
    "Transparency and trust: Privacy Policy, Cookie Policy, Terms of Service, Service Level Agreement (SLA), and Acceptable Use Policy.",
};

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
