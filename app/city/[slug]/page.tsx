import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Calculator from "@/app/Calculator";
import { CITY_DATA, CITY_SLUGS } from "@/lib/city-data";
import {
  calculateTax,
  getNetForPeriod,
  formatCurrencyFull,
  formatPercent,
} from "@/lib/tax-data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return CITY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = CITY_DATA[slug];
  if (!city) return {};

  const result = calculateTax(city.medianSalary, "single", city.stateCode);
  const takeHome = formatCurrencyFull(result.netAnnual);

  return {
    title: `Take-Home Pay in ${city.name} — ${city.state} Salary Calculator`,
    description: `The median salary in ${city.name} is ${formatCurrencyFull(city.medianSalary)}. After federal and ${city.state} state taxes, a single filer takes home ${takeHome} per year. See your full breakdown.`,
    alternates: { canonical: `https://netpaytool.com/city/${slug}` },
    openGraph: {
      title: `${city.name} Take-Home Pay Calculator`,
      description: `${formatCurrencyFull(city.medianSalary)} median salary in ${city.name} takes home ${takeHome} after taxes.`,
      url: `https://netpaytool.com/city/${slug}`,
    },
  };
}

function getSalaryTiers(medianSalary: number): number[] {
  const base = Math.round(medianSalary / 10000) * 10000;
  return [
    Math.max(40000, base - 20000),
    Math.max(50000, base - 10000),
    base,
    base + 10000,
    base + 25000,
  ].filter((v, i, arr) => arr.indexOf(v) === i);
}

interface FaqItem { q: string; a: string }

function buildFaqs(city: (typeof CITY_DATA)[string]): FaqItem[] {
  const result = calculateTax(city.medianSalary, "single", city.stateCode);
  const gross = formatCurrencyFull(city.medianSalary);
  const net = formatCurrencyFull(result.netAnnual);
  const biweekly = formatCurrencyFull(getNetForPeriod(result.netAnnual, "biweekly"));
  const monthly = formatCurrencyFull(getNetForPeriod(result.netAnnual, "monthly"));
  const hasStateTax = result.stateTax > 0;
  const colLabel = city.colIndex > 100 ? `${city.colIndex - 100}% higher than` : city.colIndex < 100 ? `${100 - city.colIndex}% lower than` : "equal to";

  return [
    {
      q: `What is the take-home pay for the median salary in ${city.name}?`,
      a: `The median salary in ${city.name} is ${gross}. A single filer takes home ${net} per year after federal income tax, ${city.state} state tax, Social Security, and Medicare. That works out to ${biweekly} bi-weekly or ${monthly} per month.`,
    },
    {
      q: `How does ${city.name}'s cost of living affect your paycheck?`,
      a: `${city.name} has a cost of living index of ${city.colIndex} — ${colLabel} the US national average. While your take-home pay is the same in dollar terms regardless of location, your purchasing power is ${city.colIndex > 100 ? "lower" : city.colIndex < 100 ? "higher" : "the same"} than the US average. A ${gross} salary in ${city.name} buys ${city.colIndex > 100 ? "less" : "more"} than the same salary in an average-cost US city.`,
    },
    {
      q: hasStateTax ? `How much state income tax do you pay in ${city.name}?` : `Does ${city.name} have state income tax?`,
      a: hasStateTax
        ? `${city.state} has an effective state income tax rate of ${formatPercent(result.stateTax / city.medianSalary)} on a ${gross} salary, totalling ${formatCurrencyFull(result.stateTax)} annually.${city.localIncomeTax ? ` Additionally, ${city.localTaxName} applies at up to ${formatPercent(city.localIncomeTax)}.` : ""}`
        : `No. ${city.state} has no state income tax. Workers in ${city.name} avoid state income tax entirely, keeping an extra ${formatCurrencyFull(city.medianSalary * 0.05)} to ${formatCurrencyFull(city.medianSalary * 0.09)} per year compared to high-tax states like California or New York.`,
    },
    {
      q: `What is the effective tax rate in ${city.name} on a ${gross} salary?`,
      a: `A single filer earning ${gross} in ${city.name} (${city.state}) has a total effective tax rate of ${formatPercent(result.effectiveTotalRate)}. This includes ${formatPercent(result.effectiveFederalRate)} federal income tax${hasStateTax ? `, ${formatPercent(result.stateTax / city.medianSalary)} ${city.state} state income tax` : ", 0% state income tax"}, plus 7.65% FICA.`,
    },
  ];
}

