# Team Workspaces

A Team Workspace is a self-contained configuration bundle that lets team members get fully set up with a single command. It defines which profiles to install, which rules to apply, which projects to initialize, and any team-specific context or conventions.

Workspaces support **hierarchical inheritance** — a parent workspace defines the shared foundation, and child workspaces extend it with team-specific configuration.

---

## Quick Start

```bash
# List available workspaces (shows hierarchy)
koda workspace list

# Apply a workspace (resolves inheritance automatically)
koda workspace apply opsheet-vas-team

# Configure MCP tokens
koda mcp-install
```

---

## Hierarchical Workspaces

A workspace can `extend` a parent. The child inherits the parent's profiles, rules, and context, then adds its own.

```
opsheet-team (parent)              → profiles: [dev-core, qa, ba]
  ├─ opsheet-vas-team              → inherits + [dev-web, ops, dev-vas]
  └─ opsheet-flutter-team          → inherits + [dev-mobile]
```

### Inheritance rules

| Field                                                 | Strategy                | Example                                                                 |
|-------------------------------------------------------|-------------------------|-------------------------------------------------------------------------|
| `profiles`                                            | Additive (union)        | parent `[dev-core, qa]` + child `[dev-web]` → `[dev-core, qa, dev-web]` |
| `rules`                                               | Additive (union)        | parent `[conventional_commit]` + child `[flutter-dev]` → both           |
| `context/`                                            | All copied (root-first) | parent's `team_context.md` + child's `vas_context.md`                   |
| `description`, `team`, `default_agent`, `jira_prefix` | Child overrides parent  | Child value wins if set                                                 |
| `projects`                                            | Child only              | Projects are team-specific                                              |

Chains can go multiple levels deep. Resolution walks bottom-up with cycle detection.

---

## Workspace Structure

```
workspaces/
├── opsheet-team/                   # Parent workspace
│   ├── workspace.json
│   ├── context/
│   │   └── team_context.md         # Shared business context
│   └── rules/
│       └── opsheet-conventions.md
├── opsheet-vas-team/               # Child workspace
│   ├── workspace.json              # "extends": "opsheet-team"
│   ├── context/
│   │   └── vas_context.md          # VAS-specific context
│   └── profiles/
│       └── dev-vas/                # Workspace-specific profile overrides
└── opsheet-flutter-team/           # Child workspace
    ├── workspace.json              # "extends": "opsheet-team"
    └── context/
        └── flutter_context.md
```

---

## workspace.json Schema

```json
{
  "name": "opsheet-vas-team",
  "extends": "opsheet-team",
  "description": "OpSheet+ VAS backend & web team",
  "team": "OpSheet+ VAS Team",
  "profiles": ["dev-web", "ops", "dev-vas"],
  "default_agent": "orchestrator",
  "projects": [
    {
      "name": "opsheet-plus-vas",
      "repo": "wdpr-parkops-opsheet-suite/opsheet-plus-vas",
      "host": "github.disney.com",
      "path": "../opsheet-plus-vas",
      "memory_bank": "opsheet-plus-vas"
    }
  ],
  "rules": ["general-angular-development"],
  "enable_tools": true,
  "jira_prefix": "OPS-"
}
```

| Field            | Type     | Description                                                |
|------------------|----------|------------------------------------------------------------|
| `name`           | string   | Workspace identifier (matches directory name)              |
| `extends`        | string   | Parent workspace name (optional — enables inheritance)     |
| `description`    | string   | Human-readable description                                 |
| `team`           | string   | Team name                                                  |
| `profiles`       | string[] | Profiles to install (merged with parent if extends is set) |
| `default_agent`  | string   | Suggested starting agent                                   |
| `projects`       | object[] | Repos to initialize with memory banks                      |
| `rules`          | string[] | Common rules from `common/rules/` (merged with parent)     |
| `enable_tools`   | boolean  | Enable thinking, todo, knowledge                           |
| `jira_prefix`    | string   | Team's Jira project prefix                                 |
| `workspace_path` | string   | Base path for project repos                                |

