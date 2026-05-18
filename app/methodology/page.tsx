import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — Take-Home Pay Calculator",
  description: "How we calculate take-home pay. Tax brackets, FICA rates, state tax methodology, and limitations.",
  alternates: { canonical: "https://netpaytool.com/methodology" },
};

export default function MethodologyPage() {
  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(9,9,11,0.95)", borderColor: "var(--border)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight" style={{ color: "var(--text)", textDecoration: "none" }}>
            <span className="text-gradient-1">netpay</span>tool.com
          </Link>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>2024 IRS Tax Brackets</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
          &larr; Back to calculator
        </Link>

        <h1 className="text-3xl font-black mb-2">Methodology</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>How this calculator works and where the data comes from.</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Federal income tax</h2>
            <p>We use the 2024 IRS federal income tax brackets (Rev. Proc. 2023-34) and apply the standard deduction before calculating tax: $14,600 for single filers, $29,200 for married filing jointly, and $21,900 for head of household. The standard deduction is taken before applying brackets — the same method used on Form 1040.</p>
            <p className="mt-3">Tax is calculated progressively across each bracket. Only income in each bracket is taxed at that bracket&apos;s rate.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>FICA taxes</h2>
            <p>Social Security is 6.2% on wages up to $168,600 (2024 wage base). Medicare is 1.45% on all wages, plus an additional 0.9% on wages over $200,000 (single) or $250,000 (married filing jointly) — the Additional Medicare Tax under the ACA.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>State income tax</h2>
            <p>State income tax uses a simplified effective rate for each state based on Tax Foundation 2024 data. Nine states have no income tax: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. For other states, we apply a flat effective rate approximation rather than full graduated bracket calculations.</p>
            <p className="mt-3">This means state tax estimates are approximations — actual state tax can differ based on state-specific deductions, credits, and local taxes not captured here.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Limitations</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Pre-tax deductions (401k contributions, health insurance premiums, HSA contributions) are not accounted for. These reduce your taxable income and would increase your actual take-home pay.</li>
              <li>Local city and county income taxes are not included.</li>
              <li>State tax uses effective rate estimates, not full graduated state bracket calculations.</li>
              <li>This tool does not store any data you enter. All calculations happen in your browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>Not tax advice</h2>
            <p>This calculator provides estimates for informational purposes only. It does not constitute tax advice. For accurate withholding, consult your payroll department or a licensed tax professional.</p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="btn-primary-gold" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            Back to calculator
          </Link>
        </div>
      </main>

      <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>2024 IRS federal tax brackets.</p>
            <p>More tools at{" "}
              <a href="https://calcmoney.io" target="_blank" rel="noopener noreferrer" style={{ color: "#22C55E", textDecoration: "none" }}>CalcMoney.io</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
