#!/usr/bin/env python3
"""
Weekly Control & Kaos Sprint Report Generator (Full)
Queries Jira via Atlassian MCP and generates a COMPLETE HTML report.
Scheduled: Mondays 9 AM Argentina time (ART/UTC-3)
"""

import subprocess
import json
import os
import sys
from datetime import datetime, date
from pathlib import Path
from html import escape
import re

# === Configuration ===
SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_FILE = SCRIPT_DIR.parent / ".report_config"

def load_config() -> dict:
    """Load configuration from .report_config file."""
    config = {
        "reports_dir": str(Path.home() / "Documents" / "Control-Kaos Reports" / "reports"),
        "jira_method": "api",
        "jira_email": "",
        "jira_token": "",
    }
    if CONFIG_FILE.exists():
        for line in CONFIG_FILE.read_text().splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip().lower()
            val = val.strip().strip('"')
            if key == "reports_dir":
                config["reports_dir"] = val
            elif key == "jira_method":
                config["jira_method"] = val
            elif key == "jira_email":
                config["jira_email"] = val
            elif key == "jira_token":
                config["jira_token"] = val
    return config

CONFIG = load_config()
REPORTS_DIR = Path(CONFIG["reports_dir"])
JIRA_METHOD = CONFIG["jira_method"]
CONTROL_BOARD_ID = "3411"
KAOS_BOARD_ID = "3441"
DOCKER_CONTAINER = "mcp-atlassian"
JIRA_BASE_URL = "https://disneyexperiences.atlassian.net/browse"
JIRA_API_BASE = "https://disneyexperiences.atlassian.net/rest"


# === MCP Communication ===

def call_mcp(tool_name: str, arguments: dict) -> dict:
    """Call an MCP tool via docker exec to the atlassian container."""
    init_msg = json.dumps({
        "jsonrpc": "2.0", "id": 0, "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "report-gen", "version": "1.0"}
        }
    })
    call_msg = json.dumps({
        "jsonrpc": "2.0", "id": 1, "method": "tools/call",
        "params": {"name": tool_name, "arguments": arguments}
    })
    
    input_data = f"{init_msg}\n{call_msg}\n"
    
    try:
        result = subprocess.run(
            ["docker", "exec", "-i", DOCKER_CONTAINER, "mcp-atlassian"],
            input=input_data, capture_output=True, text=True, timeout=30
        )
    except subprocess.TimeoutExpired:
        print(f"  [TIMEOUT] {tool_name} timed out after 30s")
        return {}
    except FileNotFoundError:
        print("  [ERROR] docker not found in PATH")
        return {}
    
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
            if data.get("id") == 1:
                if "error" in data:
                    print(f"  [MCP ERROR] {tool_name}: {data['error']}")
                    return {}
                content = data.get("result", {}).get("content", [])
                if content:
                    text = content[0].get("text", "")
                    return json.loads(text) if text else {}
        except (json.JSONDecodeError, IndexError, KeyError):
            continue
    return {}


# === API REST Client (alternative to Docker MCP) ===

def api_request(endpoint: str, params: dict = None) -> dict:
    """Make a REST API call to Atlassian Cloud."""
    import urllib.request
    import urllib.parse
    import base64
    
    email = CONFIG["jira_email"]
    token = CONFIG["jira_token"]
    
    if not email or not token:
        print("  [ERROR] Jira API credentials not configured. Run install.sh again.")
        return {}
    
    url = f"{JIRA_API_BASE}/{endpoint}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    
    auth = base64.b64encode(f"{email}:{token}".encode()).decode()
    req = urllib.request.Request(url, headers={
        "Authorization": f"Basic {auth}",
        "Accept": "application/json",
    })
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [API ERROR] {endpoint}: {e}")
        return {}


