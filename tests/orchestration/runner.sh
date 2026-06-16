#!/usr/bin/env bash
# orchestration-test-runner.sh — Tests orchestrator delegation behavior
# Usage: ./runner.sh [scenario.json | --all] [--dry-run]
#
# Spawns kiro-cli ACP with the specified agent, sends a prompt,
# captures tool calls, and validates delegation happened correctly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCENARIOS_DIR="$SCRIPT_DIR/scenarios"
RESULTS_DIR="$SCRIPT_DIR/results"
KIRO_CLI="${KIRO_CLI:-$(which kiro-cli 2>/dev/null || echo "$HOME/.local/bin/kiro-cli")}"
TIMEOUT_DEFAULT=60
DRY_RUN=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

mkdir -p "$RESULTS_DIR"

# --- Helpers ---

log() { echo -e "${CYAN}[runner]${NC} $*"; }
pass() { echo -e "  ${GREEN}✓${NC} $*"; }
fail() { echo -e "  ${RED}✗${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; }

json_field() {
  python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('$1',''))" <<< "$2"
}

json_array() {
  python3 -c "import json,sys; d=json.load(sys.stdin); print('\n'.join(d.get('$1',[])))" <<< "$2"
}

# --- ACP Communication ---

# Sends JSON-RPC to kiro-cli ACP and captures all output until session ends or timeout
run_scenario() {
  local scenario_file="$1"
  local scenario
  scenario=$(cat "$scenario_file")

  local name agent prompt timeout
  name=$(json_field "name" "$scenario")
  agent=$(json_field "agent" "$scenario")
  prompt=$(json_field "prompt" "$scenario")
  timeout=$(json_field "timeout_seconds" "$scenario")
  timeout="${timeout:-$TIMEOUT_DEFAULT}"

  local expect_delegated
  expect_delegated=$(python3 -c "import json; d=json.load(open('$scenario_file')); print(str(d['expect']['delegated']).lower())")

  log "Running: $name (agent=$agent, timeout=${timeout}s)"

  if $DRY_RUN; then
    warn "DRY-RUN — would send: \"$prompt\" to agent=$agent"
    return 0
  fi

  local output_file="$RESULTS_DIR/${name}.jsonl"
  local pid

  # Start kiro-cli ACP
  # We use a FIFO for stdin so we can write to it
  local fifo="/tmp/orch-test-$$"
  mkfifo "$fifo"

  $KIRO_CLI acp --agent "$agent" --trust-all-tools < "$fifo" > "$output_file" 2>/dev/null &
  pid=$!

  # Open fifo for writing
  exec 3>"$fifo"

  # Wait for kiro-cli to start
  sleep 2

  # Send initialize
  echo '{"jsonrpc":"2.0","id":"1","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"orch-test","version":"0.1.0"}}}' >&3
  sleep 1

  # Wait for session ID from notifications
  local session_id=""
  for i in $(seq 1 10); do
    session_id=$(grep -o '"sessionId":"[^"]*"' "$output_file" 2>/dev/null | head -1 | cut -d'"' -f4 || true)
    if [[ -n "$session_id" ]]; then
      break
    fi
    sleep 1
  done

  if [[ -z "$session_id" ]]; then
    # Try session/new
    echo "{\"jsonrpc\":\"2.0\",\"id\":\"2\",\"method\":\"session/new\",\"params\":{\"cwd\":\"$HOME\",\"mcpServers\":[]}}" >&3
    sleep 3
    session_id=$(grep -o '"sessionId":"[^"]*"' "$output_file" 2>/dev/null | head -1 | cut -d'"' -f4 || true)
  fi

  if [[ -z "$session_id" ]]; then
    fail "Could not get session ID"
    exec 3>&-
    rm -f "$fifo"
    kill "$pid" 2>/dev/null || true
    return 1
  fi

  # Send prompt
  echo "{\"jsonrpc\":\"2.0\",\"id\":\"3\",\"method\":\"session/prompt\",\"params\":{\"sessionId\":\"$session_id\",\"prompt\":{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":$(python3 -c "import json; print(json.dumps('$prompt'))")}]}}}" >&3

  # Wait for response (up to timeout)
  local elapsed=0
  while [[ $elapsed -lt $timeout ]]; do
    # Check if we got a result (id:3 response or end notification)
    if grep -q '"id":"3".*"result"' "$output_file" 2>/dev/null; then
      break
    fi
    if grep -q '"_kiro.dev/session/ended"' "$output_file" 2>/dev/null; then
      break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  # Close stdin to let kiro-cli exit
  exec 3>&-
  rm -f "$fifo"
  sleep 1
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true

  # --- Analyze results ---
  analyze_results "$scenario_file" "$output_file"
}

