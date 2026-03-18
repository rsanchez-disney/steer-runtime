# steer-runtime

Unified multi-profile Kiro agent system for Disney Payments — 40 specialized agents across 5 profiles.

```bash
./setup.sh install dev ba qa ops pm # Install all profiles
./setup.sh mcp-install              # Configure MCP servers + tokens
```

> 🆕 **First time with Kiro?** See [Getting Started](docs/GETTING_STARTED.md) · 🪟 **Windows?** See [Windows Setup](docs/WINDOWS_SETUP.md)

---

## Prerequisites

Node.js, Git, and [Kiro CLI](docs/GETTING_STARTED.md). Optional: [GitHub CLI](https://cli.github.com/) (`gh auth login --hostname github.disney.com`).

---

## Quick Start

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime

./setup.sh list                 # See available profiles
./setup.sh install dev          # Install dev profile (or: dev ba qa ops)
./setup.sh mcp-install          # Setup MCP servers + tokens
```

Then use agents:
```bash
kiro-cli chat --agent orchestrator              # Dev orchestrator
kiro-cli chat --agent ba_orchestrator_agent      # BA orchestrator
kiro-cli chat --agent qa_orchestrator_agent      # QA orchestrator
kiro-cli chat --agent ops_orchestrator_agent     # Ops orchestrator
kiro-cli chat --agent pm_orchestrator_agent      # PM/Scrum Master orchestrator
```

---

## Profiles

| Profile | Agents | Focus | Docs |
|---------|:------:|-------|------|
| **dev** | 19 | Backend, WebAPI, UI, mobile, security, code review | [Prompt Guide](docs/PROMPT_GUIDE.md) |
| **ba** | 4 | Requirements, scope, user stories, acceptance criteria | [BA Guide](docs/BA_PROMPT_GUIDE.md) |
| **qa** | 6 | Test planning, automation, defect analysis, API/perf testing | [QA Guide](docs/QA_PROMPT_GUIDE.md) |
| **ops** | 5 | AI metrics, infrastructure, deployments, code quality | [Ops Guide](docs/OPS_PROMPT_GUIDE.md) |
| **pm** | 6 | Sprint management, standups, retros, risk tracking, delivery reports | [PM Guide](docs/PM_PROMPT_GUIDE.md) |

Full agent reference: [AGENTS.md](AGENTS.md)

---

## Commands

```bash
./setup.sh                      # Show help
./setup.sh list                 # List available profiles
./setup.sh install <profiles>   # Install one or more profiles
./setup.sh install dev --project ~/my-project   # Project-specific (Kiro UI)
./setup.sh sync                 # Update installed profiles
./setup.sh remove <profiles>    # Remove specific profiles
./setup.sh check                # Verify installation
./setup.sh mcp-install          # Setup MCP servers + configure tokens
./setup.sh configure            # Reconfigure MCP tokens only
./setup.sh rules list           # List available coding rules
./setup.sh rules install --all  # Install rules to project
./setup.sh prompts list         # List available prompts
./setup.sh init-memory <dir>    # Initialize project memory bank
```

---

## MCP Servers

MCP servers are pre-built and bundled — no `npm install` required. Just configure tokens:

```bash
./setup.sh mcp-install          # Verify bundles + configure tokens
./setup.sh configure            # Reconfigure tokens only
```

| Server | Purpose | Token URL |
|--------|---------|-----------|
| jira-mcp | Jira issue management | [Generate token](https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens) |
| confluence-mcp | Confluence wiki | [Generate token](https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action) |
| mywiki-mcp | MyWiki instance | [Generate token](https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action) |
| github-mcp | GitHub Enterprise | [Generate token](https://github.disney.com/settings/tokens) |
| mermaid-diagram-mcp | Diagram generation | No token needed |

---

## Project Structure

```
steer-runtime/
├── .kiro-dev/              # Dev profile (19 agents)
├── .kiro-ba/               # BA profile (4 agents)
├── .kiro-qa/               # QA profile (6 agents)
├── .kiro-ops/              # Ops profile (5 agents)
├── .kiro-pm/               # PM/Scrum Master profile (6 agents)
├── .kiro/tools/mcp-servers/  # Pre-built MCP bundles
├── common/                 # Shared rules, prompts, memory templates
├── docs/                   # All documentation
├── setup.sh                # macOS/Linux setup
└── setup.ps1               # Windows setup
```

---

## Documentation

| Audience | Guides |
|----------|--------|
| **Developers** | [Prompt Guide](docs/PROMPT_GUIDE.md) · [Mobile Setup](docs/MOBILE_AGENTS_SETUP.md) · [Architecture](docs/DESIGN.md) · [MCP Config](docs/MCP_SETUP.md) |
| **BA / PO** | [BA Guide](docs/BA_PROMPT_GUIDE.md) · [Workflows](docs/BA_WORKFLOWS.md) · [Quick Ref](docs/BA_QUICK_REFERENCE.md) |
| **QA** | [QA Guide](docs/QA_PROMPT_GUIDE.md) · [Workflows](docs/QA_WORKFLOWS.md) · [Quick Ref](docs/QA_QUICK_REFERENCE.md) · [Overview](docs/QA_PROFILE_OVERVIEW.md) |
| **Ops** | [Ops Guide](docs/OPS_PROMPT_GUIDE.md) · [Workflows](docs/OPS_WORKFLOWS.md) · [Quick Ref](docs/OPS_QUICK_REFERENCE.md) |
| **PM / Scrum** | [PM Guide](docs/PM_PROMPT_GUIDE.md) |
| **All** | [Agent Reference](AGENTS.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [Windows Setup](docs/WINDOWS_SETUP.md) · [Getting Started](docs/GETTING_STARTED.md) |

---

## Adding New Profiles

1. Create `.kiro-<name>/agents/` and `.kiro-<name>/prompts/`
2. Add agent JSON configs and prompt markdown files
3. Run `./setup.sh install <name>`

The setup script auto-discovers all `.kiro-*` directories.

---

## Features

✅ 40 specialized agents across 5 profiles  
✅ Pre-built MCP bundles — no npm install needed  
✅ Auto-discovery of `.kiro-*` profile directories  
✅ Cross-platform — macOS/Linux (`setup.sh`) + Windows (`setup.ps1`)  
✅ MCP integration — Jira, Confluence, MyWiki, GitHub, Mermaid  
✅ Memory banks — per-project AI context  
✅ Common rules and standalone prompts  

---

**Version:** 3.2.0 · **Agents:** 40 (dev 19, ba 4, qa 6, ops 5, pm 6) · **Updated:** March 17, 2026

## Resources

### 🪁 Kite — Desktop GUI for Kiro CLI

[Kite](https://github.disney.com/SANCR225/Kite) is a native desktop companion app (Tauri + React) that wraps kiro-cli with a visual interface — streaming chat, agent/profile switching, prompt scoring, session management, and plugins for steering files, GitHub, and MCP servers.

```bash
# Requires steer-runtime profiles installed first
cd Kite/app && npm install && npm run tauri dev
```

### Recordings & Sessions

| Date | Description | Link |
|------|-------------|------|
| March 10, 2026 | Working Session with CAP Team | [Recording](https://drive.google.com/file/d/19DzFCKPKcAAvNitrWYLDfNxntlvqpkH4/view?usp=sharing) |

---

Internal Disney tool — not for external distribution.
