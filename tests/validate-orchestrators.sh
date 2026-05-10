#!/bin/bash
# Orchestrator delegation validation
# Runs test prompts and checks that the orchestrator delegates to the expected agent.
# Requires: kiro-cli, jq
#
# Usage: ./tests/validate-orchestrators.sh [--dry-run]
#
# In dry-run mode, just validates the test matrix JSON without running agents.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MATRIX="$SCRIPT_DIR/orchestrator-test-matrix.json"

if [ ! -f "$MATRIX" ]; then
  echo "ERROR: test matrix not found at $MATRIX"
  exit 1
fi

DRY_RUN=false
[ "${1:-}" = "--dry-run" ] && DRY_RUN=true

TOTAL=$(jq '.tests | length' "$MATRIX")
THRESHOLD=$(jq '.pass_threshold' "$MATRIX")
PASS=0
FAIL=0

echo "🧪 Orchestrator Delegation Validation"
echo "   Tests: $TOTAL | Threshold: $(echo "$THRESHOLD * 100" | bc)%"
echo ""

for i in $(seq 0 $((TOTAL - 1))); do
  ORCH=$(jq -r ".tests[$i].orchestrator" "$MATRIX")
  PROMPT=$(jq -r ".tests[$i].prompt" "$MATRIX")
  EXPECTED=$(jq -r ".tests[$i].expected_agent" "$MATRIX")

  if [ "$DRY_RUN" = true ]; then
    echo "  [$((i+1))/$TOTAL] $ORCH: \"$PROMPT\" → expects $EXPECTED (dry-run)"
    PASS=$((PASS + 1))
    continue
  fi

  # Run the orchestrator with the test prompt and capture the subagent call
  RESULT=$(kiro-cli chat --agent "$ORCH" --prompt "$PROMPT" --max-turns 1 --json 2>/dev/null | \
    jq -r '.tool_calls[]? | select(.name == "subagent") | .arguments.stages[0].role // empty' 2>/dev/null || echo "")

  if [ "$RESULT" = "$EXPECTED" ]; then
    echo "  ✓ [$((i+1))/$TOTAL] $ORCH: \"$PROMPT\" → $RESULT"
    PASS=$((PASS + 1))
  else
    echo "  ✗ [$((i+1))/$TOTAL] $ORCH: \"$PROMPT\" → $RESULT (expected $EXPECTED)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
PRECISION=$(echo "scale=2; $PASS / $TOTAL" | bc)
echo "Results: $PASS/$TOTAL passed (${PRECISION})"

PASS_CHECK=$(echo "$PRECISION >= $THRESHOLD" | bc)
if [ "$PASS_CHECK" = "1" ]; then
  echo "✓ Passes threshold"
  exit 0
else
  echo "✗ Below threshold ($THRESHOLD)"
  exit 1
fi
