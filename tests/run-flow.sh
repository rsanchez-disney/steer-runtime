#!/bin/bash
set -euo pipefail

# ─── SDLC Flow Runner — chains specialist agents sequentially ───
#
# From Jira ticket:
#   ./tests/run-flow.sh DPAY-14337 [project-dir] [--dry-run]
#
# From Confluence spec (full lifecycle — scope → stories → dev):
#   ./tests/run-flow.sh --from-confluence <url> [project-dir] [--dry-run]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STEER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI_FLAGS="--trust-all-tools --no-interactive"

# ─── Colors ───
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
MAGENTA='\033[0;35m'
DIM='\033[2m'
RESET='\033[0m'

# ─── Args ───
CONFLUENCE_URL=""
TICKET=""
PROJECT_DIR=""
DRY_RUN=false

while [ $# -gt 0 ]; do
    case "$1" in
        --from-confluence) shift; CONFLUENCE_URL="$1"; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        -*)  echo "❌ Unknown flag: $1"; exit 1 ;;
        *)
            if [ -z "$TICKET" ] && [ -z "$CONFLUENCE_URL" ]; then
                TICKET="$1"
            else
                PROJECT_DIR="${1/#\~/$HOME}"
            fi
            shift ;;
    esac
done

if [ -z "$TICKET" ] && [ -z "$CONFLUENCE_URL" ]; then
    echo "Usage:"
    echo "  ./tests/run-flow.sh DPAY-14337 [project-dir] [--dry-run]"
    echo "  ./tests/run-flow.sh --from-confluence <url> [project-dir] [--dry-run]"
    exit 1
fi

# ─── Validate ───
if ! command -v kiro-cli &>/dev/null; then
    echo "❌ kiro-cli not found. Install: npm install -g @kiro/cli"
    exit 1
fi

# ─── Resolve project ───
resolve_project() {
    local repo_name="$1"
    SEARCH_ROOT="${STEER_SEARCH_ROOT:-$HOME/Workspace}"
    if [ -d "$STEER_ROOT/../$repo_name" ]; then
        echo "$(cd "$STEER_ROOT/../$repo_name" && pwd)"
    else
        find "$SEARCH_ROOT" -maxdepth 4 -type d -name "$repo_name" -not -path "*/node_modules/*" -not -path "*/.git/*" -print -quit 2>/dev/null
    fi
}

if [ -z "$PROJECT_DIR" ]; then
    if [ -n "$TICKET" ]; then
        PREFIX=$(echo "$TICKET" | grep -oE '^[A-Z]+-')
        case "$PREFIX" in
            DPAY-)  PROJECT_DIR="$(resolve_project wdpr-payment-controls-api)" ;;
            GCP-)   PROJECT_DIR="$(resolve_project wdpr-gcp-admin-api)" ;;
            TIMON-) PROJECT_DIR="$(resolve_project wdpr-cap-rev-rec-svc)" ;;
            SPR-)   PROJECT_DIR="$(resolve_project spr-router)" ;;
            *)      echo "❌ Cannot auto-detect project for '$PREFIX'. Pass project dir."; exit 1 ;;
        esac
    elif [ -n "$CONFLUENCE_URL" ]; then
        # Default to webapi for Confluence-driven flows; override with explicit dir
        PROJECT_DIR="$(resolve_project wdpr-payment-controls-api)"
    fi
fi

