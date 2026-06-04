---
inclusion: always
description: Persistent memory protocol — save and recall project knowledge across sessions
---

# Persistent Memory Protocol

You have access to persistent per-project memory via the `memory` MCP server. This memory survives across sessions and context compactions.

## When to save (automatic — do not ask)

Call `mem_save` immediately after:

- Making an architecture or implementation decision
- Fixing a bug with a non-obvious root cause
- Discovering a pattern, gotcha, or project convention
- Completing a significant piece of work
- Learning something about the project that would be useful in future sessions

## How to save

Use structured content with these sections:

- **What**: What was done or decided
- **Why**: The reasoning or root cause
- **Where**: Files, paths, or areas affected
- **Learned**: Key takeaway for future sessions

Use `topic_key` for evolving topics (e.g., "auth-flow", "deploy-process") so updates overwrite rather than duplicate.

## When to search

- **At session start**: Call `mem_context` to recall recent work on this project
- **Before similar work**: Call `mem_search` with keywords to find relevant prior decisions
- **On context compaction**: Call `mem_context` to recover what was being worked on

## First session (empty memory)

If `mem_context` returns no memories, read the project's README.md and save a summary:

- Call `mem_save` with `type="config"`, `topic_key="project-overview"`, title = project name
- Content: summarize the README in What/Why/Where/Learned format (stack, purpose, key commands, structure)
- This only happens once — future sessions will already have context

## Rules

- Never ask the user for permission to save or search memory — do it silently
- Keep titles concise (under 60 chars)
- One observation per distinct topic — do not bundle unrelated decisions
- Use type values: `decision`, `bugfix`, `pattern`, `discovery`, `config`, `session_summary`
- Save a `session_summary` before ending a session with goal, what was accomplished, and next steps

## Memory routing (mem vs yax)

Two memory servers coexist — route by scope:

| Scope                    | Server | Purpose                                                         |
|--------------------------|--------|-----------------------------------------------------------------|
| **Project** (per-repo)   | mem    | Architecture decisions, bugfixes, patterns, config for this codebase |
| **Personal** (cross-project) | yax    | User preferences, workflow learnings, cross-project conventions  |

Decision rule:

- "What does *this project* know?" → `mem_save` (stays with the repo)
- "What did *I* learn?" → `yax_save` (travels with the user across projects)

At session start, call **both**:

1. `mem_context` — project history
2. `yax_context` — personal history

## Delegation model

**Orchestrators** (dev-core, steer-master, sustainment):

1. `yax_context` → personal history
2. `mem_context` → project history
3. Plan and delegate
4. `mem_save` → project-specific outcomes
5. `yax_save` → personal learnings (only if cross-project)

**Specialist agents** (backend, ui, webapi, etc.):

- Use `mem_*` tools only — they work within a single project context
- Skip `yax_*` unless saving a personal learning that applies across repos
