#!/bin/bash
# workspace-health.sh — Diagnose workspace state
# Usage: ./workspace-health.sh [workspace-name]
# Output: Health report with actionable recommendations

set -euo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
WORKSPACE_NAME="${1:-}"
ISSUES=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✅${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️ ${NC} $1"; WARNINGS=$((WARNINGS+1)); }
fail() { echo -e "  ${RED}❌${NC} $1"; ISSUES=$((ISSUES+1)); }

echo "🏥 Workspace Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check MCP connections
echo ""
echo "MCP Servers:"
MCP_JSON="$KIRO_DIR/settings/mcp.json"
if [ -f "$MCP_JSON" ]; then
  SERVERS=$(python3 -c "
import json
with open('$MCP_JSON') as f:
    d = json.load(f)
servers = d.get('mcpServers', {})
for name, cfg in servers.items():
    disabled = cfg.get('disabled', False)
    status = 'disabled' if disabled else 'enabled'
    print(f'{name}|{status}')
" 2>/dev/null || echo "")
  while IFS='|' read -r name status; do
    [ -z "$name" ] && continue
    if [ "$status" = "disabled" ]; then
      warn "$name (disabled)"
    else
      pass "$name (enabled)"
    fi
  done <<< "$SERVERS"
else
  fail "No mcp.json found at $MCP_JSON"
fi

# 2. Check tokens
echo ""
echo "Tokens:"
TOKENS_FILE="$KIRO_DIR/tokens.env"
if [ -f "$TOKENS_FILE" ]; then
  for KEY in JIRA_PAT CONFLUENCE_PAT GITHUB_TOKEN MYWIKI_PAT; do
    if grep -q "^${KEY}" "$TOKENS_FILE" 2>/dev/null; then
      VAL=$(grep "^${KEY}" "$TOKENS_FILE" | head -1 | cut -d= -f2-)
      if [ -n "$VAL" ] && [ "$VAL" != '""' ] && [ "$VAL" != "''" ]; then
        pass "$KEY configured"
      else
        warn "$KEY is empty"
      fi
    fi
  done
else
  warn "No tokens.env found — run 'koda configure'"
fi

# 3. Check agents installed
echo ""
echo "Agents:"
AGENT_DIR="$KIRO_DIR/agents"
if [ -d "$AGENT_DIR" ]; then
  AGENT_COUNT=$(find "$AGENT_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$AGENT_COUNT" -gt 0 ]; then
    pass "$AGENT_COUNT agents installed"
  else
    fail "No agents found in $AGENT_DIR"
  fi
else
  fail "Agent directory not found"
fi

# 4. Check version
echo ""
echo "Version:"
STEER_DIR="$KIRO_DIR/steer-runtime"
if [ -f "$STEER_DIR/VERSION" ]; then
  LOCAL_VER=$(cat "$STEER_DIR/VERSION")
  pass "steer-runtime $LOCAL_VER installed"
else
  warn "Cannot determine steer-runtime version"
fi

# 5. Check memory connectivity
echo ""
echo "Memory:"
if command -v yax >/dev/null 2>&1; then
  pass "yax binary found"
else
  warn "yax not installed — persistent memory unavailable"
fi

# 6. Check context freshness
echo ""
echo "Context:"
CONTEXT_DIR="$KIRO_DIR/context"
if [ -d "$CONTEXT_DIR" ]; then
  STALE_DAYS=30
  STALE_FILES=$(find "$CONTEXT_DIR" -name "*.md" -mtime +${STALE_DAYS} 2>/dev/null | wc -l | tr -d ' ')
  TOTAL_FILES=$(find "$CONTEXT_DIR" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$STALE_FILES" -gt 0 ]; then
    warn "$STALE_FILES/$TOTAL_FILES context files older than ${STALE_DAYS} days"
  else
    pass "All $TOTAL_FILES context files are fresh"
  fi
else
  warn "No context directory found"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}All checks passed!${NC}"
elif [ $ISSUES -eq 0 ]; then
  echo -e "${YELLOW}$WARNINGS warning(s) — workspace functional but could be improved${NC}"
else
  echo -e "${RED}$ISSUES error(s), $WARNINGS warning(s) — action needed${NC}"
fi

# Recommendations
if [ $ISSUES -gt 0 ] || [ $WARNINGS -gt 0 ]; then
  echo ""
  echo "Suggested actions:"
  [ $ISSUES -gt 0 ] && echo "  → Run 'koda sync' to fix missing agents/config"
  grep -q "disabled" <<< "${SERVERS:-}" 2>/dev/null && echo "  → Enable disabled MCPs with 'koda mcp-install --assistant'"
  [ "$STALE_FILES" -gt 0 ] 2>/dev/null && echo "  → Run 'koda sync' to refresh stale context"
fi

exit $ISSUES
