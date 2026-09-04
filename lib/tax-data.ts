// US Federal & State Tax Data — 2026 tax year
// Federal brackets: IRS Rev. Proc. 2025-32 (published Oct 9, 2025),
// https://www.irs.gov/pub/irs-drop/rp-25-32.pdf, Section 4 tax rate
// tables. Every bracket threshold below was cross-verified against the
// Rev Proc's own stated cumulative-tax dollar amounts at each threshold
// (e.g. "$2,480 plus 12% of the excess over $24,800" for MFJ) before
// being trusted, not just read off the table once.
//
// Audited 2026-08-31, corrected from a prior version of this file that
// was one full tax year stale (2025 brackets, shown as current on a
// live paycheck calculator) AND mis-cited its own source (labeled
// "Rev. Proc. 2024-61", which doesn't exist — the real 2025-vintage
// citation is Rev. Proc. 2024-40). The 2025 standard deduction figures
// that prior version used were also superseded mid-year by the One,
// Big, Beautiful Bill Act (OBBBA), which retroactively raised the 2025
// standard deduction (to $15,750 single / $31,500 MFJ / $23,625 HOH)
// before the 2026 figures below took effect — so the old numbers were
// wrong for 2025 by the time this was caught, not just outdated.
//
// State rates: Tax Foundation 2026 data, audited 2026-09-04 — see
// STATE_TAX_RATES comment below.

export type FilingStatus = "single" | "married" | "hoh";
export type PayPeriod = "weekly" | "biweekly" | "semimonthly" | "monthly" | "annual";

export const PAY_PERIOD_LABELS: Record<PayPeriod, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  semimonthly: "Semi-monthly",
  monthly: "Monthly",
  annual: "Annual",
};

export const PAY_PERIOD_DIVISOR: Record<PayPeriod, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  annual: 1,
};

// Standard deductions 2026 (Rev. Proc. 2025-32, Sec. 4.14)
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 16100,
  married: 32200,
  hoh: 24150,
};

// Federal income tax brackets 2026 (IRS Rev. Proc. 2025-32, Sec. 4.01)
export const FEDERAL_BRACKETS: Record<FilingStatus, [number, number, number][]> = {
  // [min, max, rate]
  single: [
    [0, 12400, 0.10],
    [12400, 50400, 0.12],
    [50400, 105700, 0.22],
    [105700, 201775, 0.24],
    [201775, 256225, 0.32],
    [256225, 640600, 0.35],
    [640600, Infinity, 0.37],
  ],
  married: [
    [0, 24800, 0.10],
    [24800, 100800, 0.12],
    [100800, 211400, 0.22],
    [211400, 403550, 0.24],
    [403550, 512450, 0.32],
    [512450, 768700, 0.35],
    [768700, Infinity, 0.37],
  ],
  hoh: [
    [0, 17700, 0.10],
    [17700, 67450, 0.12],
    [67450, 105700, 0.22],
    [105700, 201750, 0.24],
    [201750, 256200, 0.32],
    [256200, 640600, 0.35],
    [640600, Infinity, 0.37],
  ],
};

// FICA 2026. Wage base: SSA announcement, Oct 24, 2025 ($184,500, up
// from $176,100 in 2025). Medicare rate/surtax thresholds are set by
// statute (ACA), not indexed annually — unchanged.
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 184500;
export const MEDICARE_RATE = 0.0145;
export const MEDICARE_SURTAX_RATE = 0.009;
export const MEDICARE_SURTAX_THRESHOLD_SINGLE = 200000;
export const MEDICARE_SURTAX_THRESHOLD_MARRIED = 250000;