---

## Project Entry Schema

Each entry in `projects` describes a repository:

| Field         | Type   | Description                                                                 |
|---------------|--------|-----------------------------------------------------------------------------|
| `name`        | string | Project display name                                                        |
| `path`        | string | Directory name (relative to `workspace_path`)                               |
| `repo`        | string | Repository path — `org/repo` format (no host prefix)                        |
| `host`        | string | Git host — `github.disney.com` (default) or `gitlab.disney.com`             |
| `memory_bank` | string | Memory bank template name (optional, defaults to project name)              |

### Host routing

The `host` field determines which platform Koda uses for clone URLs and which MCP tools agents use for PRs/MRs:

| `host` value | Clone URL | Agent tools |
|---|---|---|
| `github.disney.com` (or omitted) | `git@github.disney.com:org/repo.git` | `@github/*`, `gh` CLI |
| `gitlab.disney.com` | `git@gitlab.disney.com:org/repo.git` | `@gitlab/*` |

### Examples

```json
// GitHub repo (default)
{ "name": "my-service", "path": "my-service", "repo": "MyOrg/my-service", "host": "github.disney.com" }

// GitLab repo
{ "name": "my-spa", "path": "my-spa", "repo": "cgs-wdw/myapp/my-spa", "host": "gitlab.disney.com" }
```

---

## Managing Workspaces with Koda

### Koda TUI (interactive)

Launch `koda` and press `w` to open the Workspaces screen.

| Key     | Action                                                 |
|---------|--------------------------------------------------------|
| `enter` | Apply selected workspace                               |
| `e`     | Edit selected workspace                                |
| `x`     | Extend — create a child workspace from selected parent |
| `n`     | Create a new workspace from scratch                    |
| `esc`   | Back to dashboard                                      |

The TUI shows workspaces in a tree:

```
▸ opsheet-team           dev-core, qa, ba
    OpSheet+ shared foundation
  ├─ opsheet-vas-team    dev-web, ops, dev-vas
  └─ opsheet-flutter-team dev-mobile
  payments-core          dev-core, dev-web, qa, ops
```

### Koda CLI

```bash
koda workspace list                    # List with tree hierarchy
koda workspace show payments-core      # View full details
koda workspace apply opsheet-vas-team  # Apply (resolves inheritance)
koda workspace sync payments-core      # Pull all workspace repos
```

### setup.sh (for scripts and CI)

The setup script supports listing and applying workspaces. Workspace creation and editing is done through Koda.

```bash
./setup.sh workspace list                    # List with tree hierarchy
./setup.sh workspace list --fetch            # Pull latest, then list
./setup.sh workspace show payments-core      # View details
./setup.sh workspace apply opsheet-vas-team  # Apply (resolves inheritance)
./setup.sh workspace sync payments-core      # Pull all workspace repos
```

---

## Creating a Workspace

Use the Koda TUI (`koda` → `w` → `n`):

1. Fill in name, description, team, Jira prefix
2. Select profiles (space to toggle)
3. Select rules
4. Set repos path and add repositories
5. `ctrl+s` to save — Koda scaffolds the directory and publishes via PR

### Creating a child workspace

Select a parent workspace and press `x`:

1. The `extends` field is pre-filled with the parent name
2. Add only the profiles, rules, and context specific to the child team
3. The child inherits everything from the parent automatically

### Manual creation

If you prefer, create the directory structure directly:

```bash
mkdir -p workspaces/my-team/{rules,context}
# Edit workspaces/my-team/workspace.json
# Commit and push
```

---

## What Apply Does

When you run `koda workspace apply <name>`:

