# Flow Tests

Run the orchestrator SDLC workflow end-to-end against a real Jira ticket.

## Usage

```bash
# Full flow — explore, plan, implement, test, PR
./tests/run-flow.sh DPAY-14337

# Dry run — explore and plan only, no code changes
./tests/run-flow.sh DPAY-14337 --dry-run

# Explicit project directory
./tests/run-flow.sh DPAY-14337 ~/wdpr-payment-controls-api

# Different project prefixes
./tests/run-flow.sh GCP-5678                    # → wdpr-gcp-admin-api
./tests/run-flow.sh TIMON-7590                  # → wdpr-cap-rev-rec-svc
./tests/run-flow.sh SPR-1234                    # → spr-router
```

## What it does

1. Resolves the target project from the Jira prefix (or explicit path)
2. Launches `kiro-cli chat --agent orchestrator` with the ticket
3. The orchestrator runs its 12-step SDLC workflow:
   - Fetch & analyze Jira story
   - Explore codebase
   - Review architecture
   - Create implementation plan
   - Implement (delegates to specialist agents)
   - Run tests (coverage ≥90%)
   - Code review + security scan
   - Create pull request
4. Output is logged to `tests/runs/<ticket>-<timestamp>.log`

## Modes

| Flag | Behavior |
|------|----------|
| *(none)* | Full flow — implements and creates PR |
| `--dry-run` | Plan only — explores and produces plan, no code changes |

## Prerequisites

- `kiro-cli` installed (`npm install -g @kiro/cli`)
- Profiles installed (`./setup.sh workspace apply payments-core`)
- MCP tokens configured (`./setup.sh mcp-install`)
- Target project repo cloned locally

## Logs

All runs are saved to `tests/runs/` (gitignored):

```
tests/runs/
├── DPAY-14337-20260321-160000.log
├── GCP-5678-20260321-163000.log
```
