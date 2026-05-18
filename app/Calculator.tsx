"use client";

import { useState } from "react";
import {
  getPercentile,
  getTopPercent,
  getDiffFromMedian,
  formatCurrency,
  NATIONAL_MEDIAN,
  AGE_BRACKET_LABELS,
  type AgeBracket,
} from "@/lib/scf-data";

interface Result {
  percentile: number;
  topPercent: number;
  bracket: AgeBracket;
  bracketLabel: string;
  netWorth: number;
  median: number;
  diffAmount: number;
  diffDirection: "ahead" | "behind";
}

function PercentileBar({ percentile }: { percentile: number }) {
  return (
    <div className="mt-5">
      <div className="flex justify-between mb-2">
        <span className="terminal-label">Bottom</span>
        <span className="terminal-label" style={{ color: "var(--amber-500)" }}>
          {percentile}th percentile
        </span>
        <span className="terminal-label">Top</span>
      </div>
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentile}%`,
            background: "linear-gradient(90deg, var(--amber-600) 0%, var(--amber-400) 100%)",
          }}
        />
        <div
          className="absolute top-0 h-full w-px -translate-x-1/2 opacity-80"
          style={{ left: `${percentile}%`, background: "#fff" }}
        />
      </div>
    </div>
  );
}

function ShareButtons({ result }: { result: Result }) {
  const [copied, setCopied] = useState(false);

  const shareText = `My net worth puts me in the top ${result.topPercent}% of Americans ages ${result.bracketLabel}. Calculated at networthrank.com`;

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  };

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    "https://networthrank.com"
  )}&summary=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={copyResult}
        className="btn-orbital flex-1 text-sm py-2.5"
      >
        {copied ? "Copied!" : "Copy result"}
      </button>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-orbital flex-1 text-sm py-2.5 text-center"
        style={{ textDecoration: "none" }}
      >
        Share on LinkedIn
      </a>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  const isAhead = result.diffDirection === "ahead";
  const tone =
    result.percentile >= 75
      ? "You are well ahead of most Americans your age."
      : result.percentile >= 50
      ? "You are above the median for your age group."
      : result.percentile >= 25
      ? "You are close to the national median for your age."
      : "Building net worth takes time. Here is what moves the needle most.";

  return (
    <div className="gradient-border-result rounded-xl p-6 mt-8">
      <p className="terminal-label mb-4">Your rank</p>

      <div className="text-center my-6">
        <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
          You are in the
        </p>
        <p
          className="text-gradient-1 font-black leading-none glow-amber"
          style={{ fontSize: "clamp(56px, 14vw, 96px)" }}
        >
          TOP {result.topPercent}%
        </p>
        <p className="mt-2 font-semibold" style={{ color: "var(--text-secondary)" }}>
          of Americans ages {result.bracketLabel}
        </p>
      </div>

      <PercentileBar percentile={result.percentile} />

      {/* Comparison grid */}
      <div className="holo-panel p-4 mt-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="terminal-label">Median, ages {result.bracketLabel}</span>
          <span className="tabular-gold text-sm">{formatCurrency(result.median)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Your net worth</span>
          <span className="tabular-gold text-sm">{formatCurrency(result.netWorth)}</span>
        </div>
        <div
          className="flex justify-between items-center pt-2 mt-1"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <span className="terminal-label">vs. median</span>
          <span
            className="font-bold font-mono text-sm"
            style={{ color: isAhead ? "var(--emerald-500)" : "var(--rose-500)" }}
          >
            {isAhead ? "+" : "-"}{formatCurrency(result.diffAmount)}&nbsp;
            {isAhead ? "ahead" : "behind"}
          </span>
        </div>
      </div>

      <p className="text-sm mt-4" style={{ color: "var(--text-muted)" }}>
        {tone}
      </p>

      <ShareButtons result={result} />

      {/* CTAs */}
      <div className="mt-6 space-y-3">
        <a
          href="https://calcmoney.io/calculators/net-worth"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-orbital block w-full text-center py-3"
          style={{ textDecoration: "none" }}
        >
          Full financial breakdown at CalcMoney &rarr;
        </a>
        <a
          href="https://www.empower.com/personal-wealth"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full text-center py-3 px-4 rounded-md text-sm transition-opacity hover:opacity-70"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-default)",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          Track your net worth automatically &mdash; Empower is free &rarr;
        </a>
      </div>
    </div>
  );
}

export default function Calculator() {
  const [netWorthInput, setNetWorthInput] = useState("");
  const [bracket, setBracket] = useState<AgeBracket | "">("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const raw = netWorthInput.replace(/[$,\s]/g, "");
    const nw = parseFloat(raw);
    if (isNaN(nw)) {
      setError("Enter a valid net worth amount — e.g. 250000 or -15000.");
      return;
    }
    if (!bracket) {
      setError("Select your age bracket.");
      return;
    }
    const percentile = getPercentile(nw, bracket);
    const topPercent = getTopPercent(percentile);
    const { amount: diffAmount, direction: diffDirection } = getDiffFromMedian(nw, bracket);
    const median = NATIONAL_MEDIAN[bracket];
    setResult({ percentile, topPercent, bracket, bracketLabel: AGE_BRACKET_LABELS[bracket], netWorth: nw, median, diffAmount, diffDirection });
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  return (
    <div>
      {/* Form */}
      <div className="aura-panel p-6">
        <div className="space-y-5">
          <div>
            <label className="terminal-label block mb-2">
              Net worth (assets minus debts)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="250000"
              value={netWorthInput}
              onChange={(e) => setNetWorthInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-md px-4 py-3 text-base font-mono tracking-wider transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-default)",
                color: "var(--amber-400)",
              }}
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Total assets (home equity, investments, retirement, savings) minus total debts (mortgage, loans, credit cards). Negative values are fine.
            </p>
          </div>

          <div>
            <label className="terminal-label block mb-2">Age bracket</label>
            <select
              value={bracket}
              onChange={(e) => setBracket(e.target.value as AgeBracket | "")}
              className="w-full rounded-md px-4 py-3 text-base transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <option value="" style={{ background: "#16181F" }}>
                Select your age
              </option>
              {(Object.entries(AGE_BRACKET_LABELS) as [AgeBracket, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key} style={{ background: "#16181F" }}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--rose-500)" }}>
              {error}
            </p>
          )}

          <button className="btn-primary-gold" onClick={handleCalculate}>
            Calculate My Rank
          </button>
        </div>
      </div>

      {/* Result */}
      <div id="result">
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
