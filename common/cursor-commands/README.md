# Cursor Agent Commands

Plain Markdown for Cursor **Agent** mode. Each file **must** include YAML frontmatter (`name`, `description`) or Cursor will not list it.

Installed to both:
- `.cursor/commands/` — slash menu (`/orchestrator`)
- `.cursor/agents/` — Agent picker (select **orchestrator**)

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

Copies rules, MCP config, commands to `.cursor/commands/`, and agents to `.cursor/agents/`.

## Use in Cursor

1. Open the **steer-runtime** folder (or your project after `cursor install`) as the workspace root.
2. Use **Agent** mode (not inline Edit).
3. **Reload window** once after adding files (`Developer: Reload Window`).
4. Either:
   - Type `/` → choose **orchestrator**, **implement-story**, or **code-review**, or
   - Open the **Agent** dropdown → select **orchestrator**
5. Add your task after the command (e.g. `/implement-story DPAY-14337`).

If `/orchestrator` is missing, see [CURSOR_SETUP.md](../../docs/getting-started/CURSOR_SETUP.md#troubleshooting-orchestrator-not-in-the-menu).

## Source

Adapted from `profiles/dev-core/prompts/orchestrator.md` and `shared/context/sdlc-workflow.md`. Kiro uses `subagent`; Cursor uses the **Task** tool with `subagent_type`.
