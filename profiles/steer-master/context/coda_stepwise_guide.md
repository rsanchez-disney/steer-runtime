---
inclusion: auto
description: CODA and Stepwise integration guide for steer-runtime ecosystem
---

# CODA + Stepwise integration

## Overview

CODA (Globant's AI coding agent) and Stepwise (workflow orchestrator) are part of the AI Pods platform. Koda supports CODA as a runtime target — materializing steer-runtime agents/skills/MCP into `~/.coda/` via `koda chat --ws <name> --target coda`.

## Architecture

```text
AI Pods-as-Code (YAML) → Stepwise (orchestrator) → Agent Runtime (coda) → LLM → Artifacts
```

- **AI Pods-as-Code** — declarative YAML defining what should happen
- **Stepwise** — decides when and in what order (quality gates, DAG execution)
- **Agent Runtime (CODA)** — executes skills, manages prompts, produces outputs

## CODA content model

| Concept | Location | Format |
|---------|----------|--------|
| Skills | `~/.coda/skills/<name>/SKILL.md` | Flat dirs, YAML frontmatter |
| Agents | `~/.coda/agents/<name>.md` | Flat .md, YAML frontmatter (name, description, tools) |
| MCP | `~/.coda/mcp.json` | Same schema as kiro `mcpServers` |
| Conventions | `AGENTS.md` at project root | Loaded per-cwd at session start |
| Plugins | `~/.coda/plugins/<name>/` | Hooks, extensions, bundled MCP |

## Koda → CODA materialization

When `coda` is a configured runtime (or `--target coda` is used):

| steer-runtime source | CODA destination | Transform |
|---------------------|-----------------|-----------|
| Agent JSON + prompt | `~/.coda/agents/<name>.md` | Add YAML frontmatter, concat prompt |
| Workspace skills | `~/.coda/skills/<name>/SKILL.md` | Copy as-is |
| mcp.json | `~/.coda/mcp.json` | Strip `_source`, `disabled` fields |
| Steering + context | `~/.coda/AGENTS.md` | Generate from workspace snapshot |

## Stepwise executors

Stepwise can delegate to multiple runtimes. Key executors:

- `coda` — CODA CLI in batch mode (default)
- `claude-code` — Claude Code CLI
- `kiro` — Kiro CLI
- `cursor-agent` — Cursor Agent headless

Per-step executor override is supported in capability YAML.

## Integration with steer-runtime

- The `aipods-steer` marketplace repo packages steer-runtime skills for CODA distribution
- Skills use the same SKILL.md format across both platforms
- Workspace selection determines which agents/skills sync to CODA
- MCP servers (yax, memory, graphify, jira, confluence, github) all propagate

## Key commands

```bash
koda runtime                          # Add coda to configured runtimes
koda chat --ws <name> --target coda   # Materialize + launch CODA
stepwise registry sync                # Sync Stepwise skill registry
stepwise exec <capability>            # Run a Stepwise capability
```

## Full reference

See skill: `coda-stepwise-setup` (`~/.kiro/skills/coda-stepwise-setup/SKILL.md`)
