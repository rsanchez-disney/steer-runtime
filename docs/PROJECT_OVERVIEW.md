# steer-runtime — Project Overview

A unified LLMOps platform that packages AI-assisted workflows for the entire software delivery lifecycle at Disney Payments.

---

## What is steer-runtime?

steer-runtime is a curated collection of 40 specialized AI agents organized into 5 role-based profiles (dev, BA, QA, ops, PM) that run on [Kiro CLI](https://kiro.dev). Each agent is purpose-built for a specific SDLC task — from writing code to planning sprints — and comes pre-wired with the tools, context, and integrations it needs.

Instead of one general-purpose AI assistant, steer-runtime gives every team role a set of agents that already understand Disney Payments' repositories, coding standards, Jira workflows, and organizational conventions.

```
Developer → dev profile (19 agents)  → code, review, test, PR
BA / PO   → ba profile  (4 agents)  → requirements, scope, stories
QA        → qa profile  (6 agents)  → test plans, automation, defects
Ops       → ops profile (5 agents)  → metrics, infra, deploys, quality
PM/Scrum  → pm profile  (6 agents)  → sprints, standups, retros, risks
```

---

## Why steer-runtime?

### The Problem

General-purpose AI assistants lack organizational context. Every conversation starts from zero — the AI doesn't know your repos, your Jira project keys, your coding standards, your sprint cadence, or your deployment pipeline. Teams end up repeating the same context in every prompt, getting inconsistent results, and building no institutional memory.

### The Solution

steer-runtime solves this by encoding organizational knowledge into agent configurations:

- **Context files** inject coding standards, project mappings, and guidelines into every agent session automatically
- **MCP servers** give agents direct access to Jira, Confluence, GitHub, SonarQube, and Harness — no copy-pasting
- **Hooks** enforce guardrails (block writes to protected paths, warn on destructive commands) without relying on the LLM to self-police
- **Steering rules** and **skills** teach agents repository-specific patterns (e.g., "this is a Flutter monorepo with this package structure")
- **Memory banks** persist project knowledge across sessions so agents improve over time

### Key Advantages

| Advantage | How |
|-----------|-----|
| **Zero-setup onboarding** | `./setup.sh install dev` — one command, 19 agents ready |
| **Role-appropriate tooling** | A BA agent can't accidentally run `rm -rf`; a dev agent can't skip code review |
| **Consistent quality** | Golden rules, compliance checks, and write guards are enforced by hooks, not hope |
| **Institutional memory** | Context files, steering rules, and knowledge tool persist what the team has learned |
| **Multi-repo coordination** | Orchestrator agents understand which repos map to which Jira prefixes and coordinate across them |
| **No vendor lock-in on context** | All config is plain JSON + Markdown — portable, version-controlled, reviewable |
| **Pre-built integrations** | MCP servers are bundled as single-file Node.js bundles — no npm install, no Nexus credentials needed |
| **Cross-platform** | macOS/Linux (`setup.sh`) + Windows (`setup.ps1`) |

---

## LLMOps Principles

steer-runtime is built on LLMOps practices that treat AI agent configurations as first-class engineering artifacts.

### 1. Agents as Code

Every agent is a versioned JSON config + Markdown prompt stored in Git. Changes go through PRs, code review, and conventional commits — the same workflow as application code.

```
.kiro-dev/agents/backend.json     ← config (tools, hooks, resources, MCP)
.kiro-dev/prompts/backend.md      ← system prompt (personality, constraints)
```

This means agent behavior is auditable, diffable, and rollback-able.

### 2. Separation of Concerns

Each agent has a single responsibility. The orchestrator delegates; specialists execute. This mirrors microservice architecture:

```
orchestrator → planner_agent      → "break this into tasks"
             → backend            → "implement the Java changes"
             → code_review_agent  → "review the diff"
             → pr_creator_agent   → "create the PR"
```

No single agent tries to do everything. This reduces hallucination surface and makes each agent's prompt focused and testable.

### 3. Context Engineering over Prompt Engineering

Rather than crafting elaborate prompts, steer-runtime invests in structured context:

- **`resources`** — files loaded into every session (golden rules, project mappings)
- **`steering`** — numbered rules that shape behavior (00-foundation, 20-repo-backend-java, etc.)
- **`skills`** — reusable knowledge chunks (flutter-provider-pattern, api-contract-compatibility-check)
- **`context`** — profile-specific guidelines (qa_guidelines, pm_guidelines)

The prompt stays simple; the context does the heavy lifting.

### 4. Guardrails as Infrastructure

Safety isn't a suggestion in the prompt — it's enforced by hooks:

| Hook | What it prevents |
|------|-----------------|
| `guard-writes.sh` | Writing to `node_modules/`, `dist/`, `.git/` |
| `warn-destructive.sh` | Silent `rm -rf`, `DROP TABLE`, `--force` |
| `git-context.sh` | Agent starting without knowing the current branch |

Hooks run as shell scripts with exit codes — `exit 2` blocks the action, `exit 0` allows it. The LLM can't override them.

### 5. Progressive Disclosure

Not every team member needs every agent. Profiles are installed independently:

```bash
./setup.sh install dev          # Developer gets 19 agents
./setup.sh install pm           # Scrum master gets 6 agents
./setup.sh install dev ba qa    # Full-stack team gets 29 agents
```

Advanced tools (`thinking`, `todo`, `knowledge`) are opt-in via `./setup.sh enable-tools`. Agents degrade gracefully when features aren't enabled.

### 6. Pre-built, Not Just Configured

MCP servers are bundled as single `.cjs` files using esbuild — no `npm install`, no Nexus credentials, no build step. This eliminates the #1 onboarding friction point in enterprise environments where package registries are restricted.

### 7. Observability

- `./setup.sh check` validates installation and runs `kiro-cli agent validate` on every config
- `/hooks` command in chat shows active hooks for the current agent
- `kiro-cli mcp list` shows MCP server status per agent
- Memory banks and todo lists persist across sessions for auditability

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────┐
│                      User Terminal                        │
│  kiro-cli chat --agent orchestrator                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                     Kiro CLI Runtime                      │
│                                                          │
│  Agent Config (.json)  ──→  Tools + Hooks + Resources    │
│  System Prompt (.md)   ──→  LLM Context                  │
│  MCP Servers           ──→  Jira, Confluence, GitHub     │
│  Steering + Skills     ──→  Repo-specific knowledge      │
└────────────────────────┬─────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Jira MCP │  │Confluence│  │GitHub MCP│
    │  (node)  │  │MCP (node)│  │  (node)  │
    └──────────┘  └──────────┘  └──────────┘
```

### Profile Layout

Each profile is a self-contained directory:

```
.kiro-<profile>/
├── agents/          # Agent JSON configs
├── prompts/         # System prompt markdown files
└── context/         # Profile-specific guidelines
```

Shared resources live in `.kiro/`:

```
.kiro/
├── context/         # Cross-profile context (golden_rules, project_mappings)
├── hooks/           # Reusable hook scripts
├── steering/        # Numbered behavioral rules
├── skills/          # Reusable knowledge chunks
├── memory-bank/     # Project-level persistent memory
└── tools/mcp-servers/  # Pre-built MCP bundles
```

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Total agents | 40 |
| Profiles | 5 (dev, ba, qa, ops, pm) |
| MCP servers | 5 (jira, confluence, mywiki, github, mermaid) |
| Agents with MCP integration | 22 |
| Agents with hooks | 11 |
| Agents with advanced tools | 11 |
| Context files | 12 |
| Steering rules | 10 |
| Skills | 16 |
| Hook scripts | 3 |
| Supported projects | 9 (with pre-built memory banks) |
| Setup commands | 13 (+ 4 cursor subcommands) |

---

## Getting Started

```bash
git clone <repo-url> ~/steer-runtime && cd ~/steer-runtime

./setup.sh install dev ba qa ops pm   # Install all profiles
./setup.sh mcp-install                # Configure MCP tokens
./setup.sh enable-tools               # Enable advanced tools

kiro-cli chat --agent orchestrator    # Start working
```

For detailed setup: [Getting Started](GETTING_STARTED.md)  
For agent reference: [AGENTS.md](../AGENTS.md)  
For troubleshooting: [Troubleshooting](TROUBLESHOOTING.md)

---

## Multi-IDE Strategy

steer-runtime is designed to be runtime-agnostic. While Kiro CLI is the primary runtime today, work is in progress to bring the same agent configurations to [Cursor](https://cursor.com) — mirroring the Kiro approach with Cursor's native rules, tools, and MCP support.

The goal: teams pick the IDE they prefer, but share the same organizational context, guardrails, and agent behaviors. The agent configs (JSON + Markdown) are the source of truth — each runtime adapter translates them into its native format.

```
steer-runtime (source of truth)
├── Kiro CLI    ← current primary runtime
├── Kite        ← desktop GUI for Kiro CLI
└── Cursor      ← in progress
```

This reinforces the "agents as code" principle — agent behavior is defined once, version-controlled, and deployed to multiple runtimes without duplication.

---

**Version:** 3.3.0 · **Last Updated:** March 19, 2026  
Internal Disney tool — not for external distribution.
