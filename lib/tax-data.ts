// US Federal & State Tax Data — 2024 tax year
// Federal brackets: IRS Rev. Proc. 2023-34
// State rates: state revenue department publications

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

// Standard deductions 2024
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 14600,
  married: 29200,
  hoh: 21900,
};

// Federal income tax brackets 2024
export const FEDERAL_BRACKETS: Record<FilingStatus, [number, number, number][]> = {
  // [min, max, rate]
  single: [
    [0, 11600, 0.10],
    [11600, 47150, 0.12],
    [47150, 100525, 0.22],
    [100525, 191950, 0.24],
    [191950, 243725, 0.32],
    [243725, 609350, 0.35],
    [609350, Infinity, 0.37],
  ],
  married: [
    [0, 23200, 0.10],
    [23200, 94300, 0.12],
    [94300, 201050, 0.22],
    [201050, 383900, 0.24],
    [383900, 487450, 0.32],
    [487450, 731200, 0.35],
    [731200, Infinity, 0.37],
  ],
  hoh: [
    [0, 16550, 0.10],
    [16550, 63100, 0.12],
    [63100, 100500, 0.22],
    [100500, 191950, 0.24],
    [191950, 243700, 0.32],
    [243700, 609350, 0.35],
    [609350, Infinity, 0.37],
  ],
};

// FICA 2024
export const SOCIAL_SECURITY_RATE = 0.062;
export const SOCIAL_SECURITY_WAGE_BASE = 168600;
export const MEDICARE_RATE = 0.0145;
export const MEDICARE_SURTAX_RATE = 0.009;
export const MEDICARE_SURTAX_THRESHOLD_SINGLE = 200000;
export const MEDICARE_SURTAX_THRESHOLD_MARRIED = 250000;

// State income tax — effective rates for all 50 states + DC
// No-tax states = 0. Others use simplified effective rate for median earner.
// Source: Tax Foundation 2024 State Individual Income Tax Rates
export const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.045, AK: 0, AZ: 0.025, AR: 0.047, CA: 0.093,
  CO: 0.044, CT: 0.065, DE: 0.066, FL: 0, GA: 0.055,
  HI: 0.079, ID: 0.058, IL: 0.0495, IN: 0.0305, IA: 0.057,
  KS: 0.052, KY: 0.045, LA: 0.042, ME: 0.075, MD: 0.057,
  MA: 0.09, MI: 0.0425, MN: 0.072, MS: 0.047, MO: 0.048,
  MT: 0.059, NE: 0.052, NV: 0, NH: 0, NJ: 0.064,
  NM: 0.049, NY: 0.0685, NC: 0.0475, ND: 0.025, OH: 0.035,
  OK: 0.045, OR: 0.088, PA: 0.0307, RI: 0.055, SC: 0.065,
  SD: 0, TN: 0, TX: 0, UT: 0.0485, VT: 0.066,
  VA: 0.057, WA: 0, WV: 0.055, WI: 0.053, WY: 0,
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
