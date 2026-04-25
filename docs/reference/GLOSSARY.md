# Glossary

Definitions of key concepts, terms, and components used across steer-runtime.

---

## Core Concepts

| Term | Definition |
|------|-----------|
| **steer-runtime** | The source-of-truth repo for all AI agent definitions, prompts, context, hooks, MCP servers, and workspaces. An LLMOps platform for the entire SDLC. |
| **LLMOps** | Treating AI agent configurations as first-class engineering artifacts — versioned, reviewed, and deployed like application code. |
| **Agents as Code** | Every agent is a versioned JSON config + Markdown prompt stored in Git, making behavior auditable, diffable, and rollback-able. |
| **Context Engineering** | Investing in structured context (resources, steering, skills, context files) that shapes agent behavior, rather than crafting elaborate prompts. |
| **Guardrails as Infrastructure** | Safety enforced by hooks (shell scripts with exit codes), not by prompt suggestions the LLM could ignore. |
| **Koda** | Go binary that installs profiles, manages tokens, workspaces, MCP servers, and auto-updates. The bridge between steer-runtime (source) and the IDE (consumer). |
| **Kiro CLI** | The native agent runtime that loads agent configs, injects context, manages MCP lifecycles, enforces hooks, and routes tool calls. |
| **LLM** | The large language model (e.g., Claude Sonnet) that performs inference. Stateless — all specialization comes from injected context. |

---

## Agent System

| Term | Definition |
|------|-----------|
| **Agent** | A single-purpose AI persona defined by a JSON config + Markdown prompt, with defined tools, context, hooks, and constraints. |
| **Agent JSON** | `.json` file defining an agent's name, description, prompt path, tools, MCP servers, resources, hooks, and allowed tools. |
| **Agent Prompt** | Markdown file defining an agent's identity, role, workflow steps, output format, and rules. |
| **Orchestrator** | A special agent that coordinates specialist agents via delegation (`subagent` tool). Never does work directly. |
| **Specialist Agent** | An agent focused on a single task (code review, test planning, PR creation) that receives delegated work from an orchestrator. |
| **tools** | Array in agent JSON listing built-in and MCP tools the agent can invoke (e.g., `fs_read`, `@jira/*`). |
| **allowedTools** | Array in agent JSON explicitly permitting specific tool patterns for MCP access control. |
| **resources** | Array in agent JSON referencing context files loaded into every session (e.g., `file://.kiro/context/golden_rules.md`). |
| **includeMcpJson** | Boolean in agent JSON; when true, the agent inherits MCP server configs from the global `mcp.json`. |
| **welcomeMessage** | String in agent JSON shown when the agent starts a session. |
| **subagent** | Tool enabling multi-agent orchestration — the orchestrator spawns specialist agents with specific tasks. |
| **thinking** | Opt-in tool enabling chain-of-thought reasoning within an agent session. |
| **todo** | Opt-in tool for persistent task tracking within agent sessions. |
| **knowledge** | Opt-in tool for persistent memory within Kiro CLI sessions. |

---

## Profiles

| Term | Definition |
|------|-----------|
| **Profile** | A role-scoped group of agents sharing a common purpose (e.g., dev-core, ba, qa, ops, pm). A self-contained directory with agents, prompts, context, and steering. |
| **dev** | Alias that expands to dev-core + dev-web + dev-mobile + dev-python + dev-infra. |
| **dev-core** | Core development profile — orchestrator, architecture, code review, testing, security, PRs. |
| **dev-web** | Web development profile — Java backend, Node API, Angular UI, Astro SSR, UX. |
| **ba** | Business Analyst profile — requirements, scope, stories, PRDs, estimation. |
| **qa** | QA profile — test planning, automation, defect analysis, coverage. |
| **ops** | Operations profile — infra, deployments, log analysis, releases. |
| **pm** | Project Management profile — sprints, standups, retros, delivery reports. |
| **leadership** | Leadership profile — cross-team analytics, quarterly reports, executive briefings. |
| **steer-master** | Meta-profile for steer-runtime/Koda development and review. |
| **Steering Rules** | Numbered markdown files (e.g., `06-markdown-formatting.md`) that shape agent behavior with conventions and patterns. |
| **Skills** | Reusable workflow definitions (e.g., implement-ticket, ship-it) invocable via `@prompt` or from agent prompts. |
| **Context Files** | Markdown files injected into agent sessions to provide organizational knowledge (golden rules, project mappings). |
| **Golden Rules** | Shared context file (`golden_rules.md`) with coding standards applied across all profiles. |
| **Common Rules** | Tech-stack coding rules (Java, Node, Go, AWS, etc.) in `common/rules/`, installable per workspace. |

---

## Workspaces

