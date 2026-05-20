import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — netpaytool.com",
  description: "Privacy policy for netpaytool.com. We don't store your salary or tax data.",
  alternates: { canonical: "https://netpaytool.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16" style={{ color: "var(--text-secondary)" }}>
      <h1 className="text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
        Last updated: May 2025
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          What we collect
        </h2>
        <p className="leading-relaxed mb-3">
          <strong>Nothing you type into the calculator is stored.</strong> All take-home pay
          calculations run entirely in your browser. No salary figures, tax withholdings, or
          any other inputs are transmitted to our servers.
        </p>
        <p className="leading-relaxed">
          We do collect anonymous usage data through Google Analytics 4 (page views, session
          duration, device type). This data contains no personally identifiable information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Advertising
        </h2>
        <p className="leading-relaxed mb-3">
          This site uses Google AdSense to display ads. Google may use cookies to show you
          ads based on your prior visits to this site and other sites. You can opt out of
          personalized advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#22C55E" }}
          >
            Google Ads Settings
          </a>
          .
        </p>
        <p className="leading-relaxed">
          We do not control the content of ads served by Google AdSense.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Cookies
        </h2>
        <p className="leading-relaxed">
          We use Google Analytics cookies to understand aggregate site usage. Google AdSense
          may also set cookies for ad personalization. You can disable cookies in your browser
          settings at any time, though some site features may be affected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Third-party links
        </h2>
        <p className="leading-relaxed">
          This site links to CalcMoney.io and other financial tools. We are not responsible
          for the privacy practices of those sites.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Children
        </h2>
        <p className="leading-relaxed">
          This site is not directed at children under 13. We do not knowingly collect data
          from children.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Contact
        </h2>
        <p className="leading-relaxed">
          Questions about this policy:{" "}
          <a href="mailto:privacy@netpaytool.com" style={{ color: "#22C55E" }}>
            privacy@netpaytool.com
          </a>
        </p>
      </section>
    </main>
  );
}
