# Kite — Desktop Agent Application

Kite is the desktop GUI for steer-runtime agents. It provides a visual interface for chat, file exploration, git operations, sprint tracking, and workspace management.

## Install

```bash
koda apps install kite
```

## Launch

```bash
open ~/.koda/bin/kite/Kite.app
# or
koda apps start kite
```

## How Kite Uses steer-runtime

### Workspaces

Kite reads workspaces from `~/.kiro/steer-runtime/workspaces/`. The workspace selector:
1. Lists all workspaces (parent + child, with inheritance)
2. On switch: calls `koda ws materialize <name>` to install profiles into `~/.kiro/workspaces/<name>/`
3. Restarts the ACP bridge with `KIRO_HOME=~/.kiro/workspaces/<name>/`
4. Loads the workspace's `default_agent`

### Agents

Kite discovers agents from the active workspace's materialized dir. The agent switcher in the top bar lists all available agents and switches the ACP session.

### Profiles

The profile switcher reads from `~/.kiro/settings/profiles.json` and activates profiles via kiro-cli.

### Files Module

Roots to the workspace's `workspace_path`. Shows project folders with git status (branch, changed files). Context menu provides:
- Git Powers popup (status, pull, log, branch switch)
- View in Terminal
- Build/Run/Test actions (auto-detected from project type)
- AI Powers (explain, review, test, document)

### ACP Bridge

Kite spawns `kiro-cli acp --trust-all-tools --agent <default>` as a child process. Communication is via JSON-RPC over stdin/stdout. The bridge:
- Sends `session/new` with the workspace's cwd
- Streams `session/update` notifications to the chat UI
- Auto-approves tool permissions

## Configuration

| Setting | Location | Purpose |
|---------|----------|---------|
| Primary workspace | `~/.kiro/settings/kite.json` → `steerRuntime.primaryWorkspace` | Loaded on startup |
| Default agent | `~/.kiro/settings/kite.json` → `defaultAgent` | Used for ACP bridge |
| Theme | `~/.kiro/settings/kite.json` → `theme` | UI theme |
| Trust tools | `~/.kiro/settings/kite.json` → `steerRuntime.trustTools` | `all` / `none` |

## Relationship to Koda

Kite and Koda share:
- `~/.kiro/settings/kite.json` — workspace, agent, trust preferences
- `~/.kiro/steer-runtime/` — profiles, workspaces, rules
- `~/.kiro/workspaces/` — materialized workspace dirs
- `koda ws materialize` — Kite delegates workspace installation to Koda

Switching workspaces in Kite is equivalent to `koda chat --ws <name>`.
