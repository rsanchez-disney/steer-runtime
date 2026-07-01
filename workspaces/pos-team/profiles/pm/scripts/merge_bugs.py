import json
import glob
import os
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, '..', '..', '..', '..', '..', 'POS Output')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Merge all available pages
all_issues = []
seen_keys = set()

# Load exact match pages
for f_path in sorted(glob.glob(os.path.join(OUTPUT_DIR, 'pos_bugs_exact*.json'))):
    with open(f_path) as f:
        data = json.load(f)
        for issue in data.get('issues', []):
            if issue['key'] not in seen_keys:
                seen_keys.add(issue['key'])
                all_issues.append(issue)

# Also load the startAt pages
for i in [200, 300, 400, 500]:
    f_path = os.path.join(OUTPUT_DIR, f'pos_exact_s{i}.json')
    try:
        with open(f_path) as f:
            data = json.load(f)
            for issue in data.get('issues', []):
                if issue['key'] not in seen_keys:
                    seen_keys.add(issue['key'])
                    all_issues.append(issue)
    except:
        pass

print(f"Total unique issues loaded: {len(all_issues)}")

# Status breakdown
status_counts = {}
for issue in all_issues:
    status = issue['fields']['status']['name']
    status_counts[status] = status_counts.get(status, 0) + 1

print("\nStatus breakdown:")
total = len(all_issues)
for s, c in sorted(status_counts.items(), key=lambda x: -x[1]):
    pct = (c / total) * 100
    print(f"  {s}: {c} ({pct:.1f}%)")

# Active (non-closed)
active = [i for i in all_issues if i['fields']['status']['name'] != 'Closed']
print(f"\nActive (non-closed): {len(active)}")
print(f"Closed: {status_counts.get('Closed', 0)}")