def api_get_active_sprints(board_id: str) -> list:
    """Get active sprints via REST API."""
    data = api_request(f"agile/1.0/board/{board_id}/sprint", {"state": "active"})
    sprints = []
    for s in data.get("values", []):
        sprints.append({
            "id": str(s.get("id", "")),
            "name": s.get("name", ""),
            "state": s.get("state", ""),
            "start_date": s.get("startDate", ""),
            "end_date": s.get("endDate", ""),
        })
    return sprints


def api_get_sprint_issues(sprint_id: str) -> list:
    """Get sprint issues via REST API."""
    data = api_request(f"agile/1.0/sprint/{sprint_id}/issue", {
        "maxResults": 50,
        "fields": "summary,status,issuetype,labels,assignee,fixVersions"
    })
    issues = []
    for item in data.get("issues", []):
        fields = item.get("fields", {})
        issues.append({
            "key": item.get("key", ""),
            "summary": fields.get("summary", ""),
            "status": {"name": fields.get("status", {}).get("name", "")},
            "issue_type": {"name": fields.get("issuetype", {}).get("name", "")},
            "labels": fields.get("labels", []),
        })
    return issues


def api_search_issues(jql: str) -> list:
    """Search issues via REST API."""
    data = api_request("api/2/search", {
        "jql": jql,
        "maxResults": 30,
        "fields": "summary,status,issuetype,labels,assignee,fixVersions,created,updated"
    })
    issues = []
    for item in data.get("issues", []):
        fields = item.get("fields", {})
        issues.append({
            "key": item.get("key", ""),
            "summary": fields.get("summary", ""),
            "status": {"name": fields.get("status", {}).get("name", "")},
            "issue_type": {"name": fields.get("issuetype", {}).get("name", "")},
            "labels": fields.get("labels", []),
            "created": fields.get("created", ""),
            "updated": fields.get("updated", ""),
        })
    return issues


# === Unified Interface (dispatches based on JIRA_METHOD) ===

def get_active_sprints(board_id: str) -> list:
    if JIRA_METHOD == "docker_mcp":
        result = call_mcp("jira_get_sprints_from_board", {"board_id": board_id, "state": "active"})
        return result if isinstance(result, list) else []
    else:
        return api_get_active_sprints(board_id)


def get_sprint_issues(sprint_id: str) -> list:
    if JIRA_METHOD == "docker_mcp":
        result = call_mcp("jira_get_sprint_issues", {"sprint_id": sprint_id, "limit": "50"})
        return result.get("issues", [])
    else:
        return api_get_sprint_issues(sprint_id)


def search_issues(jql: str) -> list:
    if JIRA_METHOD == "docker_mcp":
        result = call_mcp("jira_search", {"jql": jql, "limit": "30"})
        return result.get("issues", [])
    else:
        return api_search_issues(jql)


# === Previous Report Parsing ===

def find_latest_report() -> tuple:
    """Find the most recent Control & Kaos report. Returns (path, date_str).
    Falls back to the template if no previous report exists."""
    dirs = sorted(REPORTS_DIR.glob("202*"))
    for d in reversed(dirs):
        if "-mcqueen" in d.name or "-rex" in d.name:
            continue
        html_files = list(d.glob("sprint_status_report_*.html"))
        # Skip drafts
        html_files = [f for f in html_files if "_draft" not in f.name]
        if html_files:
            return html_files[0], d.name
    # Fallback: use the template bundled with the agent
    template_path = SCRIPT_DIR / ".." / "templates" / "sprint_status_report_template.html"
    if template_path.exists():
        print("    Using template as base (no previous report found)")
        return template_path.resolve(), None
    return None, None


