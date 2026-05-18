import Calculator from "./Calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Net Worth Percentile Calculator — Where Do You Rank?",
  description:
    "Find out where your net worth ranks among Americans your age. Uses Federal Reserve 2022 Survey of Consumer Finances data. Free, no sign-up.",
};

const faqItems = [
  {
    q: "What counts as net worth?",
    a: "Net worth is the total value of everything you own minus everything you owe. Assets include your home equity (market value minus mortgage balance), investment accounts, retirement accounts (401k, IRA), savings, and any other valuables. Debts include your mortgage balance, student loans, auto loans, credit card balances, and other liabilities. Negative net worth is common, especially for people under 35 still paying down student debt.",
  },
  {
    q: "Where does this data come from?",
    a: "All percentile data is sourced from the Federal Reserve 2022 Survey of Consumer Finances (SCF), published October 2023. The SCF is the gold standard for US household wealth data, conducted every three years by the Federal Reserve. It surveys over 4,500 households and oversamples high-wealth households for accuracy at the top of the distribution.",
  },
  {
    q: "What is a good net worth at my age?",
    a: "There is no universal benchmark, but the Federal Reserve SCF gives context. The median American household net worth is $192,700 across all ages (2022). At age 35-44, the median is $135,000. At 45-54, it's $248,000. By 65-74, it's $410,000. A net worth above the 75th percentile for your age group means you are ahead of three-quarters of Americans your age.",
  },
  {
    q: "Why does age matter for net worth comparisons?",
    a: "Net worth compounds over time. A 28-year-old with $50,000 and a 60-year-old with $50,000 are in completely different situations. Comparing yourself to your age group gives a much more meaningful picture than a flat national average, which is skewed heavily by older, higher-wealth households.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Net Worth Percentile Calculator",
  url: "https://networthrank.com",
  description:
    "Calculate where your net worth ranks among Americans your age using Federal Reserve 2022 SCF data.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(9,9,11,0.95)",
          borderColor: "var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="font-bold text-lg tracking-tight"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            <span className="text-gradient-1">networth</span>rank.com
          </a>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Data: Federal Reserve 2022 SCF
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1
            className="font-black mb-3 leading-tight"
            style={{ fontSize: "clamp(28px, 6vw, 42px)" }}
          >
            Net Worth Percentile
            <br />
            <span className="text-gradient-1">Calculator</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Enter your net worth and age. See exactly where you rank among
            Americans your age using{" "}
            <a
              href="/methodology"
              style={{ color: "var(--amber-500)", textDecoration: "none" }}
            >
              Federal Reserve data
            </a>
            .
          </p>
          <div
            className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span className="live-dot" />
            <span className="terminal-label" style={{ letterSpacing: "0.08em" }}>
              Free. No sign-up. No data collected.
            </span>
          </div>
        </div>

        {/* Calculator */}
        <Calculator />

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              Data: 2022 Federal Reserve Survey of Consumer Finances.{" "}
              <a href="/methodology" style={{ color: "var(--amber-500)", textDecoration: "none" }}>
                Methodology &rarr;
              </a>
            </p>
            <p>
              More tools at{" "}
              <a
                href="https://calcmoney.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber-500)", textDecoration: "none" }}
              >
                CalcMoney.io
              </a>
            </p>
          </div>
          <p className="mt-3 text-xs">
            Not financial advice. Net worth percentiles are calculated from household survey data
            and are estimates. &copy; {new Date().getFullYear()} networthrank.com
          </p>
        </div>
      </footer>
    </>
  );
}
