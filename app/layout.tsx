import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Take-Home Pay Calculator — Net Pay After Taxes",
  description:
    "Calculate your exact take-home pay after federal, state, and FICA taxes. All 50 states. 2024 tax brackets. Free, no sign-up.",
  metadataBase: new URL("https://netpaytool.com"),
  openGraph: {
    title: "Take-Home Pay Calculator",
    description: "See your exact net pay after all taxes. All 50 states, 2024 brackets.",
    url: "https://netpaytool.com",
    siteName: "netpaytool.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Take-Home Pay Calculator",
    description: "See your exact net pay after federal, state, and FICA taxes.",
  },
  alternates: {
    canonical: "https://netpaytool.com",
  },
  verification: {
    google: "_KltCpzlVEgeRJqOA0WosRMxk_eDtrgw3N5tVgzY-30",
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
