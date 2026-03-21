#!/bin/bash
set -euo pipefail

# ─── Run the orchestrator SDLC flow against a Jira ticket ───
#
# Usage:
#   ./tests/run-flow.sh DPAY-14337                          # auto-detect project
#   ./tests/run-flow.sh DPAY-14337 ~/wdpr-payment-controls-api  # explicit project
#   ./tests/run-flow.sh DPAY-14337 --dry-run                # plan only, no implementation
#
# Output is logged to tests/runs/<ticket>-<timestamp>.log

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STEER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

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

# ─── Resolve project from prefix if not provided ───
# Map prefix → repo name, then search for it
if [ -z "$PROJECT_DIR" ]; then
    case "$PREFIX" in
        DPAY-)  REPO_NAME="wdpr-payment-controls-api" ;;
        GCP-)   REPO_NAME="wdpr-gcp-admin-api" ;;
        TIMON-) REPO_NAME="wdpr-cap-rev-rec-svc" ;;
        SPR-)   REPO_NAME="spr-router" ;;
        *)      echo "❌ Cannot auto-detect project for prefix '$PREFIX'. Pass project dir as 2nd arg."; exit 1 ;;
    esac

    # Search: 1) steer-runtime sibling  2) workspace projects  3) find under ~/Workspace
    SEARCH_ROOT="${STEER_SEARCH_ROOT:-$HOME/Workspace}"
    if [ -d "$STEER_ROOT/../$REPO_NAME" ]; then
        PROJECT_DIR="$(cd "$STEER_ROOT/../$REPO_NAME" && pwd)"
    else
        PROJECT_DIR="$(find "$SEARCH_ROOT" -maxdepth 4 -type d -name "$REPO_NAME" -not -path "*/node_modules/*" -not -path "*/.git/*" -print -quit 2>/dev/null)"
    fi

    if [ -z "$PROJECT_DIR" ]; then
        echo "❌ Could not find '$REPO_NAME' under $SEARCH_ROOT"
        echo "   Pass the path explicitly: ./tests/run-flow.sh $TICKET /path/to/$REPO_NAME"
        echo "   Or set STEER_SEARCH_ROOT to change the search root"
        exit 1
    fi
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

PROJECT_NAME=$(basename "$PROJECT_DIR")
echo "📁 Project: $PROJECT_NAME ($PROJECT_DIR)"

# ─── Setup logging ───
mkdir -p "$SCRIPT_DIR/runs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$SCRIPT_DIR/runs/${TICKET}-${TIMESTAMP}.log"

# ─── Build prompt ───
if $DRY_RUN; then
    PROMPT="Analyze Jira ticket $TICKET for the project at $PROJECT_DIR. Follow this delegation plan:

1. Delegate to story_analyzer_agent: Fetch the Jira ticket, extract requirements and acceptance criteria. Pull related Confluence docs if referenced.
2. Delegate to codebase_explorer_agent: Explore the codebase structure, find relevant files for the change.
3. Delegate to architecture_agent: Review the architecture and identify the right patterns for this change.
4. Delegate to planner_agent: Create a detailed implementation plan with tasks, files to change, and estimated complexity.

For each delegation, show the agent name and its output. Stop after the plan — do not implement. Show a summary of:
- Requirements extracted
- Files that would be changed
- Implementation plan with tasks"
else
    PROMPT="Implement Jira ticket $TICKET in the project at $PROJECT_DIR. Run the full SDLC workflow with these delegations:

1. Delegate to story_analyzer_agent: Fetch the Jira ticket, extract requirements and acceptance criteria.
2. Delegate to codebase_explorer_agent: Explore the codebase, find relevant files.
3. Delegate to architecture_agent: Review architecture and design approach.
4. Delegate to planner_agent: Create implementation plan.
5. Auto-approve Gate 1 — proceed to implementation.
6. Delegate to the appropriate specialist agents for implementation:
   - backend agent for Java/Spring changes
   - webapi agent for Node.js/Express changes
   - ui agent for Angular frontend changes
   - flutter agent for Dart/Flutter changes
7. Delegate to test_runner_agent: Run tests, ensure coverage >= 90%.
8. Delegate to code_review_agent: Review all changes.
9. Delegate to security_scanner_agent: Run security scan.
10. Auto-approve Gate 2 — proceed to PR.
11. Delegate to pr_creator_agent: Create the pull request.

Auto-approve all approval gates — do not pause for human review. If tests fail, fix and retry once."
fi

echo "🚀 Mode:    $(if $DRY_RUN; then echo 'dry-run (plan only)'; else echo 'full flow'; fi)"
echo "📝 Log:     $LOG_FILE"
echo ""
echo "─── Starting orchestrator ───"
echo ""

# ─── Run ───
cd "$PROJECT_DIR"
kiro-cli chat --agent orchestrator --trust-all-tools --no-interactive "$PROMPT" 2>&1 | tee "$LOG_FILE"

# ─── Summary ───
echo ""
echo "─── Flow complete ───"
echo "📝 Full log: $LOG_FILE"

# Quick stats from log
if [ -f "$LOG_FILE" ]; then
    lines=$(wc -l < "$LOG_FILE" | tr -d ' ')
    echo "📊 Log lines: $lines"
    
    # Check for key milestones
    for milestone in "implementation plan" "pull request" "PR" "coverage" "security scan"; do
        if grep -qi "$milestone" "$LOG_FILE" 2>/dev/null; then
            echo "  ✓ $milestone mentioned"
        fi
    done
fi
