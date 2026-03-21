#!/bin/bash
set -euo pipefail

# ─── Run the SDLC flow by chaining specialist agents ───
#
# Usage:
#   ./tests/run-flow.sh DPAY-14337                              # full flow
#   ./tests/run-flow.sh DPAY-14337 ~/wdpr-payment-controls-api  # explicit project
#   ./tests/run-flow.sh DPAY-14337 --dry-run                    # plan only
#
# The script IS the orchestrator — it chains kiro-cli agent calls
# sequentially, passing context between them.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STEER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_FLAGS="--trust-all-tools --no-interactive"

# ─── Args ───
TICKET="${1:?Usage: ./tests/run-flow.sh <TICKET> [project-dir] [--dry-run]}"
shift
PROJECT_DIR=""
DRY_RUN=false

while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run) DRY_RUN=true; shift ;;
        *) PROJECT_DIR="${1/#\~/$HOME}"; shift ;;
    esac
done

# ─── Validate ───
if ! command -v kiro-cli &>/dev/null; then
    echo "❌ kiro-cli not found. Install: npm install -g @kiro/cli"
    exit 1
fi

PREFIX=$(echo "$TICKET" | grep -oE '^[A-Z]+-')
echo "🎫 Ticket:  $TICKET (prefix: ${PREFIX:-unknown})"

