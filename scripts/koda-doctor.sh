#!/bin/bash
# koda doctor — full environment diagnostics
# Usage: koda-doctor.sh [--full]

set -o pipefail
STEER_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KIRO_ROOT="${HOME}/.kiro"
FULL=false
[[ "$1" == "--full" ]] && FULL=true

PASS=0; WARN=0; FAIL=0
suggestions=()

ok()   { echo "  ✅ $1"; ((PASS++)); }
warn() { echo "  ⚠️  $1"; ((WARN++)); suggestions+=("$2"); }
fail() { echo "  ❌ $1"; ((FAIL++)); suggestions+=("$2"); }

echo ""
echo "🏥 Koda Doctor — Environment Diagnostics"
echo "══════════════════════════════════════════════════"

# ── Runtime ──
echo ""
echo "Runtime"
if [ -f "$STEER_ROOT/VERSION" ]; then
    ver=$(cat "$STEER_ROOT/VERSION")
    ok "steer-runtime $ver"
else
    fail "steer-runtime not found" "Run: koda sync"
fi

if command -v node &>/dev/null; then
    nv=$(node --version)
    ok "Node.js $nv"
else
    fail "Node.js not found" "Install Node.js >= 18"
fi

if command -v python3 &>/dev/null; then
    pv=$(python3 --version 2>&1 | awk '{print $2}')
    ok "Python $pv"
else
    warn "Python3 not found" "Install Python 3 for playbook validation and certify"
fi

if command -v uv &>/dev/null; then
    ok "uv $(uv --version 2>&1 | awk '{print $2}')"
else
    warn "uv not installed" "Install: curl -LsSf https://astral.sh/uv/install.sh | sh"
fi

if npx playwright --version &>/dev/null 2>&1; then
    ok "Playwright $(npx playwright --version 2>&1)"
else
    warn "Playwright not installed (teams-mcp/servicenow-graph-mcp need it)" "Run: npx playwright install chromium"
fi

# ── MCP Servers ──
echo ""
echo "MCP Servers"
tokens_file="$KIRO_ROOT/tokens.env"
_tok() { grep -s "^$1=" "$tokens_file" 2>/dev/null | head -1 | cut -d= -f2-; }

mcp_dir="$KIRO_ROOT/tools/mcp-servers"
if [ -d "$mcp_dir" ]; then
    mcp_count=0
    for d in "$mcp_dir"/*/; do
        [ -d "$d" ] || continue
        name=$(basename "$d")
        bundle="$d/dist/index.cjs"
        if [ -f "$bundle" ]; then
            ((mcp_count++))
        else
            warn "$name — bundle missing (dist/index.cjs)" "Run: koda sync"
        fi
    done
    ok "$mcp_count MCP bundles found"
else
    fail "No MCP servers directory" "Run: koda sync"
fi

# Key tokens
[ -n "$(_tok JIRA_PAT)" ] && ok "JIRA_PAT configured" || warn "JIRA_PAT not set" "Add JIRA_PAT to ~/.kiro/tokens.env"
[ -n "$(_tok XRAY_CLOUD_CLIENT_ID)" ] && ok "XRAY_CLOUD credentials configured" || warn "XRAY_CLOUD_CLIENT_ID not set (XRay Cloud tools hidden)" "Add XRAY_CLOUD_CLIENT_ID + SECRET to tokens.env"
[ -n "$(_tok OPENROUTER_API_KEY)" ] && ok "OPENROUTER_API_KEY configured" || warn "OPENROUTER_API_KEY not set" "Add key from https://openrouter.ai/keys"

# ── Agents ──
echo ""
echo "Agents"
if [ -d "$KIRO_ROOT/agents" ]; then
    agent_count=$(find "$KIRO_ROOT/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    orphans=0
    for aj in "$KIRO_ROOT/agents"/*.json; do
        [ -f "$aj" ] || continue
        prompt=$(python3 -c "import json; print(json.load(open('$aj')).get('prompt',''))" 2>/dev/null)
        if [ -n "$prompt" ] && [ ! -f "$KIRO_ROOT/prompts/$prompt" ]; then
            ((orphans++))
        fi
    done
    ok "$agent_count agents installed"
    [ "$orphans" -eq 0 ] && ok "0 orphaned prompts" || warn "$orphans agents missing prompt files" "Run: koda sync"
else
    fail "No agents directory" "Run: koda install"
fi

# ── Workspace ──
echo ""
echo "Workspace"
if [ -f "$KIRO_ROOT/settings/workspace.json" ]; then
    ws_name=$(python3 -c "import json; print(json.load(open('$KIRO_ROOT/settings/workspace.json')).get('name','unknown'))" 2>/dev/null)
    ok "Active: $ws_name"
else
    warn "No active workspace" "Run: koda workspace apply <name>"
fi

# ── Memory ──
echo ""
echo "Memory"
if command -v yax &>/dev/null; then
    if yax doctor &>/dev/null 2>&1; then
        ok "yax reachable"
    else
        warn "yax not responding" "Check yax installation"
    fi
else
    warn "yax CLI not found" "Included with Koda — ensure PATH includes ~/.kiro/bin"
fi

# ── Structural Validation ──
echo ""
echo "Structural Validation"
if [ -f "$STEER_ROOT/Makefile" ]; then
    val_output=$(make -C "$STEER_ROOT" validate-all 2>&1)
    if [ $? -eq 0 ]; then
        ok "validate-all passed"
    else
        warn "validate-all has errors" "Run: make validate-all"
    fi
else
    warn "Makefile not found" "steer-runtime may be incomplete"
fi

# ── Full mode: delegation + evals ──
if [ "$FULL" = true ]; then
    echo ""
    echo "Delegation & Evals (--full)"
    echo "  Running certify.py..."
    if python3 "$STEER_ROOT/evals/certify.py" 2>&1 | tail -5; then
        ok "Certification complete"
    else
        warn "Certification had failures" "Review evals/results/CERTIFICATION.md"
    fi
fi

# ── Summary ──
total=$((PASS + WARN + FAIL))
echo ""
echo "══════════════════════════════════════════════════"
if [ "$FAIL" -gt 0 ]; then
    echo "🔴 Health: $PASS/$total passed, $WARN warnings, $FAIL errors"
elif [ "$WARN" -gt 0 ]; then
    echo "🟡 Health: $PASS/$total passed, $WARN warnings"
else
    echo "🟢 Health: $PASS/$total passed — all good!"
fi

if [ ${#suggestions[@]} -gt 0 ]; then
    echo ""
    echo "Suggested actions:"
    for s in "${suggestions[@]}"; do
        [ -n "$s" ] && echo "  → $s"
    done
fi
echo ""
