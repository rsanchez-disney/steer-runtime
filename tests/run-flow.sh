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
PROMPT_DIR="$SCRIPT_DIR/prompts"

# ─── Template renderer ───
# Replaces {{VAR}} placeholders with bash variable values.
# Usage: render_prompt <file.md> [context_string]
render_prompt() {
    local file="$PROMPT_DIR/$1"
    local ctx="${2:-}"
    if [ ! -f "$file" ]; then
        echo "❌ Prompt file not found: $file" >&2; exit 1
    fi
    local prompt
    prompt=$(sed \
        -e "s|{{TICKET}}|${TICKET}|g" \
        -e "s|{{PROJECT_DIR}}|${PROJECT_DIR}|g" \
        -e "s|{{PROJECT_NAME}}|${PROJECT_NAME}|g" \
        -e "s|{{CONFLUENCE_URL}}|${CONFLUENCE_URL}|g" \
        "$file")
    if [ -n "$ctx" ]; then
        printf '%s\n\n## Context from previous steps\n\n%s' "$prompt" "$ctx"
    else
        printf '%s' "$prompt"
    fi
}

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
REVERT_DIR=""

while [ $# -gt 0 ]; do
    case "$1" in
        --revert) shift; REVERT_DIR="${1/#\~/$HOME}"; shift ;;
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

