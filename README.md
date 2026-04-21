# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

55+ agents, 9 profiles, one setup. Define your standards once, run them everywhere.

> Requires an Amazon Q Developer license for Kiro CLI access.

---

## New Users — Quick Start

### 1. Install Koda

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex
```

### 2. Run Setup

```bash
koda setup
```

This installs all dependencies: kiro-cli, Node.js, Git, GitHub CLI, and yax (persistent memory).

### 3. Verify

```bash
koda doctor
```

All checks should pass. If kiro-cli shows issues on Windows, see [Windows Troubleshooting](docs/getting-started/WINDOWS_SETUP.md#kiro-cli-silent-failure-on-windows).

### 4. Install Profiles

> **Install only the profiles that match your role.** You don't need all of them — pick what's relevant to your day-to-day work.

| Your Role | Recommended Profiles | Command |
|-----------|---------------------|---------|
| Developer | dev | `koda install dev` |
| Fullstack Developer | dev, qa | `koda install dev qa` |
| .NET Developer | dev, dev-dotnet | `koda install dev dev-dotnet` |
| PHP Developer | dev, dev-php | `koda install dev dev-php` |
| Python Developer | dev, dev-python | `koda install dev dev-python` |
| Infra / Terraform | dev-core, dev-infra | `koda install dev-core dev-infra` |
| Business Analyst / PO | ba | `koda install ba` |
| QA Engineer | qa, dev-core | `koda install qa dev-core` |
| Ops / SRE | ops, dev-core | `koda install ops dev-core` |
| Sustainment / L3 Support | sustainment, dev-core | `koda install sustainment dev-core` |
| Project Manager / Scrum Master | pm | `koda install pm` |
| Tech Director / Delivery Manager | leadership | `koda install leadership` |
| All roles | dev, ba, qa, ops, pm | `koda install dev ba qa ops pm` |

Open Koda TUI and press `[p]` to toggle profiles interactively, or install from CLI.

| Profile | Agents | Description |
|---------|:------:|-------------|
| **dev** | 26 | Alias for dev-core + dev-web + dev-mobile |
| **dev-core** | 18 | Code, review, test, security, PRs, architecture |
| **dev-web** | 5 | Angular UI, Node gateway, Astro SSR, UX, backend |
| **dev-mobile** | 3 | Mobile development agents |
| **dev-dotnet** | 3 | .NET / C# development and review |
| **dev-php** | 1 | PHP development and review |
| **dev-python** | 1 | Python (FastAPI, Flask, Django) |
| **dev-infra** | 1 | Terraform / IaC |
| **ba** | 7 | Requirements, scope, stories, PRDs, estimation |
| **qa** | 11 | Test planning, automation, defect analysis, coverage |
| **ops** | 8 | Infra, deployments, log analysis, releases |
| **sustainment** | 5 | Incident response, AppDynamics, ServiceNow, Splunk |
| **pm** | 6 | Sprints, standups, retros, delivery reports |
| **leadership** | 5 | Cross-studio analytics, quarterly reports, executive briefings |
| **steer-master** | 5 | steer-runtime/Koda development and review |

### 5. Select Workspace (optional)

If your team has a workspace configured:

```bash
koda
```

Press `[w]` to select your team workspace. This applies team-specific profiles, rules, context, and project mappings.

### 6. Configure Tokens

Press `[t]` in Koda (or `[m]` for the full MCP screen) to configure:

| Token | For |
|-------|-----|
| **Jira PAT** | myjira.disney.com or jira.disney.com |
| **Confluence PAT** | mywiki.disney.com or confluence.disney.com |
| **GitHub PAT** | github.disney.com |
| **Compass Token** | compass.wdprapps.disney.com (optional) |

Each instance needs its own PAT. Koda generates `mcp.json` automatically — only instances with tokens get MCP server entries.

### 7. Adjust Env Vars (if needed)

Press `[e]` in Koda to set environment variables:

| Variable | When to set |
|----------|-------------|
| `COMPASS_URL` | If using Compass MCP — set your team's endpoint URL |
| `QTEST_BASE_URL` | If using qTest integration |

### 8. Start Chatting

```bash
koda chat                  # Default agent (kiro-cli TUI)
koda chat --agent orchestrator  # Dev orchestrator
```

Or press `[enter]` on the Koda dashboard.

---

## Existing Users — Update

```bash
koda upgrade       # Update Koda + yax binaries
koda sync          # Pull latest agents, prompts, MCP bundles
koda doctor        # Verify everything
```

---

## Profiles

`dev` is five composable sub-profiles: `dev-core` (18), `dev-web` (5), `dev-python` (1), `dev-infra` (1), `dev-mobile` (3).

Each profile includes an orchestrator that coordinates its specialist agents automatically.

---

## Learn More

| Topic | Link |
|-------|------|
| All agents with tools and MCP coverage | [AGENTS.md](AGENTS.md) |
| Full command reference and architecture | [Reference](docs/reference/REFERENCE.md) |
| MCP servers, tokens, env vars | [MCP Setup](docs/reference/MCP_SETUP.md) |
| Team workspaces | [Workspaces](docs/reference/TEAM_WORKSPACES.md) |
| Windows setup details | [Windows](docs/getting-started/WINDOWS_SETUP.md) |
| macOS/Linux setup details | [Setup](docs/getting-started/SETUP.md) |
| Prompt guides | [Dev](docs/profiles/dev/PROMPT_GUIDE.md) · [BA](docs/profiles/ba/BA_PROMPT_GUIDE.md) · [QA](docs/profiles/qa/QA_PROMPT_GUIDE.md) · [Ops](docs/profiles/ops/OPS_PROMPT_GUIDE.md) · [PM](docs/profiles/pm/PM_PROMPT_GUIDE.md) |
| Kiro IDE / Cursor / Amazon Q | [Cursor](docs/getting-started/CURSOR_SETUP.md) · [Amazon Q](.amazonq-templates/README.md) |
| Eval framework | [Evals](docs/reference/EVAL_FRAMEWORK.md) |
| Roadmap | [Waypoints](https://github.disney.com/users/SANCR225/projects/2/views/1) |

---

## Recordings

| Date | Description | Link |
|------|-------------|------|
| March 10, 2026 | Working Session with CAP Team | [Recording](https://drive.google.com/file/d/19DzFCKPKcAAvNitrWYLDfNxntlvqpkH4/view?usp=sharing) |
| April 2, 2026 | Q&A Session with OpSheet Team | [Recording](https://drive.google.com/file/d/1dyEmmOJOiPxmi7GgzqWsNBUv7zlhT8t-/view?usp=sharing) |
| April 17, 2026 | Product Profile Session | [Recording](https://drive.google.com/file/d/1TiWw0mgX-QOS5zO1lQrZzODjIUGBpw7_/view?usp=sharing) |
| April 17, 2026 | Trips/RA Team Session | [Recording](https://drive.google.com/file/d/1PNBL_WDgTlVvn03ih8uah-DAakmhXR9h/view?usp=drive_link) |

---

## Contribute

- 💡 [Propose a feature](https://github.disney.com/SANCR225/steer-runtime/issues/new?template=feature_request.md)
- 🐛 [Report a bug](https://github.disney.com/SANCR225/steer-runtime/issues/new?template=bug_report.md)
- 📋 [Waypoints board](https://github.disney.com/users/SANCR225/projects/2/views/1)

---

Internal Disney tool — not for external distribution.
