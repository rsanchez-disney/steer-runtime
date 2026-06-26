#!/bin/bash
# knowledge-push.sh — Export local observations (yax + mem + memory-bank) for ALL workspaces
# Usage: koda knowledge push [--dry-run]
# Exports from ALL workspaces the user has observations for, not just the active one.

set -euo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
STEER_DIR="${STEER_HOME:-$KIRO_DIR/steer-runtime}"
KNOWLEDGE_BRANCH="knowledge"
USERNAME=$(git config user.name 2>/dev/null | tr ' ' '_' | tr '[:upper:]' '[:lower:]' || whoami)
DRY_RUN=false
[ "${1:-}" = "--dry-run" ] && DRY_RUN=true

echo "📤 Knowledge push ($USERNAME)"
[ "$DRY_RUN" = true ] && echo "   [DRY RUN — nothing will be pushed]"

# ─── Step 1: Discover workspaces with observations ───────────────────────────

EXPORT_DIR="$KIRO_DIR/knowledge-export"
mkdir -p "$EXPORT_DIR"

# Get all workspace names from installed workspace snapshot
WORKSPACES_FILE="$KIRO_DIR/workspace-snapshot.json"
ALL_WORKSPACES=()
if [ -f "$WORKSPACES_FILE" ]; then
  ACTIVE_WS=$(python3 -c "import json; print(json.load(open('$WORKSPACES_FILE')).get('name',''))" 2>/dev/null || echo "")
  ALL_WORKSPACES+=("$ACTIVE_WS")
fi