# ─── Revert mode ───
if [ -n "$REVERT_DIR" ]; then
    if [ ! -d "$REVERT_DIR" ]; then
        echo "❌ Run directory not found: $REVERT_DIR"
        exit 1
    fi
    META="$REVERT_DIR/run-meta.json"
    if [ ! -f "$META" ]; then
        echo "❌ No run-meta.json in $REVERT_DIR (older run without metadata)"
        exit 1
    fi

    proj=$(python3 -c "import json; print(json.load(open('$META'))['project_dir'])")
    branch=$(python3 -c "import json; print(json.load(open('$META')).get('branch',''))")
    echo -e "${YELLOW}⏪ Reverting run: $(basename "$REVERT_DIR")${RESET}"
    echo "   Project: $proj"
    echo ""

    # 1. Revert uncommitted code changes
    if [ -d "$proj" ]; then
        cd "$proj"
        dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        if [ "$dirty" -gt 0 ]; then
            echo "  📂 Reverting $dirty uncommitted file(s)..."
            git checkout . 2>/dev/null
            git clean -fd 2>/dev/null
            echo "  ✓ Code changes reverted"
        else
            echo "  ✓ Working tree already clean"
        fi

        # 2. Delete feature branch if created by the run
        if [ -n "$branch" ] && [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
            if git rev-parse --verify "$branch" &>/dev/null; then
                git checkout main 2>/dev/null || git checkout master 2>/dev/null
                git branch -D "$branch" 2>/dev/null && echo "  ✓ Deleted branch: $branch"
            fi
        fi
    fi

    # 3. Close PR if one was created
    pr_log="$REVERT_DIR/09-pr_creator_agent.log"
    if [ -f "$pr_log" ]; then
        pr_url=$(grep -oE 'https://github[^[:space:]]+/pull/[0-9]+' "$pr_log" | head -1)
        if [ -n "$pr_url" ]; then
            echo "  🔗 Closing PR: $pr_url"
            gh pr close "$pr_url" --delete-branch 2>/dev/null && echo "  ✓ PR closed" || echo "  ⚠ Could not close PR (may already be closed)"
        fi
    fi

    # 4. Note Confluence page (can't auto-delete safely)
    conf_log="$REVERT_DIR/10-technical_writer_agent.log"
    if [ -f "$conf_log" ]; then
        page_id=$(grep -oE 'ID [0-9]+' "$conf_log" | head -1 | grep -oE '[0-9]+')
        if [ -n "$page_id" ]; then
            echo "  📄 Confluence child page created (ID: $page_id) — delete manually if needed"
        fi
    fi

    echo ""
    echo -e "${GREEN}✓ Revert complete${RESET}"
    exit 0
fi

if [ -z "$TICKET" ] && [ -z "$CONFLUENCE_URL" ]; then
    echo "Usage:"
    echo "  ./tests/run-flow.sh DPAY-14337 [project-dir] [--dry-run]"
    echo "  ./tests/run-flow.sh --from-confluence <url> [project-dir] [--dry-run]"
    echo "  ./tests/run-flow.sh --revert <run-dir>"
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

# Save run metadata for --revert
python3 -c "
import json
json.dump({
    'ticket': '${TICKET}',
    'confluence_url': '${CONFLUENCE_URL}',
    'project_dir': '${PROJECT_DIR}',
    'project_name': '${PROJECT_NAME}',
    'branch': '$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "")',
    'timestamp': '${TIMESTAMP}',
    'dry_run': $(if $DRY_RUN; then echo 'True'; else echo 'False'; fi)
}, open('$RUN_DIR/run-meta.json', 'w'), indent=2)
"

echo "📝 Run dir: $RUN_DIR"
echo ""

FLOW_START=$SECONDS

# ─── Helper: run an agent and capture output ───
run_agent() {
    local agent="$1"
    local step="$2"
    local prompt="$3"
    local log_file="$RUN_DIR/${step}-${agent}.log"
    local step_start=$SECONDS

    echo -e "${YELLOW}─── Step $step: $agent ───${RESET}"
    echo ""
    echo -e "${CYAN}▶ PROMPT:${RESET}"
    echo -e "${DIM}$prompt${RESET}"
    echo ""
    cd "$PROJECT_DIR"
    kiro-cli chat --agent "$agent" $CLI_FLAGS "$prompt" 2>&1 | tee "$log_file"
    local elapsed=$(( SECONDS - step_start ))
    local mins=$(( elapsed / 60 ))
    local secs=$(( elapsed % 60 ))
    echo ""
    echo -e "  📄 Log: $log_file"
    echo -e "  ⏱  ${mins}m ${secs}s"
    echo "${step},${agent},${elapsed}" >> "$RUN_DIR/timings.csv"
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
        "$(render_prompt 00a-scope_definer.md)"

    SCOPE="$RUN_DIR/00a-scope_definer_agent.log"

    # 0b. Story breakdown
    run_agent "feature_writer_agent" "00b" \
        "$(render_prompt 00b-feature_writer.md "$(ctx "$SCOPE")")"

    STORIES="$RUN_DIR/00b-feature_writer_agent.log"

    # 0c. Requirements validation
    SCOPE_AND_STORIES="$(printf 'Original scope:\n%s\n\nProposed stories:\n%s' "$(ctx "$SCOPE")" "$(ctx "$STORIES")")"
    run_agent "requirements_analyst_agent" "00c" \
        "$(render_prompt 00c-requirements_analyst.md "$SCOPE_AND_STORIES")"

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
        "$(render_prompt 01-story_analyzer.md)"

    REQUIREMENTS="$RUN_DIR/01-story_analyzer_agent.log"
fi

# ═══════════════════════════════════════════════════════
# PHASE 2: Codebase Exploration
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 2: Codebase Exploration ═══${RESET}"
echo ""

run_agent "codebase_explorer_agent" "02" \
    "$(render_prompt 02-codebase_explorer.md "$(ctx "$REQUIREMENTS")")"

# ═══════════════════════════════════════════════════════
# PHASE 3: Architecture Review
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 3: Architecture Review ═══${RESET}"
echo ""

run_agent "architecture_agent" "03" \
    "$(render_prompt 03-architecture.md "$(ctx "$REQUIREMENTS")")"

# ═══════════════════════════════════════════════════════
# PHASE 4: Implementation Plan
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 4: Implementation Plan ═══${RESET}"
echo ""

run_agent "planner_agent" "04" \
    "$(render_prompt 04-planner.md "$(ctx "$REQUIREMENTS")")"

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

PLAN_AND_REQS="$(printf 'Plan:\n%s\n\nRequirements:\n%s' "$(ctx "$PLAN")" "$(ctx "$REQUIREMENTS")")"
run_agent "$IMPL_AGENT" "05" \
    "$(render_prompt 05-implementation.md "$PLAN_AND_REQS")"

# ═══════════════════════════════════════════════════════
# PHASE 6: Tests
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 6: Tests ═══${RESET}"
echo ""

run_agent "test_runner_agent" "06" \
    "$(render_prompt 06-test_runner.md)"

# ═══════════════════════════════════════════════════════
# PHASE 7: Code Review
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 7: Code Review ═══${RESET}"
echo ""

run_agent "code_review_agent" "07" \
    "$(render_prompt 07-code_review.md)"

# ═══════════════════════════════════════════════════════
# PHASE 8: Security Scan
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 8: Security Scan ═══${RESET}"
echo ""

run_agent "security_scanner_agent" "08" \
    "$(render_prompt 08-security_scanner.md)"

# ═══════════════════════════════════════════════════════
# PHASE 9: Pull Request
# ═══════════════════════════════════════════════════════
echo -e "${GREEN}═══ Phase 9: Pull Request ═══${RESET}"
echo ""

PR_CTX="$(printf 'Requirements:\n%s\n\nCode review:\n%s\n\nSecurity scan:\n%s' "$(ctx "$REQUIREMENTS")" "$(ctx "$RUN_DIR/07-code_review_agent.log")" "$(ctx "$RUN_DIR/08-security_scanner_agent.log")")"
run_agent "pr_creator_agent" "09" \
    "$(render_prompt 09-pr_creator.md "$PR_CTX")"

# Update metadata with branch/PR from step 09
if [ -f "$RUN_DIR/09-pr_creator_agent.log" ]; then
    python3 -c "
import json, re
meta = json.load(open('$RUN_DIR/run-meta.json'))
log = open('$RUN_DIR/09-pr_creator_agent.log').read()
pr = re.findall(r'https://github[^ ]+/pull/[0-9]+', log)
if pr: meta['pr_urls'] = list(set(pr))
json.dump(meta, open('$RUN_DIR/run-meta.json', 'w'), indent=2)
"
fi

# ═══════════════════════════════════════════════════════
# PHASE 10: Confluence Implementation Summary
# ═══════════════════════════════════════════════════════
if [ -n "$CONFLUENCE_URL" ]; then
    echo -e "${GREEN}═══ Phase 10: Confluence Implementation Summary ═══${RESET}"
    echo ""

    # Collect context from all steps + explicit PR URLs
    RUN_CTX=""
    for log in "$RUN_DIR"/*.log; do
        [ -f "$log" ] || continue
        fname=$(basename "$log" .log)
        RUN_CTX="${RUN_CTX}--- ${fname} ---
$(ctx "$log")

"
    done

    # Append PR URLs from metadata
    PR_URLS=$(python3 -c "import json; [print(u) for u in json.load(open('$RUN_DIR/run-meta.json')).get('pr_urls',[])]" 2>/dev/null)
    if [ -n "$PR_URLS" ]; then
        RUN_CTX="${RUN_CTX}--- Pull Requests ---
${PR_URLS}

"
    fi

    run_agent "technical_writer_agent" "10" \
        "$(render_prompt 10-confluence_summary.md "$RUN_CTX")"
fi

# ═══════════════════════════════════════════════════════
# Generate run summary
# ═══════════════════════════════════════════════════════
SUMMARY="$RUN_DIR/summary.md"
{
    echo "# SDLC Flow Summary"
    echo ""
    if [ -n "$CONFLUENCE_URL" ]; then
        echo "- **Source:** Confluence — $CONFLUENCE_URL"
    else
        echo "- **Ticket:** $TICKET"
    fi
    echo "- **Project:** $PROJECT_NAME (\`$PROJECT_DIR\`)"
    echo "- **Date:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "- **Mode:** $(if $DRY_RUN; then echo 'dry-run'; else echo 'full'; fi)"
    echo ""
    echo "---"
    echo ""

    for log in "$RUN_DIR"/*.log; do
        [ -f "$log" ] || continue
        fname=$(basename "$log" .log)
        step="${fname%%-*}"
        agent="${fname#*-}"
        echo "## Step $step — $agent"
        echo ""
        sed 's/\x1b\[[0-9;]*m//g' "$log" \
            | grep -v '^\[' \
            | grep -v '^$' \
            | grep -v '^─' \
            | grep -v '^═' \
            | head -30
        echo ""
        echo "---"
        echo ""
    done

    # Timing table
    if [ -f "$RUN_DIR/timings.csv" ]; then
        echo "## Execution Times"
        echo ""
        echo "| Step | Agent | Duration |"
        echo "|------|-------|----------|"
        while IFS=, read -r step agent elapsed; do
            printf '| %s | %s | %dm %ds |\n' "$step" "$agent" "$((elapsed/60))" "$((elapsed%60))"
        done < "$RUN_DIR/timings.csv"
        total=$(( SECONDS - FLOW_START ))
        printf '\n| | **Total** | **%dm %ds** |\n' "$((total/60))" "$((total%60))"
        echo ""
        echo "---"
        echo ""
    fi

    echo "*Generated by \`run-flow.sh\` — logs in \`$RUN_DIR\`*"
} > "$SUMMARY"

TOTAL=$(( SECONDS - FLOW_START ))
echo -e "${GREEN}═══ Flow complete ═══${RESET}"
echo ""
echo -e "⏱  Total: $((TOTAL/60))m $((TOTAL%60))s"
echo "📋 Summary: $SUMMARY"
echo "📁 All logs: $RUN_DIR"
ls -1 "$RUN_DIR"
