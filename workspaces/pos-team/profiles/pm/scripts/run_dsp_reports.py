#!/usr/bin/env python3
"""
DSP Daily Bug Report Generator

Fetches bug data from Jira and generates daily operational reports
for POS DSP releases (2.1.1, 2.1.2, 2.1.3) in markdown + HTML.

Configuration via environment variables:
  JIRA_URL    - Jira instance URL (default: https://disneyexperiences.atlassian.net)
  JIRA_EMAIL  - Jira account email
  JIRA_PAT    - Jira Personal Access Token

Usage:
  export JIRA_EMAIL="your.email@disney.com"
  export JIRA_PAT="your-token-here"
  python3 run_dsp_reports.py [--output-dir ./reports] [--release "DSP 2.1.2"]
"""
import json
import urllib.request
import base64
import ssl
import os
import sys
import argparse
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from pathlib import Path


# --- Configuration ---
JIRA_URL = os.environ.get("JIRA_URL", "https://disneyexperiences.atlassian.net")
JIRA_EMAIL = os.environ.get("JIRA_EMAIL", "")
JIRA_PAT = os.environ.get("JIRA_PAT", "")

TEAM_IDS = (
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4004, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4027, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4134, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-3993, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4168, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4111, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4237, "
    "237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4326"
)

ALL_RELEASES = ["DSP 2.1.1", "DSP 2.1.2", "DSP 2.1.3"]


# --- Jira API ---
ctx = ssl.create_default_context()


def get_auth():
    if not JIRA_EMAIL or not JIRA_PAT:
        print("ERROR: JIRA_EMAIL and JIRA_PAT environment variables are required.")
        print("  export JIRA_EMAIL='your.email@disney.com'")
        print("  export JIRA_PAT='your-jira-token'")
        sys.exit(1)
    return base64.b64encode(f"{JIRA_EMAIL}:{JIRA_PAT}".encode()).decode()


def search_jira(jql, auth, max_results=100):
    """Fetch all pages for a JQL query using the v3 search/jql endpoint."""
    all_issues = []
    next_token = None
    while True:
        body = {
            "jql": jql,
            "maxResults": max_results,
            "fields": ["summary", "status", "assignee", "priority", "created", "updated"],
        }
        if next_token:
            body["nextPageToken"] = next_token
        data = json.dumps(body).encode()
        req = urllib.request.Request(
            f"{JIRA_URL}/rest/api/3/search/jql",
            data=data,
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"},
            method="POST",
        )
        resp = urllib.request.urlopen(req, context=ctx)
        result = json.loads(resp.read())
        all_issues.extend(result.get("issues", []))
        if result.get("isLast", True) or not result.get("nextPageToken"):
            break
        next_token = result["nextPageToken"]
    return all_issues


# --- Helpers ---
def pct(n, t):
    return f"{(n/t*100):.1f}%" if t > 0 else "0.0%"


def load_previous_counts(output_dir, version):
    """Load yesterday's report to compute deltas."""
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    prev_md = output_dir / f"pos-dsp-{version}-daily-report-{yesterday}.md"
    if not prev_md.exists():
        return None
    counts = {}
    try:
        for line in prev_md.read_text().split("\n"):
            if "|" in line and "%" in line and "Status" not in line and "---" not in line:
                parts = [p.strip() for p in line.split("|") if p.strip()]
                if len(parts) >= 2 and parts[1].replace("**", "").isdigit():
                    counts[parts[0].replace("**", "")] = int(parts[1].replace("**", ""))
    except Exception:
        pass
    return counts if counts else None


def delta_str(prev, label, count):
    if prev and label in prev:
        d = count - prev[label]
        return f"+{d}" if d > 0 else str(d) if d < 0 else "0"
    return "—"


def is_biweekly_day():
    """Check if today is a biweekly Tuesday (anchored May 27, 2026)."""
    today_dt = datetime.now(timezone.utc).date()
    anchor = datetime(2026, 5, 27, tzinfo=timezone.utc).date()
    if today_dt.weekday() != 1:  # Tuesday = 1
        return False
    diff = (today_dt - anchor).days
    return diff >= 0 and diff % 14 == 0


