#!/bin/bash
# agentSpawn hook: inject orchestrator awareness context
# Emits: workspace context, installed profiles, MCP status, agent registry

KIRO_DIR="$HOME/.kiro"
STEER_ROOT="$KIRO_DIR/steer-runtime"

# --- Workspace Context ---
ws=""
for f in "$KIRO_DIR/settings/kite.json" "$KIRO_DIR/settings/koda/steer_settings.json" "$KIRO_DIR/settings/koda/shared_settings.json"; do
  [ -f "$f" ] && [ -z "$ws" ] && \
    ws=$(python3 -c "import json; d=json.load(open('$f')); print(d.get('steerRuntime',{}).get('activeWorkspace',''))" 2>/dev/null)
done

if [ -n "$ws" ]; then
  echo "## Workspace Context"
  echo ""
  echo "- **Active workspace:** $ws"

  # Fast path: read resolved snapshot from settings
  WS_SNAPSHOT="$KIRO_DIR/settings/workspace.json"
  if [ -f "$WS_SNAPSHOT" ]; then
    WS_FILE="$WS_SNAPSHOT"
  else
    # Fallback: search steer-runtime recursively
    WS_FILE=$(find "$STEER_ROOT/workspaces" -name "workspace.json" -exec grep -l "\"name\".*\"$ws\"" {} \; 2>/dev/null | head -1)
  fi
  if [ -n "$WS_FILE" ]; then
    python3 -c "
import json
d=json.load(open('$WS_FILE'))
if d.get('team'): print(f'- **Team:** {d[\"team\"]}')
if d.get('extends'): print(f'- **Extends:** {d[\"extends\"]}')
if d.get('profiles'): print(f'- **Profiles:** {\", \".join(d[\"profiles\"])}')
if d.get('default_agent'): print(f'- **Default agent:** {d[\"default_agent\"]}')
if d.get('jira_prefix'): print(f'- **Jira prefix:** {d[\"jira_prefix\"]}')
if d.get('projects'): print(f'- **Projects:** {len(d[\"projects\"])}')
if d.get('services'): print(f'- **Services:** {\", \".join(d[\"services\"])}')
if d.get('channels'): print(f'- **Channels:** {\", \".join(d[\"channels\"])}')
if d.get('teams'):
    print(f'- **Teams:** {len(d[\"teams\"])}')
    for t in d['teams']:
        info = t['name']
        projs = ', '.join(t.get('jira_projects', []))
        if projs: info += f' ({projs})'
        if t.get('studio'): info += f' — Studio: {t[\"studio\"]}'
        elif t.get('team_id'): info += f' — Team ID: {t[\"team_id\"]}'
        boards = ', '.join(str(b) for b in t.get('board_ids', []))
        if boards: info += f' [boards: {boards}]'
        print(f'  - {info}')
" 2>/dev/null
  fi
  echo ""
fi

# --- Installed Profiles (with agent counts) ---
PROFILES_FILE="$KIRO_DIR/settings/profiles.json"
if [ -f "$PROFILES_FILE" ]; then
  python3 -c "
import json
d=json.load(open('$PROFILES_FILE'))
installed = [p for p in d.get('profiles',[]) if p.get('installed')]
if installed:
    print('## Installed Profiles')
    print('')
    for p in installed:
        count = p.get('agent_count', len(p.get('agents',[])))
        agents = ', '.join(p.get('agents',[]))
        print(f'- **{p[\"id\"]}** ({count} agents): {agents}')
    print('')
" 2>/dev/null
fi

# --- MCP Server Status ---
MCP_JSON="$KIRO_DIR/mcp.json"
if [ -f "$MCP_JSON" ]; then
  echo "## MCP Servers"
  echo ""
  python3 -c "
import json
d=json.load(open('$MCP_JSON'))
servers = d.get('mcpServers',{})
for name, cfg in sorted(servers.items()):
    cmd = cfg.get('command','')
    args = ' '.join(cfg.get('args',[])[:1])
    print(f'- **{name}**: {cmd} {args}')
if not servers:
    print('- (none configured)')
" 2>/dev/null
  echo ""
fi

# --- Agent Registry ---
echo "## Agent Registry (auto-discovered)"
echo ""
for f in "$KIRO_DIR"/agents/*.json; do
  [ -f "$f" ] || continue
  [[ "$(basename "$f")" == ._* ]] && continue
  name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  desc=$(grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  echo "- **$name**: $desc"
done