1. **Resolves inheritance** — walks the `extends` chain, merges profiles and rules
2. **Installs profiles** — global profiles first, then workspace-specific overrides
3. **Installs rules** — from `common/rules/` for all merged rule names
4. **Copies rules and context** — from each workspace in the chain (root-first)
5. **Injects tokens** — applies configured MCP tokens to agent configs
6. **For each project**:
   - If not cloned locally and `repo` field is set → **clones the repo** to `workspace_path/<name>`
   - If cloned but no memory bank → **initializes memory bank** from known templates or generic templates
   - If already set up → skips silently
7. **Saves active workspace** — records which workspace is active in settings

### Project path resolution

When `workspace_path` is set on a workspace (or inherited from a parent), project paths are resolved as `workspace_path + path`. This means projects only need the folder name:

```json
{
  "workspace_path": "~/Workspace/Disney/DisneyPaymentsOrg",
  "projects": [
    { "name": "wdpr-config-services", "path": "wdpr-config-services", "repo": "DisneyPaymentsOrg/wdpr-config-services", "host": "github.disney.com" }
  ]
}
```

Koda resolves this to `~/Workspace/Disney/DisneyPaymentsOrg/wdpr-config-services`. The `repo` and `host` fields enable auto-cloning when the directory doesn't exist.

### Environment Variables in `workspace_path`

`workspace_path` supports environment variable expansion for cross-platform compatibility. This allows the same `workspace.json` to work across macOS, Linux, and Windows without modification.

**Supported formats:**

| Format | Example | Platform |
|--------|---------|----------|
| `~` | `~/Workspace/Disney` | All (expands to home dir) |
| `${VAR}` | `${WORKSPACE_ROOT}/Disney` | All (recommended) |
| `$VAR` | `$HOME/Workspace/Disney` | All |
| `%VAR%` | `%USERPROFILE%\Workspace\Disney` | Windows |

**Recommended approach** — use `${VAR}` syntax:

```json
{
  "workspace_path": "${WORKSPACE_ROOT}/Disney/DisneyPaymentsOrg"
}
```

Each team member sets the env var on their machine:

```bash
# macOS/Linux (~/.zshrc or ~/.bashrc)
export WORKSPACE_ROOT=/Users/ricardo/Workspace

# Windows (System Environment Variables)
set WORKSPACE_ROOT=C:\Users\ricardo\Workspace
```

**Common variables:**

| Variable | macOS/Linux | Windows |
|----------|-------------|---------|
| `HOME` | `/Users/ricardo` | `C:\Users\ricardo` |
| `USERPROFILE` | (not set) | `C:\Users\ricardo` |
| Custom: `WORKSPACE_ROOT` | Set by user | Set by user |

**Path separators** are normalized automatically — use `/` in `workspace.json` and Koda converts to `\` on Windows.

---

## Syncing Repos

Pull or push all repositories in a workspace:

```bash
koda workspace sync payments-core          # fetch + pull all repos
koda workspace sync payments-core --push   # push all repos
```

---

## Best Practices

- **One parent workspace per product team** — shared foundation (profiles, rules, context)
- **Child workspaces per sub-team** — only add what's specific to that sub-team
- **Keep workspace.json in version control** — it's the team's setup contract
- **Don't put tokens in workspace files** — tokens go in `~/.kiro/tokens.env` via `koda configure`
- **Use `rules/` for team conventions** — API patterns, naming standards
- **Use `context/` for team knowledge** — deployment processes, review SLAs, team contacts
- **Test before sharing** — run `workspace apply` on a clean setup to verify

---

## Workspaces vs. Forks

|                        | Workspace                              | Fork                 |
|------------------------|----------------------------------------|----------------------|
| **Scope**              | Team-level config within a repo        | Full repo copy       |
| **What it customizes** | Profiles, rules, context, memory banks | Everything           |
| **Where it lives**     | `workspaces/<name>/` in any fork       | Separate GitHub repo |
| **Hierarchy**          | Supports `extends` for parent-child    | N/A                  |

A typical setup: each org has a fork of steer-runtime, and within that fork teams have workspaces (with hierarchy) that configure their specific setup.

---

Back to [README](../index.md)