if [ -z "$PROJECT_DIR" ] || [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found. Pass it explicitly as an argument."
    exit 1
fi

PROJECT_NAME=$(basename "$PROJECT_DIR")

# ─── Header ───
if [ -n "$CONFLUENCE_URL" ]; then
    echo -e "${MAGENTA}📄 Source:  Confluence spec${RESET}"
    echo "   $CONFLUENCE_URL"
else
    echo "🎫 Ticket:  $TICKET"
fi
echo "📁 Project: $PROJECT_NAME ($PROJECT_DIR)"
echo "🚀 Mode:    $(if $DRY_RUN; then echo 'dry-run (plan only)'; else echo 'full flow'; fi)"

# ─── Setup logging ───
mkdir -p "$SCRIPT_DIR/runs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RUN_ID="${TICKET:-confluence}-${TIMESTAMP}"
RUN_DIR="$SCRIPT_DIR/runs/$RUN_ID"
mkdir -p "$RUN_DIR"
echo "📝 Run dir: $RUN_DIR"
echo ""

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

# Helper: read first N lines from a log as context
ctx() {
    head -80 "$1" 2>/dev/null | grep -v '^\[38;5;' | grep -v '^$' | head -60 || echo "(no context)"
}

# ═══════════════════════════════════════════════════════
# PHASE 0: Confluence → Story Breakdown (BA agents)
# ═══════════════════════════════════════════════════════
if [ -n "$CONFLUENCE_URL" ]; then
    echo -e "${GREEN}═══ Phase 0: Scope & Story Breakdown (from Confluence) ═══${RESET}"
    echo ""

    # 0a. Scope definition
    run_agent "scope_definer_agent" "00a" \
        "Read this Confluence page: $CONFLUENCE_URL

IMPORTANT MCP routing:
- URLs starting with https://confluence.disney.com → use confluence MCP tools (get_confluence_page, search_confluence_pages)
- URLs starting with https://mywiki.disney.com → use mywiki MCP tools

Analyze the scope of this feature. Extract:
- Feature title and objective
- Functional requirements
- Non-functional requirements
- Out of scope items
- Dependencies and assumptions
- Affected systems/repos

Return a structured scope document."

    SCOPE="$RUN_DIR/00a-scope_definer_agent.log"

    # 0b. Story breakdown
    run_agent "feature_writer_agent" "00b" \
        "Based on this scope analysis, break down the feature into implementable Jira stories.

Scope: $(ctx "$SCOPE")

For each proposed story, provide:
- Title (format: Story X.Y — <description>)
- Type: Story / Task / Sub-task
- Description with context
- Acceptance criteria (Given/When/Then)
- Story points estimate (1/2/3/5/8)
- Affected repo(s): backend (wdpr-config-services), webapi (wdpr-payment-controls-api), ui (wdpr-payment-controls-client)
- Dependencies on other stories

DO NOT create real Jira tickets. Output the proposed ticket content as structured text so it can be reviewed and reproduced."

    STORIES="$RUN_DIR/00b-feature_writer_agent.log"

    # 0c. Requirements validation
    run_agent "requirements_analyst_agent" "00c" \
        "Review these proposed stories for completeness and gaps.

Original scope: $(ctx "$SCOPE")

Proposed stories: $(ctx "$STORIES")

Check for:
- Missing acceptance criteria
- Gaps in coverage vs the original scope
- Missing non-functional requirements (performance, security, accessibility)
- Correct story point estimates
- Proper dependency ordering

Provide a validation report and any recommended additions."

    VALIDATED="$RUN_DIR/00c-requirements_analyst_agent.log"

    echo -e "${GREEN}═══ Phase 0 complete — stories proposed ═══${RESET}"
    echo ""

    # Use the proposed stories as requirements for the dev flow
    REQUIREMENTS="$STORIES"

    if $DRY_RUN; then
        echo -e "${GREEN}═══ Dry run complete (scope + stories) ═══${RESET}"
        echo ""
        echo "📁 All logs in: $RUN_DIR"
        ls -1 "$RUN_DIR"
        exit 0
    fi

    # 0d. Create Jira tickets from validated stories
    # Extract project key from Confluence URL or default to DPAY
    JIRA_PROJECT="${JIRA_PROJECT:-DPAY}"

    run_agent "story_analyzer_agent" "00d"         "Create Jira tickets for the validated stories below using the jira_create_issue MCP tool.

Reference ticket for format/style: https://myjira.disney.com/browse/DPAY-14416
First, fetch DPAY-14416 with jira_get_issue to use as a template for description format, labels, and components.

Project key: $JIRA_PROJECT

Validated stories: $(ctx "$VALIDATED")
Original proposed stories: $(ctx "$STORIES")

For EACH story, call jira_create_issue with:
- projectKey: $JIRA_PROJECT
- summary: the story title
- issueType: Story (or Task/Sub-task as specified)
- description: include context, acceptance criteria (Given/When/Then), affected repos, and dependencies — formatted like DPAY-14416

After creating all tickets, output a summary table with: ticket key, summary, type, and story points."

    TICKETS="$RUN_DIR/00d-story_analyzer_agent.log"

    echo -e "${GREEN}═══ Jira tickets created ═══${RESET}"
    echo ""

    # For full flow, pick the first story and run dev phases on it
    echo -e "${GREEN}═══ Continuing with dev flow for first proposed story ═══${RESET}"
    echo ""
fi

# ═══════════════════════════════════════════════════════
# PHASE 1: Requirements (from Jira or from Phase 0)
# ═══════════════════════════════════════════════════════
if [ -n "$TICKET" ]; then
    echo -e "${GREEN}═══ Phase 1: Requirements ═══${RESET}"
    echo ""

    run_agent "story_analyzer_agent" "01" \
        "Fetch Jira ticket $TICKET using your Jira MCP tools. Extract: title, description, acceptance criteria, story points, priority, linked issues, and any referenced Confluence pages. Return a structured summary."

    REQUIREMENTS="$RUN_DIR/01-story_analyzer_agent.log"
fi

# ═══════════════════════════════════════════════════════
# PHASE 2: Codebase Exploration
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 2: Codebase Exploration ═══${RESET}"
echo ""

run_agent "codebase_explorer_agent" "02" \
    "Explore the codebase at $PROJECT_DIR. Understand the project structure, key directories, entry points, and patterns. Identify files most likely relevant to this change: $(ctx "$REQUIREMENTS"). Return a summary of the project structure and relevant files."

# ═══════════════════════════════════════════════════════
# PHASE 3: Architecture Review
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 3: Architecture Review ═══${RESET}"
echo ""

run_agent "architecture_agent" "03" \
    "Review the architecture for the project at $PROJECT_DIR. Based on these requirements: $(ctx "$REQUIREMENTS"). Identify the right design patterns, layers to modify, and any architectural concerns."

# ═══════════════════════════════════════════════════════
# PHASE 4: Implementation Plan
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 4: Implementation Plan ═══${RESET}"
echo ""

run_agent "planner_agent" "04" \
    "Create a detailed implementation plan for the project at $PROJECT_DIR. Requirements: $(ctx "$REQUIREMENTS"). Include: tasks with file paths, estimated complexity, testing approach, and order of implementation."

if $DRY_RUN; then
    echo -e "${GREEN}═══ Dry run complete ═══${RESET}"
    echo ""
    echo "📁 All logs in: $RUN_DIR"
    ls -1 "$RUN_DIR"
    exit 0
fi

PLAN="$RUN_DIR/04-planner_agent.log"

# ═══════════════════════════════════════════════════════
# PHASE 5: Implementation
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 5: Implementation ═══${RESET}"
echo ""

case "$PROJECT_NAME" in
    *config-services*|*cap-*|*payment-svc*|*cart-service*|*spr-ai-adapter*)
        IMPL_AGENT="backend" ;;
    *controls-api*|*gcp-admin-api*|*inquiry-webapi*)
        IMPL_AGENT="webapi" ;;
    *controls-client*|*gcp-admin*|*inquiry-ui*)
        IMPL_AGENT="ui" ;;
    *)  IMPL_AGENT="webapi" ;;
