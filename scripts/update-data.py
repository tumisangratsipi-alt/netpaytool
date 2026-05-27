#!/usr/bin/env python3
"""
Auto-update netpaytool/lib/tax-data.ts from IRS inflation adjustment releases.

Data source: IRS newsroom page "IRS provides tax inflation adjustments for tax year {YEAR}"
Published each October for the following tax year.

Strategy:
  1. Determine which tax year should be "current" (current calendar year).
  2. Fetch the IRS newsroom page for that year.
  3. Parse standard deduction and bracket thresholds using regex patterns.
  4. If parsed values differ from what is currently in tax-data.ts, update the file.
  5. If parsing fails (IRS changes page structure), send a Slack alert for manual update.
  6. Also use CPI-based inflation estimation as a cross-check.

IRS page pattern:
  https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-{YEAR}
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import requests

TAX_DATA_FILE = Path("lib/tax-data.ts")
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")
IRS_NEWS_URL = "https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-{year}"

# BLS CPI series for inflation estimation fallback
BLS_CPI_SERIES = "CUUR0000SA0"  # CPI-U, All items, US City Average


def slack(msg: str) -> None:
    if SLACK_WEBHOOK:
        try:
            requests.post(SLACK_WEBHOOK, json={"text": msg}, timeout=10)
        except Exception:
            pass
    print(msg)


def get_current_tax_year_in_file() -> int:
    """
    Read the comment at the top of tax-data.ts to find which year the data covers.
    Falls back to 2024 if not found.
    """
    content = TAX_DATA_FILE.read_text(encoding="utf-8")
    m = re.search(r"// US Federal & State Tax Data — (\d{4}) tax year", content)
    if m:
        return int(m.group(1))
    # Fallback: look for Rev. Proc. year in source comment
    m = re.search(r"IRS Rev\. Proc\. 20(\d{2})-\d+", content)
    if m:
        return int("20" + m.group(1)) + 1  # Rev Proc year + 1 = tax year
    return 2024


def read_current_standard_deductions() -> dict:
    content = TAX_DATA_FILE.read_text(encoding="utf-8")
    # Match: single: 14600,
    result = {}
    for status in ("single", "married", "hoh"):
        m = re.search(rf"{status}: (\d+),", content)
        if m:
            result[status] = int(m.group(1))
    return result


def read_current_brackets() -> dict[str, list]:
    """Read the first bracket threshold per filing status as a sanity check."""
    content = TAX_DATA_FILE.read_text(encoding="utf-8")
    # Find 10% bracket upper bound for single filer: [0, 11600, 0.10]
    m = re.search(r"single: \[\s*\[0, (\d+), 0\.10\]", content)
    return {"single_10pct_top": int(m.group(1)) if m else None}


def fetch_irs_page(year: int) -> str | None:
    url = IRS_NEWS_URL.format(year=year)
    try:
        resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        return resp.text
    except Exception as exc:
        print(f"Could not fetch IRS page for {year}: {exc}")
        return None


def parse_irs_standard_deductions(html: str, year: int) -> dict | None:
    """
    Try to extract standard deduction amounts from IRS newsroom HTML.
    Returns dict with keys single, married, hoh, or None if parsing fails.
    """
    # IRS page contains text like:
    # "The standard deduction for single taxpayers ... will be $15,000"
    # "For married couples filing jointly ... $30,000"
    # "Heads of household ... $22,500"

    deductions = {}

    # Single filer
    patterns_single = [
        r"single taxpayers[^.]*?\$(\d{1,2},\d{3})",
        r"standard deduction.*?single.*?\$(\d{1,2},\d{3})",
        r"\$(\d{1,2},\d{3}) for single",
    ]
    for pat in patterns_single:
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            deductions["single"] = int(m.group(1).replace(",", ""))
            break

    # Married filing jointly
    patterns_married = [
        r"married couples filing jointly[^.]*?\$(\d{2},\d{3})",
        r"\$(\d{2},\d{3}) for married",
        r"married filing jointly.*?\$(\d{2},\d{3})",
    ]
    for pat in patterns_married:
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            deductions["married"] = int(m.group(1).replace(",", ""))
            break

    # Head of household
    patterns_hoh = [
        r"heads? of household[^.]*?\$(\d{1,2},\d{3})",
        r"\$(\d{1,2},\d{3}) for heads? of household",
    ]
    for pat in patterns_hoh:
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            deductions["hoh"] = int(m.group(1).replace(",", ""))
            break

    if len(deductions) < 2:
        return None

    # Sanity check: married should be ~2x single
    if "single" in deductions and "married" in deductions:
        ratio = deductions["married"] / deductions["single"]
        if not (1.9 <= ratio <= 2.1):
            print(f"Sanity check failed: married/single ratio = {ratio:.2f}")
            return None

    return deductions if deductions else None


def estimate_deductions_via_cpi(current_deductions: dict, from_year: int, to_year: int) -> dict | None:
    """
    Estimate next year's standard deductions using CPI inflation.
    Uses BLS CPI series CUUR0000SA0.
    """
    try:
        years_to_fetch = list(range(from_year - 1, to_year + 1))
        payload = {
            "seriesid": [BLS_CPI_SERIES],
            "startyear": str(min(years_to_fetch)),
            "endyear": str(max(years_to_fetch)),
        }
        resp = requests.post(
            "https://api.bls.gov/publicAPI/v2/timeseries/data/",
            json=payload,
            timeout=30,
        )
        data = resp.json()
        if data.get("status") != "REQUEST_SUCCEEDED":
            return None

        obs = data["Results"]["series"][0]["data"]

        def avg_cpi_sept(year: int) -> float:
            # IRS uses average CPI for 12 months ending Aug 31
            # Approximate with calendar year average
            year_obs = [float(o["value"]) for o in obs if o["year"] == str(year)]
            return sum(year_obs) / len(year_obs) if year_obs else 0.0

        cpi_base = avg_cpi_sept(from_year)
        cpi_new = avg_cpi_sept(to_year)

        if cpi_base <= 0 or cpi_new <= 0:
            return None

        inflation = cpi_new / cpi_base

        # IRS rounds standard deduction to nearest $50
        def round50(v: float) -> int:
            return round(v / 50) * 50

        return {
            "single": round50(current_deductions.get("single", 14600) * inflation),
            "married": round50(current_deductions.get("married", 29200) * inflation),
            "hoh": round50(current_deductions.get("hoh", 21900) * inflation),
            "inflation": inflation,
        }
    except Exception as exc:
        print(f"CPI estimation failed: {exc}")
        return None


def update_tax_data(new_deductions: dict, new_year: int, source: str) -> None:
    """Update tax-data.ts standard deductions and scale brackets by inflation ratio."""
    content = TAX_DATA_FILE.read_text(encoding="utf-8")
    current_deductions = read_current_standard_deductions()
    current_year = get_current_tax_year_in_file()

    # Calculate inflation ratio using single deduction as anchor
    cur_single = current_deductions.get("single", 14600)
    new_single = new_deductions.get("single", cur_single)
    inflation = new_single / cur_single

    # Update header comment
    content = re.sub(
        r"(// US Federal & State Tax Data — )\d{4}( tax year)",
        rf"\g<1>{new_year}\g<2>",
        content,
    )

    # Update source comment with new year info
    content = re.sub(
        r"(// Federal brackets: IRS Rev\. Proc\. \d{4}-\d+)",
        f"// Federal brackets: {source}",
        content,
    )

    # Update standard deductions block
    for status, val in new_deductions.items():
        if status == "inflation":
            continue
        content = re.sub(
            rf"({status}: )\d+(,)",
            rf"\g<1>{val}\g<2>",
            content,
        )

    # Scale all bracket thresholds (not rates) by inflation ratio
    # IRS rounds bracket thresholds to nearest $25
    def round25(v: float) -> int:
        return round(v / 25) * 25

    def scale_bracket_threshold(m: re.Match) -> str:
        val = int(m.group(1))
        if val == 0:
            return m.group(0)  # leave 0 alone
        new_val = round25(val * inflation)
        return m.group(0).replace(str(val), str(new_val), 1)

    # Scale bracket thresholds: patterns like [0, 11600, 0.10] and [11600, 47150, 0.12]
    # We need to scale the non-zero, non-Infinity numbers in bracket arrays
    def scale_bracket_line(m: re.Match) -> str:
        min_val = m.group(1)
        max_val = m.group(2)
        rate = m.group(3)

        new_min = "0" if min_val == "0" else str(round25(int(min_val) * inflation))
        new_max = "Infinity" if max_val == "Infinity" else str(round25(int(max_val) * inflation))
        return f"[{new_min}, {new_max}, {rate}]"

    content = re.sub(
        r"\[(\d+), (\d+|Infinity), (0\.\d+)\]",
        scale_bracket_line,
        content,
    )

    # Scale Social Security wage base (nearest $300)
    def scale_ss_wage_base(m: re.Match) -> str:
        old_val = int(m.group(2))
        new_val = round(old_val * inflation / 300) * 300
        return f"{m.group(1)}{new_val};"

    content = re.sub(
        r"(export const SOCIAL_SECURITY_WAGE_BASE = )(\d+);",
        scale_ss_wage_base,
        content,
    )

    # Scale Medicare surtax thresholds (nearest $1000)
    def scale_medicare_threshold(m: re.Match) -> str:
        old_val = int(m.group(2))
        new_val = round(old_val * inflation / 1000) * 1000
        return f"{m.group(1)}{new_val};"

    content = re.sub(
        r"(export const MEDICARE_SURTAX_THRESHOLD_SINGLE = )(\d+);",
        scale_medicare_threshold,
        content,
    )
    content = re.sub(
        r"(export const MEDICARE_SURTAX_THRESHOLD_MARRIED = )(\d+);",
        scale_medicare_threshold,
        content,
    )

    TAX_DATA_FILE.write_text(content, encoding="utf-8")
    print(f"Updated tax-data.ts for {new_year} (inflation factor {inflation:.4f}, source: {source})")


def main() -> None:
    current_year_in_file = get_current_tax_year_in_file()
    calendar_year = datetime.now().year
    # The current tax year we should have is the calendar year
    target_year = calendar_year

    print(f"Current data in file: tax year {current_year_in_file}")
    print(f"Target tax year: {target_year}")

    if current_year_in_file >= target_year:
        print("Tax data is already current. No update needed.")
        slack(f":white_check_mark: netpaytool tax check: data is current ({current_year_in_file}). No update.")
        return

    print(f"Tax data is stale ({current_year_in_file}). Attempting to fetch {target_year} data...")

    current_deductions = read_current_standard_deductions()

    # Strategy 1: fetch IRS newsroom page and parse
    html = fetch_irs_page(target_year)
    parsed_deductions = None

    if html:
        print(f"IRS page fetched for {target_year}. Attempting to parse...")
        parsed_deductions = parse_irs_standard_deductions(html, target_year)
        if parsed_deductions:
            print(f"Parsed from IRS page: {parsed_deductions}")
        else:
            print("IRS page parsing failed (page structure may have changed).")
    else:
        print(f"IRS page for {target_year} not found (not yet published?).")

    # Strategy 2: CPI-based estimation if IRS page unavailable or unparseable
    if not parsed_deductions:
        print("Falling back to CPI-based estimation...")
        estimated = estimate_deductions_via_cpi(current_deductions, current_year_in_file, target_year)
        if estimated:
            parsed_deductions = estimated
            source = f"CPI-estimated for {target_year} (IRS page unparseable)"
            print(f"CPI estimate: {estimated}")
        else:
            # Complete failure
            msg = (
                f":warning: netpaytool IRS tax update FAILED for {target_year}. "
                f"IRS page unavailable and CPI fallback failed. "
                f"Current data is from {current_year_in_file}. Manual update needed."
            )
            slack(msg)
            sys.exit(0)  # non-fatal: data just stays at last-known-good
    else:
        source = f"IRS newsroom {target_year}"

    # Verify we have all three filing statuses
    if not all(k in parsed_deductions for k in ("single", "married", "hoh")):
        # Fill in married/hoh if missing via ratio from current data
        if "single" in parsed_deductions:
            ratio = parsed_deductions["single"] / current_deductions.get("single", 14600)
            if "married" not in parsed_deductions:
                parsed_deductions["married"] = round(current_deductions.get("married", 29200) * ratio / 50) * 50
            if "hoh" not in parsed_deductions:
                parsed_deductions["hoh"] = round(current_deductions.get("hoh", 21900) * ratio / 50) * 50

    update_tax_data(parsed_deductions, target_year, source)

    delta_single = parsed_deductions.get("single", 0) - current_deductions.get("single", 0)
    msg = (
        f":money_with_wings: netpaytool auto-updated IRS tax brackets for {target_year} "
        f"(was {current_year_in_file}). "
        f"Standard deduction (single): ${current_deductions.get('single', 0):,} -> "
        f"${parsed_deductions.get('single', 0):,} (+${delta_single:,}). "
        f"Source: {source}."
    )
    slack(msg)
    print("Done.")


if __name__ == "__main__":
    main()
