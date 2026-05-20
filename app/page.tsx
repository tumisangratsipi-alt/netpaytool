import Calculator from "./Calculator";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Take-Home Pay Calculator — Net Pay After Taxes",
  description:
    "Calculate your exact take-home pay after federal, state, and FICA taxes. All 50 states. 2024 tax brackets. Free, no sign-up.",
};

const faqItems = [
  {
    q: "What taxes are deducted from my paycheck?",
    a: "Four main taxes come out of every paycheck: federal income tax (based on your income bracket and filing status), Social Security tax (6.2% up to $168,600), Medicare tax (1.45% on all wages, plus 0.9% over $200,000), and state income tax if your state has one. Nine states have no income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming.",
  },
  {
    q: "Why is my take-home pay different from what this calculator shows?",
    a: "This calculator uses the 2024 standard deduction and effective state tax rates. Your actual paycheck may differ based on: pre-tax deductions (401k, health insurance, HSA), additional W-4 withholding elections, local city or county taxes, and state-specific deductions. Use this as an estimate — your payroll department has the exact numbers.",
  },
  {
    q: "What is the difference between gross pay and net pay?",
    a: "Gross pay is your total salary before any deductions. Net pay (take-home pay) is what you actually receive after federal income tax, FICA taxes (Social Security and Medicare), and state income tax are withheld. For most Americans earning $50,000-$150,000, net pay is roughly 65-75% of gross pay depending on their state.",
  },
  {
    q: "How does filing status affect my take-home pay?",
    a: "Filing status determines your tax bracket thresholds and standard deduction. Married filing jointly gets a $29,200 standard deduction (2024) versus $14,600 for single filers — meaning married couples shelter more income from federal tax. Head of household gets a $21,900 deduction. For the same gross salary, a married filer will typically take home more than a single filer.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Take-Home Pay Calculator",
  url: "https://netpaytool.com",
  description:
    "Calculate your net pay after federal, state, and FICA taxes for all 50 states.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(9,9,11,0.95)", borderColor: "var(--border)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-lg tracking-tight flex items-center gap-2" style={{ color: "var(--text-primary)", textDecoration: "none" }}>
            <img src="/logo.png" alt="NetPayTool logo" style={{ height: "28px", width: "auto" }} />
            <span className="text-gradient-1">netpay</span>tool.com
          </a>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>2024 IRS Tax Brackets</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1 className="font-black mb-3 leading-tight" style={{ fontSize: "clamp(28px, 6vw, 42px)" }}>
            Take-Home Pay
            <br />
            <span className="text-gradient-1">Calculator</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Enter your salary, filing status, and state. See your exact net pay after{" "}
            <Link href="/methodology" style={{ color: "#22C55E", textDecoration: "none" }}>
              federal and state taxes
            </Link>
            .
          </p>
          <div
            className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-default)" }}
          >
            <span className="live-dot" />
            <span className="terminal-label" style={{ letterSpacing: "0.08em" }}>
              Free. No sign-up. No data collected.
            </span>
          </div>
        </div>

        <Calculator />

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              2024 IRS federal tax brackets.{" "}
              <Link href="/methodology" style={{ color: "#22C55E", textDecoration: "none" }}>
                Methodology &rarr;
              </Link>
            </p>
            <p>
              More tools at{" "}
              <a href="https://calcmoney.io" target="_blank" rel="noopener noreferrer" style={{ color: "#22C55E", textDecoration: "none" }}>
                CalcMoney.io
              </a>
            </p>
          </div>
          <p className="mt-3 text-xs">
            Not financial or tax advice. Results are estimates based on standard deductions and effective state rates. &copy; {new Date().getFullYear()} netpaytool.com
            {" · "}
            <a href="/privacy" style={{ color: "#22C55E", textDecoration: "none" }}>Privacy</a>
          </p>
        </div>
      </footer>
    </>
  );
}