// State income tax — effective marginal rate at $100,000 single-filer
// taxable income, for all 50 states + DC. No-tax states = 0. This is a
// simplified single-rate model (one number per state, not a real bracket
// calculation against the user's actual income), same approach the prior
// version used — $100K was reverse-engineered as the reference income
// that best reproduced the prior version's numbers before they went
// stale, so this update keeps the same intent, just current data.
//
// Source: Tax Foundation, "2026 State Individual Income Tax Rates and
// Brackets" (https://taxfoundation.org/data/all/state/state-income-tax-
// rates-2026/), downloaded XLSX (2026-State-Individual-Income-Tax-Rates-
// Brackets.xlsx), "2026" sheet. Full bracket schedules were parsed for
// all 51 jurisdictions and the marginal rate at $100,000 taken directly
// from each state's real 2026 bracket table — not read off a single
// pre-summarized column.
//
// Washington is 0 here even though Tax Foundation's table lists a 7%/9%
// rate for WA: that rate applies only to long-term capital gains over
// $270K+, not wage/salary income, which is what this calculator computes
// (confirmed via the table's own footnote). WA also has a separate 0.58%
// payroll tax funding the WA Cares long-term-care program, withheld from
// gross wages — not modeled here, consistent with this file not modeling
// any other state's special payroll surcharges either.
//
// Audited 2026-09-04, replacing 2024-vintage data that the prior version
// of this file itself already flagged as stale — several states (Georgia,
// Iowa, Mississippi, and others) have had real rate cuts since 2024 that
// the old numbers missed (Iowa's flat-tax transition alone dropped its
// rate from 5.7% to 3.8%). Also found and fixed one apparent data error
// in the old figures, not just staleness: Massachusetts was listed at
// 9%, but MA's flat rate has been 5% since 2020, with its "millionaire's
// tax" surtax only applying above $1,083,150 — nowhere close to the
// $100K reference income this file uses.
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05, AK: 0, AZ: 0.025, AR: 0.039, CA: 0.093,
  CO: 0.044, CT: 0.06, DE: 0.066, FL: 0, GA: 0.0519,
  HI: 0.076, ID: 0.053, IL: 0.0495, IN: 0.0295, IA: 0.038,
  KS: 0.0558, KY: 0.035, LA: 0.03, ME: 0.0715, MD: 0.05,
  MA: 0.05, MI: 0.0425, MN: 0.068, MS: 0.04, MO: 0.047,
  MT: 0.0565, NE: 0.0455, NV: 0, NH: 0, NJ: 0.0637,
  NM: 0.049, NY: 0.059, NC: 0.0399, ND: 0.0195, OH: 0.0275,
  OK: 0.045, OR: 0.0875, PA: 0.0307, RI: 0.0475, SC: 0.06,
  SD: 0, TN: 0, TX: 0, UT: 0.045, VT: 0.066,
  VA: 0.0575, WA: 0, WV: 0.0482, WI: 0.053, WY: 0,
  DC: 0.085,
};

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
};

export interface TaxResult {
  grossAnnual: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  totalDeductions: number;
  netAnnual: number;
  effectiveFederalRate: number;
  effectiveTotalRate: number;
  stateCode: string;
  stateName: string;
  filingStatus: FilingStatus;
}

export function calculateTax(
  grossAnnual: number,
  filingStatus: FilingStatus,
  stateCode: string,
): TaxResult {
  // 1. Federal income tax (after standard deduction)
  const deduction = STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, grossAnnual - deduction);
  const brackets = FEDERAL_BRACKETS[filingStatus];

  let federalTax = 0;
  for (const [min, max, rate] of brackets) {
    if (taxableIncome <= min) break;
    federalTax += (Math.min(taxableIncome, max) - min) * rate;
  }

  // 2. Social Security
  const ssTaxable = Math.min(grossAnnual, SOCIAL_SECURITY_WAGE_BASE);
  const socialSecurity = ssTaxable * SOCIAL_SECURITY_RATE;

  // 3. Medicare (+ surtax)
  const surtaxThreshold = filingStatus === "married"
    ? MEDICARE_SURTAX_THRESHOLD_MARRIED
    : MEDICARE_SURTAX_THRESHOLD_SINGLE;
  const medicare =
    grossAnnual * MEDICARE_RATE +
    Math.max(0, grossAnnual - surtaxThreshold) * MEDICARE_SURTAX_RATE;

  // 4. State income tax (flat effective rate — approximation)
  const stateRate = STATE_TAX_RATES[stateCode] ?? 0;
  const stateTax = grossAnnual * stateRate;

  const totalDeductions = federalTax + socialSecurity + medicare + stateTax;
  const netAnnual = grossAnnual - totalDeductions;

  return {
    grossAnnual,
    federalTax,
    socialSecurity,
    medicare,
    stateTax,
    totalDeductions,
    netAnnual,
    effectiveFederalRate: grossAnnual > 0 ? federalTax / grossAnnual : 0,
    effectiveTotalRate: grossAnnual > 0 ? totalDeductions / grossAnnual : 0,
    stateCode,
    stateName: STATE_NAMES[stateCode] ?? stateCode,
    filingStatus,
  };
}

export function getNetForPeriod(netAnnual: number, period: PayPeriod): number {
  return netAnnual / PAY_PERIOD_DIVISOR[period];
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