| Term | Definition |
|------|-----------|
| **Workspace** | A team-level configuration that selects profiles, rules, context, and projects for a specific team. Applied via `koda workspace apply`. |
| **workspace.json** | Manifest declaring a workspace's profiles, rules, projects, Jira prefix, services, and default agent. |
| **extends** | Field in workspace.json for hierarchical inheritance from a parent workspace. |
| **Workspace Agent Merge** | When a workspace provides an agent with the same name as a global profile agent, Koda merges them (arrays appended, scalars overridden, objects deep-merged). |
| **Profile Overlay** | Workspace agents placed inside `workspaces/{ws}/profiles/{profile}/agents/` that override or extend global profile agents. |
| **default_agent** | Field in workspace.json specifying which agent to use by default in chat. |
| **jira_prefix** | Field in workspace.json for the team's Jira project key (e.g., `"DPAY-"`). |
| **Service Banks** | Structured documentation for specific services (API contracts, architecture) in `shared/services/`. |

---

## MCP (Model Context Protocol)

| Term | Definition |
|------|-----------|
| **MCP** | Protocol used by MCP servers to expose external systems (Jira, GitHub, Confluence) as tool calls the LLM can invoke. |
| **MCP Server** | An integration bridge — a child process (stdio) or remote endpoint (SSE) translating between agent tool calls and external APIs. |
| **Bundle** | A single `.cjs` file produced by esbuild from MCP server TypeScript source — eliminates npm install. |
| **mcp.json** | Generated config at `~/.kiro/settings/mcp.json` declaring active MCP servers with connection details. |
| **Multi-Instance** | Same MCP server type running multiple times with different tokens/URLs (e.g., `confluence-confluence` and `confluence-mywiki`). |
| **Tool Prefix** | MCP tools are namespaced by server name (e.g., `@confluence-mywiki/*`, `@jira-myjira/*`). |
| **tokens.env** | Centralized token file at `~/.kiro/tokens.env` storing PATs and API keys. |
| **Token Injection** | During install, Koda reads tokens and injects them into agent JSON `env` blocks. |
| **Tool Expansion** | Koda expands alias patterns (`@confluence/*`) to actual server names (`@confluence-confluence/*`, `@confluence-mywiki/*`) during install. |

---

## Hooks & Powers

| Term | Definition |
|------|-----------|
| **Hook** | A shell script that runs at agent lifecycle events to enforce guardrails. Exit code 0 = allow, 2 = block. The LLM cannot override hooks. |
| **preToolUse** | Hook event firing before a tool executes — used for write guards and secret scanning. |
| **postToolUse** | Hook event firing after a tool executes — used for linting and destructive command warnings. |
| **agentSpawn** | Hook event firing when an agent session starts — used for git context injection and agent registry. |
| **guard-writes.sh** | Hook blocking writes to `node_modules/`, `dist/`, `.git/`. |
| **secret-scan.sh** | Hook scanning file content for hardcoded secrets before writing. |
| **branch-guard.sh** | Hook blocking direct commits/pushes to `main`/`master`. |
| **Powers** | Custom tool extensions (lightweight JS modules) that add capabilities beyond built-in tools — different from MCP servers (no child process) and hooks (add capabilities vs. constrain them). |

---

## Memory

| Term | Definition |
|------|-----------|
| **Memory Bank** | Project-specific markdown files (project-brief, tech-context, system-patterns, active-context, progress) persisting knowledge across sessions. |
| **yax** | Persistent memory system using MCP tools (`yax_save`, `yax_search`, `yax_context`) for cross-session knowledge. |
| **Observation** | Core unit of memory — a record with title, content, type, project, scope, and topic_key. |
| **topic_key** | Deduplication key — same topic_key + project overwrites the existing observation. |
| **Semantic Search** | Vector-based search finding relevant observations even when wording differs. |

---

## Build & Deploy

| Term | Definition |
|------|-----------|
| **koda install** | Copies profile agents, prompts, context, hooks, and MCP bundles to `~/.kiro/` with path expansion and token injection. |
| **koda sync** | Re-installs from local source or downloads the latest encrypted release. |
| **koda workspace apply** | Resolves workspace inheritance and installs merged profiles + rules + context. |
| **koda mcp-install** | Sets up MCP servers — configures tokens and generates `mcp.json`. |
| **koda doctor** | Deep health check — validates installation, agent configs, MCP connectivity. |
| **Encrypted Release** | steer-runtime packaged as encrypted tarballs published to public GitHub; Koda downloads, decrypts, and installs. |
| **$HOME Expansion** | Source repo uses `$HOME` for portability; Koda expands to absolute paths during install. |
| **setup.sh** | Deprecated bash fallback for Koda; still supports cursor install/sync. |
| **project.yaml** | Project manifest dropped in a repo root to give agents structured config without forking steer-runtime. |