# --- CSS for HTML reports ---
CSS = """
:root { --blue: #1a73e8; --green: #34a853; --yellow: #f9ab00; --red: #ea4335; --gray: #5f6368; --light: #f8f9fa; --border: #dadce0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #202124; background: #fff; padding: 2rem; max-width: 1200px; margin: 0 auto; }
h1 { color: var(--blue); font-size: 1.8rem; margin-bottom: 0.25rem; }
h2 { color: #202124; font-size: 1.3rem; margin-top: 2rem; margin-bottom: 0.75rem; padding-bottom: 0.4rem; border-bottom: 2px solid var(--blue); }
h3 { color: var(--gray); font-size: 1.05rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.date { color: var(--gray); font-size: 0.95rem; margin-bottom: 1.5rem; }
table { width: 100%; border-collapse: collapse; margin: 0.75rem 0 1.5rem; font-size: 0.9rem; }
th { background: var(--light); color: var(--gray); font-weight: 600; text-align: left; padding: 0.6rem 0.75rem; border: 1px solid var(--border); }
td { padding: 0.5rem 0.75rem; border: 1px solid var(--border); }
tr:hover td { background: #f1f3f4; }
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.8rem; font-weight: 500; }
.badge-red { background: #fce8e6; color: var(--red); }
.badge-yellow { background: #fef7e0; color: #e37400; }
.risk { background: #fce8e6; border-left: 4px solid var(--red); padding: 0.75rem 1rem; margin: 0.75rem 0; border-radius: 0 4px 4px 0; }
.success { background: #e6f4ea; border-left: 4px solid var(--green); padding: 0.75rem 1rem; margin: 0.75rem 0; border-radius: 0 4px 4px 0; }
.insight { background: var(--light); border-left: 4px solid var(--blue); padding: 0.75rem 1rem; margin: 0.75rem 0; border-radius: 0 4px 4px 0; }
.stats { display: flex; gap: 1.5rem; margin: 1rem 0; flex-wrap: wrap; }
.stat-card { background: var(--light); border: 1px solid var(--border); border-radius: 8px; padding: 1rem 1.25rem; min-width: 140px; }
.stat-card .value { font-size: 1.8rem; font-weight: 700; color: var(--blue); }
.stat-card .label { font-size: 0.8rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.5px; }
.footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--gray); font-size: 0.85rem; }
.none { color: var(--gray); font-style: italic; }
ul { margin: 0.5rem 0 1rem 1.5rem; }
li { margin: 0.3rem 0; }
@media print { body { padding: 1rem; } }
"""


