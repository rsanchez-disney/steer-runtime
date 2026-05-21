# Cursor Agent Commands

Plain Markdown commands for Cursor Agent mode. Filename (without `.md`) becomes the `/` command name.

| Command | File | Purpose |
|---------|------|---------|
| `/orchestrator` | `orchestrator.md` | Route any dev request; delegate via Task; SDLC gates |
| `/implement-story` | `implement-story.md` | Jira story → plan → implement → quality → PR |
| `/code-review` | `code-review.md` | PR or branch review checklist |

## Install

From steer-runtime root:

```bash
./setup.sh cursor install ~/my-project
```

Copies rules, MCP config, and these commands to `<project>/.cursor/commands/`.

## Use in Cursor

1. Open the project in **Agent** mode (Composer Agent).
2. Type `/` and pick `orchestrator`, `implement-story`, or `code-review`.
3. Add arguments after the command (e.g. `/implement-story DPAY-14337`).

## Source

Adapted from `profiles/dev-core/prompts/orchestrator.md` and `shared/context/sdlc-workflow.md`. Kiro uses `subagent`; Cursor uses the **Task** tool with `subagent_type`.