# ─── Resolve project ───
if [ -z "$PROJECT_DIR" ]; then
    case "$PREFIX" in
        DPAY-)  REPO_NAME="wdpr-payment-controls-api" ;;
        GCP-)   REPO_NAME="wdpr-gcp-admin-api" ;;
        TIMON-) REPO_NAME="wdpr-cap-rev-rec-svc" ;;
        SPR-)   REPO_NAME="spr-router" ;;
        *)      echo "❌ Cannot auto-detect project for prefix '$PREFIX'. Pass project dir as 2nd arg."; exit 1 ;;
    esac

    SEARCH_ROOT="${STEER_SEARCH_ROOT:-$HOME/Workspace}"
    if [ -d "$STEER_ROOT/../$REPO_NAME" ]; then
        PROJECT_DIR="$(cd "$STEER_ROOT/../$REPO_NAME" && pwd)"
    else
        PROJECT_DIR="$(find "$SEARCH_ROOT" -maxdepth 4 -type d -name "$REPO_NAME" -not -path "*/node_modules/*" -not -path "*/.git/*" -print -quit 2>/dev/null)"
    fi

    if [ -z "$PROJECT_DIR" ]; then
        echo "❌ Could not find '$REPO_NAME' under $SEARCH_ROOT"
        echo "   Pass the path explicitly: ./tests/run-flow.sh $TICKET /path/to/$REPO_NAME"
        exit 1
    fi
fi

[ ! -d "$PROJECT_DIR" ] && echo "❌ Not found: $PROJECT_DIR" && exit 1

PROJECT_NAME=$(basename "$PROJECT_DIR")
echo "📁 Project: $PROJECT_NAME ($PROJECT_DIR)"
echo "🚀 Mode:    $(if $DRY_RUN; then echo 'dry-run (plan only)'; else echo 'full flow'; fi)"

# ─── Setup logging ───
mkdir -p "$SCRIPT_DIR/runs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RUN_DIR="$SCRIPT_DIR/runs/${TICKET}-${TIMESTAMP}"
mkdir -p "$RUN_DIR"
echo "📝 Run dir: $RUN_DIR"
echo ""

# ─── Colors ───
CYAN='[0;36m'
YELLOW='[1;33m'
DIM='[2m'
RESET='[0m'

# ─── Helper: run an agent and capture output ───
run_agent() {
    local agent="$1"
    local step="$2"
    local prompt="$3"
    local log_file="$RUN_DIR/${step}-${agent}.log"

    echo -e "${YELLOW}─── Step $step: $agent ───${RESET}"
    echo ""
    echo -e "${CYAN}▶ PROMPT:${RESET}"
    echo -e "${DIM}$prompt${RESET}"
    echo ""
    cd "$PROJECT_DIR"
    kiro-cli chat --agent "$agent" $CLI_FLAGS "$prompt" 2>&1 | tee "$log_file"
    echo ""
    echo "  📄 Log: $log_file"
    echo ""
}

# ═══════════════════════════════════════════
# STEP 1: Fetch & analyze Jira ticket
# ═══════════════════════════════════════════
echo "═══ Phase 1: Requirements ═══"
echo ""

run_agent "story_analyzer_agent" "01" \
    "Fetch Jira ticket $TICKET using your Jira MCP tools. Extract: title, description, acceptance criteria, story points, priority, linked issues, and any referenced Confluence pages. Return a structured summary."

REQUIREMENTS="$RUN_DIR/01-story_analyzer_agent.log"

# ═══════════════════════════════════════════
# STEP 2: Explore codebase
# ═══════════════════════════════════════════
echo "═══ Phase 2: Codebase Exploration ═══"
echo ""

run_agent "codebase_explorer_agent" "02" \
    "Explore the codebase at $PROJECT_DIR. Understand the project structure, key directories, entry points, and patterns. Identify files most likely relevant to this change: $(head -50 "$REQUIREMENTS" 2>/dev/null || echo "$TICKET"). Return a summary of the project structure and relevant files."

# ═══════════════════════════════════════════
# STEP 3: Architecture review
# ═══════════════════════════════════════════
echo "═══ Phase 3: Architecture Review ═══"
echo ""

run_agent "architecture_agent" "03" \
    "Review the architecture for the project at $PROJECT_DIR. Based on these requirements from $TICKET: $(head -50 "$REQUIREMENTS" 2>/dev/null || echo "$TICKET"). Identify the right design patterns, layers to modify, and any architectural concerns."

# ═══════════════════════════════════════════
# STEP 4: Implementation plan
# ═══════════════════════════════════════════
echo "═══ Phase 4: Implementation Plan ═══"
echo ""

run_agent "planner_agent" "04" \
    "Create a detailed implementation plan for $TICKET in the project at $PROJECT_DIR. Requirements: $(head -50 "$REQUIREMENTS" 2>/dev/null || echo "$TICKET"). Include: tasks with file paths, estimated complexity, testing approach, and order of implementation."

if $DRY_RUN; then
    echo "═══ Dry run complete ═══"
    echo ""
    echo "📁 All logs in: $RUN_DIR"
    ls -1 "$RUN_DIR"
    exit 0
fi

# ═══════════════════════════════════════════
# STEP 5: Implementation (delegate to specialist)
# ═══════════════════════════════════════════
echo "═══ Phase 5: Implementation ═══"
echo ""

PLAN="$RUN_DIR/04-planner_agent.log"

# Pick the right specialist based on project tech
case "$PROJECT_NAME" in
    *config-services*|*cap-*|*payment-svc*|*cart-service*|*spr-ai-adapter*)
        IMPL_AGENT="backend" ;;
    *controls-api*|*gcp-admin-api*|*inquiry-webapi*)
        IMPL_AGENT="webapi" ;;
    *controls-client*|*gcp-admin*|*inquiry-ui*)
        IMPL_AGENT="ui" ;;
    *spr-router*)
        IMPL_AGENT="backend" ;;
    *)
        IMPL_AGENT="webapi" ;;
esac

run_agent "$IMPL_AGENT" "05" \
    "Implement the changes for $TICKET in the project at $PROJECT_DIR. Follow this plan: $(head -100 "$PLAN" 2>/dev/null). Requirements: $(head -50 "$REQUIREMENTS" 2>/dev/null). Write the code, following existing patterns and conventions."

# ═══════════════════════════════════════════
# STEP 6: Run tests
# ═══════════════════════════════════════════
echo "═══ Phase 6: Tests ═══"
echo ""

run_agent "test_runner_agent" "06" \
    "Run the test suite for the project at $PROJECT_DIR. Check that all tests pass and coverage is >= 90% for changed files. If tests fail, show the failures."

# ═══════════════════════════════════════════
# STEP 7: Code review
# ═══════════════════════════════════════════
echo "═══ Phase 7: Code Review ═══"
echo ""

run_agent "code_review_agent" "07" \
    "Review the uncommitted changes in $PROJECT_DIR for ticket $TICKET. Check for: backward compatibility, test coverage, error handling, security issues, coding standards compliance. Provide a structured review."

# ═══════════════════════════════════════════
# STEP 8: Security scan
# ═══════════════════════════════════════════
echo "═══ Phase 8: Security Scan ═══"
echo ""

run_agent "security_scanner_agent" "08" \
    "Run a security analysis on the changes in $PROJECT_DIR for ticket $TICKET. Check for: hardcoded secrets, injection vulnerabilities, insecure dependencies, OWASP top 10 issues."

# ═══════════════════════════════════════════
# STEP 9: Create PR
# ═══════════════════════════════════════════
echo "═══ Phase 9: Pull Request ═══"
echo ""

run_agent "pr_creator_agent" "09" \
    "Create a pull request for $TICKET in the project at $PROJECT_DIR. Use your GitHub MCP tools. Include: title with ticket number, description with requirements and changes summary, link to Jira ticket."

# ═══════════════════════════════════════════
echo "═══ Flow complete ═══"
echo ""
echo "📁 All logs in: $RUN_DIR"
ls -1 "$RUN_DIR"
