import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — Net Worth Percentile Calculator",
  description:
    "How we calculate net worth percentiles. Data source, interpolation method, and limitations.",
  alternates: {
    canonical: "https://networthrank.com/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <>
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
          <Link
            href="/"
            className="font-bold text-lg tracking-tight"
            style={{ color: "var(--text)", textDecoration: "none" }}
          >
            <span className="text-gradient-1">networth</span>rank.com
          </Link>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Data: Federal Reserve 2022 SCF
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          &larr; Back to calculator
        </Link>

        <h1 className="text-3xl font-black mb-2">Methodology</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          How this calculator works and where the data comes from.
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
              Data source
            </h2>
            <p>
              All percentile benchmarks are derived from the{" "}
              <a
                href="https://www.federalreserve.gov/econres/scfindex.htm"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber-500)", textDecoration: "none" }}
              >
                Federal Reserve 2022 Survey of Consumer Finances (SCF)
              </a>
              , published October 2023.
            </p>
            <p className="mt-3">
              The SCF is conducted every three years by the Federal Reserve Board. It is
              the most comprehensive source of US household wealth data available,
              surveying over 4,500 households with deliberate oversampling of high-wealth
              households to ensure accuracy at the top of the distribution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
              Percentile calculation
            </h2>
            <p>
              We use key percentile breakpoints from the 2022 SCF (10th, 25th, 50th,
              75th, 90th, 95th, 99th) for each age bracket. For net worth values between
              these breakpoints, we apply linear interpolation to estimate the percentile.
            </p>
            <p className="mt-3">
              For example: if the 50th percentile for ages 35-44 is $135,000 and the 75th
              percentile is $385,000, a net worth of $260,000 would be approximately at the
              62nd percentile (halfway between 50 and 75 on a linear scale).
            </p>
            <p className="mt-3">
              This method produces accurate estimates near the known breakpoints and
              approximations between them. Results are rounded to the nearest whole
              percentile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
              Age brackets
            </h2>
            <p>
              The SCF groups household wealth by age of the household head: Under 35,
              35-44, 45-54, 55-64, 65-74, and 75 and older. This calculator uses the same
              groupings. If your household has two earners, use the age of the primary
              earner or financial decision-maker.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
              Limitations
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                SCF data is collected every three years. The 2022 data reflects conditions
                as of early 2022, before the full impact of 2022-2023 interest rate changes.
              </li>
              <li>
                Percentiles represent household net worth, not individual net worth. For
                couples, total household assets and debts should be combined.
              </li>
              <li>
                Very high net worth values (above the 99th percentile) use the top known
                breakpoint as a ceiling; actual percentiles for extreme values may differ.
              </li>
              <li>
                This tool does not store any data you enter. All calculations happen
                entirely in your browser.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
              Not financial advice
            </h2>
            <p>
              This calculator provides context for understanding your net worth relative to
              US households. It does not constitute financial advice, investment advice, or
              any recommendation to take or refrain from taking any action. Consult a
              licensed financial advisor for personalized guidance.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            Back to calculator
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>Data: 2022 Federal Reserve Survey of Consumer Finances.</p>
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
        </div>
      </footer>
    </>
  );
}
