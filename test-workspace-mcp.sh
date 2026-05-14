#!/bin/bash
# test-workspace-mcp.sh — Local validation of workspace + fork MCP levels
# Usage: ./test-workspace-mcp.sh
set -e

KODA_BIN="${KODA_BIN:-/tmp/koda-test}"
STEER_ROOT="$HOME/.kiro/steer-runtime"
SETTINGS_DIR="$HOME/.kiro/settings"
MCP_JSON="$HOME/.kiro/workspaces/app-team/settings/mcp.json"
# Fallback to global settings if workspace not found
if [ ! -f "$MCP_JSON" ]; then MCP_JSON="$SETTINGS_DIR/mcp.json"; fi

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Workspace + Fork MCP Levels — Local Test Suite         ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Koda binary: $KODA_BIN"
echo "║  Steer root:  $STEER_ROOT"
echo "║  MCP config:  $MCP_JSON"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

assert_eq() {
    local desc="$1" expected="$2" actual="$3"
    if [ "$expected" = "$actual" ]; then
        echo "  ✅ $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $desc"
        echo "     Expected: $expected"
        echo "     Actual:   $actual"
        FAIL=$((FAIL + 1))
    fi
}

assert_contains() {
    local desc="$1" needle="$2" haystack="$3"
    if echo "$haystack" | grep -q "$needle"; then
        echo "  ✅ $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $desc (not found: $needle)"
        FAIL=$((FAIL + 1))
    fi
}

assert_not_contains() {
    local desc="$1" needle="$2" haystack="$3"
    if ! echo "$haystack" | grep -q "$needle"; then
        echo "  ✅ $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $desc (found but shouldn't: $needle)"
        FAIL=$((FAIL + 1))
    fi
}

# ─── Test 1: _source field present in mcp.json ───────────────────────────────
echo "━━━ Test 1: _source field tracking ━━━"

