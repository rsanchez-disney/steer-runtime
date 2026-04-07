# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

55 agents, 7 profiles, one setup. Define your standards once, run them everywhere.

---

## Get Started

You need **Node.js**, **Git**, and [Kiro CLI](docs/GETTING_STARTED.md). That's it.

### Option A — Koda (recommended)

Koda is the interactive terminal companion for steer-runtime. One-liner install:

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex
```

Then:

```bash
koda setup                        # Check & install dependencies
koda install dev                  # Install all dev agents
koda mcp-install                  # Setup MCP servers + tokens
koda                              # Launch interactive dashboard
```

Or jump straight into chat:

```bash
koda chat --agent orchestrator    # Dev orchestrator
koda chat --agent qa_orchestrator_agent  # QA orchestrator
```

> `koda chat` wraps `kiro-cli chat` — both work. Koda adds session history and shared settings with [Kite](https://github.disney.com/SANCR225/Kite).

### Option B — setup.sh (⚠️ deprecated)

> **Deprecated:** `setup.sh` and `setup.ps1` are deprecated and will be removed in a future release. Use [Koda](#option-a--koda-recommended) instead.

```bash
git clone git@github.disney.com:SANCR225/steer-runtime.git ~/steer-runtime
cd ~/steer-runtime
koda install dev        # Install dev agents
koda mcp-install        # Setup MCP servers + tokens
kiro-cli chat --agent orchestrator --tui
```

> 🪟 On Windows? See [Windows Setup](docs/WINDOWS_SETUP.md).
> 👥 Joining a team? Run `koda workspace apply <team>` or `koda workspace apply <team>` — [details](docs/TEAM_WORKSPACES.md).

---

## Profiles

Pick what fits your role, or install everything:

```bash
koda install dev ba qa ops pm     # Koda
koda install dev ba qa ops pm
```

| Profile | Agents | What it does |
|---------|:------:|-------------|
| **dev** | 23 | Code, review, test, security, PRs — the full dev loop |
| **ba** | 8 | Requirements, scope, stories, PRD generation, quality gates |
| **qa** | 10 | Test planning, automation, E2E generation, defect analysis, API & perf testing |
| **ops** | 7 | AI metrics, infra, deployments, code quality, release management |
| **pm** | 6 | Sprints, standups, retros, risk tracking, delivery reports |

`dev` is five composable sub-profiles: `dev-core` (16), `dev-web` (5), `dev-python` (1), `dev-infra` (1), `dev-mobile` (3).

---

## Features

| Feature | What it is |
|---------|-----------|
| **Agents** | 50 specialized AI assistants — each with a focused role (code review, test planning, sprint management, etc.) |
| **Profiles** | Role-based bundles of agents — dev, BA, QA, ops, PM. Install only what your role needs |
| **Orchestrators** | Multi-agent coordinators that break down tasks and delegate to specialists automatically |
| **Skills** | Reusable multi-step workflows — implement-ticket, ship-it, generate-plan, fix-failing-test |
| **Rules** | Coding standards per tech stack (Java, Node, Go, C#, Python, React, K8s, AWS, Docker, etc.) |
| **Golden Rules** | Organization-wide standards enforced across all agents — security, quality, consistency |
| **Hooks** | Guardrails that run before/after agent actions — write guards, secret scanning, branch protection |
| **MCP Servers** | Pre-built integrations — Jira, Confluence, GitHub, Mermaid, Context7. No setup beyond tokens |
| **Workspaces** | One-command team setup — profiles, rules, context, and Jira/board config per team |
| **Memory Banks** | Project-specific knowledge that agents carry across sessions — tech stack, patterns, conventions |
| **Project Manifest** | `project.yaml` — structured config so agents know your stack, commands, and integrations without forking |
| **Spec Templates** | Architecture, API contracts, domain models, business rules, workflows, data dictionary templates |
| **Artifact Templates** | PRD, backlog, test plan, ADR templates for structured document generation |
| **Quality Gates** | Formal approve/reject/revise checkpoints between generation steps |
| **IDE Portable** | Same agents run on Kiro CLI, Cursor, Amazon Q, and Kite — author once, deploy everywhere |
| **Evals** | Agent quality scoring — structural checks + LLM-as-judge. Run via `koda eval` or CI. [Details](docs/EVAL_FRAMEWORK.md) |

---

## What's New

| Date | Change |
|------|--------|
| Apr 4 | [Compass MCP](docs/MCP_SETUP.md) — SSE-based Compass server for global search |
| Apr 3 | [Multi-instance GitHub MCP](docs/MCP_SETUP.md) — support multiple GitHub remotes (Disney GHE + public) |
| Apr 2 | [Nested workspaces](docs/TEAM_WORKSPACES.md) — child workspaces inside parent folders |
| Apr 1 | [Figma MCP](docs/MCP_SETUP.md) + `dev-python` and `dev-infra` profiles |
| Apr 1 | RA enrichment — agents gain context files, skills library, and spec awareness |
| Mar 31 | [MCP bundles](docs/MCP_SETUP.md) — self-contained `dist/index.cjs` for all MCP servers |
| Mar 30 | [Eval Framework](docs/EVAL_FRAMEWORK.md) — automated agent quality scoring with fixtures and rubrics |
| Mar 28 | [project.yaml](common/templates/project.yaml) — structured project manifest (stack, commands, Jira, GitHub) |
| Mar 27 | 7 new agents — architecture_spec, bounded_context, compliance, performance, steery, release_manager, release_documenter |
| Mar 26 | [Koda v0.1.0](https://github.com/rsanchez-disney/Koda) — interactive terminal companion, replaces `setup.sh` |
| Mar 24 | [Hierarchical workspaces](docs/TEAM_WORKSPACES.md) — `extends` support, 7 team workspaces |
| Mar 22 | Agent hooks — git context injection, write guards, destructive command warnings |
| Mar 20 | [Team Workspaces](docs/TEAM_WORKSPACES.md) — one-command team setup |
| Mar 20 | Dev profile split → `dev-core` + `dev-web` + `dev-mobile` |

> **Current:** 9 profiles · 55+ agents · 8 MCP servers · 7 team workspaces

---

## Learn More

| What | Where |
|------|-------|
| Full command reference, MCP servers, architecture, extending | [Reference](docs/REFERENCE.md) |
| All 55 agents with tools, hooks, and MCP coverage | [AGENTS.md](AGENTS.md) |
| Eval framework — fixtures, rubrics, scoring | [Eval Framework](docs/EVAL_FRAMEWORK.md) |
| First-time Kiro setup (SSO, downloads) | [Getting Started](docs/GETTING_STARTED.md) |
| How to prompt agents effectively | [Prompt Guide](docs/PROMPT_GUIDE.md) |
| Role-specific guides | [BA](docs/BA_PROMPT_GUIDE.md) · [QA](docs/QA_PROMPT_GUIDE.md) · [Ops](docs/OPS_PROMPT_GUIDE.md) · [PM](docs/PM_PROMPT_GUIDE.md) |
| Cursor / Amazon Q / Kite setup | [Cursor](docs/CURSOR_SETUP.md) · [Amazon Q](.amazonq-templates/README.md) · [Kite](https://github.disney.com/SANCR225/Kite) |
| Roadmap & feature requests | [Roadmap](docs/ROADMAP.md) · [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1) |
| IDE concepts comparison | [IDE Concepts](docs/IDE_CONCEPTS_COMPARISON.md) |
| Troubleshooting | [Troubleshooting](docs/TROUBLESHOOTING.md) |

---

## Recordings & Sessions

| Date | Description | Link |
|------|-------------|------|
| March 10, 2026 | Working Session with CAP Team | [Recording](https://drive.google.com/file/d/19DzFCKPKcAAvNitrWYLDfNxntlvqpkH4/view?usp=sharing) |
| April 2, 2026 | Q&A Session with OpSheet Team | [Recording](https://drive.google.com/file/d/1dyEmmOJOiPxmi7GgzqWsNBUv7zlhT8t-/view?usp=sharing) |

---

## Contribute

Got an idea or found a bug? We'd love to hear from you.

- 💡 [Propose a feature](https://github.disney.com/SANCR225/steer-runtime/issues/new?template=feature_request.md)
- 🐛 [Report a bug](https://github.disney.com/SANCR225/steer-runtime/issues/new?template=bug_report.md)
- 📋 [Track progress on Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1)

---

**Version:** 3.7.0 · **Agents:** 51 · **Updated:** March 28, 2026

Internal Disney tool — not for external distribution.
