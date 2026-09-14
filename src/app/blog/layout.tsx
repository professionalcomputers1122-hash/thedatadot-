import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Insights & IT Blog | The Data Dot",
  description:
    "Practical tips, news, cybersecurity guides, and cloud updates from the engineering team at The Data Dot.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
