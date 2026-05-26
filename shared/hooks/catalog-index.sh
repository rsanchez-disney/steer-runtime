#!/bin/bash
# agentSpawn hook: generate managed services catalog index for the current workspace scope
# Stdout: full index with BAPP IDs, paths, and instructions (injected into agent context)
# Also writes backup to _dynamic/catalog-index.md
#
# Requires: python3, yq

command -v python3 >/dev/null 2>&1 || { echo "python3 required" >&2; exit 1; }
command -v yq >/dev/null 2>&1 || { echo "yq required" >&2; exit 1; }

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
DYNAMIC_DIR="$KIRO_DIR/context/_dynamic"
mkdir -p "$DYNAMIC_DIR"

INDEX_FILE="$DYNAMIC_DIR/catalog-index.md"
# Catalog always lives in the global steer-runtime install (not per-workspace)
CATALOG_BASE="$HOME/.kiro/steer-runtime/profiles/sustainment/managed-services-catalog"
CATALOG_DIR="$CATALOG_BASE/studios"

[ -d "$CATALOG_DIR" ] || exit 0

# Read managed_studios from workspace snapshot (written by Koda at workspace apply)
SCOPE_DIRS=$(python3 -c "
import json, os, sys
kiro = os.environ.get('KIRO_HOME', os.path.expanduser('~/.kiro'))
snapshot = os.path.join(kiro, 'settings', 'workspace.json')
if not os.path.isfile(snapshot):
    print('*')
    sys.exit(0)
try:
    ws = json.load(open(snapshot))
    scope = ws.get('managed_studios', [])
    print(' '.join(scope) if scope else '*')
except:
    print('*')
" 2>/dev/null)

WS_NAME=$(python3 -c "
import json, os, sys
kiro = os.environ.get('KIRO_HOME', os.path.expanduser('~/.kiro'))
snapshot = os.path.join(kiro, 'settings', 'workspace.json')
if os.path.isfile(snapshot):
    try: print(json.load(open(snapshot)).get('name', ''))
    except: pass
" 2>/dev/null)

# Default to all if no scope resolved
[ -z "$SCOPE_DIRS" ] && SCOPE_DIRS="*"

# Determine which studio directories to scan (safe array iteration)
STUDIOS=()
if [ "$SCOPE_DIRS" = "*" ]; then
  while IFS= read -r d; do
    STUDIOS+=("$d")
  done < <(find "$CATALOG_DIR" -maxdepth 1 -type d -name "studio-*" | sort)
else
  for s in $SCOPE_DIRS; do
    [ -d "$CATALOG_DIR/$s" ] && STUDIOS+=("$CATALOG_DIR/$s")
  done
fi

# Collect all apps
LINES=""
TOTAL=0

for studio_path in "${STUDIOS[@]}"; do
  [ -d "$studio_path" ] || continue
  studio=$(basename "$studio_path")

  for app_dir in "$studio_path"/BAPP*/; do
    [ -d "$app_dir" ] || continue
    [ -f "$app_dir/app.yaml" ] || continue

    dir_name=$(basename "$app_dir")
    bapp_id=$(yq -r '.bapp_id // ""' "$app_dir/app.yaml")
    full_name=$(yq -r '.full_name // ""' "$app_dir/app.yaml")
    support_studio=$(yq -r '.support_studio // ""' "$app_dir/app.yaml")
    ci=$(yq -r '.servicenow.configuration_item // ""' "$app_dir/app.yaml")

    LINES="${LINES}| ${bapp_id} | ${full_name} | ${support_studio} | ${ci} | ${studio}/${dir_name}/ |
"
    TOTAL=$((TOTAL + 1))
  done
done

# === OUTPUT (stdout — this is what the agent actually sees) ===
cat << EOF
## Managed Services Catalog — ${TOTAL} applications in scope

Workspace: ${WS_NAME:-default}
Scope: ${SCOPE_DIRS}

| BAPP ID | Full Name | Studio | CI | Catalog Path |
|---------|-----------|--------|-----|--------------|
${LINES}### How to Get App Details

To get full details for any app listed above, use your file reading tool:

1. Take the "Catalog Path" from the table (e.g., studio-mars/BAPP0012680-Booking_Service/)
2. Read: ~/.kiro/steer-runtime/profiles/sustainment/managed-services-catalog/studios/<Catalog Path>/app.yaml
3. The app.yaml contains: repositories, splunk queries, health checks, cloud infra, contacts, CI/CD, and more

For troubleshooting context, read the troubleshooting.md in the same directory.
EOF

# === FULL (file — backup copy) ===
cat > "$INDEX_FILE" << EOF
# Managed Services Catalog Index (auto-generated)

Workspace: ${WS_NAME:-default}
Scope: ${SCOPE_DIRS}
Total: $TOTAL applications

These are YOUR applications. Use this as the default list when asked about apps in scope.

When asked for details about any app (repositories, splunk queries, cloud, contacts, etc.), read the app.yaml file at:
~/.kiro/steer-runtime/profiles/sustainment/managed-services-catalog/studios/<Catalog Path>/app.yaml

| BAPP ID | Full Name | Studio | CI | Catalog Path |
|---------|-----------|--------|-----|--------------|
${LINES}### How to Get App Details

To get full details for any app listed above, use your file reading tool:

1. Take the "Catalog Path" from the table (e.g., studio-mars/BAPP0012680-Booking_Service/)
2. Read: ~/.kiro/steer-runtime/profiles/sustainment/managed-services-catalog/studios/studio-mars/BAPP0012680-Booking_Service/app.yaml
3. The app.yaml contains: repositories, splunk queries, health checks, cloud infra, contacts, CI/CD, and more

For troubleshooting context, read the troubleshooting.md in the same directory.
EOF
