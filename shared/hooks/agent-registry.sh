#!/bin/bash
# agentSpawn hook: inject available agents registry and workspace context

# --- Workspace Context ---
SETTINGS_FILE="$HOME/.kiro/settings/koda/steer_settings.json"
if [ -f "$SETTINGS_FILE" ]; then
  ws=$(python3 -c "import json; d=json.load(open('$SETTINGS_FILE')); print(d.get('steerRuntime',{}).get('activeWorkspace',''))" 2>/dev/null)
fi
if [ -z "$ws" ]; then
  # Try shared settings
  SHARED="$HOME/.kiro/settings/koda/shared_settings.json"
  if [ -f "$SHARED" ]; then
    ws=$(python3 -c "import json; d=json.load(open('$SHARED')); print(d.get('steerRuntime',{}).get('activeWorkspace',''))" 2>/dev/null)
  fi
fi

if [ -n "$ws" ]; then
  echo "## Workspace Context"
  echo ""
  echo "- **Active workspace:** $ws"

  # Find workspace.json
  STEER_ROOT="$HOME/.kiro/steer-runtime"
  WS_FILE="$STEER_ROOT/workspaces/$ws/workspace.json"
  if [ -f "$WS_FILE" ]; then
    extends=$(python3 -c "import json; d=json.load(open('$WS_FILE')); print(d.get('extends',''))" 2>/dev/null)
    profiles=$(python3 -c "import json; d=json.load(open('$WS_FILE')); print(', '.join(d.get('profiles',[])))" 2>/dev/null)
    team=$(python3 -c "import json; d=json.load(open('$WS_FILE')); print(d.get('team',''))" 2>/dev/null)
    defAgent=$(python3 -c "import json; d=json.load(open('$WS_FILE')); print(d.get('default_agent',''))" 2>/dev/null)
    [ -n "$team" ] && echo "- **Team:** $team"
    [ -n "$extends" ] && echo "- **Extends:** $extends"
    [ -n "$profiles" ] && echo "- **Profiles:** $profiles"
    [ -n "$defAgent" ] && echo "- **Default agent:** $defAgent"
  fi
  echo ""
fi

# --- Installed Profiles ---
PROFILES_FILE="$HOME/.kiro/settings/profiles.json"
if [ -f "$PROFILES_FILE" ]; then
  installed=$(python3 -c "
import json
d=json.load(open('$PROFILES_FILE'))
print(', '.join(p['id'] for p in d.get('profiles',[]) if p.get('installed')))
" 2>/dev/null)
  if [ -n "$installed" ]; then
    echo "## Installed Profiles"
    echo ""
    echo "$installed"
    echo ""
  fi
fi

# --- Agent Registry ---
echo "## Agent Registry (auto-discovered)"
echo ""
for f in ~/.kiro/agents/*.json; do
  [ -f "$f" ] || continue
  [[ "$(basename "$f")" == ._* ]] && continue
  name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  desc=$(grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  echo "- **$name**: $desc"
done