# Also scan yax for any project names that map to workspaces
# (user may have worked in multiple workspaces today)
WORKSPACE_PROJECTS=$(python3 -c "
import json, os, glob

steer_dir = '$STEER_DIR'
ws_dir = os.path.join(steer_dir, 'workspaces')
if not os.path.isdir(ws_dir):
    exit(0)

# Build project→workspace map from all workspace.json files
project_to_ws = {}
for ws_file in glob.glob(os.path.join(ws_dir, '**/workspace.json'), recursive=True):
    try:
        with open(ws_file) as f:
            ws = json.load(f)
        ws_name = ws.get('name', '')
        for proj in ws.get('projects', []):
            proj_name = proj.get('name', '')
            if proj_name:
                project_to_ws[proj_name] = ws_name
                # Also map memory_bank name
                mb = proj.get('memory_bank', '')
                if mb:
                    project_to_ws[mb] = ws_name
    except (json.JSONDecodeError, IOError):
        continue

# Output unique workspace names
print(' '.join(sorted(set(project_to_ws.values()))))
" 2>/dev/null || echo "")

for ws in $WORKSPACE_PROJECTS; do
  if [[ ! " ${ALL_WORKSPACES[*]} " =~ " $ws " ]]; then
    ALL_WORKSPACES+=("$ws")
  fi
done

if [ ${#ALL_WORKSPACES[@]} -eq 0 ]; then
  echo "  ⚠️  No workspaces found. Run 'koda workspace apply <team>' first."
  exit 0
fi

echo "  📂 Workspaces to export: ${ALL_WORKSPACES[*]}"

# ─── Step 2: Export from all sources for each workspace ──────────────────────

python3 << 'PYEXPORT'
import json, subprocess, sys, re, os, glob

kiro_dir = os.environ.get("KIRO_HOME", os.path.expanduser("~/.kiro"))
steer_dir = os.environ.get("STEER_HOME", os.path.join(kiro_dir, "steer-runtime"))
export_dir = os.path.join(kiro_dir, "knowledge-export")
username = os.environ.get("KNOWLEDGE_USER", "unknown")
workspaces_str = os.environ.get("KNOWLEDGE_WORKSPACES", "")
workspaces = workspaces_str.split() if workspaces_str else []

# Secret patterns to block
SECRET_PATTERNS = [
    r'(?:password|passwd|pwd)\s*[=:]\s*["\'][^"\']{4,}',
    r'(?:api[_-]?key|apikey|token|secret)\s*[=:]\s*["\'][^"\']{8,}',
    r'(?:AKIA|ASIA)[A-Z0-9]{16}',
    r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----',
    r'(?:mongodb|postgres|mysql|redis)://[^\s]+:[^\s]+@',
    r'eyJ[A-Za-z0-9_-]{10,}\.',  # JWT tokens
]

SHAREABLE_TYPES = {'decision', 'architecture', 'pattern', 'discovery'}

def contains_secrets(text):
    for pattern in SECRET_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def load_workspace_projects(ws_name):
    """Find project names associated with a workspace."""
    ws_dir = os.path.join(steer_dir, "workspaces")
    for ws_file in glob.glob(os.path.join(ws_dir, f"**/{ws_name}/workspace.json"), recursive=True):
        try:
            with open(ws_file) as f:
                ws = json.load(f)
            projects = []
            for p in ws.get("projects", []):
                projects.append(p.get("name", ""))
                if p.get("memory_bank"):
                    projects.append(p["memory_bank"])
            return [p for p in projects if p]
        except (json.JSONDecodeError, IOError):
            pass
    # Fallback: workspace name itself as project prefix
    return [ws_name]

def export_yax(ws_name, projects):
    """Export observations from yax for given projects."""
    observations = []
    for project in projects:
        try:
            result = subprocess.run(
                ["yax", "search", "--project", project, "--limit", "50", "--format", "json"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0 and result.stdout.strip():
                obs_list = json.loads(result.stdout)
                observations.extend(obs_list)
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
            pass
    return observations

def export_mem(ws_name, projects):
    """Export observations from koda-memory (mem) for given projects."""
    observations = []
    for project in projects:
        try:
            result = subprocess.run(
                ["yax", "search", "--project", project, "--limit", "50",
                 "--format", "json", "--scope", "project"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0 and result.stdout.strip():
                obs_list = json.loads(result.stdout)
                observations.extend(obs_list)
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
            pass
    return observations

def export_memory_bank(ws_name, projects):
    """Export memory-bank markdown files (tech.md, patterns, not active-context)."""
    bank_files = {}
    memory_bank_dir = os.path.join(kiro_dir, "memory-bank")

    # Check project-specific memory banks
    for project in projects:
        project_mb = os.path.join(memory_bank_dir, project)
        if os.path.isdir(project_mb):
            for fname in os.listdir(project_mb):
                if not fname.endswith(".md"):
                    continue
                # Skip ephemeral/personal files
                if fname in ("active-context.md", "progress.md"):
                    continue
                fpath = os.path.join(project_mb, fname)
                content = open(fpath).read()
                if not contains_secrets(content):
                    bank_files[f"{project}/{fname}"] = content

    # Also check root memory-bank for workspace-level files
    if os.path.isdir(memory_bank_dir):
        for fname in os.listdir(memory_bank_dir):
            fpath = os.path.join(memory_bank_dir, fname)
            if not os.path.isfile(fpath) or not fname.endswith(".md"):
                continue
            if fname in ("active-context.md", "progress.md"):
                continue
            content = open(fpath).read()
            if not contains_secrets(content):
                bank_files[fname] = content

    return bank_files

# ─── Main export loop ────────────────────────────────────────────────────────

total_exported = 0

for ws_name in workspaces:
    if not ws_name:
        continue

    projects = load_workspace_projects(ws_name)
    ws_export_dir = os.path.join(export_dir, ws_name)
    os.makedirs(ws_export_dir, exist_ok=True)

    # Export from yax
    yax_obs = export_yax(ws_name, projects)

    # Export from mem
    mem_obs = export_mem(ws_name, projects)

    # Merge and deduplicate
    all_obs = yax_obs + mem_obs
    seen_keys = {}
    for obs in all_obs:
        key = obs.get("topic_key") or obs.get("title", "")
        if key not in seen_keys or obs.get("updated_at", "") > seen_keys[key].get("updated_at", ""):
            seen_keys[key] = obs

    # Filter: only shareable types + no secrets
    filtered = []
    blocked = 0
    for obs in seen_keys.values():
        if obs.get("type", "") not in SHAREABLE_TYPES:
            continue
        content = obs.get("content", "")
        if contains_secrets(content):
            blocked += 1
            continue
        filtered.append({
            "title": obs.get("title", ""),
            "content": content,
            "type": obs.get("type", ""),
            "topic_key": obs.get("topic_key", ""),
            "project": obs.get("project", ""),
            "updated_at": obs.get("updated_at", ""),
            "source": "yax+mem",
        })

    # Write observations JSONL
    obs_file = os.path.join(ws_export_dir, f"{username}.jsonl")
    with open(obs_file, "w") as f:
        for obs in filtered:
            f.write(json.dumps(obs) + "\n")

    # Export memory-bank files
    bank_files = export_memory_bank(ws_name, projects)
    if bank_files:
        bank_dir = os.path.join(ws_export_dir, f"{username}-memory-bank")
        os.makedirs(bank_dir, exist_ok=True)
        for fname, content in bank_files.items():
            safe_name = fname.replace("/", "__")
            with open(os.path.join(bank_dir, safe_name), "w") as f:
                f.write(content)

    obs_count = len(filtered)
    bank_count = len(bank_files)
    total_exported += obs_count + bank_count

    print(f"  ✅ {ws_name}: {obs_count} observations + {bank_count} memory-bank files", end="")
    if blocked:
        print(f" (🚫 {blocked} blocked for secrets)", end="")
    print()

print(f"\n  📦 Total exported: {total_exported} items across {len(workspaces)} workspace(s)")
PYEXPORT

# Pass env vars to Python
export KNOWLEDGE_USER="$USERNAME"
export KNOWLEDGE_WORKSPACES="${ALL_WORKSPACES[*]}"

# Re-run the Python with env vars set
KNOWLEDGE_USER="$USERNAME" KNOWLEDGE_WORKSPACES="${ALL_WORKSPACES[*]}" python3 << 'PYEXPORT2'
# (The actual Python code is above, this is the execution)
import os
print(f"  ℹ️  Export dir: {os.environ.get('KIRO_HOME', '~/.kiro')}/knowledge-export/")
PYEXPORT2

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "  [DRY RUN complete — files in $EXPORT_DIR but not pushed]"
  exit 0
fi

# ─── Step 3: Push to knowledge branch ────────────────────────────────────────

REMOTE_URL=$(git -C "$STEER_DIR" remote get-url origin 2>/dev/null || git -C "$STEER_DIR" remote get-url upstream 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo "❌ Cannot determine steer-runtime remote URL"
  exit 1
fi

WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

# Clone knowledge branch (or create orphan)
if git clone --depth 1 --branch "$KNOWLEDGE_BRANCH" "$REMOTE_URL" "$WORK_DIR" 2>/dev/null; then
  : # fetched
else
  echo "  ℹ️  Creating knowledge branch (first push ever)..."
  git -C "$WORK_DIR" init -q
  git -C "$WORK_DIR" remote add origin "$REMOTE_URL"
  git -C "$WORK_DIR" checkout --orphan "$KNOWLEDGE_BRANCH"
  printf "# Team Knowledge\n\nAuto-managed branch for shared workspace observations.\nDo NOT apply branch protection — direct push required.\n" > "$WORK_DIR/README.md"
  git -C "$WORK_DIR" add README.md
  git -C "$WORK_DIR" commit -m "knowledge: init branch" -q
fi

# Copy all workspace exports
for ws_name in "${ALL_WORKSPACES[@]}"; do
  [ -z "$ws_name" ] && continue
  WS_EXPORT="$EXPORT_DIR/$ws_name"
  [ ! -d "$WS_EXPORT" ] && continue

  WS_TARGET="$WORK_DIR/$ws_name/exports"
  mkdir -p "$WS_TARGET"

  # Copy JSONL
  [ -f "$WS_EXPORT/${USERNAME}.jsonl" ] && cp "$WS_EXPORT/${USERNAME}.jsonl" "$WS_TARGET/"

  # Copy memory-bank files
  MB_DIR="$WS_EXPORT/${USERNAME}-memory-bank"
  if [ -d "$MB_DIR" ]; then
    MB_TARGET="$WORK_DIR/$ws_name/memory-banks/$USERNAME"
    mkdir -p "$MB_TARGET"
    cp "$MB_DIR"/* "$MB_TARGET/" 2>/dev/null || true
  fi
done

# Commit and push
git -C "$WORK_DIR" add -A
if git -C "$WORK_DIR" diff --cached --quiet; then
  echo "  ℹ️  No changes to push"
  exit 0
fi

TOTAL_FILES=$(git -C "$WORK_DIR" diff --cached --numstat | wc -l | tr -d ' ')
git -C "$WORK_DIR" commit -m "knowledge: $USERNAME — ${#ALL_WORKSPACES[@]} workspace(s), $TOTAL_FILES file(s)" -q
git -C "$WORK_DIR" push origin "$KNOWLEDGE_BRANCH" -q 2>/dev/null

echo ""
echo "  ✅ Pushed to knowledge branch"
