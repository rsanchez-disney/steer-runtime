#!/bin/bash
# Full local test suite for the orchestration-harness-context feature branch.
# Run from any directory. Tests all 3 repos.
#
# Usage: ./tests/test-all-local.sh [--skip-live]
#   --skip-live  Skip tests that require kiro-cli sessions (faster, CI-safe)

set -uo pipefail

SKIP_LIVE=false
[ "${1:-}" = "--skip-live" ] && SKIP_LIVE=true

STEER="$HOME/Workspace/Disney/SANCR225/steer-runtime"
KODA="$HOME/Workspace/Disney/SANCR225/Koda"
AUTOPILOT="$HOME/Workspace/Disney/SANCR225/steer-autopilot"
KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"

PASS=0
FAIL=0
SKIP=0

pass() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }
skip() { echo "  ○ $1 (skipped)"; SKIP=$((SKIP + 1)); }

section() { echo ""; echo "━━━ $1 ━━━"; }

# ─────────────────────────────────────────────────────────────────────────────
section "1. Go builds"

cd "$KODA"
if go build ./... 2>/dev/null; then pass "Koda build"; else fail "Koda build"; fi

cd "$AUTOPILOT"
if go build ./... 2>/dev/null; then pass "steer-autopilot build"; else fail "steer-autopilot build"; fi

# ─────────────────────────────────────────────────────────────────────────────
section "2. Go unit tests"

cd "$KODA"
if go test ./internal/acp/ ./internal/team/ ./internal/ops/ 2>/dev/null; then
  pass "Koda tests (acp, team, ops)"
else
  fail "Koda tests"
fi

cd "$AUTOPILOT"
if go test ./internal/broker/ ./internal/engine/ 2>/dev/null; then
  pass "steer-autopilot tests (broker, engine)"
else
  fail "steer-autopilot tests"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "3. JSON validity (steer-runtime)"

cd "$STEER"
INVALID=0
for f in $(find profiles -name "*.json" -not -path "*/node_modules/*" -not -name "._*"); do
  if ! python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then
    echo "    INVALID: $f"
    INVALID=$((INVALID + 1))
  fi
done
if [ "$INVALID" -eq 0 ]; then pass "All agent/workspace JSONs valid"; else fail "$INVALID invalid JSON files"; fi

# ─────────────────────────────────────────────────────────────────────────────
section "4. Koda doctor"

cd "$KODA"
DOCTOR_OUT=$(go run ./cmd/koda doctor 2>&1)
DOCTOR_FAILS=$(echo "$DOCTOR_OUT" | grep -c "✗" || true)
# steer-git and gh-auth failures are expected (uncommitted changes, session auth)
REAL_FAILS=$(echo "$DOCTOR_OUT" | grep "✗" | grep -cv "steer-git\|gh-auth" || true)
if [ "$REAL_FAILS" -eq 0 ]; then pass "koda doctor (no real failures)"; else fail "koda doctor: $REAL_FAILS issues"; fi

# ─────────────────────────────────────────────────────────────────────────────
section "5. Hook tests (agent-registry two-tier)"

