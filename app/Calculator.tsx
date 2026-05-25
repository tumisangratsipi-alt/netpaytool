"use client";

import { useState } from "react";
import {
  calculateTax,
  getNetForPeriod,
  formatCurrency,
  formatCurrencyFull,
  formatPercent,
  STATE_NAMES,
  PAY_PERIOD_LABELS,
  PAY_PERIOD_DIVISOR,
  type FilingStatus,
  type PayPeriod,
} from "@/lib/tax-data";
import { resolveNetPayRoute, type NetPayRouteResult } from "@/lib/routingLogic";
import { logTelemetry } from "@/actions/logTelemetry";
import { captureEmail } from "@/actions/captureEmail";

const STATE_CODES = Object.keys(STATE_NAMES).sort((a, b) =>
  STATE_NAMES[a].localeCompare(STATE_NAMES[b])
);

function TaxBreakdownBar({ federalTax, fica, stateTax, grossAnnual }: {
  federalTax: number; fica: number; stateTax: number; grossAnnual: number;
}) {
  const fedPct = (federalTax / grossAnnual) * 100;
  const ficaPct = (fica / grossAnnual) * 100;
  const statePct = (stateTax / grossAnnual) * 100;
  const netPct = 100 - fedPct - ficaPct - statePct;

  return (
    <div className="mt-5">
      <div className="flex justify-between mb-2">
        <span className="terminal-label">Deductions breakdown</span>
        <span className="terminal-label" style={{ color: "#22C55E" }}>
          {formatPercent((fedPct + ficaPct + statePct) / 100)} withheld
        </span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        <div style={{ width: `${fedPct}%`, background: "var(--rose-500)", opacity: 0.85 }} />
        <div style={{ width: `${ficaPct}%`, background: "#F59E0B", opacity: 0.85 }} />
        {statePct > 0 && <div style={{ width: `${statePct}%`, background: "#8B5CF6", opacity: 0.85 }} />}
        <div style={{ width: `${netPct}%`, background: "#22C55E", opacity: 0.9 }} />
      </div>
      <div className="flex gap-4 mt-2 flex-wrap">
        {[
          { label: "Federal", color: "var(--rose-500)", pct: fedPct },
          { label: "FICA", color: "#F59E0B", pct: ficaPct },
          ...(statePct > 0 ? [{ label: "State", color: "#8B5CF6", pct: statePct }] : []),
          { label: "Take-home", color: "#22C55E", pct: netPct },
        ].map(({ label, color, pct }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            <span className="terminal-label" style={{ color: "var(--text-muted)" }}>{label} {pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, period }: { result: ReturnType<typeof calculateTax>; period: PayPeriod }) {
  const netPeriod = getNetForPeriod(result.netAnnual, period);
  const fica = result.socialSecurity + result.medicare;

  return (
    <div className="gradient-border-result rounded-xl p-6 mt-8">
      <p className="terminal-label mb-4">Your take-home pay</p>

      <div className="text-center my-6">
        <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
          {PAY_PERIOD_LABELS[period]} take-home
        </p>
        <p
          className="font-black leading-none"
          style={{
            fontSize: "clamp(48px, 12vw, 84px)",
            background: "linear-gradient(135deg, #16A34A 0%, #22C55E 45%, #86EFAC 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
        >
          {formatCurrency(netPeriod)}
        </p>
        <p className="mt-2 font-semibold" style={{ color: "var(--text-secondary)" }}>
          in {result.stateName}
        </p>
      </div>

      <TaxBreakdownBar federalTax={result.federalTax} fica={fica} stateTax={result.stateTax} grossAnnual={result.grossAnnual} />

      {/* Breakdown grid */}
      <div className="holo-panel p-4 mt-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="terminal-label">Gross annual salary</span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "#22C55E" }}>{formatCurrencyFull(result.grossAnnual)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Federal income tax ({formatPercent(result.effectiveFederalRate)} eff.)</span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "var(--rose-500)" }}>-{formatCurrencyFull(result.federalTax)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Social Security (6.2%)</span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "var(--rose-500)" }}>-{formatCurrencyFull(result.socialSecurity)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Medicare (1.45%)</span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "var(--rose-500)" }}>-{formatCurrencyFull(result.medicare)}</span>
        </div>
        {result.stateTax > 0 && (
          <div className="flex justify-between items-center">
            <span className="terminal-label">{result.stateName} income tax</span>
            <span className="font-mono text-sm tabular-nums" style={{ color: "var(--rose-500)" }}>-{formatCurrencyFull(result.stateTax)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 mt-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="terminal-label">Effective total rate</span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>{formatPercent(result.effectiveTotalRate)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Annual take-home</span>
          <span className="font-mono font-bold text-sm tabular-nums" style={{ color: "#22C55E" }}>{formatCurrencyFull(result.netAnnual)}</span>
        </div>
      </div>

      {/* All periods */}
      <div className="grid grid-cols-2 gap-3 mt-5 sm:grid-cols-3">
        {(Object.keys(PAY_PERIOD_DIVISOR) as PayPeriod[]).map((p) => (
          <div
            key={p}
            className="rounded-lg p-3 text-center"
            style={{
              background: p === period ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              border: p === period ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border-default)",
            }}
          >
            <p className="terminal-label mb-1">{PAY_PERIOD_LABELS[p]}</p>
            <p className="font-mono font-bold text-sm" style={{ color: "#22C55E" }}>
              {formatCurrencyFull(getNetForPeriod(result.netAnnual, p))}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs mt-5 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Federal tax uses 2024 brackets with standard deduction ({result.filingStatus === "married" ? "$29,200" : result.filingStatus === "hoh" ? "$21,900" : "$14,600"}). State tax uses effective rate estimates. Actual withholding may differ based on W-4 elections, pre-tax benefits, and local taxes.
      </p>
    </div>
  );
}

function AffiliateCTA({ route }: { route: NetPayRouteResult }) {
  if (route.product === "none" || !route.url) return null;
  return (
    <div
      className="mt-6 p-4 rounded-xl"
      style={{
        background: route.product === "national_debt_relief"
          ? "rgba(239,68,68,0.06)"
          : "rgba(34,197,94,0.06)",
        border: `1px solid ${route.colorHex}33`,
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: route.colorHex }}>
        Based on your debt load
      </p>
      <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {route.sublabel}
      </p>
      <a
        href={route.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-full text-center py-3 rounded-lg font-bold text-sm transition-all"
        style={{
          background: route.colorHex,
          color: "#09090B",
          textDecoration: "none",
        }}
      >
        {route.label} &rarr;
      </a>
    </div>
  );
}

export default function Calculator({
  defaultSalary,
  defaultState,
}: {
  defaultSalary?: number;
  defaultState?: string;
}) {
  const [salaryInput, setSalaryInput] = useState(defaultSalary ? String(defaultSalary) : "");
  const [debtInput, setDebtInput] = useState("");
  const [filingStatus, setFilingStatus] = useState<FilingStatus | "">("");
  const [stateCode, setStateCode] = useState(defaultState ?? "");
  const [period, setPeriod] = useState<PayPeriod>("biweekly");
  const [result, setResult] = useState<ReturnType<typeof calculateTax> | null>(null);
  const [route, setRoute] = useState<NetPayRouteResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const raw = salaryInput.replace(/[$,\s]/g, "");
    const salary = parseFloat(raw);
    if (isNaN(salary) || salary <= 0) {
      setError("Enter a valid annual salary — e.g. 75000.");
      return;
    }
    if (!filingStatus) {
      setError("Select your filing status.");
      return;
    }
    if (!stateCode) {
      setError("Select your state.");
      return;
    }

    const debt = parseFloat(debtInput.replace(/[$,\s]/g, "")) || 0;
    const res = calculateTax(salary, filingStatus as FilingStatus, stateCode);
    const routeResult = resolveNetPayRoute(salary, debt);

    setResult(res);
    setRoute(routeResult);

    // Fire-and-forget — never awaited
    const filingCode = filingStatus === "single" ? 0 : filingStatus === "married" ? 1 : 2;
    const periodCodes: Record<PayPeriod, number> = { weekly: 1, biweekly: 2, semimonthly: 4, monthly: 12, annual: 0 };
    void logTelemetry({
      annual_income: salary,
      debt_amount: debt,
      filing_status_code: filingCode as 0 | 1 | 2,
      pay_period_code: periodCodes[period],
      state_code: stateCode,
    });

    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--border-default)",
    color: "#4ADE80",
  };

  return (
    <div>
      <div className="aura-panel p-6">
        <div className="space-y-5">

          <div>
            <label className="terminal-label block mb-2">Annual gross salary</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="75000"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-md px-4 py-3 text-base font-mono tracking-wider transition-colors"
              style={inputStyle}
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Total salary before taxes. Hourly? Multiply: rate × hours/week × 52.
            </p>
          </div>

          <div>
            <label className="terminal-label block mb-2">Total outstanding debt <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={debtInput}
              onChange={(e) => setDebtInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-md px-4 py-3 text-base font-mono tracking-wider transition-colors"
              style={inputStyle}
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Credit cards, auto loans, student debt. Used to surface relevant resources.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="terminal-label block mb-2">Filing status</label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as FilingStatus | "")}
                className="w-full rounded-md px-4 py-3 text-base transition-colors"
                style={{ ...inputStyle, color: "var(--text-primary)" }}
              >
                <option value="" style={{ background: "#16181F" }}>Select</option>
                <option value="single" style={{ background: "#16181F" }}>Single</option>
                <option value="married" style={{ background: "#16181F" }}>Married jointly</option>
                <option value="hoh" style={{ background: "#16181F" }}>Head of household</option>
              </select>
            </div>

            <div>
              <label className="terminal-label block mb-2">State</label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full rounded-md px-4 py-3 text-base transition-colors"
                style={{ ...inputStyle, color: "var(--text-primary)" }}
              >
                <option value="" style={{ background: "#16181F" }}>Select state</option>
                {STATE_CODES.map((code) => (
                  <option key={code} value={code} style={{ background: "#16181F" }}>
                    {STATE_NAMES[code]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="terminal-label block mb-2">Show take-home per</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(Object.keys(PAY_PERIOD_LABELS) as PayPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="rounded-md px-2 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: period === p ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)",
                    border: period === p ? "1px solid rgba(34,197,94,0.5)" : "1px solid var(--border-default)",
                    color: period === p ? "#4ADE80" : "var(--text-muted)",
                  }}
                >
                  {PAY_PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--rose-500)" }}>{error}</p>
          )}

          <button
            className="relative inline-flex items-center justify-center font-bold text-sm rounded-md px-6 py-3 transition-all duration-150 w-full"
            style={{
              background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)",
              color: "#09090B",
              border: "none",
            }}
            onClick={handleCalculate}
          >
            Calculate My Take-Home Pay
          </button>
        </div>
      </div>

      <div id="result">
        {result && <ResultCard result={result} period={period} />}
        {route && <AffiliateCTA route={route} />}
        {result && <EmailCapture />}
      </div>
    </div>
  );
}

/* ─── Email Capture ─────────────────────────────────────────── */

function EmailCapture() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await captureEmail(email);
    if (res.ok) {
      setStatus("done");
    } else {
      setErrMsg(res.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-xl px-5 py-4 text-center" style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-accent-dark)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>You&rsquo;re on the list.</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-ink-muted)" }}>We&rsquo;ll send paycheck optimization tips. Unsubscribe any time.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl px-5 py-5" style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-border)" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>Get paycheck tips + tax saving strategies</p>
      <p className="text-xs mb-4" style={{ color: "var(--color-ink-muted)" }}>We break down what&rsquo;s eating your paycheck and how to keep more of it.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: "var(--color-paper-3)", border: "1px solid var(--color-border)", color: "var(--color-ink)" }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
        >
          {status === "loading" ? "..." : "Notify me"}
        </button>
      </form>
      {status === "error" && <p className="text-xs mt-2" style={{ color: "var(--color-hud-negative)" }}>{errMsg}</p>}
    </div>
  );
}
