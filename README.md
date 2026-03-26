# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

41 agents, 5 profiles, one setup. Define your standards once, run them everywhere.

---

## Get Started

You need **Node.js**, **Git**, and [Kiro CLI](docs/GETTING_STARTED.md). That's it.

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime

./setup.sh install dev        # Install dev agents (or: ba, qa, ops, pm)
./setup.sh mcp-install        # Hook up Jira, Confluence, GitHub (optional)
```

Then start chatting:

```bash
kiro-cli chat --agent orchestrator          # Dev orchestrator
kiro-cli chat --agent qa_orchestrator_agent  # QA orchestrator
kiro-cli chat --agent ba_orchestrator_agent  # BA orchestrator
```

> 🪟 On Windows? See [Windows Setup](docs/WINDOWS_SETUP.md).
> 👥 Joining a team? Run `./setup.sh workspace apply <team>` — [details](docs/TEAM_WORKSPACES.md).

---

## Profiles

Pick what fits your role, or install everything with `./setup.sh install dev ba qa ops pm`.

| Profile | Agents | What it does |
|---------|:------:|-------------|
| **dev** | 20 | Code, review, test, security, PRs — the full dev loop |
| **ba** | 4 | Requirements, scope, user stories, acceptance criteria |
| **qa** | 6 | Test planning, automation, defect analysis, API & perf testing |
| **ops** | 5 | AI metrics, infra checks, deployments, code quality |
| **pm** | 6 | Sprints, standups, retros, risk tracking, delivery reports |

`dev` is actually three sub-profiles you can mix: `dev-core` (13), `dev-web` (4), `dev-mobile` (3).

---

## Koda (Recommended)

[Koda](https://github.disney.com/SANCR225/Koda) is a Go CLI that replaces `setup.sh` with an interactive TUI — fuzzy agent search, masked tokens, health checks. One binary, no dependencies.

```bash
koda                              # Launch interactive dashboard
koda install dev ba qa ops pm     # Or use CLI commands directly
```

> `setup.sh` still works and is fully maintained.

---

## What's New

| Date | Change |
|------|--------|
| Mar 25 | [Koda CLI](https://github.disney.com/SANCR225/Koda) — interactive Go CLI with TUI dashboard |
| Mar 20 | [Team Workspaces](docs/TEAM_WORKSPACES.md) — one-command team setup |
| Mar 20 | [Context7 MCP](https://context7.com) — real-time library docs, no token needed |
| Mar 20 | Dev profile split → `dev-core` + `dev-web` + `dev-mobile` |
| Mar 20 | [Fork Strategy](docs/FORK_STRATEGY.md) — cross-team governance |

---

## Learn More

| What | Where |
|------|-------|
| Full command reference, MCP servers, architecture, extending | [Reference](docs/REFERENCE.md) |
| All 41 agents with tools, hooks, and MCP coverage | [AGENTS.md](AGENTS.md) |
| First-time Kiro setup (SSO, downloads) | [Getting Started](docs/GETTING_STARTED.md) |
| How to prompt agents effectively | [Prompt Guide](docs/PROMPT_GUIDE.md) |
| Role-specific guides | [BA](docs/BA_PROMPT_GUIDE.md) · [QA](docs/QA_PROMPT_GUIDE.md) · [Ops](docs/OPS_PROMPT_GUIDE.md) · [PM](docs/PM_PROMPT_GUIDE.md) |
| Cursor / Amazon Q / Kite setup | [Cursor](docs/CURSOR_SETUP.md) · [Amazon Q](.amazonq-templates/README.md) · [Kite](https://github.disney.com/SANCR225/Kite) |
| Troubleshooting | [Troubleshooting](docs/TROUBLESHOOTING.md) |

---

**Version:** 3.5.0 · **Agents:** 41 · **Updated:** March 26, 2026

Internal Disney tool — not for external distribution.
