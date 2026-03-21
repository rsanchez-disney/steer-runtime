# Flow Tests

Run the full SDLC workflow by chaining specialist agents sequentially.

## Entry Points

### From a Jira ticket (dev flow)

```bash
./tests/run-flow.sh DPAY-14337                              # full flow
./tests/run-flow.sh DPAY-14337 --dry-run                    # plan only
./tests/run-flow.sh DPAY-14337 ~/wdpr-payment-controls-api  # explicit project
```

### From a Confluence spec (full lifecycle)

```bash
# Scope → story breakdown → dev flow
./tests/run-flow.sh --from-confluence https://confluence.disney.com/spaces/Payments/pages/123/My+Feature

# Scope + stories only (no implementation)
./tests/run-flow.sh --from-confluence https://confluence.disney.com/spaces/Payments/pages/123/My+Feature --dry-run
```

## Flow Phases

### From Confluence (`--from-confluence`)

| Phase | Agent | What it does |
|-------|-------|-------------|
| 0a | scope_definer_agent | Reads Confluence page, extracts scope |
| 0b | feature_writer_agent | Breaks scope into proposed Jira stories |
| 0c | requirements_analyst_agent | Validates stories for completeness |

Stories are proposed as structured text — no real Jira tickets are created. This makes the flow reproducible.

### Dev flow (from Jira ticket or after Phase 0)

| Phase | Agent | What it does |
|-------|-------|-------------|
| 1 | story_analyzer_agent | Fetches Jira ticket via MCP |
| 2 | codebase_explorer_agent | Explores project structure |
| 3 | architecture_agent | Reviews design patterns |
| 4 | planner_agent | Creates implementation plan |
| 5 | backend/webapi/ui | Implements code (auto-selected) |
| 6 | test_runner_agent | Runs tests, checks coverage |
| 7 | code_review_agent | Reviews changes |
| 8 | security_scanner_agent | Security scan |
| 9 | pr_creator_agent | Creates PR via GitHub MCP |

`--dry-run` stops after Phase 4 (or Phase 0c for Confluence flows).

## Logs

Each run creates a timestamped directory:

```
tests/runs/DPAY-14337-20260321-170000/
├── 01-story_analyzer_agent.log
├── 02-codebase_explorer_agent.log
├── 03-architecture_agent.log
├── 04-planner_agent.log
├── 05-webapi.log
├── ...

tests/runs/confluence-20260321-170500/
├── 00a-scope_definer_agent.log
├── 00b-feature_writer_agent.log
├── 00c-requirements_analyst_agent.log
├── 02-codebase_explorer_agent.log
├── ...
```

## Prerequisites

- `kiro-cli` installed (`npm install -g @kiro/cli`)
- Profiles installed (`./setup.sh workspace apply payments-core`)
- MCP tokens configured (`./setup.sh mcp-install`)
- Target project repo cloned locally