def parse_previous_report(html: str) -> dict:
    """Parse the previous report HTML to extract all tracked data."""
    prev = {
        "events": [],
        "releases": [],
        "important_updates_html": "",
        "security_html": "",
        "features_control": [],
        "features_kaos": [],
        "bugs_control": [],
        "bugs_kaos": [],
        "all_ticket_statuses": {},
    }
    
    # Extract all COM-XXXXX with statuses
    for match in re.finditer(r'(COM-\d+).*?badge[- ](\w+)"[^>]*>([^<]+)<', html):
        key = match.group(1)
        status = match.group(3).strip()
        if key not in prev["all_ticket_statuses"]:
            prev["all_ticket_statuses"][key] = status
    
    # Extract sections by h2 boundaries
    sections = re.split(r'<h2>', html)
    for section in sections:
        if section.startswith("Events and Offers"):
            # Extract events table rows
            prev["events_html"] = "<h2>" + section.split("<hr>")[0]
        elif section.startswith("Releases"):
            prev["releases_html"] = "<h2>" + section.split("<hr>")[0]
        elif section.startswith("Important Updates"):
            prev["important_updates_html"] = "<h2>" + section.split("<hr>")[0]
        elif section.startswith("Security Findings"):
            prev["security_html"] = "<h2>" + section.split("<hr>")[0]
        elif section.startswith("Feature Deliverables"):
            prev["features_html"] = "<h2>" + section.split("<hr>")[0]
        elif section.startswith("Bugs"):
            prev["bugs_html"] = "<h2>" + section.split("<hr>")[0]
    
    return prev


# === Data Collection ===

def collect_report_data() -> dict:
    """Collect all data needed for a complete report."""
    print("📊 Collecting report data...")
    data = {
        "report_date": date.today().strftime("%m/%d/%Y"),
        "report_date_iso": date.today().strftime("%Y-%m-%d"),
    }
    
    # 1. Get active sprints
    print("  → Getting Control sprints...")
    control_sprints = get_active_sprints(CONTROL_BOARD_ID)
    data["control_sprint"] = next((s for s in control_sprints if "Control" in s.get("name", "")), None)
    
    print("  → Getting Kaos sprints...")
    kaos_sprints = get_active_sprints(KAOS_BOARD_ID)
    data["kaos_sprint"] = next((s for s in kaos_sprints if "Kaos" in s.get("name", "")), None)
    
    # 2. Read and parse previous report
    print("  → Reading previous report...")
    prev_path, prev_date = find_latest_report()
    if prev_path:
        print(f"    Found: {prev_path.name} ({prev_date})")
        with open(prev_path, "r") as f:
            prev_html = f.read()
        data["previous"] = parse_previous_report(prev_html)
        data["previous_date"] = prev_date
        data["previous_path"] = prev_path
    else:
        print("    ⚠️ No previous report found — will generate from scratch")
        data["previous"] = None
        data["previous_date"] = None
    
    # 3. Get current status of ALL tracked tickets from previous report
    if data["previous"]:
        tracked_keys = list(data["previous"]["all_ticket_statuses"].keys())
        print(f"  → Checking {len(tracked_keys)} tracked tickets...")
        current_statuses = {}
        # Query in batches of 20
        for i in range(0, len(tracked_keys), 20):
            batch = tracked_keys[i:i+20]
            jql = f"key in ({','.join(batch)})"
            results = search_issues(jql)
            for issue in results:
                key = issue.get("key", "")
                current_statuses[key] = issue.get("status", {}).get("name", "")
        data["current_statuses"] = current_statuses
    else:
        data["current_statuses"] = {}
    
    # 4. Get new bugs since last report
    if prev_date:
        print(f"  → Searching new bugs since {prev_date}...")
        jql = f'project = COM AND type = Bug AND created >= "{prev_date}" ORDER BY created DESC'
        data["new_bugs"] = search_issues(jql)
    else:
        data["new_bugs"] = []
    
    # 5. Get release readiness trackers
    print("  → Checking release trackers...")
    jql = 'project = COM AND labels = release-readiness-tracker AND status != Closed ORDER BY created DESC'
    data["release_trackers"] = search_issues(jql)
    
    print("✅ Data collection complete\n")
    return data


# === HTML Generation ===