export default async function CityPayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = CITY_DATA[slug];
  if (!city) notFound();

  const faqs = buildFaqs(city);
  const salaryTiers = getSalaryTiers(city.medianSalary);
  const medianResult = calculateTax(city.medianSalary, "single", city.stateCode);
  const hasStateTax = medianResult.stateTax > 0;

  // JSON-LD: all content derived from static CITY_DATA — no user input.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <nav className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <a href="/" style={{ color: "var(--color-accent)", textDecoration: "none" }}>netpaytool.com</a>
          {" / "}<span>City</span>{" / "}<span>{city.name}</span>
        </nav>

        <h1 className="font-black mb-3 leading-tight" style={{ fontSize: "clamp(22px, 5vw, 34px)" }}>
          Take-Home Pay in <span className="text-gradient-1">{city.name}</span>
        </h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          The median salary in {city.name} is{" "}
          <strong style={{ color: "var(--color-accent)" }}>{formatCurrencyFull(city.medianSalary)}</strong>{" "}
          (BLS 2024). After federal{hasStateTax ? ` and ${city.state} state` : ""} taxes, a single filer takes home{" "}
          <strong style={{ color: "var(--color-accent)" }}>{formatCurrencyFull(medianResult.netAnnual)}</strong>{" "}
          per year. Adjust your salary below to see your exact breakdown.
        </p>

        {/* Take-home by salary tier */}
        <div className="gradient-border-result rounded-xl p-6 mb-8">
          <p className="terminal-label mb-4">Take-home pay in {city.name} — single filer</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 terminal-label">Gross salary</th>
                  <th className="text-right py-2 pr-4 terminal-label">Bi-weekly</th>
                  <th className="text-right py-2 terminal-label">Annual net</th>
                </tr>
              </thead>
              <tbody>
                {salaryTiers.map((salary) => {
                  const res = calculateTax(salary, "single", city.stateCode);
                  const isMedian = Math.abs(salary - city.medianSalary) < 1000;
                  return (
                    <tr key={salary} style={{ background: isMedian ? "rgba(161,139,250,0.06)" : "transparent", borderTop: "1px solid var(--border-subtle)" }}>
                      <td className="py-3 pr-4 font-medium">
                        {formatCurrencyFull(salary)}
                        {isMedian && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(161,139,250,0.15)", color: "var(--color-accent)" }}>
                            metro median
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums font-bold" style={{ color: "var(--color-accent)" }}>
                        {formatCurrencyFull(getNetForPeriod(res.netAnnual, "biweekly"))}
                      </td>
                      <td className="py-3 text-right tabular-nums" style={{ color: "var(--text-secondary)" }}>
                        {formatCurrencyFull(res.netAnnual)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Single filer, standard deduction, 2025 tax year. Federal + {city.state} state taxes + FICA.
          </p>
        </div>

        {/* City stats */}
        <div className="aura-panel p-5 mb-8">
          <p className="terminal-label mb-4">{city.name} — key figures</p>
          <div className="space-y-2">
            {[
              { label: "Median salary (BLS 2024)", value: formatCurrencyFull(city.medianSalary) },
              { label: "Cost of living index", value: `${city.colIndex} (US avg = 100)` },
              { label: "State income tax", value: hasStateTax ? `Yes (${city.state})` : `None (${city.state} has no income tax)` },
              ...(city.localIncomeTax ? [{ label: city.localTaxName ?? "Local income tax", value: `${formatPercent(city.localIncomeTax)}` }] : []),
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start gap-4">
                <span className="terminal-label text-xs">{item.label}</span>
                <span className="text-sm font-semibold text-right" style={{ color: "var(--text-primary)", maxWidth: "55%" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculator */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Adjust your salary</h2>
          <Calculator defaultState={city.stateCode} />
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sibling cities */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Other cities</h2>
          <div className="grid grid-cols-2 gap-2">
            {CITY_SLUGS.filter((s) => s !== slug).slice(0, 8).map((s) => {
              const c = CITY_DATA[s];
              return (
                <a key={s} href={`/city/${s}`} className="aura-panel px-4 py-3 text-sm font-medium" style={{ textDecoration: "none", color: "var(--text-primary)" }}>
                  {c.name}
                  <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Median {formatCurrencyFull(c.medianSalary)}</span>
                </a>
              );
            })}
          </div>
        </section>

        <a href="/" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: 14 }}>&larr; Back to netpaytool.com</a>
      </main>
    </>
  );
}