# --- Report generation ---
def generate_reports(release, rel_data, output_dir, today, now_ts):
    """Generate both .md and .html reports for a single release."""
    issues = rel_data["all"]
    recent = rel_data["recent"]
    created = rel_data["created"]
    stagnant = rel_data["stagnant"]
    total = len(issues)
    version = release.replace("DSP ", "")
    prev = load_previous_counts(output_dir, version)

    # Status aggregation
    status_counts = defaultdict(int)
    for issue in issues:
        status_counts[issue["fields"]["status"]["name"]] += 1

    in_progress = sum(status_counts.get(s, 0) for s in ["In Dev", "In Code Review", "In Progress"])
    in_testing = sum(status_counts.get(s, 0) for s in ["Ready for QA", "In QA", "In Testing"])
    awaiting_release = status_counts.get("Awaiting Release", 0)
    done = sum(status_counts.get(s, 0) for s in ["Closed", "Done", "Resolved", "Next Phase"])
    blocked = status_counts.get("Blocked", 0)
    other = total - in_progress - in_testing - awaiting_release - done - blocked
    open_total = total - done

    summary_rows = [
        ("In Progress / Dev", in_progress),
        ("Ready for QA / Testing", in_testing),
        ("Awaiting Release", awaiting_release),
        ("Blocked", blocked),
        ("Closed / Done / Next Phase", done),
    ]
    if other > 0:
        summary_rows.append(("Other", other))

    # Promoted bugs (last 24h)
    promoted = []
    for issue in recent:
        st = issue["fields"]["status"]["name"]
        if st in ["Awaiting Release", "Closed", "Done", "Next Phase", "Ready for QA", "Resolved"]:
            a = issue["fields"].get("assignee")
            promoted.append({
                "key": issue["key"], "summary": issue["fields"]["summary"][:70],
                "status": st, "assignee": a["displayName"] if a else "Unassigned",
                "updated": issue["fields"]["updated"][:16].replace("T", " "),
            })

    # New bugs (last 24h)
    new_bugs = []
    for issue in created:
        a = issue["fields"].get("assignee")
        new_bugs.append({
            "key": issue["key"], "summary": issue["fields"]["summary"][:70],
            "priority": issue["fields"]["priority"]["name"],
            "assignee": a["displayName"] if a else "Unassigned",
            "created": issue["fields"]["created"][:16].replace("T", " "),
        })

    # Stagnant bugs (top 15 by age)
    stagnant_list = []
    for issue in stagnant[:15]:
        a = issue["fields"].get("assignee")
        days = (datetime.now(timezone.utc) - datetime.fromisoformat(
            issue["fields"]["updated"].replace("+0000", "+00:00")
        )).days
        stagnant_list.append({
            "key": issue["key"], "summary": issue["fields"]["summary"][:55],
            "status": issue["fields"]["status"]["name"],
            "assignee": a["displayName"] if a else "Unassigned",
            "updated": issue["fields"]["updated"][:10], "days": days,
        })
    stagnant_list.sort(key=lambda x: -x["days"])

    # Blocked bugs
    blocked_list = []
    for i in issues:
        if i["fields"]["status"]["name"] == "Blocked":
            a = i["fields"].get("assignee")
            blocked_list.append({
                "key": i["key"], "summary": i["fields"]["summary"][:55],
                "assignee": a["displayName"] if a else "Unassigned",
                "updated": i["fields"]["updated"][:10],
            })

    # --- Generate Markdown ---
    md = []
    md.append(f"# POS {release} — Daily Bug Report\n")
    md.append(f"> Date: {today}\n")
    md.append("## 1. Bugs Status Summary\n")
    md.append("| Status | Count | Delta | % of Total |")
    md.append("|--------|-------|-------|------------|")
    for label, count in summary_rows:
        md.append(f"| {label} | {count} | {delta_str(prev, label, count)} | {pct(count, total)} |")
    md.append(f"| **Total** | **{total}** | — | **100%** |")
    if not prev:
        md.append("\n> First report — no deltas available.")

    md.append("\n### Status Detail\n")
    md.append("| Status | Count |")
    md.append("|--------|-------|")
    for st, ct in sorted(status_counts.items(), key=lambda x: -x[1]):
        md.append(f"| {st} | {ct} |")

    md.append("\n## 2. Bugs Promoted to Next Phase (last 24h)\n")
    if promoted:
        md.append("| Key | Summary | Status | Assignee | Promoted At |")
        md.append("|-----|---------|--------|----------|-------------|")
        for p in promoted[:20]:
            md.append(f"| {p['key']} | {p['summary']} | {p['status']} | {p['assignee']} | {p['updated']} |")
    else:
        md.append("None in the last 24 hours.")

    md.append("\n## 3. Bugs Created (last 24h)\n")
    if new_bugs:
        md.append("| Key | Summary | Priority | Assignee | Created |")
        md.append("|-----|---------|----------|----------|---------|")
        for b in new_bugs:
            md.append(f"| {b['key']} | {b['summary']} | {b['priority']} | {b['assignee']} | {b['created']} |")
    else:
        md.append("None created in the last 24 hours.")

    md.append("\n## 4. Risks and Attention Points\n")
    md.append(f"### Stagnant Bugs (7+ days no movement): {len(stagnant)} total\n")
    if stagnant_list:
        md.append("| Key | Summary | Status | Assignee | Last Updated | Days |")
        md.append("|-----|---------|--------|----------|--------------|------|")
        for s in stagnant_list:
            md.append(f"| {s['key']} | {s['summary']} | {s['status']} | {s['assignee']} | {s['updated']} | {s['days']} |")
        if len(stagnant) > 15:
            md.append(f"\n*Showing top 15 of {len(stagnant)} stagnant bugs.*")

    md.append(f"\n### Blocked Bugs: {len(blocked_list)}\n")
    if blocked_list:
        md.append("| Key | Summary | Assignee | Last Updated |")
        md.append("|-----|---------|----------|--------------|")
        for b in blocked_list:
            md.append(f"| {b['key']} | {b['summary']} | {b['assignee']} | {b['updated']} |")
    else:
        md.append("None currently blocked.")

    md.append("\n### Flow Bottlenecks\n")
    has_bn = False
    if open_total > 0:
        for label, count in [("Awaiting Release", awaiting_release), ("Ready for QA/Testing", in_testing)]:
            p2 = count / open_total * 100
            if p2 > 35:
                md.append(f"- **{label}**: {count} bugs ({p2:.1f}% of open) ⚠️")
                has_bn = True
    if not has_bn:
        md.append("No significant bottlenecks detected.")

    md.append("\n## 5. Throughput Insights\n")
    md.append(f"**Total bugs:** {total} | **Open:** {open_total} | **Closed/Done:** {done}\n")
    md.append(f"- **Activity in last 24h:** {len(recent)} bugs updated, {len(created)} new bugs created")
    md.append(f"- **Promoted forward:** {len(promoted)} bugs moved to a later phase")
    if open_total > 0:
        md.append(f"- **Stagnant (7d+):** {len(stagnant)} bugs ({len(stagnant)/open_total*100:.1f}% of open)")
    md.append(f"- **Blocked:** {len(blocked_list)} bugs currently blocked")
    if open_total > 10 and len(stagnant) > open_total * 0.5:
        md.append("\n⚠️ **Delivery Risk:** Over 50% of open bugs are stagnant. Consider triage sweep.")
    if open_total > 10 and awaiting_release > open_total * 0.4:
        md.append(f"\n✅ **Release Readiness:** {awaiting_release} bugs awaiting release ({awaiting_release/open_total*100:.1f}% of open).")
    md.append(f"\n---\n\n_Generated: {now_ts}_")

    (output_dir / f"pos-dsp-{version}-daily-report-{today}.md").write_text("\n".join(md))

    # --- Generate HTML ---
    h = []
    h.append(f'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">')
    h.append(f"<title>POS {release} — Daily Bug Report</title>")
    h.append(f"<style>{CSS}</style></head><body>")
    h.append(f"<h1>POS {release} — Daily Bug Report</h1>")
    h.append(f'<p class="date">{today}</p>')

    # Stat cards
    h.append('<div class="stats">')
    for val, lbl in [(total, "Total Bugs"), (open_total, "Open"), (done, "Closed/Done"), (blocked, "Blocked"), (len(stagnant), "Stagnant (7d+)")]:
        h.append(f'<div class="stat-card"><div class="value">{val}</div><div class="label">{lbl}</div></div>')
    h.append("</div>")

    # Section 1
    h.append("<h2>1. Bugs Status Summary</h2>")
    h.append("<table><tr><th>Status</th><th>Count</th><th>Delta</th><th>%</th></tr>")
    for label, count in summary_rows:
        h.append(f"<tr><td>{label}</td><td>{count}</td><td>{delta_str(prev, label, count)}</td><td>{pct(count, total)}</td></tr>")
    h.append(f'<tr style="font-weight:bold"><td>Total</td><td>{total}</td><td>—</td><td>100%</td></tr></table>')
    if not prev:
        h.append('<p class="none">First report — no deltas available.</p>')

    # Status detail
    h.append("<h3>Status Detail</h3><table><tr><th>Status</th><th>Count</th></tr>")
    for st, ct in sorted(status_counts.items(), key=lambda x: -x[1]):
        h.append(f"<tr><td>{st}</td><td>{ct}</td></tr>")
    h.append("</table>")

    # Section 2
    h.append("<h2>2. Bugs Promoted to Next Phase (last 24h)</h2>")
    if promoted:
        h.append("<table><tr><th>Key</th><th>Summary</th><th>Status</th><th>Assignee</th><th>Promoted At</th></tr>")
        for p in promoted[:20]:
            h.append(f'<tr><td>{p["key"]}</td><td>{p["summary"]}</td><td>{p["status"]}</td><td>{p["assignee"]}</td><td>{p["updated"]}</td></tr>')
        h.append("</table>")
    else:
        h.append('<p class="none">None in the last 24 hours.</p>')

    # Section 3
    h.append("<h2>3. Bugs Created (last 24h)</h2>")
    if new_bugs:
        h.append("<table><tr><th>Key</th><th>Summary</th><th>Priority</th><th>Assignee</th><th>Created</th></tr>")
        for b in new_bugs:
            h.append(f'<tr><td>{b["key"]}</td><td>{b["summary"]}</td><td>{b["priority"]}</td><td>{b["assignee"]}</td><td>{b["created"]}</td></tr>')
        h.append("</table>")
    else:
        h.append('<p class="none">None created in the last 24 hours.</p>')

    # Section 4
    h.append("<h2>4. Risks and Attention Points</h2>")
    h.append(f"<h3>Stagnant Bugs (7+ days): {len(stagnant)} total</h3>")
    if stagnant_list:
        h.append("<table><tr><th>Key</th><th>Summary</th><th>Status</th><th>Assignee</th><th>Last Updated</th><th>Days</th></tr>")
        for s in stagnant_list:
            badge = "badge-red" if s["days"] > 30 else "badge-yellow"
            h.append(f'<tr><td>{s["key"]}</td><td>{s["summary"]}</td><td>{s["status"]}</td><td>{s["assignee"]}</td><td>{s["updated"]}</td><td><span class="badge {badge}">{s["days"]}d</span></td></tr>')
        h.append("</table>")
        if len(stagnant) > 15:
            h.append(f'<p class="none">Showing top 15 of {len(stagnant)} stagnant bugs.</p>')

    h.append(f"<h3>Blocked Bugs: {len(blocked_list)}</h3>")
    if blocked_list:
        h.append("<table><tr><th>Key</th><th>Summary</th><th>Assignee</th><th>Last Updated</th></tr>")
        for b in blocked_list:
            h.append(f'<tr><td>{b["key"]}</td><td>{b["summary"]}</td><td>{b["assignee"]}</td><td>{b["updated"]}</td></tr>')
        h.append("</table>")
    else:
        h.append('<p class="none">None currently blocked.</p>')

    # Bottlenecks
    h.append("<h3>Flow Bottlenecks</h3>")
    has_bn2 = False
    if open_total > 0:
        for label, count in [("Awaiting Release", awaiting_release), ("Ready for QA/Testing", in_testing)]:
            p2 = count / open_total * 100
            if p2 > 35:
                h.append(f'<div class="risk"><strong>{label}</strong>: {count} bugs ({p2:.1f}% of open) ⚠️</div>')
                has_bn2 = True
    if not has_bn2:
        h.append('<p class="none">No significant bottlenecks detected.</p>')

    # Section 5
    h.append("<h2>5. Throughput Insights</h2>")
    h.append(f'<div class="insight"><strong>Total:</strong> {total} | <strong>Open:</strong> {open_total} | <strong>Closed/Done:</strong> {done}</div>')
    h.append("<ul>")
    h.append(f"<li><strong>Activity (24h):</strong> {len(recent)} bugs updated, {len(created)} new</li>")
    h.append(f"<li><strong>Promoted:</strong> {len(promoted)} bugs moved forward</li>")
    if open_total > 0:
        h.append(f"<li><strong>Stagnant (7d+):</strong> {len(stagnant)} ({len(stagnant)/open_total*100:.1f}% of open)</li>")
    h.append(f"<li><strong>Blocked:</strong> {len(blocked_list)}</li></ul>")

    if open_total > 10 and len(stagnant) > open_total * 0.5:
        h.append('<div class="risk">⚠️ <strong>Delivery Risk:</strong> Over 50% of open bugs are stagnant.</div>')
    if open_total > 10 and awaiting_release > open_total * 0.4:
        h.append(f'<div class="success">✅ <strong>Release Readiness:</strong> {awaiting_release} bugs awaiting release ({awaiting_release/open_total*100:.1f}% of open).</div>')

    h.append(f'<div class="footer">Generated: {now_ts}</div></body></html>')

    (output_dir / f"pos-dsp-{version}-daily-report-{today}.html").write_text("\n".join(h))