HTML_CSS = """\
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 960px; margin: 20px auto; padding: 20px; color: #1a1a1a; line-height: 1.5; }
  h1 { font-size: 18pt; color: #1a237e; border-bottom: 3px solid #1a237e; padding-bottom: 8px; }
  h2 { font-size: 14pt; color: #283593; margin-top: 30px; border-bottom: 1px solid #c5cae9; padding-bottom: 4px; }
  h3 { font-size: 12pt; color: #3949ab; margin-top: 20px; }
  h4 { font-size: 11pt; color: #444; margin-top: 14px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 10pt; }
  th { background: #1a237e; color: white; padding: 8px 10px; text-align: left; }
  td { border: 1px solid #ddd; padding: 7px 10px; vertical-align: top; }
  tr:nth-child(even) { background: #f5f5f5; }
  ul { margin: 6px 0 16px 20px; padding: 0; }
  li { margin-bottom: 5px; }
  .important-updates li { margin-bottom: 16px; }
  .subtitle { font-size: 11pt; color: #666; margin-top: -10px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: 600; }
  .badge-progress { background: #fff3e0; color: #e65100; }
  .badge-ready { background: #e8f5e9; color: #2e7d32; }
  .badge-review { background: #e3f2fd; color: #1565c0; }
  .badge-open { background: #fafafa; color: #616161; }
  .badge-closed { background: #e8f5e9; color: #2e7d32; }
  .badge-blocked { background: #fce4ec; color: #c62828; }
  .badge-critical { color: #c62828; font-weight: bold; }
  a { color: #1565c0; text-decoration: none; }
  .new-tag { background-color: #e3f2fd; color: #0d47a1; font-size: 9pt; padding: 1px 5px; border-radius: 3px; font-weight: bold; }
  .changed-tag { background-color: #fff8e1; color: #f57f17; font-size: 9pt; padding: 1px 5px; border-radius: 3px; font-weight: bold; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
  .project-block { margin: 24px 0; padding: 8px 12px; border-left: 3px solid #1a237e; background: #f9fbfd; }
  .project-title { margin: 16px 0 4px 0; }
  footer { margin-top: 40px; font-size: 10pt; color: #999; }"""

STATUS_BADGE_MAP = {
    "Open": ("badge-open", "Open"),
    "Not Started": ("badge-open", "Not Started"),
    "In Analysis": ("badge-progress", "In Analysis"),
    "In Development": ("badge-progress", "In Development"),
    "In Progress": ("badge-progress", "In Progress"),
    "In Testing": ("badge-progress", "In Testing"),
    "Ready for Dev": ("badge-open", "Ready for Dev"),
    "Ready for Testing": ("badge-ready", "Ready for Testing"),
    "Peer Review": ("badge-review", "Peer Review"),
    "In Review": ("badge-review", "In Review"),
    "Closed": ("badge-closed", "Closed"),
    "Blocked": ("badge-blocked", "Blocked"),
    "Rejected": ("badge-closed", "Rejected"),
    "Reopened": ("badge-progress", "Reopened"),
    "Released": ("badge-closed", "Released"),
    "Ready": ("badge-ready", "Ready"),
}


def badge_html(status: str) -> str:
    cls, text = STATUS_BADGE_MAP.get(status, ("badge-progress", status))
    return f'<span class="badge {cls}">{text}</span>'


def jira_link(key: str) -> str:
    return f'<a href="{JIRA_BASE_URL}/{key}">{key}</a>'


def format_sprint_dates(sprint: dict) -> str:
    start = sprint.get("start_date", "")[:10]
    end = sprint.get("end_date", "")[:10]
    try:
        s = datetime.strptime(start, "%Y-%m-%d").strftime("%m/%d")
        e = datetime.strptime(end, "%Y-%m-%d").strftime("%m/%d")
        return f"{s}–{e}"
    except ValueError:
        return "TBD"


