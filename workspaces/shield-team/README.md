# Shield

Parent workspace for all Shield team. Provides shared profiles, rules, and team context.

## What's Inherited

All child workspaces get:
- **Profiles**: dev-core, dev-mobile, sustainment, pm, qa
- **Rules**: conventional_commit
- **Workspace path**: `${SHIELD_WORKSPACE_PATH}` (set via environment variable)

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for details on hierarchy and inheritance.

## Quick installation guide

For detailed information see [General installation Guide](../../README.md).

### 1. Install Koda

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash
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

All checks should pass.

### 4. Install Profiles

> **Install only the profiles that match your role.** You don't need all of them — pick what's relevant to your day-to-day work.

| Your Role | Recommended Profiles | Command |
|-----------|---------------------|---------|
| Developer | dev | `koda install dev` |
| QA Engineer | qa, dev-core | `koda install qa dev-core` |
| Sustainment / L3 Support | sustainment, dev-core | `koda install sustainment dev-core` |
| Project Manager / Scrum Master | pm | `koda install pm` |
| Tech Director / Delivery Manager | leadership | `koda install leadership` |
| All roles | dev, ba, qa, ops, pm | `koda install dev ba qa pm` |

Open Koda TUI and press `[p]` to toggle profiles interactively, or install from CLI.

| Profile | Agents | Description |
|---------|:------:|-------------|
| **dev** | 26 | Alias for dev-core + dev-web + dev-mobile |
| **dev-core** | 18 | Code, review, test, security, PRs, architecture |
| **dev-web** | 5 | Angular UI, Node gateway, Astro SSR, UX, backend |
| **dev-mobile** | 3 | Mobile development agents |
| **ba** | 7 | Requirements, scope, stories, PRDs, estimation |
| **qa** | 11 | Test planning, automation, defect analysis, coverage |
| **sustainment** | 5 | Incident response, AppDynamics, ServiceNow, Splunk |
| **pm** | 6 | Sprints, standups, retros, delivery reports |
| **leadership** | 5 | Cross-studio analytics, quarterly reports, executive briefings |
| **steer-master** | 5 | steer-runtime/Koda development and review |

### 5. Set Workspace for Shield

Add the environment variable pointing to your repositories root folder (e.g., in `~/.zshrc`):

```bash
export SHIELD_WORKSPACE_PATH=<path-to-repositories_root_folder>
```

Then apply the workspace:

```bash
koda workspace apply shield-team
```

Or launch the TUI:

```bash
koda
```

Press `[w]` to select your team workspace. This applies team-specific profiles, rules, context, and project mappings.

### 6. Configure Tokens

Press `[t]` in Koda (or `[m]` for the full MCP screen) to configure:

| Token | For |
|-------|-----|
| **Jira PAT** | disneyexperiences.atlassian.net or jira.disney.com |
| **Confluence PAT** | disneyexperiences.atlassian.net/wiki or confluence.disney.com |
| **GitHub PAT** | github.disney.com |
| **Compass Token** | compass.wdprapps.disney.com (optional) |

Each instance needs its own PAT. Koda generates `mcp.json` automatically — only instances with tokens get MCP server entries.

### 7. Install MCPs

```bash
koda mcp-install
```

### 8. Start Chatting

```bash
koda chat                  # Default agent (kiro-cli TUI)
koda chat --agent orchestrator  # Dev orchestrator
```

## Extra: Test changes in the local workspace

To apply the workspace from your local steer-runtime folder:

```bash
koda --steer-root <local-path-to-steer-runtime> workspace apply shield-team
```
