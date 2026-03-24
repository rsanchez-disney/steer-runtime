# SDLC Flow Runner

Chains specialist AI agents sequentially to execute a full software development lifecycle — from requirements to merged PR.

## Usage

### From a Jira ticket

```bash
./tests/run-flow.sh DPAY-14337                              # full flow
./tests/run-flow.sh DPAY-14337 --dry-run                    # plan only (stops after Phase 4)
./tests/run-flow.sh DPAY-14337 ~/wdpr-payment-controls-api  # explicit project dir
```

### From a Confluence spec

```bash
# Full lifecycle: scope → stories → implementation → PR → Confluence summary
./tests/run-flow.sh --from-confluence "https://confluence.disney.com/spaces/Payments/pages/123/My+Feature"

# Scope + stories only (no implementation)
./tests/run-flow.sh --from-confluence "https://confluence.disney.com/spaces/Payments/pages/123/My+Feature" --dry-run
```

### Revert a run

```bash
./tests/run-flow.sh --revert tests/runs/confluence-20260324-171418
```

Reverts code changes (`git checkout`), deletes the feature branch, closes the PR, and notes any Confluence pages for manual cleanup. Reads `run-meta.json` saved at the start of each run.

## Flow Phases

### Phase 0 — Business Analysis (`--from-confluence` only)

| Step | Agent | What it does |
|------|-------|-------------|
| 0a | `scope_definer_agent` | Fetches Confluence page, extracts structured scope document |
| 0b | `feature_writer_agent` | Breaks scope into implementable Jira stories with acceptance criteria |
| 0c | `requirements_analyst_agent` | Validates stories for completeness, gaps, and NFRs |

Stories are proposed as structured text — no real Jira tickets are created.

### Phases 1–4 — Analysis & Planning

| Step | Agent | What it does |
|------|-------|-------------|
| 1 | `story_analyzer_agent` | Fetches Jira ticket via MCP (skipped for Confluence flows) |
| 2 | `codebase_explorer_agent` | Explores project structure, identifies relevant files |
| 3 | `architecture_agent` | Reviews design patterns, layers to modify, concerns |
| 4 | `planner_agent` | Creates implementation plan with tasks, file paths, complexity |

`--dry-run` stops here (or after Phase 0c for Confluence flows).

### Phases 5–9 — Build & Ship

| Step | Agent | What it does |
|------|-------|-------------|
| 5 | `backend` / `webapi` / `ui` | Implements code changes (agent auto-selected by repo name) |
| 6 | `test_runner_agent` | Runs tests, checks coverage ≥ 90% |
| 7 | `code_review_agent` | Reviews for backward compat, error handling, standards |
| 8 | `security_scanner_agent` | Scans for secrets, injection, OWASP top 10 |
| 9 | `pr_creator_agent` | Creates branch, commits, pushes, creates PR with full description |

Step 9 handles the full git workflow:
```
git checkout -b feat/<slug> → git add -A → git commit → git push → create PR
```

The PR description includes: summary, requirements addressed, files changed, test results, and security findings.

### Phase 10 — Documentation (`--from-confluence` only)

| Step | Agent | What it does |
|------|-------|-------------|
| 10 | `technical_writer_agent` | Creates Confluence child page with implementation summary and PR links |

## Prompts

Each step's prompt is externalized in `tests/prompts/`:

```
tests/prompts/
  00a-scope_definer.md
  00b-feature_writer.md
  00c-requirements_analyst.md
  01-story_analyzer.md
  02-codebase_explorer.md
  03-architecture.md
  04-planner.md
  05-implementation.md
  06-test_runner.md
  07-code_review.md
  08-security_scanner.md
  09-pr_creator.md
  10-confluence_summary.md
```

Prompts use `{{TICKET}}`, `{{PROJECT_DIR}}`, `{{CONFLUENCE_URL}}` placeholders. Context from previous steps is appended automatically by `render_prompt()`.

## Output

Each run creates a timestamped directory with per-step logs, metadata, and a summary:

```
tests/runs/confluence-20260324-171418/
  run-meta.json                          ← metadata (project, branch, PR URLs)
  00a-scope_definer_agent.log
  00b-feature_writer_agent.log
  00c-requirements_analyst_agent.log
  02-codebase_explorer_agent.log
  03-architecture_agent.log
  04-planner_agent.log
  05-webapi.log
  06-test_runner_agent.log
  07-code_review_agent.log
  08-security_scanner_agent.log
  09-pr_creator_agent.log
  10-technical_writer_agent.log
  summary.md                             ← formatted run summary
```

## Prerequisites

- `kiro-cli` installed
- Profiles installed: `./setup.sh install dev ba qa`
- MCP tokens configured: `./setup.sh configure` or `./setup.sh mcp-install`
- Target project repo cloned locally

## MCP Servers Used

| Server | Steps | Purpose |
|--------|-------|---------|
| `jira` | 0b, 0c, 1, 7, 9 | Ticket data, story creation |
| `confluence` | 0a, 0b, 0c, 9, 10 | Spec pages, summary publishing |
| `github` | 7, 9 | PR creation, code review |
| `mermaid` | — | Available for architecture diagrams |
| `bruno` | — | Available for API test generation |
