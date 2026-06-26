# Shared Playbooks

Playbooks are declarative, multi-step workflows that chain agents together with quality gates.

## What is a Playbook?

A playbook defines a repeatable sequence of agent delegations — each step has:
- An **agent** to execute it
- An **instruction** (with variable interpolation)
- A **gate** (auto, user_approval, pass_threshold, condition)
- A **failure strategy** (stop, skip, retry, fallback)

## Usage

```bash
# Run a playbook
koda run hotfix --jira_key DPAY-14500

# List available playbooks
koda playbook list

# Dry-run (show what would execute without running)
koda run hotfix --jira_key DPAY-14500 --dry-run

# Resume an interrupted playbook
koda run --resume <run-id>
```

## Creating a Playbook

1. Copy the template: `cp _template.yaml my-playbook.yaml`
2. Define inputs (what the user must provide)
3. Define steps (agent + instruction + gate)
4. Validate: `koda playbook validate my-playbook.yaml`

## File Format

See `playbook.schema.json` for the full schema.

Key fields:
- `name` — human-readable name
- `version` — semver
- `trigger` — when it can run: manual, on_jira_status, on_alert, on_pr_create, scheduled
- `inputs` — required user inputs with types and validation
- `steps[]` — ordered agent executions

## Gates

| Gate Type | Behavior |
|-----------|----------|
| `auto` | Proceed immediately if step succeeds |
| `user_approval` | Pause and ask user to approve/reject/edit |
| `pass_threshold` | Check numeric result against threshold (e.g., test pass rate) |
| `condition` | Evaluate an expression against step output |

## Failure Strategies

| Strategy | Behavior |
|----------|----------|
| `stop` | Halt the entire playbook |
| `skip` | Skip this step, continue to next |
| `retry` | Retry the step once with same parameters |
| `fallback` | Try `fallback_agent` instead |

## Variable Interpolation

Use `{{variable_name}}` in instructions to reference:
- Input values: `{{jira_key}}`, `{{base_branch}}`
- Previous step outputs: referenced via `inputs_from` field

## Available Playbooks

| Playbook | Trigger | Steps | Description |
|----------|---------|-------|-------------|
| `hotfix.yaml` | manual | 7 | Emergency fix: analyze → plan → implement → test → PR |
| `incident-response.yaml` | manual | 5 | P1/P2 triage: signals → changes → diagnose → communicate |
| `sprint-kickoff.yaml` | manual | 3 | Sprint planning: analyze backlog → risks → report |
| `feature-implementation.yaml` | manual | 8 | Full SDLC for a user story |
| `pr-review-cycle.yaml` | manual | 4 | Review → feedback → fix → re-review loop |

## Contributing

1. Create your playbook YAML following the schema
2. Validate: `koda playbook validate <file>`
3. Test: `koda run <playbook> --dry-run`
4. Submit PR to steer-runtime
