import json
import os
import sys
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', '..', '..', '..', '..', 'POS Output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(os.path.join(OUTPUT_DIR, 'pos_bugs.json')) as f:
    data = json.load(f)

issues = data.get('issues', [])
print(f"Total issues: {len(issues)}")

# Group by status
status_counts = {}
for issue in issues:
    status = issue['fields']['status']['name']
    status_counts[status] = status_counts.get(status, 0) + 1

print("\nStatus breakdown:")
for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
    pct = (c / len(issues)) * 100 if issues else 0
    print(f"  {s}: {c} ({pct:.1f}%)")

# Bugs created in last 24h
now = datetime.utcnow()
cutoff_24h = now - timedelta(hours=24)
cutoff_7d = now - timedelta(days=7)

print("\n--- Created in last 24h ---")
for issue in issues:
    created = datetime.strptime(issue['fields']['created'][:19], '%Y-%m-%dT%H:%M:%S')
    if created >= cutoff_24h:
        assignee = issue['fields'].get('assignee')
        name = assignee['displayName'] if assignee else 'Unassigned'
        print(f"  {issue['key']} | {issue['fields']['summary'][:80]} | {issue['fields']['status']['name']} | {name}")

print("\n--- Updated in last 24h (potential promotions) ---")
for issue in issues:
    updated = datetime.strptime(issue['fields']['updated'][:19], '%Y-%m-%dT%H:%M:%S')
    if updated >= cutoff_24h:
        assignee = issue['fields'].get('assignee')
        name = assignee['displayName'] if assignee else 'Unassigned'
        print(f"  {issue['key']} | {issue['fields']['summary'][:60]} | {issue['fields']['status']['name']} | {name} | Updated: {issue['fields']['updated'][:16]}")

print("\n--- Stagnant (no update in 7+ days, not Closed) ---")
for issue in issues:
    status = issue['fields']['status']['name']
    if status == 'Closed':
        continue
    updated = datetime.strptime(issue['fields']['updated'][:19], '%Y-%m-%dT%H:%M:%S')
    if updated < cutoff_7d:
        assignee = issue['fields'].get('assignee')
        name = assignee['displayName'] if assignee else 'Unassigned'
        days_stale = (now - updated).days
        print(f"  {issue['key']} | {issue['fields']['summary'][:60]} | {status} | {name} | Stale {days_stale}d")

# Print all issues for reference
print("\n--- All issues detail ---")
for issue in issues:
    assignee = issue['fields'].get('assignee')
    name = assignee['displayName'] if assignee else 'Unassigned'
    print(f"  {issue['key']} | {issue['fields']['status']['name']} | {issue['fields']['priority']['name']} | {name} | {issue['fields']['summary'][:70]}")
