import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const clashDisplay = localFont({
  src: "../assets/fonts/ClashDisplay-Semibold.ttf",
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Take-Home Pay Calculator — Net Pay After Taxes",
  description:
    "Calculate your exact take-home pay after federal, state, and FICA taxes. All 50 states. 2025 tax brackets. Free, no sign-up.",
  metadataBase: new URL("https://netpaytool.com"),
  openGraph: {
    title: "Take-Home Pay Calculator",
    description: "See your exact net pay after all taxes. All 50 states, 2025 brackets.",
    url: "https://netpaytool.com",
    siteName: "netpaytool.com",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Take-Home Pay Calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Take-Home Pay Calculator",
    description: "See your exact net pay after federal, state, and FICA taxes.",
    images: ["/og.png"],
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
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || 'G-PDXEK5JF9E';
  return (
    <html lang="en" className={`${clashDisplay.variable} ${plusJakartaSans.variable}`}>
      <head>
        {/* @ts-expect-error impact.com requires non-standard value= attribute */}
        <meta name="impact-site-verification" value="0cbf041c-77fc-472f-9ccc-24c250573ed3" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','${ga4Id}',{page_path:window.location.pathname});
        `}</Script>
      </body>
    </html>
  );
}