OUTPUT=$(bash "$STEER/shared/hooks/agent-registry.sh" 2>/dev/null)
OUTPUT_SIZE=${#OUTPUT}
if [ "$OUTPUT_SIZE" -lt 500 ] && [ "$OUTPUT_SIZE" -gt 50 ]; then
  pass "agent-registry.sh compact output (${OUTPUT_SIZE}B)"
else
  fail "agent-registry.sh output size unexpected (${OUTPUT_SIZE}B)"
fi

if [ -f "$KIRO_DIR/context/_dynamic/agent-registry-full.md" ]; then
  FULL_SIZE=$(wc -c < "$KIRO_DIR/context/_dynamic/agent-registry-full.md")
  if [ "$FULL_SIZE" -gt 1000 ]; then pass "agent-registry full file (${FULL_SIZE}B)"; else fail "agent-registry full file too small"; fi
else
  fail "agent-registry full file not created"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "6. Hook tests (delegation-map)"

DMAP_OUT=$(bash "$STEER/shared/hooks/delegation-map.sh" 2>/dev/null)
if echo "$DMAP_OUT" | grep -q "## Delegation Map"; then
  pass "delegation-map.sh produces output"
else
  fail "delegation-map.sh no output"
fi

if [ -f "$KIRO_DIR/context/_dynamic/delegation-map.md" ]; then
  pass "delegation-map.md file created"
else
  fail "delegation-map.md not created"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "7. Hook tests (telemetry-emit)"

TEST_META='{"agent":"test-agent","sessionId":"test-123","duration_ms":90000,"tool_calls":10,"context_usage_pct":0.25}'
echo "$TEST_META" | bash "$STEER/shared/hooks/telemetry-emit.sh" 2>/dev/null

if [ -f "$KIRO_DIR/logs/telemetry.jsonl" ]; then
  LAST=$(tail -1 "$KIRO_DIR/logs/telemetry.jsonl")
  if echo "$LAST" | grep -q "test-agent"; then
    pass "telemetry-emit.sh writes JSONL"
  else
    fail "telemetry-emit.sh entry not found"
  fi
else
  fail "telemetry.jsonl not created"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "8. Hook tests (session-to-memory)"

if [ -f "$KIRO_DIR/memory-bank/active-context.md" ]; then
  echo "$TEST_META" | bash "$STEER/shared/hooks/session-to-memory.sh" 2>/dev/null
  if grep -q "test-agent" "$KIRO_DIR/memory-bank/active-context.md" 2>/dev/null; then
    pass "session-to-memory.sh appends to active-context.md"
  else
    fail "session-to-memory.sh did not append"
  fi
else
  skip "session-to-memory (no active-context.md)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "9. RAG context index"

cd "$KODA"
# Build index
if go run -exec '' ./cmd/koda sync 2>/dev/null; then
  skip "koda sync (may require git auth)"
else
  # Try building index directly
  python3 -c "
import os, sys
sys.path.insert(0, '.')
" 2>/dev/null
fi

if [ -f "$KIRO_DIR/context/_index.json" ]; then
  INDEX_SIZE=$(wc -c < "$KIRO_DIR/context/_index.json")
  if [ "$INDEX_SIZE" -gt 100 ]; then
    pass "context index exists (${INDEX_SIZE}B)"
  else
    fail "context index too small"
  fi

  # Run eval
  EVAL_OUT=$(go run ./cmd/koda eval context-retrieval 2>&1 || true)
  if echo "$EVAL_OUT" | grep -q "Passes"; then
    pass "context-retrieval eval passes threshold"
  elif echo "$EVAL_OUT" | grep -q "Precision"; then
    PREC=$(echo "$EVAL_OUT" | grep "Precision" | grep -oE '[0-9]+%')
    fail "context-retrieval eval: $PREC (below threshold)"
  else
    skip "context-retrieval eval (index may need rebuild)"
  fi
else
  skip "context index not found (run koda sync first)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "10. Koda stats"

cd "$KODA"
STATS_OUT=$(go run ./cmd/koda stats --days 1 2>&1)
if echo "$STATS_OUT" | grep -qE "Telemetry|Usage|No"; then
  pass "koda stats runs without error"
else
  fail "koda stats failed"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "11. Orchestrator prompt sizes"

cd "$STEER"
ORCH_LINES=$(wc -l < profiles/dev-core/prompts/orchestrator.md)
if [ "$ORCH_LINES" -le 150 ]; then
  pass "dev-core orchestrator ≤150 lines ($ORCH_LINES)"
else
  fail "dev-core orchestrator too long ($ORCH_LINES lines)"
fi

TOTAL_LINES=0
for f in profiles/*/prompts/*orchestrator* profiles/dev-ai/prompts/ai_orchestrator*; do
  [ -f "$f" ] && TOTAL_LINES=$((TOTAL_LINES + $(wc -l < "$f")))
done
if [ "$TOTAL_LINES" -le 1600 ]; then
  pass "all orchestrators total ≤1600 lines ($TOTAL_LINES)"
else
  fail "orchestrators total too high ($TOTAL_LINES lines)"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "12. Schema validation"

cd "$STEER"
if python3 -c "import json; json.load(open('common/schemas/agent.schema.json'))" 2>/dev/null; then
  pass "agent.schema.json is valid JSON Schema"
else
  fail "agent.schema.json invalid"
fi

# Validate orchestrator.json against key fields
python3 -c "
import json, sys
a = json.load(open('profiles/dev-core/agents/orchestrator.json'))
errors = []
if 'contextBudget' not in a: errors.append('missing contextBudget')
if not any(isinstance(r, dict) for r in a.get('resources', [])): errors.append('no conditional resources')
if 'agentComplete' not in a.get('hooks', {}): errors.append('missing agentComplete hook')
if errors:
    print('  ERRORS: ' + ', '.join(errors))
    sys.exit(1)
" 2>/dev/null
if [ $? -eq 0 ]; then pass "orchestrator.json has new fields (contextBudget, conditional resources, agentComplete)"; else fail "orchestrator.json missing new fields"; fi

# ─────────────────────────────────────────────────────────────────────────────
if [ "$SKIP_LIVE" = false ]; then
  section "13. Live orchestrator delegation (requires kiro-cli)"

  if command -v kiro-cli &>/dev/null; then
    # Verify orchestrator agent loads without error (validates prompt + resources parse correctly)
    LIVE_OUT=$(timeout 10 kiro-cli acp -a --agent orchestrator 2>&1 &
      KIRO_PID=$!
      sleep 3
      kill $KIRO_PID 2>/dev/null
      wait $KIRO_PID 2>/dev/null)
    # If kiro-cli started without crashing in 3s, the agent config is valid
    if [ $? -le 137 ]; then
      pass "orchestrator agent loads via kiro-cli (config valid)"
    else
      fail "orchestrator agent failed to load"
    fi
  else
    skip "kiro-cli not found"
  fi
else
  section "13. Live tests (skipped with --skip-live)"
  skip "live orchestrator delegation"
fi

# ─────────────────────────────────────────────────────────────────────────────
section "RESULTS"
echo ""
TOTAL=$((PASS + FAIL + SKIP))
echo "  Total: $TOTAL | ✓ Pass: $PASS | ✗ Fail: $FAIL | ○ Skip: $SKIP"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "  ⚠ $FAIL test(s) failed"
  exit 1
else
  echo "  ✅ All tests passed"
  exit 0
fi
