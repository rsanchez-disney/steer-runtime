# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

41 agents, 5 profiles, one setup. Define your standards once, run them everywhere.

---

## Get Started

You need **Node.js**, **Git**, and [Kiro CLI](docs/GETTING_STARTED.md). That's it.

### Option A — Koda (recommended)

Koda is the interactive terminal companion for steer-runtime. One-liner install:

```bash
# macOS / Linux
curl -fsSL https://github.disney.com/raw/SANCR225/steer-runtime/main/tools/install-koda.sh | bash

# Windows (PowerShell)
irm https://github.disney.com/raw/SANCR225/steer-runtime/main/tools/install-koda.ps1 | iex
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

> Koda replaces `setup.sh` with a cross-platform binary. It also adds an interactive TUI, chat mode, and shared settings with [Kite](https://github.disney.com/SANCR225/Kite).

### Option B — setup.sh (bash)

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime

./setup.sh install dev        # Install dev agents
./setup.sh mcp-install        # Setup MCP servers + tokens
```

Then start chatting:

```bash
kiro-cli chat --agent orchestrator
```

> 🪟 On Windows? See [Windows Setup](docs/WINDOWS_SETUP.md).
> 👥 Joining a team? Run `koda workspace apply <team>` or `./setup.sh workspace apply <team>` — [details](docs/TEAM_WORKSPACES.md).

---

## Profiles

Pick what fits your role, or install everything:

```bash
koda install dev ba qa ops pm     # Koda
./setup.sh install dev ba qa ops pm  # setup.sh
```

| Profile | Agents | What it does |
|---------|:------:|-------------|
| **dev** | 20 | Code, review, test, security, PRs — the full dev loop |
| **ba** | 4 | Requirements, scope, user stories, acceptance criteria |
| **qa** | 6 | Test planning, automation, defect analysis, API & perf testing |
| **ops** | 5 | AI metrics, infra checks, deployments, code quality |
| **pm** | 6 | Sprints, standups, retros, risk tracking, delivery reports |

`dev` is three composable sub-profiles: `dev-core` (13), `dev-web` (4), `dev-mobile` (3).

---

## What's New

| Date | Change |
|------|--------|
| Mar 26 | [Koda v0.1.0](https://github.disney.com/SANCR225/Koda) — interactive terminal companion, replaces setup.sh |
| Mar 20 | [Team Workspaces](docs/TEAM_WORKSPACES.md) — one-command team setup |
| Mar 20 | [Context7 MCP](https://context7.com) — real-time library docs, no token needed |
| Mar 20 | Dev profile split → `dev-core` + `dev-web` + `dev-mobile` |

---

## Learn More

| What | Where |
|------|-------|
| Full command reference, MCP servers, architecture, extending | [Reference](docs/REFERENCE.md) |
| All 41 agents with tools, hooks, and MCP coverage | [AGENTS.md](AGENTS.md) |
| First-time Kiro setup (SSO, downloads) | [Getting Started](docs/GETTING_STARTED.md) |
| How to prompt agents effectively | [Prompt Guide](docs/PROMPT_GUIDE.md) |
| Role-specific guides | [BA](docs/BA_PROMPT_GUIDE.md) · [QA](docs/QA_PROMPT_GUIDE.md) · [Ops](docs/OPS_PROMPT_GUIDE.md) · [PM](docs/PM_PROMPT_GUIDE.md) |
| Amazon Q / Kite setup | [Amazon Q](.amazonq-templates/README.md) · [Kite](https://github.disney.com/SANCR225/Kite) |
| Troubleshooting | [Troubleshooting](docs/TROUBLESHOOTING.md) |

---

**Version:** 3.6.0 · **Agents:** 41 · **Updated:** March 26, 2026

Internal Disney tool — not for external distribution.
