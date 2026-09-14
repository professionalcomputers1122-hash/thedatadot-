import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | The Data Dot",
  description:
    "Learn about The Data Dot, our mission, vision, values, and how we help businesses stay secure and productive with reliable IT solutions.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
