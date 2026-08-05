# JedAI Agent Registry

Available specialist agents for delegation. Use `subagent` with the agent name exactly as listed.

## Portal (`jedai/portal`)

| Agent | Name | Delegate when |
|-------|------|---------------|
| `portal_developer` | Portal Developer | Astro pages, layouts, React islands, build config, MCP integration, PR review |
| `content_creator` | Content Creator | MDX doc pages, model catalog entries, integration guides, changelog, onboarding content |

## Chat (`jedai/chat` — Open WebUI fork)

| Agent | Name | Delegate when |
|-------|------|---------------|
| `owui_developer` | OWUI Developer | Upstream upgrades, Python backend, Svelte frontend, pipelines, SSO, a11y overrides |

## Gateway (`jedai/gateway` — LiteLLM)

| Agent | Name | Delegate when |
|-------|------|---------------|
| `llm_engineer` | LLM Engineer | LiteLLM config, model routing, virtual keys, rate limits, cost tracking, new provider onboarding |
| `python` | Python | General Python work, FastAPI endpoints, testing |

## Cross-cutting (dev-core)

| Agent | Name | Delegate when |
|-------|------|---------------|
| `orchestrator` | Dev Orchestrator | Complex Jira story implementation spanning multiple files/services |
| `code_review_agent` | Code Reviewer | PR review across any project |
| `security_scanner_agent` | Security Scanner | Security audit before merging |
| `pr_creator_agent` | PR Creator | Creating pull requests with proper metadata |

## Delegation rules

- **Single project task** → go directly to the specialist, do not route through this orchestrator
- **Cross-project task** → break into per-project sub-tasks, delegate each to the right specialist
- **Unclear routing** → ask the user which project is the primary target
- **Never delegate to yourself** — if a task is unclear, clarify with the user first
