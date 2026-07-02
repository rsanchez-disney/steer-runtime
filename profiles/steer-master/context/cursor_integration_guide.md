# Cursor integration guide

Context for the steer_orchestrator_agent on how Cursor support works in the steer ecosystem.

## Command reference

| Command                                | Action                                               |
|:---------------------------------------|:-----------------------------------------------------|
| `koda cursor --ws <name>`              | Generate `.cursor/` in current directory             |
| `koda cursor --ws <name> --dir <path>` | Generate `.cursor/` in specific directory            |
| `koda cursor --ws <name> --launch`     | Generate and open Cursor IDE                         |
| `koda cursor list`                     | Show all registered Cursor projects                  |
| `koda cursor sync`                     | Refresh `.cursor/` for all registered projects       |
| `koda cursor remove`                   | Deregister a Cursor project                          |
| `koda chat --target cursor`            | Launch agent chat targeting Cursor runtime            |
| `koda ps`                              | Lists Cursor agent processes alongside Kiro          |
| `koda ps --kill cursor`                | Kill stale Cursor agent processes                    |
| `koda setup runtime`                   | Configure kiro/cursor/both preference                |
| `koda doctor`                          | Includes Cursor MCP validation section               |

## Translation pipeline

| steer-runtime source                     | Cursor output                                |
|:-----------------------------------------|:---------------------------------------------|
| `steering/*.md`                          | `.cursor/rules/*.mdc` (frontmatter mapped)   |
| `context/*.md`                           | `.cursor/rules/ctx-*.mdc` (alwaysApply: true)|
| `agents/*.json` + `prompts/*.md`         | `.cursor/agents/*.md`                        |
| `skills/*/SKILL.md`                      | `.cursor/skills/*/SKILL.md` (copied)         |
| `settings/mcp.json`                      | `.cursor/mcp.json` (cleaned)                 |

## Frontmatter mapping

| Kiro steering frontmatter             | Cursor `.mdc` frontmatter                     |
|:--------------------------------------|:----------------------------------------------|
| `inclusion: always`                   | `alwaysApply: true`                           |
| `inclusion: auto` + `description`     | `alwaysApply: false` + `description`          |
| `inclusion: fileMatch` + patterns     | `alwaysApply: false` + `globs: [...]`         |

## MCP cleaning

When emitting `.cursor/mcp.json`, Koda strips non-standard fields:

- `_source` — internal routing metadata
- `disabled: true` — server excluded entirely from output
- Other fields preserved as-is

## Project registry

Koda maintains a registry of all Cursor-enabled projects at `~/.koda/cursor-registry.json`. Each entry tracks:

- `path` — absolute path to the project directory
- `workspace` — steer-runtime workspace used to generate it
- `generated` — ISO timestamp of last generation

The registry enables bulk sync (`koda cursor sync`) and health monitoring (`koda doctor`).

## Auto-detection

When running Koda commands from a directory containing `.cursor/.koda-meta.json`, Koda:

1. Reads the workspace name from the metadata file
2. Auto-selects the default agent for that workspace
3. Routes to Cursor runtime instead of Kiro

The `.koda-meta.json` file is generated alongside `.cursor/` and contains:

```json
{"workspace": "my-team", "generated": "2026-06-29T..."}
```

## Agent prompt generation

Each steer-runtime agent JSON is translated to a Cursor agent markdown file with:

- YAML frontmatter: `description` (from agent JSON) + `alwaysApply: false`
- Body: full prompt content (resolved from prompt .md file)
- MCP tool hints: appended section listing available MCP tools per agent permissions
- Welcome message: appended as a "when invoked without a task" section

## Known limitations

### One-way sync

`koda cursor` generates `.cursor/` FROM steer-runtime — it does not read back. If someone edits `.cursor/rules/` or adds agents directly in Cursor, those changes are lost on next `koda cursor sync`.

**Workaround:** Keep the source of truth in steer-runtime. Edit workspace steering/context/prompts there, then run `koda cursor sync`.

**Future:** A `koda cursor diff` command to detect local Cursor customizations before overwriting, and `koda cursor import` to pull changes back into steer-runtime format.

### No incremental update

The entire `.cursor/` directory is regenerated on each run. A freshness check skips regeneration if the workspace hasn't changed, but partial updates (e.g., only one steering file changed) aren't supported.

### No .cursorignore generation

Koda does not auto-generate `.cursorignore`. Teams should create this manually to exclude large directories (`node_modules/`, `dist/`, `target/`, etc.) from Cursor's context.

## When to recommend Cursor vs Kiro

| Scenario                              | Recommend        | Why                                           |
|:--------------------------------------|:-----------------|:----------------------------------------------|
| Team already uses Cursor              | Cursor           | Lower friction — familiar IDE                 |
| Need full agent delegation (subagent) | Kiro             | Cursor doesn't support multi-agent pipelines  |
| Single-file edits, quick fixes        | Either           | Both work well for focused tasks              |
| CI/CD integration                     | Kiro             | `koda ci run` uses kiro-cli headless mode     |
| Windows users                         | Cursor preferred | Better native Windows support                 |
| Need MCP tools                        | Either           | Both consume `.cursor/mcp.json` / kiro mcp    |