if [ -f "$MCP_JSON" ]; then
    sources=$(python3 -c "
import json
d = json.load(open('$MCP_JSON'))
sources = set()
for name, srv in d.get('mcpServers', {}).items():
    sources.add(srv.get('_source', 'MISSING'))
print(' '.join(sorted(sources)))
")
    assert_contains "_source field exists in mcp.json" "global" "$sources"
else
    echo "  ⚠️  $MCP_JSON not found — run 'koda mcp-install' first"
    FAIL=$((FAIL + 1))
fi

# ─── Test 2: User server preservation ─────────────────────────────────────────
echo ""
echo "━━━ Test 2: User server preservation ━━━"

# Add a fake user server
if [ -f "$MCP_JSON" ]; then
    python3 -c "
import json
with open('$MCP_JSON', 'r') as f:
    d = json.load(f)
d['mcpServers']['test-user-custom-mcp'] = {
    'command': 'echo',
    'args': ['test'],
    '_source': 'user'
}
with open('$MCP_JSON', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')
"
    echo "  ℹ️  Added test-user-custom-mcp to mcp.json"

    # Regenerate (simulates koda upgrade)
    "$KODA_BIN" mcp-install 2>/dev/null || true

    # Check if user server survived
    if [ -f "$MCP_JSON" ]; then
        has_user=$(python3 -c "
import json
d = json.load(open('$MCP_JSON'))
print('yes' if 'test-user-custom-mcp' in d.get('mcpServers', {}) else 'no')
")
        assert_eq "User server preserved after regeneration" "yes" "$has_user"

        # Cleanup
        python3 -c "
import json
with open('$MCP_JSON', 'r') as f:
    d = json.load(f)
d['mcpServers'].pop('test-user-custom-mcp', None)
with open('$MCP_JSON', 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')
"
    fi
fi

# ─── Test 3: File permissions ─────────────────────────────────────────────────
echo ""
echo "━━━ Test 3: File permissions ━━━"

if [ -f "$MCP_JSON" ]; then
    perms=$(stat -f "%Lp" "$MCP_JSON" 2>/dev/null || stat -c "%a" "$MCP_JSON" 2>/dev/null)
    assert_eq "mcp.json has 600 permissions (owner-only)" "600" "$perms"
fi

# ─── Test 4: Workspace MCP template exists ────────────────────────────────────
echo ""
echo "━━━ Test 4: Workspace MCP template ━━━"

TEMPLATE_DIR="$STEER_ROOT/shared/templates/workspace-mcp"
assert_eq "Template mcp.json exists" "true" "$([ -f "$TEMPLATE_DIR/mcp.json" ] && echo true || echo false)"
assert_eq "Template defaults.env exists" "true" "$([ -f "$TEMPLATE_DIR/defaults.env" ] && echo true || echo false)"
assert_eq "Template README.md exists" "true" "$([ -f "$TEMPLATE_DIR/README.md" ] && echo true || echo false)"

# ─── Test 5: koda mcp status command ─────────────────────────────────────────
echo ""
echo "━━━ Test 5: koda mcp status ━━━"

if [ -x "$KODA_BIN" ]; then
    status_output=$("$KODA_BIN" mcp status 2>&1 || true)
    assert_contains "Status shows 'MCP Servers'" "MCP Servers" "$status_output"
    assert_contains "Status shows 'global'" "global" "$status_output"
else
    echo "  ⚠️  Koda binary not found at $KODA_BIN"
    FAIL=$((FAIL + 1))
fi

# ─── Test 6: koda mcp add scaffold ───────────────────────────────────────────
echo ""
echo "━━━ Test 6: koda mcp add --fork (scaffold) ━━━"

TEST_MCP_DIR="$STEER_ROOT/shared/tools/mcp-servers/test-scaffold-mcp"
if [ -x "$KODA_BIN" ]; then
    "$KODA_BIN" mcp add test-scaffold --fork 2>/dev/null || true
    assert_eq "Scaffold created mcp-meta.json" "true" "$([ -f "$TEST_MCP_DIR/mcp-meta.json" ] && echo true || echo false)"
    assert_eq "Scaffold created package.json" "true" "$([ -f "$TEST_MCP_DIR/package.json" ] && echo true || echo false)"
    assert_eq "Scaffold created src/index.ts" "true" "$([ -f "$TEST_MCP_DIR/src/index.ts" ] && echo true || echo false)"

    # Validate mcp-meta.json is valid JSON
    if [ -f "$TEST_MCP_DIR/mcp-meta.json" ]; then
        valid=$(python3 -c "import json; json.load(open('$TEST_MCP_DIR/mcp-meta.json')); print('yes')" 2>/dev/null || echo "no")
        assert_eq "mcp-meta.json is valid JSON" "yes" "$valid"
    fi

    # Cleanup
    rm -rf "$TEST_MCP_DIR"
fi

# ─── Test 7: Core utility agents installed ────────────────────────────────────
echo ""
echo "━━━ Test 7: Core utility agents ━━━"

AGENTS_DIR="$STEER_ROOT/profiles/core/agents"
assert_eq "document_analyzer_agent.json exists" "true" "$([ -f "$AGENTS_DIR/document_analyzer_agent.json" ] && echo true || echo false)"
assert_eq "deck_builder_agent.json exists" "true" "$([ -f "$AGENTS_DIR/deck_builder_agent.json" ] && echo true || echo false)"
assert_eq "ai_adoption_stats_agent.json exists" "true" "$([ -f "$AGENTS_DIR/ai_adoption_stats_agent.json" ] && echo true || echo false)"

# Validate JSON
for agent in document_analyzer_agent deck_builder_agent ai_adoption_stats_agent; do
    if [ -f "$AGENTS_DIR/$agent.json" ]; then
        valid=$(python3 -c "import json; d=json.load(open('$AGENTS_DIR/$agent.json')); print('yes' if d.get('name') == '$agent' else 'no')" 2>/dev/null || echo "no")
        assert_eq "$agent.json has correct name field" "yes" "$valid"
    fi
done

# ─── Test 8: Prompt files exist for agents ────────────────────────────────────
echo ""
echo "━━━ Test 8: Agent prompt files ━━━"

PROMPTS_DIR="$STEER_ROOT/profiles/core/prompts"
for agent in document_analyzer_agent deck_builder_agent ai_adoption_stats_agent; do
    assert_eq "$agent.md exists" "true" "$([ -f "$PROMPTS_DIR/$agent.md" ] && echo true || echo false)"
done

# ─── Results ──────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Results: $PASS passed, $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL -gt 0 ]; then
    exit 1
fi
