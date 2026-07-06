import type { Metadata } from "next";
import Calculator from "@/app/Calculator";
import {
  STATE_NAMES,
  STATE_TAX_RATES,
  calculateTax,
  getNetForPeriod,
  formatCurrencyFull,
  formatPercent,
} from "@/lib/tax-data";

export const dynamic = "force-static";

// The 20 salary tiers this route covers
const SALARY_TIERS = [
  30000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000,
  80000, 90000, 100000, 110000, 120000, 130000, 150000, 175000,
  200000, 250000, 300000,
];

// Slug → number: "75000" → 75000
function parseSalarySlug(slug: string): number | null {
  const n = parseInt(slug, 10);
  if (isNaN(n) || !SALARY_TIERS.includes(n)) return null;
  return n;
}

// Slug → state code: "ca" → "CA"
const SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.keys(STATE_NAMES).map((code) => [code.toLowerCase(), code])
);

export function generateStaticParams() {
  const params: { salary: string; state: string }[] = [];
  for (const salary of SALARY_TIERS) {
    for (const code of Object.keys(STATE_NAMES)) {
      params.push({ salary: String(salary), state: code.toLowerCase() });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ salary: string; state: string }>;
}): Promise<Metadata> {
  const { salary: salarySlug, state: stateSlug } = await params;
  const salary = parseSalarySlug(salarySlug);
  const code = SLUG_TO_CODE[stateSlug];
  if (!salary || !code) return {};

  const name = STATE_NAMES[code];
  const result = calculateTax(salary, "single", code);
  const takehome = formatCurrencyFull(result.netAnnual);
  const gross = formatCurrencyFull(salary);

  return {
    title: `${gross} Salary in ${name} — Take-Home Pay Calculator`,
    description: `A ${gross} salary in ${name} takes home ${takehome} per year after federal and state taxes. See your bi-weekly, monthly, and annual take-home pay breakdown.`,
    alternates: {
      canonical: `https://netpaytool.com/${salarySlug}/${stateSlug}`,
    },
    openGraph: {
      title: `${gross} in ${name}: ${takehome} Take-Home Pay`,
      description: `Federal tax, ${name} state tax, FICA — see every deduction on a ${gross} salary.`,
      url: `https://netpaytool.com/${salarySlug}/${stateSlug}`,
    },
  };
}

// Nearby salary tiers for cross-linking
function getNearbyTiers(salary: number): number[] {
  const idx = SALARY_TIERS.indexOf(salary);
  const nearby: number[] = [];
  if (idx > 0) nearby.push(SALARY_TIERS[idx - 1]);
  if (idx < SALARY_TIERS.length - 1) nearby.push(SALARY_TIERS[idx + 1]);
  if (idx > 1) nearby.push(SALARY_TIERS[idx - 2]);
  if (idx < SALARY_TIERS.length - 2) nearby.push(SALARY_TIERS[idx + 2]);
  return nearby.slice(0, 4);
}

// Neighboring states for cross-linking (regional clusters)
const REGION_CLUSTERS: Record<string, string[]> = {
  CA: ["OR", "WA", "NV", "AZ"],
  TX: ["OK", "LA", "AR", "NM"],
  NY: ["NJ", "CT", "PA", "MA"],
  FL: ["GA", "SC", "AL"],
  WA: ["OR", "ID", "CA"],
  MA: ["CT", "RI", "NH", "NY"],
  IL: ["IN", "WI", "MO", "IA"],
  PA: ["NJ", "NY", "OH", "MD"],
  OH: ["PA", "IN", "KY", "WV"],
  GA: ["FL", "SC", "NC", "TN"],
  NC: ["SC", "VA", "TN", "GA"],
  MI: ["OH", "IN", "WI"],
  AZ: ["CA", "NV", "NM", "UT"],
  TN: ["KY", "VA", "NC", "GA"],
  MN: ["WI", "IA", "ND", "SD"],
  CO: ["UT", "WY", "NM", "KS"],
  MD: ["VA", "DC", "PA", "DE"],
  VA: ["MD", "DC", "NC", "WV"],
  OR: ["WA", "CA", "ID", "NV"],
  CT: ["NY", "MA", "RI"],
};

function getRelatedStates(code: string): string[] {
  return (REGION_CLUSTERS[code] ?? Object.keys(STATE_NAMES).slice(0, 4)).slice(0, 4);
}

function formatK(n: number): string {
  return n >= 1000 ? `$${n / 1000}k` : `$${n}`;
}

