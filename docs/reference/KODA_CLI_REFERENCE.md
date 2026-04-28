# Koda CLI Reference

Koda manages Kiro agent profiles, tokens, workspaces, and IDE integrations. Run `koda` with no arguments to launch the interactive TUI dashboard.

## Global Flags

| Flag | Description |
|------|-------------|
| `--steer-root <path>` | Path to steer-runtime repo |
| `--project <path>` | Target project directory (default: `~/.kiro`) |
| `--json` | Output in JSON format |

---

## Chat & Interaction

### `koda chat [message]`
Start an interactive chat with a Kiro agent (proxies to `kiro-cli --tui`).

| Flag | Description |
|------|-------------|
| `--agent <name>` | Agent to chat with (e.g., `orchestrator`, `backend`) |
| `--trust-all` | Trust all tools without prompting |
| `--no-trust` | Don't trust any tools (kiro-cli will prompt per tool) |

If no flag is provided and no preference is saved, prompts: `Trust all tools? (Y/n/always/never)`. Typing `always` or `never` persists the choice to settings.

### `koda prompt [message]`
Start a chat using Koda's built-in ACP TUI (with live indicators).

| Flag | Description |
|------|-------------|
| `--agent <name>` | Agent to chat with |

---

## Profile Management

### `koda install [profiles...]`
Install one or more agent profiles (e.g., `koda install dev-core qa pm`).

### `koda remove [profiles...]`
Remove specific profiles from the installation.

### `koda list`
List all available profiles and their agents.

### `koda sync`
Update installed profiles to the latest version from steer-runtime.

| Flag | Description |
|------|-------------|
| `--update` | Download latest steer-runtime release before syncing |

### `koda diff`
Show what would change on the next sync (dry-run).

### `koda status`
Show agent setup status — installed profiles, agents, and configuration (similar to `git status`).

### `koda check`
Verify installation health — checks that profiles, agents, and MCP servers are correctly configured.

### `koda reset`
Backup `~/.kiro` and reinstall fresh. Preserves tokens and environment variables.

---

## Workspace Management

### `koda workspace apply [name]`
Apply a workspace configuration — installs profiles, context, rules, and MCP servers defined in the workspace.

### `koda workspace list`
List all available workspaces.

### `koda workspace show [name]`
Show workspace details — profiles, projects, context files, and rules.

### `koda workspace create [name]`
Scaffold a new team workspace.

| Flag | Description |
|------|-------------|
| `--local` | Scaffold only, skip git commit/push |

### `koda workspace edit [name]`
Open a workspace configuration in your editor.

### `koda workspace sync [name]`
Git pull/push across workspace repos.

| Flag | Description |
|------|-------------|
| `--push` | Push instead of pull |

---

## MCP & Token Configuration

### `koda mcp-install`
Install MCP server dependencies and generate `~/.kiro/settings/mcp.json`.

| Flag | Description |
|------|-------------|
| `--assistant` | Force interactive assistant for server selection and token configuration |

### `koda configure`
Configure MCP tokens interactively — prompts for Jira PAT, Confluence PAT, GitHub tokens, and other service credentials.

### `koda enable-tools`
Enable advanced kiro-cli tool settings (notifications, thinking, todo list, knowledge, subagent, developer mode).

---

## Environment Variables

### `koda env set KEY=VALUE`
Set an environment variable in `~/.kiro/env.vars`.

### `koda env get KEY`
Get the current value of an environment variable.

### `koda env list`
List all configured environment variables.

---

## Rules & Prompts

### `koda rules list`
List available coding rules.

### `koda rules install [rules...]`
Install coding rules.

| Flag | Description |
|------|-------------|
| `--all` | Install all available rules |

### `koda prompts list`
List available standalone prompts.

### `koda prompts install [prompts...]`
Install standalone prompts.

| Flag | Description |
|------|-------------|
| `--all` | Install all available prompts |

---

## Amazon Q Integration

### `koda amazonq install [dir]`
Install Amazon Q Developer rules to a project directory.

### `koda amazonq sync [dir]`
Update Amazon Q rules to latest.

### `koda amazonq sync-all [dir]`
Full sync: templates + context + MCP to Amazon Q.

### `koda amazonq sync-mcp`
Sync MCP server configuration to Amazon Q.

### `koda amazonq status [dir]`
Show Amazon Q sync status.

### `koda amazonq remove [dir]`
Remove `.amazonq/` directory from a project.

---

## Kiro IDE

### `koda kiro-ide`
Manage Kiro IDE steering files, skills, agents, and workspace configuration. Subcommands available via `koda kiro-ide --help`.

---

## Agent Teams

### `koda team run [spec-file]`
Launch a team of agents from a TeamSpec file.

| Flag | Description |
|------|-------------|
| `--goal <text>` | High-level goal for the team |

### `koda team plan`
AI-generate a TeamSpec from a goal description.

| Flag | Description |
|------|-------------|
| `--goal <text>` | Goal to decompose into a team plan |

### `koda team init [name]`
Create a sample TeamSpec template.

### `koda team list`
List available TeamSpec templates.

### `koda team status`
Show running team status.

### `koda team merge [spec-file]`
Merge completed workers' changes back together.

---

## Diagnostics & Maintenance

### `koda doctor`
Deep health check of the entire setup — profiles, MCP servers, tokens, kiro-cli, and dependencies.

### `koda setup`
Check and install missing dependencies (Node.js, kiro-cli, etc.).

### `koda upgrade`
Self-update Koda to the latest release from GitHub.

### `koda version`
Print the current Koda version.

### `koda auto-update`
Manage daily auto-update schedule (enable/disable/status).

---

## Advanced

### `koda init-memory [dir]`
Initialize a project memory bank for persistent context.

| Flag | Description |
|------|-------------|
| `--from <project>` | Copy memory bank from a known project |

### `koda eval [agent]`
Evaluate agent quality using fixtures and rubrics.

| Flag | Description |
|------|-------------|
| `--all` | Run all agents with fixtures |
| `--deep` | Run LLM quality scoring (costs tokens) |

### `koda stats`
Show prompt scoring and token usage statistics.

| Flag | Description |
|------|-------------|
| `--days <n>` | Number of days to include (default: 7) |

### `koda autopilot`
AI-SDLC pipeline orchestrator — automated multi-stage development workflows.

### `koda kitestream`
Browser-based control surface for Kiro sessions.

| Flag | Description |
|------|-------------|
| `--port <n>` | HTTP port (default: 7700) |

### `koda slack`
Run the Steery Slack bot.

| Flag | Description |
|------|-------------|
| `--agent <name>` | Agent to use (default: `steery_agent`) |
| `--app-token <token>` | Slack App-Level Token (`xapp-...`) |

### `koda tray`
Launch the Koda menu bar app (macOS).