analyze_results() {
  local scenario_file="$1"
  local output_file="$2"
  local scenario
  scenario=$(cat "$scenario_file")

  local name
  name=$(json_field "name" "$scenario")

  local result_status="PASS"

  # Check 1: Was subagent tool called? (delegation happened)
  local subagent_calls
  subagent_calls=$(grep -c '"subagent"\|"use_subagent"\|"name":"subagent"' "$output_file" 2>/dev/null || echo "0")

  local expect_delegated
  expect_delegated=$(python3 -c "import json; d=json.load(open('$scenario_file')); print(str(d['expect']['delegated']).lower())")

  if [[ "$expect_delegated" == "true" ]]; then
    if [[ "$subagent_calls" -gt 0 ]]; then
      pass "Delegation detected ($subagent_calls subagent call(s))"
    else
      fail "NO DELEGATION — orchestrator did not use subagent tool"
      result_status="FAIL"
    fi
  fi

  # Check 2: Were the expected agents called?
  local expected_agents
  expected_agents=$(python3 -c "
import json
d = json.load(open('$scenario_file'))
agents = d['expect'].get('agents_called', d['expect'].get('agents_called_any', []))
print(' '.join(agents))
")
  local is_any
  is_any=$(python3 -c "import json; d=json.load(open('$scenario_file')); print('true' if 'agents_called_any' in d['expect'] else 'false')")

  if [[ -n "$expected_agents" ]]; then
    local found_any=false
    local all_found=true
    for agent in $expected_agents; do
      if grep -q "\"$agent\"" "$output_file" 2>/dev/null; then
        pass "Agent invoked: $agent"
        found_any=true
      else
        if [[ "$is_any" == "false" ]]; then
          fail "Agent NOT invoked: $agent"
          result_status="FAIL"
          all_found=false
        fi
      fi
    done
    if [[ "$is_any" == "true" && "$found_any" == "false" ]]; then
      fail "None of expected agents were invoked: $expected_agents"
      result_status="FAIL"
    fi
  fi

  # Check 3: Forbidden tools not called directly
  local forbidden
  forbidden=$(python3 -c "
import json
d = json.load(open('$scenario_file'))
print(' '.join(d['expect'].get('forbidden_tools', [])))
")
  if [[ -n "$forbidden" ]]; then
    for tool in $forbidden; do
      # Check if the orchestrator called it directly (not via subagent)
      if grep -v "subagent" "$output_file" | grep -q "\"name\":\"$tool\"\|\"$tool\"" 2>/dev/null; then
        fail "Forbidden tool called directly: $tool"
        result_status="FAIL"
      fi
    done
  fi

  # Summary
  local summary_file="$RESULTS_DIR/summary.json"
  python3 -c "
import json, os
summary_file = '$summary_file'
entry = {'name': '$name', 'status': '$result_status', 'subagent_calls': $subagent_calls, 'output_file': '$output_file'}
if os.path.exists(summary_file):
    with open(summary_file) as f: data = json.load(f)
else:
    data = {'results': [], 'total': 0, 'passed': 0, 'failed': 0}
data['results'].append(entry)
data['total'] += 1
if '$result_status' == 'PASS': data['passed'] += 1
else: data['failed'] += 1
with open(summary_file, 'w') as f: json.dump(data, f, indent=2)
"
  echo ""
}

# --- Main ---

print_usage() {
  echo "Usage: $0 [OPTIONS] [SCENARIO_FILE]"
  echo ""
  echo "Options:"
  echo "  --all       Run all scenarios"
  echo "  --dry-run   Show what would run without executing"
  echo "  --help      Show this help"
  echo ""
  echo "Examples:"
  echo "  $0 --all"
  echo "  $0 --all --dry-run"
  echo "  $0 scenarios/orchestrator/01-analyze-story.json"
}

# Parse args
SCENARIOS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      for f in "$SCENARIOS_DIR"/**/*.json; do
        SCENARIOS+=("$f")
      done
      shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --help) print_usage; exit 0 ;;
    *) SCENARIOS+=("$1"); shift ;;
  esac
done

if [[ ${#SCENARIOS[@]} -eq 0 ]]; then
  print_usage
  exit 1
fi

# Clean previous results
rm -f "$RESULTS_DIR/summary.json"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Orchestrator Delegation Test Harness          ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Scenarios: ${#SCENARIOS[@]}                                   ║"
echo "║  Mode: $(if $DRY_RUN; then echo "DRY-RUN"; else echo "LIVE   "; fi)                              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

for scenario in "${SCENARIOS[@]}"; do
  run_scenario "$scenario"
done

# Print summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ -f "$RESULTS_DIR/summary.json" ]]; then
  python3 -c "
import json
with open('$RESULTS_DIR/summary.json') as f: d = json.load(f)
total = d['total']
passed = d['passed']
failed = d['failed']
color_pass = '\033[0;32m'
color_fail = '\033[0;31m'
nc = '\033[0m'
print(f'Results: {color_pass}{passed} passed{nc}, {color_fail}{failed} failed{nc}, {total} total')
if failed > 0:
    print(f'\nFailed scenarios:')
    for r in d['results']:
        if r['status'] == 'FAIL':
            print(f'  ✗ {r[\"name\"]}')
"
else
  echo "No results (dry-run mode)"
fi
echo ""
