import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Net Worth Percentile Calculator — Where Do You Rank?",
  description:
    "Find out where your net worth ranks among Americans your age. Uses Federal Reserve 2022 Survey of Consumer Finances data. Free, no sign-up.",
  metadataBase: new URL("https://networthrank.com"),
  openGraph: {
    title: "Net Worth Percentile Calculator",
    description:
      "See where your net worth ranks among Americans your age. Federal Reserve data.",
    url: "https://networthrank.com",
    siteName: "networthrank.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Net Worth Percentile Calculator",
    description: "See where your net worth ranks among Americans your age.",
  },
  alternates: {
    canonical: "https://networthrank.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