esac

run_agent "$IMPL_AGENT" "05" \
    "Implement the changes in the project at $PROJECT_DIR. Follow this plan: $(ctx "$PLAN"). Requirements: $(ctx "$REQUIREMENTS"). Write the code, following existing patterns and conventions."

# ═══════════════════════════════════════════════════════
# PHASE 6: Tests
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 6: Tests ═══${RESET}"
echo ""

run_agent "test_runner_agent" "06" \
    "Run the test suite for the project at $PROJECT_DIR. Check that all tests pass and coverage is >= 90% for changed files. If tests fail, show the failures."

# ═══════════════════════════════════════════════════════
# PHASE 7: Code Review
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 7: Code Review ═══${RESET}"
echo ""

run_agent "code_review_agent" "07" \
    "Review the uncommitted changes in $PROJECT_DIR. Check for: backward compatibility, test coverage, error handling, security issues, coding standards compliance. Provide a structured review."

# ═══════════════════════════════════════════════════════
# PHASE 8: Security Scan
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 8: Security Scan ═══${RESET}"
echo ""

run_agent "security_scanner_agent" "08" \
    "Run a security analysis on the changes in $PROJECT_DIR. Check for: hardcoded secrets, injection vulnerabilities, insecure dependencies, OWASP top 10 issues."

# ═══════════════════════════════════════════════════════
# PHASE 9: Pull Request
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 9: Pull Request ═══${RESET}"
echo ""

run_agent "pr_creator_agent" "09" \
    "Create a pull request for the project at $PROJECT_DIR. Use your GitHub MCP tools. Include: title with ticket number, description with requirements and changes summary, link to Jira ticket."

# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Flow complete ═══${RESET}"
echo ""
echo "📁 All logs in: $RUN_DIR"
ls -1 "$RUN_DIR"