def update_statuses_in_html(section_html: str, current_statuses: dict, prev_statuses: dict, prev_date: str) -> str:
    """Update badge statuses in a section HTML with current Jira data."""
    
    updated = section_html
    
    for key, new_status in current_statuses.items():
        old_status = prev_statuses.get(key, "")
        if not old_status or old_status == new_status:
            continue
        
        new_cls, new_text = STATUS_BADGE_MAP.get(new_status, ("badge-progress", new_status))
        
        # Strategy: find the ticket key, then find the next badge after it and replace
        # Pattern matches: COM-XXXXX...badge badge-WORD">TEXT</span>
        escaped_key = re.escape(key)
        escaped_old = re.escape(old_status)
        
        # Replace the badge class and text
        pattern = f'({escaped_key}.*?class="badge )(badge-\\w+)(">){escaped_old}(</span>)'
        repl = f'\\1{new_cls}\\3{new_text}\\4'
        updated_new = re.sub(pattern, repl, updated, count=1, flags=re.DOTALL)
        
        if updated_new != updated:
            updated = updated_new
            # Update "Change vs" column: replace the em-dash with change info
            # The em-dash in HTML is the character \u2014
            dash_pattern = f'({escaped_key}[^\\n]*?<\/td><td>)\u2014(<\/td>)'
            dash_repl = f'\\1<span class="changed-tag">\u2191</span> was {old_status}\\2'
            updated = re.sub(dash_pattern, dash_repl, updated, count=1)
    
    return updated


def generate_full_report(data: dict) -> str:
    """Generate a COMPLETE report by taking the previous report as base,
    updating all statuses with current Jira data, and adding new items."""
    
    report_date = data["report_date"]
    prev = data.get("previous")
    current_statuses = data.get("current_statuses", {})
    
    # Sprint info
    ctrl = data.get("control_sprint") or {}
    kaos = data.get("kaos_sprint") or {}
    ctrl_name = ctrl.get("name", "Control Sprint ?")
    kaos_name = kaos.get("name", "Kaos Sprint ?")
    ctrl_num = ctrl_name.split()[-1] if ctrl_name else "?"
    kaos_num = kaos_name.split()[-1] if kaos_name else "?"
    ctrl_dates = format_sprint_dates(ctrl)
    kaos_dates = format_sprint_dates(kaos)
    
    try:
        ctrl_end = datetime.strptime(ctrl.get("end_date", "")[:10], "%Y-%m-%d").strftime("%m/%d")
        kaos_end = datetime.strptime(kaos.get("end_date", "")[:10], "%Y-%m-%d").strftime("%m/%d")
    except ValueError:
        ctrl_end = "TBD"
        kaos_end = "TBD"
    
    prev_date = data.get("previous_date", "")
    prev_statuses = prev["all_ticket_statuses"] if prev else {}
    
    # === If we have a previous report, use it as base and update ===
    if prev:
        # Update each section with current statuses
        events_section = prev.get("events_html", "")
        # Remove events that were already "Launched" in the previous report
        # Rule: once an event is reported as Launched, it doesn't appear again
        events_section = re.sub(r'  <tr>.*?Launched.*?</tr>\n', '', events_section)
        releases_section = prev.get("releases_html", "")
        # Remove releases already marked "Released" in previous report
        # Rule: once reported as Released, they don't appear again
        releases_section = re.sub(r'  <tr>.*?Released.*?</tr>\n', '', releases_section)
        updates_section = update_statuses_in_html(
            prev.get("important_updates_html", ""), current_statuses, prev_statuses, prev_date)
        security_section = prev.get("security_html", "")
        # Remove security findings already Closed in previous report
        security_section = re.sub(r'  <tr>.*?badge-closed.*?Closed.*?</tr>\n', '', security_section)
        security_section = update_statuses_in_html(
            security_section, current_statuses, prev_statuses, prev_date)
        features_section = prev.get("features_html", "")
        # Remove features already Closed/Rejected in previous report
        # Rule: once reported as Closed, they don't appear in the next report
        blocks = re.findall(r'<div class="project-block">.*?</div>\n', features_section, flags=re.DOTALL)
        for block in blocks:
            if 'badge-closed">Closed</span>' in block or 'badge-closed">Rejected</span>' in block:
                features_section = features_section.replace(block, '')
        features_section = update_statuses_in_html(
            features_section, current_statuses, prev_statuses, prev_date)
        bugs_section = prev.get("bugs_html", "")
        # Remove bugs that were in "Resolved since last report" section
        # Rule: resolved bugs are shown once, then removed
        bugs_section = re.sub(
            r'<h4>Resolved since last report:</h4>\n<ul>\n.*?</ul>\n',
            '', bugs_section, flags=re.DOTALL)
        bugs_section = update_statuses_in_html(
            bugs_section, current_statuses, prev_statuses, prev_date)
        
        # Update the "Change vs XX/XX" column headers to use new previous date
        old_change_header = f"Change vs {prev_date[5:]}" if prev_date else "Change"
        new_change_header = f"Change vs {prev_date[5:].replace('-','/')}" if prev_date else "Change"
        
        # Update releases that were "Ready" last week to "Released"
        releases_section = releases_section.replace(
            'badge-ready">Ready</span>', 'badge-closed">Released</span>')
        
        # Add new bugs found since last report
        new_bugs_html = find_new_relevant_bugs(data.get("new_bugs", []), prev_statuses)
        if new_bugs_html:
            # Append before closing of bugs section
            bugs_section = bugs_section.rstrip() + "\n" + new_bugs_html + "\n"
    else:
        # No previous report — generate minimal placeholder
        events_section = "<h2>Events and Offers</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
        releases_section = "<h2>Releases</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
        updates_section = "<h2>Important Updates</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
        security_section = "<h2>Security Findings</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
        features_section = "<h2>Feature Deliverables</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
        bugs_section = "<h2>Bugs</h2>\n<p>No previous report to base on. Needs manual creation.</p>\n"
    
    # === Assemble full HTML ===
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sprint Status Report - Control &amp; Kaos - {report_date}</title>
<style>{HTML_CSS}</style>
</head>
<body>

