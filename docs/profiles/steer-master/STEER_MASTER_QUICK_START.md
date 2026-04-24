# Steer-Master Quick Start Guide

Practical prompts for the steer-master role — reviewing PRs, validating schemas, developing agents, and maintaining consistency across steer-runtime and Koda.

---

## Prerequisites

```bash
koda install steer-master dev-core    # Install steer-master + dev specialists
koda mcp-install                      # Setup MCP servers (GitHub required)
```

## Agents

| Agent                      | When to use                                            | Command                                          |
|----------------------------|--------------------------------------------------------|--------------------------------------------------|
| `steer_orchestrator_agent` | Full workflows — develop features + review PRs         | `kiro-cli chat --agent steer_orchestrator_agent` |
| `steer_reviewer_agent`     | Review a steer-runtime PR                              | `kiro-cli chat --agent steer_reviewer_agent`     |
| `koda_reviewer_agent`      | Review a Koda PR                                       | `kiro-cli chat --agent koda_reviewer_agent`      |
| `schema_validator_agent`   | Validate agent JSON, workspace JSON, profile structure | `kiro-cli chat --agent schema_validator_agent`   |
| `compatibility_agent`      | Check cross-repo impact                                | `kiro-cli chat --agent compatibility_agent`      |

---

## 0. Initialize a Session

Always start by orienting the agent to what you're working on.

### Point to steer-runtime

```
Let's work on steer-runtime located at ~/Workspace/Disney/SANCR225/steer-runtime.
Review the current profile structure, recent changes, and any open PRs.
```

### Point to Koda

```
Let's work on Koda located at ~/Workspace/Disney/SANCR225/Koda.
Review the Go module structure, recent changes, and the model layer.
```

---

## 1. Review a PR

The most common steer-master task. Works with any steer-runtime or Koda PR.

### Review a steer-runtime PR

```
Review this PR: https://github.disney.com/SANCR225/steer-runtime/pull/166

Check for:
- Breaking changes to agent schemas or prompts
- Naming convention violations
- Missing cross-references (prompts, hooks, context files)
- Cross-repo impact on Koda
- Fork classification (upstream vs fork-only)
```

### Review a Koda PR

```
Review this PR: https://github.disney.com/SANCR225/Koda/pull/65

Check for:
- Model backward compatibility (new fields must be omitempty)
- CLI flag consistency
- Exported function signature changes
- Build and test pass
```

### Review a fork PR for upstream candidacy

```
Review this PR: https://github.disney.com/wdpr-parkops-opsheet-suite/steer-runtime/pull/8

Classify each changed file as upstream-worthy or fork-only using FORK_STRATEGY.md.
Recommend which changes should be upstreamed as a separate PR.
```

---

## 2. Validate Schemas

### Validate a single agent

```
Validate the agent at profiles/steer-master/agents/steer_reviewer_agent.json.
Check required fields, prompt reference, resource references, and naming.
```

### Validate an entire profile

```
Scan the entire dev-core profile directory.
Validate every agent JSON, check all prompt and context references resolve,
and report any orphaned files.
```

### Validate a workspace

```
Validate workspaces/cart-checkout-tep3/workspace.json.
Check required fields, valid profile IDs, and project structure.
```

---

## 3. Develop New Agents

### Create a new agent for a profile

```
Create a new agent called "release_notes_agent" in the dev-core profile.
It should:
- Read git log between two tags
- Generate formatted release notes
- Support conventional commit parsing

Follow agent-schema.md and naming-conventions.md.
```

### Create a new profile

```
Create a new profile called "data-eng" with agents for:
- Spark/PySpark development
- Airflow DAG authoring
- Data quality validation

Follow the existing profile structure (agents/, prompts/, context/).
```

---

## 4. Develop New Features

### Add a new hook

```
Create a new hook called "lint-agent-json.sh" that runs on postToolUse
after writing any .json file under agents/.
It should validate the JSON is well-formed and has required fields.
Wire it into the steer-master agents.
```

### Add a new context file

```
Create a new context file for the steer-master profile that documents
the MCP server registry — which servers exist, their bundle directories,
required tokens, and which agents use them.
```

### Implement a cross-repo feature

```
I need to add a new "services" field to workspace.json.
This spans both repos:
- steer-runtime: update workspace-schema.md, add to workspace examples
- Koda: add field to Workspace model with omitempty

Plan the implementation, flag the cross-repo dependency, and implement both sides.
```

---

## 5. Maintain Consistency

### Check for breaking changes after a merge

```
Compare main with the state from last week.
Identify any breaking changes that were merged:
- Removed agent fields or files
- Renamed profiles or hooks
- Changed Koda model fields

Update breaking-change-log.md if needed.
```

### Audit a fork for upstream candidates

```
Compare the opsheet-suite fork against upstream main.
Identify changes that should be upstreamed:
- MCP server improvements
- Bug fixes in shared code
- New agents or hooks that benefit all teams

Classify each difference using FORK_STRATEGY.md.
```

### Update schema inventory after changes

```
Scan all agent JSON files and workspace JSON files.
Update schema-inventory.md with current field counts and any new fields.
```

---

## 6. Combined Workflows

### Full feature: new agent end-to-end

```
I need a new "changelog_agent" that generates changelogs from merged PRs.

1. Create the agent JSON and prompt in dev-core
2. Validate against agent-schema.md
3. Check naming conventions
4. Self-review for breaking changes
5. Create a PR with structured description

Use review mode — pause after each step.
```

### Review + fix: address PR feedback

```
PR #163 has review comments. Read the comments, implement the fixes,
and push to the same branch. Show me the diff before pushing.
```

---

## Tips

### Execution modes

The orchestrator supports two modes:

```
Implement the new hook in review mode       # pause after each step
Implement the new hook in autopilot mode    # run straight through
```

Switch mid-session: `Switch to autopilot` or `Switch to review mode`

### Best practices

- **Always initialize** — tell the agent which repo you're working on
- **One task per prompt** — "review this PR" then "fix the issues" rather than both at once
- **Reference the rules** — "follow agent-schema.md" helps the agent stay consistent
- **Use the orchestrator for multi-step work** — it delegates to specialists and self-reviews
- **Use specialist agents for focused tasks** — `schema_validator_agent` for bulk validation, `compatibility_agent` for cross-repo checks

---

Back to [Getting Started](../../getting-started/GETTING_STARTED.md) · [Dev Quick Start](../../getting-started/DEV_QUICK_START.md) · [README](../../README.md)
