# Skill: Sync agents to steering files

Use when the user asks to load, sync, or convert agents from `~/.kiro/agents/` into Kiro steering files.

## What this skill does

Reads agent definitions from `~/.kiro/agents/*.json`, finds their associated prompt file in `~/.kiro/prompts/`, and generates manual steering files in `~/.kiro/steering/` prefixed with `agent-`.

## Steps

1. Ensure `~/.kiro/steering/` exists (create it if missing)
2. List all `.json` files in `~/.kiro/agents/`
3. For each agent JSON:
   a. Read the JSON and extract `name`, `description`, and `prompt` fields
   b. Derive the agent key from the filename (e.g. `my_agent.json` → `my_agent`)
   c. Read the corresponding `.md` file from `~/.kiro/prompts/{prompt}`
   d. Generate a steering file at `~/.kiro/steering/agent-{agent_key}.md` with this format:

```markdown
---
inclusion: manual
---
# Agent: {name}

> {description}

{content of the prompt .md file}
```

4. If the agent JSON has `hooks`, append a section documenting them:

```markdown
## Hooks (reference only)

- preToolUse: {description of each hook}
- postToolUse: {description of each hook}
```

5. If the agent JSON has `tools` that reference MCP servers (e.g. `@bruno/*`, `@github/*`, `@jira/*`), append:

```markdown
## MCP tools

This agent expects access to: {list of MCP tool patterns}
```

6. Skip agents whose steering file already exists and has the same content (idempotent).
7. Report how many agents were synced and which were skipped.

## Usage

User says: "sync my agents" or "load agents as steering" or "convert agents to steering"

Then run this skill by reading `~/.kiro/agents/` and generating the steering files.

## Notes

- Generated files use `inclusion: manual` so they are only loaded when the user explicitly references them with `#agent-{agent_key}` in chat (where `agent_key` is the filename without `.json`).
- The steering file key is derived from the filename, not the `name` field, to avoid silent overwrites when two agents share the same name.
- The original agent JSON hooks cannot be auto-converted to Kiro hooks format. They are documented as reference for the user to recreate manually if needed.
- If a prompt `.md` file is not found in `~/.kiro/prompts/`, log a warning and skip that agent.
