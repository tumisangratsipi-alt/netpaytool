#!/usr/bin/env python3
"""
Data freshness watchdog. Reads data-sources.json and flags any entry whose
real-world source is due (or overdue) for a re-check, plus any entry that
was honestly marked as never having a real automated check at all.

This script never edits the data files themselves and never guesses a
number. It only reads dates that a human already verified and wrote into
data-sources.json, and sends a Slack alert when one needs attention.
The only file it writes is its own state file, which just remembers when
it last alerted on each entry so a permanent, undated gap doesn't spam
Slack every single run (quarterly) while a real overdue date still alerts
on every run until someone fixes it (monthly, matching this job's cadence).

Exit code is always 0. This is a notify-only job, not a build gate - a
stale calculator input is not the same class of problem as a broken build,
and this script has no way to safely auto-fix either kind on its own.
"""

import json
import os
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

import requests

MANIFEST_FILE = Path("data-sources.json")
STATE_FILE = Path(".data-freshness-state.json")
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL", "")
REPO_NAME = os.environ.get("REPO_NAME", "unknown-repo")

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

# Re-alert cadence, in days, for an entry that has no real scheduled
# recheck date at all (an honest "not yet audited" gap rather than a
# dated one). Quarterly is enough to stay visible without being noise.
UNDATED_REALERT_DAYS = 90


def slack(msg: str) -> None:
    print(msg)
    if not SLACK_WEBHOOK:
        return
    try:
        requests.post(SLACK_WEBHOOK, json={"text": msg}, timeout=10)
    except Exception as exc:
        print(f"[warn] Slack post failed: {exc}")


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            return {}
    return {}


def save_state(state: dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")


def should_alert(entry_id: str, state: dict, cadence_days: int) -> bool:
    last = state.get(entry_id)
    if not last:
        return True
    try:
        last_date = datetime.strptime(last, "%Y-%m-%d").date()
    except Exception:
        return True
    return (date.today() - last_date).days >= cadence_days


def main() -> int:
    if not MANIFEST_FILE.exists():
        print("[info] no data-sources.json in this repo, nothing to check")
        return 0

    manifest = json.loads(MANIFEST_FILE.read_text())
    entries = manifest.get("entries", [])
    today = date.today()
    state = load_state()

    overdue = []
    undated_gaps = []

    for entry in entries:
        entry_id = entry.get("id", "unknown")
        next_due = entry.get("next_check_due", "")
        auto = entry.get("automated_check", {})

        if DATE_RE.match(next_due or ""):
            due_date = datetime.strptime(next_due, "%Y-%m-%d").date()
            if today >= due_date:
                days_over = (today - due_date).days
                if should_alert(entry_id, state, cadence_days=28):
                    overdue.append((entry, due_date, days_over))
                    state[entry_id] = today.isoformat()
        else:
            # No real scheduled date - this is a permanently open gap
            # (e.g. "never independently verified" or "needs a real
            # audit first"), not a specific overdue check.
            if should_alert(entry_id, state, cadence_days=UNDATED_REALERT_DAYS):
                undated_gaps.append(entry)
                state[entry_id] = today.isoformat()

    if not overdue and not undated_gaps:
        print(f"[ok] {REPO_NAME}: all {len(entries)} data-sources.json entries are within their re-check window")
        return 0

    lines = [f"*Data freshness check - {REPO_NAME}*"]

    for entry, due_date, days_over in overdue:
        source = entry.get("real_source", {}).get("name", "unknown source")
        has_watcher = entry.get("automated_check", {}).get("exists", False)
        watcher_note = "(has its own watcher - check that workflow's own status too)" if has_watcher else "(no automated check exists for this entry)"
        lines.append(
            f"- OVERDUE `{entry.get('id')}` in `{entry.get('file')}` - due {due_date.isoformat()}, "
            f"{days_over} day(s) past due. Source: {source}. {watcher_note}"
        )

    for entry in undated_gaps:
        lines.append(
            f"- NEVER AUDITED `{entry.get('id')}` in `{entry.get('file')}` - "
            f"{entry.get('description', 'no description')[:160]}"
        )

    lines.append("Re-verify against the real source in data-sources.json and update last_verified + next_check_due in the same commit as any fix.")

    slack("\n".join(lines))
    save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