<h1>Sprint Status Report — Kaos &amp; Control Teams</h1>
<p class="subtitle"><strong>Report Date:</strong> {report_date} | <strong>Sprints:</strong> Control {ctrl_num} ({ctrl_dates}) · Kaos {kaos_num} ({kaos_dates}) | <strong>Sprint ends:</strong> Control {ctrl_end} · Kaos {kaos_end}</p>

<hr>

{events_section}
<hr>

{releases_section}
<hr>

{updates_section}
<hr>

{security_section}
<hr>

{features_section}
<hr>

{bugs_section}
<hr>

<footer>Report generated {report_date} from Jira boards COM - Studio Control (3411) and COM - Studio Kaos (3441) — disneyexperiences.atlassian.net</footer>

</body>
</html>"""
    
    return html


def find_new_relevant_bugs(new_bugs: list, already_tracked: dict) -> str:
    """Find new bugs from Control/Kaos that weren't in the previous report."""
    control_labels = {"studio-control-functional-bug", "studio-control-ui", "studio-control-service"}
    kaos_labels = {"kaos-test", "kaos-test-priority"}
    exclude_kw = ["Android", "iOS", "Mobile", "LL Multi", "DTA", "Booking-SVC", "AP Sales", 
                  "Grogu", "Wall-E", "Bluey", "Bingo"]
    
    new_control = []
    new_kaos = []
    
    for bug in new_bugs:
        key = bug.get("key", "")
        if key in already_tracked:
            continue  # Already in previous report
        
        labels_set = set(bug.get("labels", []))
        summary = bug.get("summary", "")
        status = bug.get("status", {}).get("name", "Not Started")
        
        # Skip excluded
        if any(kw in summary for kw in exclude_kw):
            continue
        
        # Determine studio
        is_control = bool(labels_set & control_labels) or any(
            kw in summary for kw in ["WDW | Ticket", "WDW | Tix", "TicketSPA", "LexVAS", "EVAS | WDW", "Stop Sales"])
        is_kaos = bool(labels_set & kaos_labels) or any(
            kw in summary for kw in ["DLR | Ticket", "DLR | Tix", "DLR | Stage", "DLR | Latest", "DLR | EVAS", "DLR | TMS"])
        
        if is_control:
            new_control.append((key, summary, status))
        elif is_kaos:
            new_kaos.append((key, summary, status))
    
    html_parts = []
    if new_control:
        html_parts.append('<h3>Control — New Bugs</h3>\n<ul>\n')
        for key, summary, status in new_control[:5]:
            html_parts.append(f'  <li>{jira_link(key)}: {escape(summary)} — {badge_html(status)} <span class="new-tag">NEW</span></li>\n')
        html_parts.append('</ul>\n')
    
    if new_kaos:
        html_parts.append('<h3>Kaos — New Bugs</h3>\n<ul>\n')
        for key, summary, status in new_kaos[:5]:
            html_parts.append(f'  <li>{jira_link(key)}: {escape(summary)} — {badge_html(status)} <span class="new-tag">NEW</span></li>\n')
        html_parts.append('</ul>\n')
    
    return "".join(html_parts)


