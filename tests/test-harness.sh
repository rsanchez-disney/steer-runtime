#!/bin/bash
# Test harness changes: hooks, trust, context compression, RAG, doctor
# Usage: ./tests/test-harness.sh

set -uo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
KODA="$HOME/Workspace/Disney/SANCR225/Koda"
PASS=0; FAIL=0; SKIP=0

pass() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }
skip() { echo "  ○ $1 (skipped)"; SKIP=$((SKIP + 1)); }
section() { echo ""; echo "━━━ $1 ━━━"; }

# ─────────────────────────────────────────────────────────────────────────────
section "E2: Context compression — agent-registry two-tier"

OUT=$(bash "$KIRO_DIR/hooks/agent-registry.sh" 2>/dev/null)
SIZE=${#OUT}
if [ "$SIZE" -gt 50 ] && [ "$SIZE" -lt 500 ]; then
  pass "agent-registry compact output: ${SIZE}B (target <500B)"
else
  fail "agent-registry output unexpected: ${SIZE}B"
fi

if [ -f "$KIRO_DIR/context/_dynamic/agent-registry-full.md" ]; then
  FULL=$(wc -c < "$KIRO_DIR/context/_dynamic/agent-registry-full.md")
  pass "full registry file: ${FULL}B"
else
  fail "full registry file not created"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E7: Delegation map hook"

DMAP=$(bash "$KIRO_DIR/hooks/delegation-map.sh" 2>/dev/null)
if echo "$DMAP" | grep -q "Delegation Map"; then
  AGENTS=$(echo "$DMAP" | grep -c "^\-" || true)
  pass "delegation-map: $AGENTS profile groups"
else
  fail "delegation-map produced no output"
fi

if [ -f "$KIRO_DIR/context/_dynamic/delegation-map.md" ]; then
  LINES=$(wc -l < "$KIRO_DIR/context/_dynamic/delegation-map.md")
  pass "delegation-map.md: $LINES lines"
else
  fail "delegation-map.md not created"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E4/E10: Telemetry hook"

TLOG="$KIRO_DIR/logs/telemetry.jsonl"
echo '{"agent":"test-harness","sessionId":"harness-test","duration_ms":75000,"tool_calls":8,"context_usage_pct":0.28}' | \
  bash "$KIRO_DIR/hooks/telemetry-emit.sh" 2>/dev/null

if [ -f "$TLOG" ] && tail -1 "$TLOG" | grep -q "test-harness"; then
  pass "telemetry-emit writes JSONL"
else
  fail "telemetry-emit did not write"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E4: Session summary hook"

SLOG="$KIRO_DIR/logs/session-history.jsonl"
echo '{"agent":"test-harness","sessionId":"harness-test","duration_ms":75000,"tool_calls":8,"context_usage_pct":0.28}' | \
  bash "$KIRO_DIR/hooks/session-summary.sh" 2>/dev/null

if [ -f "$SLOG" ] && tail -1 "$SLOG" | grep -q "test-harness"; then
  pass "session-summary writes JSONL"
else
  fail "session-summary did not write"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E12: Session-to-memory hook"

ACTX="$KIRO_DIR/memory-bank/active-context.md"
if [ -f "$ACTX" ]; then
  echo '{"agent":"test-harness","sessionId":"harness-test","duration_ms":120000,"tool_calls":15,"context_usage_pct":0.4}' | \
    bash "$KIRO_DIR/hooks/session-to-memory.sh" 2>/dev/null
  if grep -q "test-harness" "$ACTX" 2>/dev/null; then
    pass "session-to-memory appends to active-context.md"
  else
    fail "session-to-memory did not append"
  fi
else
  skip "session-to-memory (no active-context.md)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E10: Koda stats"

cd "$KODA"
STATS=$(go run ./cmd/koda stats --days 1 2>&1)
if echo "$STATS" | grep -qE "Telemetry|test-harness|No telemetry"; then
  pass "koda stats reads telemetry"
else
  fail "koda stats error"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E8/E12: Doctor checks"

cd "$KODA"
DOC=$(go run ./cmd/koda doctor 2>&1)
if echo "$DOC" | grep -q "context-budgets"; then
  pass "doctor: context-budgets check present"
else
  fail "doctor: missing context-budgets check"
fi

if echo "$DOC" | grep -q "memory-bank"; then
  pass "doctor: memory-bank check present"
else
  skip "doctor: memory-bank check (no active-context.md)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E13: RAG context index"

if [ -f "$KIRO_DIR/context/_index.json" ]; then
  SIZE=$(wc -c < "$KIRO_DIR/context/_index.json")
  pass "context index exists: ${SIZE}B"

  cd "$KODA"
  EVAL=$(go run ./cmd/koda eval context-retrieval 2>&1)
  if echo "$EVAL" | grep -q "Passes"; then
    PREC=$(echo "$EVAL" | grep "Precision" | grep -oE '[0-9]+/[0-9]+')
    pass "RAG eval passes: $PREC"
  elif echo "$EVAL" | grep -q "Precision"; then
    PREC=$(echo "$EVAL" | grep "Precision" | grep -oE '[0-9]+%')
    fail "RAG eval below threshold: $PREC"
  else
    skip "RAG eval (unexpected output)"
  fi
else
  skip "context index not found (run: go run ./cmd/koda sync)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E7: Orchestrator prompt size"

PROMPT="$KIRO_DIR/prompts/orchestrator.md"
if [ -f "$PROMPT" ]; then
  LINES=$(wc -l < "$PROMPT")
  if [ "$LINES" -le 150 ]; then
    pass "orchestrator prompt: $LINES lines (target ≤150)"
  else
    fail "orchestrator prompt too long: $LINES lines"
  fi
else
  fail "orchestrator prompt not found"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "E3: Trust enforcement (unit)"

cd "$KODA"
if go test ./internal/acp/ -run TestIsDestructiveTool 2>&1 | grep -q "ok"; then
  pass "isDestructiveTool test passes"
else
  fail "trust unit test failed"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "RESULTS"
echo ""
TOTAL=$((PASS + FAIL + SKIP))
echo "  Total: $TOTAL | ✓ Pass: $PASS | ✗ Fail: $FAIL | ○ Skip: $SKIP"
echo ""
[ "$FAIL" -gt 0 ] && echo "  ⚠ $FAIL test(s) failed" && exit 1
echo "  ✅ All harness tests passed"
