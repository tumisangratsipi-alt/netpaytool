// lib/routingLogic.ts — netpaytool.com
// Affiliate URLs: env vars in production, fallback slugs for now.

export const CALCMONEY_GOLD = "#D4AF37" as const;

const URLS = {
  nationalDebtRelief:
    process.env.NEXT_PUBLIC_NDR_URL ?? "https://calcmoney.io/go/debt-relief",
  zeroPctCard:
    process.env.NEXT_PUBLIC_ZERO_APR_URL ?? "https://calcmoney.io/go/zero-apr",
} as const;

export interface NetPayRouteResult {
  url: string | null;
  label: string;
  sublabel: string;
  colorHex: string;
  product: "national_debt_relief" | "zero_apr_card" | "none";
}

/**
 * debt_amount = total outstanding debt balance (student, auto, credit cards).
 * threshold: debt_amount / annual_income >= 0.40
 */
export function resolveNetPayRoute(
  annualIncome: number,
  debtAmount: number
): NetPayRouteResult {
  if (debtAmount <= 0 || annualIncome <= 0) {
    return { url: null, label: "", sublabel: "", colorHex: "#22C55E", product: "none" };
  }

  const ratio = debtAmount / annualIncome;

  if (ratio >= 0.4) {
    return {
      url: URLS.nationalDebtRelief,
      label: "See If You Qualify for Debt Relief",
      sublabel: "Your debt-to-income ratio is above 40%. National Debt Relief may reduce what you owe.",
      colorHex: "#EF4444",
      product: "national_debt_relief",
    };
  }

  return {
    url: URLS.zeroPctCard,
    label: "Pay It Down Faster — 0% APR Cards",
    sublabel: "Transfer your balance to a 0% APR card and eliminate interest while you pay it off.",
    colorHex: "#22C55E",
    product: "zero_apr_card",
  };
}