# === Main ===

def main():
    print("=" * 60)
    print("  Weekly Control & Kaos Report Generator")
    print(f"  Date: {date.today().strftime('%Y-%m-%d %A')}")
    print("=" * 60)
    print()
    
    # Check docker container
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={DOCKER_CONTAINER}", "--format", "{{.Status}}"],
            capture_output=True, text=True, timeout=5
        )
        if "Up" not in result.stdout:
            print(f"❌ Docker container '{DOCKER_CONTAINER}' is not running!")
            print("   Start it with: docker start mcp-atlassian")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Cannot check docker: {e}")
        sys.exit(1)
    
    print(f"✅ Docker container '{DOCKER_CONTAINER}' is running\n")
    
    # Collect data
    data = collect_report_data()
    
    # Generate HTML
    print("📝 Generating full HTML report...")
    html = generate_full_report(data)
    
    # Save report
    report_dir = REPORTS_DIR / data["report_date_iso"]
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f"sprint_status_report_{data['report_date_iso']}.html"
    
    # Don't overwrite existing approved reports
    if report_path.exists() and "--force" not in sys.argv:
        report_path = report_dir / f"sprint_status_report_{data['report_date_iso']}_draft.html"
        print(f"  ℹ️  Existing report found, saving as draft: {report_path.name}")
    
    with open(report_path, "w") as f:
        f.write(html)
    
    print(f"✅ Report saved to: {report_path}\n")
    
    # Summary of changes detected
    if data.get("previous"):
        prev_statuses = data["previous"]["all_ticket_statuses"]
        current = data.get("current_statuses", {})
        changes = [(k, prev_statuses.get(k, ""), v) 
                   for k, v in current.items() 
                   if prev_statuses.get(k, "") and prev_statuses.get(k, "") != v]
        
        if changes:
            print("📋 Status changes detected:")
            for key, old, new in changes:
                print(f"   {key}: {old} → {new}")
            print()
    
    print("=" * 60)
    print("  Report is ready for review.")
    print("  Open in Kiro for adjustments if needed.")
    print("=" * 60)
    
    # Open the file (only if running interactively)
    if sys.stdout.isatty():
        import platform
        system = platform.system()
        if system == "Darwin":
            subprocess.run(["open", str(report_path)])
        elif system == "Linux":
            subprocess.run(["xdg-open", str(report_path)])
        elif system == "Windows":
            os.startfile(str(report_path))
    
    return str(report_path)


if __name__ == "__main__":
    main()