export default async function SalaryStatePage({
  params,
}: {
  params: Promise<{ salary: string; state: string }>;
}) {
  const { salary: salarySlug, state: stateSlug } = await params;
  const salary = parseSalarySlug(salarySlug);
  const code = SLUG_TO_CODE[stateSlug];

  if (!salary || !code) return <div>Not found</div>;

  const name = STATE_NAMES[code];
  const stateRate = STATE_TAX_RATES[code] ?? 0;
  const hasStateTax = stateRate > 0;

  // Calculate for all three filing statuses
  const single = calculateTax(salary, "single", code);
  const married = calculateTax(salary, "married", code);
  const hoh = calculateTax(salary, "hoh", code);

  const gross = formatCurrencyFull(salary);
  const singleNet = formatCurrencyFull(single.netAnnual);

  // Pay period breakdown for single filer (most common query)
  const periods = [
    { label: "Annual", amount: single.netAnnual },
    { label: "Monthly", amount: getNetForPeriod(single.netAnnual, "monthly") },
    { label: "Semi-monthly", amount: getNetForPeriod(single.netAnnual, "semimonthly") },
    { label: "Bi-weekly", amount: getNetForPeriod(single.netAnnual, "biweekly") },
    { label: "Weekly", amount: getNetForPeriod(single.netAnnual, "weekly") },
  ];

  const nearbyTiers = getNearbyTiers(salary);
  const relatedStates = getRelatedStates(code);

  const noTaxStates = ["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"];
  const isNoTaxState = noTaxStates.includes(code);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${gross} Salary in ${name} Take-Home Pay`,
    description: `A ${gross} salary in ${name} yields ${singleNet} take-home per year for a single filer after all taxes.`,
    url: `https://netpaytool.com/${salarySlug}/${stateSlug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "NetPayTool", item: "https://netpaytool.com" },
        { "@type": "ListItem", position: 2, name: `${gross} Salary`, item: `https://netpaytool.com/${salarySlug}` },
        { "@type": "ListItem", position: 3, name: `${name}`, item: `https://netpaytool.com/${salarySlug}/${stateSlug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the take-home pay for a ${gross} salary in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `A ${gross} salary in ${name} takes home approximately ${singleNet} per year for a single filer after federal income tax, ${name} state income tax${hasStateTax ? ` (${formatPercent(stateRate)} effective rate)` : " (none)"}, Social Security, and Medicare. That works out to ${formatCurrencyFull(getNetForPeriod(single.netAnnual, "biweekly"))} bi-weekly or ${formatCurrencyFull(getNetForPeriod(single.netAnnual, "monthly"))} monthly.`,
        },
      },
      {
        "@type": "Question",
        name: `How much federal income tax do you pay on ${gross} in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a ${gross} salary, a single filer pays approximately ${formatCurrencyFull(single.federalTax)} in federal income tax, an effective federal rate of ${formatPercent(single.effectiveFederalRate)}. Married filers pay ${formatCurrencyFull(married.federalTax)} due to the higher standard deduction of $30,000 (2025).`,
        },
      },
      {
        "@type": "Question",
        name: `Does ${name} have state income tax on a ${gross} salary?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: hasStateTax
            ? `Yes. ${name} has a ${formatPercent(stateRate)} effective state income tax rate. On a ${gross} salary, state income tax comes to approximately ${formatCurrencyFull(single.stateTax)} per year.`
            : `No. ${name} has no state income tax. This means your ${gross} salary avoids state-level income tax entirely, keeping an extra ${formatCurrencyFull(salary * 0.05)}-${formatCurrencyFull(salary * 0.09)} per year compared to high-tax states like California or New York.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the effective tax rate on ${gross} in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The total effective tax rate on a ${gross} salary in ${name} is approximately ${formatPercent(single.effectiveTotalRate)} for a single filer. This includes ${formatPercent(single.effectiveFederalRate)} federal income tax, ${hasStateTax ? `${formatPercent(stateRate)} state income tax, ` : "no state income tax, "}6.2% Social Security (up to the wage base), and 1.45% Medicare.`,
        },
      },
    ],
  };

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
          <a
            href="/"
            className="font-bold text-lg tracking-tight flex items-center gap-2"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            <img src="/logo.png" alt="NetPayTool logo" style={{ height: "28px", width: "auto" }} />
            <span className="text-gradient-1">net</span>paytool.com
          </a>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            IRS 2025 Tax Data
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <a href="/" style={{ color: "var(--amber-500)", textDecoration: "none" }}>NetPayTool</a>
          {" / "}
          <span>{gross}</span>
          {" / "}
          <span>{name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-black mb-3 leading-tight" style={{ fontSize: "clamp(22px, 5vw, 36px)" }}>
            {gross} Salary in {name}
            <br />
            <span className="text-gradient-1">Take-Home Pay</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            A {gross} salary in {name} takes home{" "}
            <strong style={{ color: "var(--amber-400)" }}>{singleNet}</strong>{" "}
            per year for a single filer after federal tax, {isNoTaxState ? "no state income tax, " : `${name} state tax, `}
            Social Security, and Medicare. The calculator below lets you adjust filing status and see your exact breakdown.
          </p>
        </div>

        {/* Take-home summary card */}
        <div
          className="gradient-border-result rounded-xl p-6 mb-8"
        >
          <p className="terminal-label mb-4">Take-home pay — single filer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {periods.map((p) => (
              <div
                key={p.label}
                className="flex justify-between items-center px-4 py-3 rounded-lg"
                style={{
                  background: p.label === "Bi-weekly" ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                  border: p.label === "Bi-weekly" ? "1px solid rgba(212,175,55,0.25)" : "1px solid var(--border-subtle)",
                }}
              >
                <span className="terminal-label">{p.label}</span>
                <span className="tabular-gold font-mono font-bold text-sm">
                  {formatCurrencyFull(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tax breakdown table */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Tax breakdown — {gross} in {name}</h2>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th className="text-left px-4 py-3 terminal-label">Deduction</th>
                  <th className="text-right px-4 py-3 terminal-label">Single</th>
                  <th className="text-right px-4 py-3 terminal-label">Married</th>
                  <th className="text-right px-4 py-3 terminal-label">Head of Household</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Gross income", s: single.grossAnnual, m: married.grossAnnual, h: hoh.grossAnnual, bold: false },
                  { label: "Federal income tax", s: single.federalTax, m: married.federalTax, h: hoh.federalTax, bold: false },
                  { label: `${name} state tax`, s: single.stateTax, m: married.stateTax, h: hoh.stateTax, bold: false },
                  { label: "Social Security (6.2%)", s: single.socialSecurity, m: married.socialSecurity, h: hoh.socialSecurity, bold: false },
                  { label: "Medicare (1.45%)", s: single.medicare, m: married.medicare, h: hoh.medicare, bold: false },
                  { label: "Total deductions", s: single.totalDeductions, m: married.totalDeductions, h: hoh.totalDeductions, bold: false },
                  { label: "Net annual take-home", s: single.netAnnual, m: married.netAnnual, h: hoh.netAnnual, bold: true },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < 6 ? "1px solid var(--border-subtle)" : "none",
                      background: row.bold ? "rgba(212,175,55,0.07)" : "transparent",
                    }}
                  >
                    <td className="px-4 py-3" style={{ color: row.bold ? "var(--amber-400)" : "var(--text-secondary)", fontWeight: row.bold ? 700 : 400 }}>
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm tabular-gold">
                      {formatCurrencyFull(row.s)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                      {formatCurrencyFull(row.m)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                      {formatCurrencyFull(row.h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Based on IRS 2025 tax brackets and standard deductions. State tax calculated at the {name} effective rate of {hasStateTax ? formatPercent(stateRate) : "0% (no state income tax)"}.
          </p>
        </section>

        {/* Effective rate callout */}
        <div
          className="mb-8 p-5 rounded-xl"
          style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--amber-500)" }}>
            Effective tax rate
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A single filer earning {gross} in {name} has a <strong style={{ color: "var(--amber-400)" }}>{formatPercent(single.effectiveTotalRate)} total effective tax rate</strong> — {formatPercent(single.effectiveFederalRate)} federal,{" "}
            {hasStateTax ? `${formatPercent(stateRate)} ${name} state, ` : `0% ${name} state (no income tax), `}
            plus 7.65% FICA. The marginal rate on the top dollar of income is higher than the effective rate shown here.
            {isNoTaxState && ` ${name} workers keep an extra ${formatCurrencyFull(salary * 0.05)}-${formatCurrencyFull(salary * 0.09)} per year compared to high-tax states.`}
          </p>
        </div>

        {/* Interactive calculator */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Adjust your numbers</h2>
          <Calculator defaultSalary={salary} defaultState={code} />
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `What is the take-home pay for a ${gross} salary in ${name}?`,
                a: `A ${gross} salary in ${name} takes home approximately ${singleNet} per year for a single filer after all taxes. That is ${formatCurrencyFull(getNetForPeriod(single.netAnnual, "biweekly"))} bi-weekly or ${formatCurrencyFull(getNetForPeriod(single.netAnnual, "monthly"))} per month. Married filers take home more — ${formatCurrencyFull(married.netAnnual)} annually — due to the higher standard deduction.`,
              },
              {
                q: `How much federal income tax do you pay on ${gross} in ${name}?`,
                a: `On a ${gross} salary, a single filer pays ${formatCurrencyFull(single.federalTax)} in federal income tax, an effective federal rate of ${formatPercent(single.effectiveFederalRate)}. Married filers pay ${formatCurrencyFull(married.federalTax)} because the married standard deduction is $30,000 versus $15,000 for single filers (2025).`,
              },
              {
                q: `Does ${name} have state income tax on a ${gross} salary?`,
                a: hasStateTax
                  ? `Yes. ${name} has an effective state income tax rate of ${formatPercent(stateRate)} applied to a ${gross} salary, resulting in ${formatCurrencyFull(single.stateTax)} in state taxes annually.`
                  : `No. ${name} has no state income tax. Your ${gross} salary avoids state income tax entirely. This is a significant advantage over states like California (9.3%) or New York (6.85%), which would take an additional ${formatCurrencyFull(salary * 0.06)}-${formatCurrencyFull(salary * 0.09)} per year.`,
              },
              {
                q: `What is the effective tax rate on ${gross} in ${name}?`,
                a: `The total effective tax rate on a ${gross} salary in ${name} is ${formatPercent(single.effectiveTotalRate)} for a single filer. This includes ${formatPercent(single.effectiveFederalRate)} federal income tax, ${hasStateTax ? `${formatPercent(stateRate)} ${name} state income tax, ` : `0% state income tax, `}6.2% Social Security on wages up to $176,100, and 1.45% Medicare.`,
              },
            ].map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links: nearby salary tiers */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Similar salaries in {name}</h2>
          <div className="grid grid-cols-2 gap-2">
            {nearbyTiers.map((tier) => {
              const tierResult = calculateTax(tier, "single", code);
              return (
                <a
                  key={tier}
                  href={`/${tier}/${stateSlug}`}
                  className="rounded-lg p-3 transition-colors"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", textDecoration: "none" }}
                >
                  <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                    {formatK(tier)} in {name}
                  </p>
                  <p className="text-xs mt-0.5 tabular-gold" style={{ color: "var(--text-muted)" }}>
                    {formatCurrencyFull(tierResult.netAnnual)} take-home
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        {/* Cross-links: same salary in nearby states */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">{gross} salary in other states</h2>
          <div className="grid grid-cols-2 gap-2">
            {relatedStates.map((relCode) => {
              const relResult = calculateTax(salary, "single", relCode);
              const relSlug = relCode.toLowerCase();
              const isActive = relCode === code;
              return (
                <a
                  key={relCode}
                  href={`/${salarySlug}/${relSlug}`}
                  className="rounded-lg p-3 transition-colors"
                  style={{
                    background: isActive ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(212,175,55,0.4)" : "1px solid var(--border-subtle)",
                    textDecoration: "none",
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: isActive ? "var(--amber-400)" : "var(--text-secondary)" }}>
                    {STATE_NAMES[relCode]}
                  </p>
                  <p className="text-xs mt-0.5 tabular-gold" style={{ color: "var(--text-muted)" }}>
                    {formatCurrencyFull(relResult.netAnnual)} take-home
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              Data: IRS 2025 tax brackets.{" "}
              <a href="/methodology" style={{ color: "var(--amber-500)", textDecoration: "none" }}>
                Methodology &rarr;
              </a>
            </p>
            <a
              href="https://calcmoney.io/calculators/net-worth"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: "999px", background: "rgba(212,175,55,0.1)", color: "var(--amber-500)", border: "1px solid rgba(212,175,55,0.25)", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}
            >
              Net worth and investment tools at CalcMoney &rarr;
            </a>
          </div>
          <p className="mt-3 text-xs">
            Estimates only. Actual take-home pay may differ based on additional withholdings, deductions, or local taxes.
            &copy; {new Date().getFullYear()} netpaytool.com
            {" · "}
            <a href="/privacy" style={{ color: "var(--amber-500)", textDecoration: "none" }}>Privacy</a>
          </p>
        </div>
      </footer>
    </>
  );
}