# --- Main ---
def main():
    parser = argparse.ArgumentParser(description="Generate DSP daily bug reports")
    default_output = str(Path(__file__).resolve().parent / '..' / '..' / '..' / '..' / '..' / 'POS Output')
    parser.add_argument("--output-dir", default=default_output, help="Directory to save reports (default: POS Output/)")
    parser.add_argument("--release", help="Generate for a specific release only (e.g. 'DSP 2.1.2')")
    parser.add_argument("--open", action="store_true", help="Open HTML reports in browser after generation")
    args = parser.parse_args()

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    releases = [args.release] if args.release else ALL_RELEASES

    auth = get_auth()
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now_ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    base_jql = f'project = "Point of Sale" AND Team in ({TEAM_IDS}) AND issuetype = Bug'

    print(f"DSP Bug Report Generator — {today}")
    print(f"Output: {output_dir}")
    if is_biweekly_day():
        print("📊 Biweekly report day detected (not yet implemented in CLI mode)")
    print()

    # Fetch data
    all_data = {}
    for rel in releases:
        print(f"  Fetching {rel}...", end=" ", flush=True)
        jql = f'{base_jql} AND "Target Release" ~ "{rel}"'
        issues = search_jira(jql, auth)
        recent = search_jira(f"{jql} AND updated >= -1d", auth)
        created = search_jira(f"{jql} AND created >= -1d", auth)
        stagnant = search_jira(f'{jql} AND updated <= -7d AND status not in (Closed, Done, Resolved)', auth)
        all_data[rel] = {"all": issues, "recent": recent, "created": created, "stagnant": stagnant}
        print(f"{len(issues)} bugs")

    # Generate reports
    print()
    for rel in releases:
        generate_reports(rel, all_data[rel], output_dir, today, now_ts)
        version = rel.replace("DSP ", "")
        print(f"  ✅ pos-dsp-{version}-daily-report-{today}.md + .html")

    # Open in browser
    if args.open:
        import subprocess
        for rel in releases:
            version = rel.replace("DSP ", "")
            html_path = output_dir / f"pos-dsp-{version}-daily-report-{today}.html"
            subprocess.run(["open", str(html_path)], check=False)

    print(f"\nDone! {len(releases)} report(s) generated.")


if __name__ == "__main__":
    main()
