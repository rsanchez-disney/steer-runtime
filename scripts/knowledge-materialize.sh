#!/bin/bash
# knowledge-materialize.sh — Merge all exports + memory-banks into team_knowledge.md
# Usage: koda knowledge materialize [--workspace <name>]
#        koda knowledge materialize --all
# Runs nightly via GitHub Action or cron

set -euo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
STEER_DIR="${STEER_HOME:-$KIRO_DIR/steer-runtime}"
KNOWLEDGE_BRANCH="knowledge"

# Parse args
WORKSPACE=""
ALL_MODE=false
while [ $# -gt 0 ]; do
  case "$1" in
    --workspace) WORKSPACE="$2"; shift 2 ;;
    --all) ALL_MODE=true; shift ;;
    *) WORKSPACE="$1"; shift ;;
  esac
done

if [ -z "$WORKSPACE" ] && [ "$ALL_MODE" = false ]; then
  WORKSPACE=$(cat "$KIRO_DIR/active-workspace" 2>/dev/null || echo "")
fi

if [ -z "$WORKSPACE" ] && [ "$ALL_MODE" = false ]; then
  echo "Usage: koda knowledge materialize --workspace <name>"
  echo "       koda knowledge materialize --all"
  exit 1
fi

REMOTE_URL=$(git -C "$STEER_DIR" remote get-url origin 2>/dev/null || git -C "$STEER_DIR" remote get-url upstream 2>/dev/null || echo "")
WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

# Fetch knowledge branch
if ! git clone --depth 1 --branch "$KNOWLEDGE_BRANCH" "$REMOTE_URL" "$WORK_DIR" 2>/dev/null; then
  echo "⚠️  Knowledge branch not found. No team knowledge yet."
  exit 0
fi

# Determine workspaces to materialize
if [ "$ALL_MODE" = true ]; then
  WORKSPACES=$(find "$WORK_DIR" -maxdepth 1 -type d -not -name ".*" -not -name "$(basename "$WORK_DIR")" -exec basename {} \; | sort)
else
  WORKSPACES="$WORKSPACE"
fi

for WS in $WORKSPACES; do
  WS_DIR="$WORK_DIR/$WS"
  [ ! -d "$WS_DIR" ] && continue

  echo "🧠 Materializing: $WS"

  python3 -c "
import json, os, sys
from datetime import datetime
from collections import defaultdict

ws_dir = '$WS_DIR'
ws_name = '$WS'
exports_dir = os.path.join(ws_dir, 'exports')
banks_dir = os.path.join(ws_dir, 'memory-banks')

# ─── Load observations from all member exports ──────────────────────────

all_obs = []
members = set()

if os.path.isdir(exports_dir):
    for fname in sorted(os.listdir(exports_dir)):
        if not fname.endswith('.jsonl'):
            continue
        member = fname.replace('.jsonl', '')
        members.add(member)
        with open(os.path.join(exports_dir, fname)) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obs = json.loads(line)
                    obs['_member'] = member
                    all_obs.append(obs)
                except json.JSONDecodeError:
                    continue

# ─── Load memory-bank files from all members ────────────────────────────

bank_content = {}  # filename → {member: content}
if os.path.isdir(banks_dir):
    for member_dir in sorted(os.listdir(banks_dir)):
        member_path = os.path.join(banks_dir, member_dir)
        if not os.path.isdir(member_path):
            continue
        members.add(member_dir)
        for fname in os.listdir(member_path):
            if not fname.endswith('.md'):
                continue
            content = open(os.path.join(member_path, fname)).read()
            if fname not in bank_content:
                bank_content[fname] = {}
            bank_content[fname][member_dir] = content

if not all_obs and not bank_content:
    print(f'  ℹ️  No data for {ws_name}')
    sys.exit(0)

# ─── Deduplicate observations by topic_key ───────────────────────────────

by_topic = {}
for obs in all_obs:
    key = obs.get('topic_key') or obs.get('title', '')
    existing = by_topic.get(key)
    if not existing or obs.get('updated_at', '') > existing.get('updated_at', ''):
        by_topic[key] = obs

deduped = list(by_topic.values())

# ─── Group by type ──────────────────────────────────────────────────────

by_type = defaultdict(list)
for obs in sorted(deduped, key=lambda x: x.get('updated_at', ''), reverse=True):
    by_type[obs.get('type', 'other')].append(obs)

# ─── Generate team_knowledge.md ─────────────────────────────────────────

now = datetime.now().strftime('%Y-%m-%d')
lines = [
    f'# {ws_name} — Team Knowledge',
    f'> Auto-materialized: {now} ({len(deduped)} observations + {len(bank_content)} memory-bank files from {len(members)} members)',
    '',
]

type_labels = {
    'decision': '## Architecture Decisions',
    'architecture': '## Architecture',
    'pattern': '## Patterns & Conventions',
    'discovery': '## Discoveries & Gotchas',
}

for obs_type, label in type_labels.items():
    items = by_type.get(obs_type, [])
    if not items:
        continue
    lines.append(label)
    lines.append('')
    for obs in items[:25]:
        date = obs.get('updated_at', '')[:10]
        title = obs.get('title', 'Untitled')
        content = obs.get('content', '').replace('\n', ' ')[:150]
        member = obs.get('_member', 'unknown')
        lines.append(f'- **{date}** [{member}]: {title}')
        if content and content != title:
            lines.append(f'  > {content}')
        lines.append('')
    lines.append('')

# Add memory-bank section if files exist
if bank_content:
    lines.append('## Shared Memory Bank')
    lines.append('')
    for fname, member_versions in sorted(bank_content.items()):
        # Use most recently modified version
        latest_member = sorted(member_versions.keys())[-1]
        content = member_versions[latest_member]
        # Truncate to first 500 chars
        preview = content[:500].rstrip()
        lines.append(f'### {fname} (from {latest_member})')
        lines.append('')
        lines.append(preview)
        if len(content) > 500:
            lines.append('...')
        lines.append('')

with open(os.path.join(ws_dir, 'team_knowledge.md'), 'w') as f:
    f.write('\n'.join(lines))

# ─── Generate team_learned.md (steering) ────────────────────────────────

conventions = by_type.get('pattern', []) + by_type.get('decision', [])
if conventions:
    steering_lines = [
        '---',
        'inclusion: auto',
        '---',
        f'# Team-Learned Conventions ({ws_name})',
        f'> Auto-generated: {now} — from {len(members)} team members',
        '',
    ]
    for obs in conventions[:15]:
        title = obs.get('title', '')
        content = obs.get('content', '').replace('\n', ' ')[:200]
        steering_lines.append(f'- **{title}**: {content}')
        steering_lines.append('')

    with open(os.path.join(ws_dir, 'team_learned.md'), 'w') as f:
        f.write('\n'.join(steering_lines))

print(f'  ✅ {ws_name}: {len(deduped)} observations + {len(bank_content)} bank files → team_knowledge.md')
print(f'     Members: {sorted(members)}')
print(f'     Types: { {k: len(v) for k,v in by_type.items()} }')
"
done

# Commit materialized output
git -C "$WORK_DIR" add -A
if ! git -C "$WORK_DIR" diff --cached --quiet; then
  git -C "$WORK_DIR" commit -m "knowledge: materialize $(date +%Y-%m-%d) ($WORKSPACES)" -q
  git -C "$WORK_DIR" push origin "$KNOWLEDGE_BRANCH" -q 2>/dev/null
  echo ""
  echo "✅ Materialized and pushed"
else
  echo ""
  echo "ℹ️  No changes after materialization"
fi
