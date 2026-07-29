# Connected Products Team

Show Ready & SARG platform team — task management APIs, cast operations services, and the Big Belly mobile app for Walt Disney World connected products.

## Quick Start

```bash
koda --steer-root <steer-runtime-clone> workspace apply connected-products-team
koda mcp-install
koda chat
```

## Profiles

| Profile | Purpose |
|---------|--------|
| dev-core | Code implementation, PRs, architecture, delegation |
| dev-web | Backend Java services, APIs |
| dev-mobile | Flutter mobile development (Big Belly app) |
| ba | Requirements, backlog, estimation |
| qa | Test planning, automation, defect analysis |

## Workspace Contents

```
workspaces/connected-products-team/
├── workspace.json              # Workspace configuration
├── README.md                   # This file
├── context/
│   ├── team_context.md         # Team members, roles, repos
│   ├── service_repo_mapping.md # Service → repo → deploy target
│   └── splunk_services.md      # Splunk indexes and query patterns
├── rules/
│   └── conventional_commit.md  # Commit message convention
└── profiles/
    └── dev-core/
        └── agents/
            └── orchestrator.json  # Adds Jira & Confluence tools
```

## Agent Capabilities

The orchestrator is extended with Jira and Confluence MCP tools for this workspace. It can:
- Create and update Jira stories in SHOWREADY / SARG projects
- Search and link Confluence documentation
- Delegate to specialized agents (backend, flutter, QA, BA)

### Splunk Log Access

The splunk_query_agent (from dev-core profile) automatically loads `splunk_services.md` from this workspace's context.

---

## How steer-runtime Works (Two Copies)

> Throughout this document, `<steer-runtime-clone>` refers to wherever you cloned the steer-runtime repository (e.g. `~/projects/steer-runtime`).

Understanding this is key before making any workspace changes.

Koda (the CLI that manages agents) reads workspaces from an **installed copy** of steer-runtime, not from a git clone. There are two distinct locations:

| Location | What it is | How it gets there | Has git? |
|---|---|---|---|
| `~/.kiro/steer-runtime/` | Installed copy (tarball) | `koda sync --update` | ❌ No |
| `<steer-runtime-clone>` | Git clone (our dev copy) | `git clone` | ✅ Yes |

- **Installed copy** (`~/.kiro/steer-runtime/`) — This is what Koda uses by default when you run any `koda workspace` command. It's an extracted encrypted tarball with no git history. All team members get updates here via `koda sync --update`.
- **Git clone** (`<steer-runtime-clone>`) — This is where you make changes, commit, and push PRs. Koda does NOT read from here unless you explicitly tell it to.

---

## Editing the Workspace

Follow this workflow whenever you need to modify workspace.json, add context files, change rules, or update agent configs.

### Step 1: Make changes in the git clone

Edit files inside your local clone:

```bash
cd <steer-runtime-clone>
# Edit workspace.json, context files, rules, etc.
vim workspaces/connected-products-team/workspace.json
```

### Step 2: Test locally with `--steer-root`

Point Koda at your local clone instead of the installed copy:

```bash
koda --steer-root <steer-runtime-clone> workspace apply connected-products-team
```

This tells Koda: "Read workspaces from my git clone, not from `~/.kiro/steer-runtime/`".

Verify the changes work:

```bash
koda doctor
koda chat
```

### Step 3: Commit and push

Once validated, create a PR:

```bash
cd <steer-runtime-clone>
git checkout -b feat/update-connected-products-workspace
git add workspaces/connected-products-team/
git commit -m "feat(workspace): update connected-products-team configuration"
git push -u origin feat/update-connected-products-workspace
```

Create the PR on GitHub Enterprise and get it merged.

### Step 4: Team members sync

After the PR is merged and a new release is published, team members run:

```bash
koda sync --update
koda workspace apply connected-products-team
```

This downloads the latest tarball (which now includes your changes) and re-applies the workspace.

---

## Common Workspace Tasks

### Adding a new project

Add an entry to the `projects` array in `workspace.json`:

```json
{
  "name": "my-new-service",
  "path": "my-new-service",
  "repo": "EDT/my-new-service",
  "host": "github.disney.com",
  "memory_bank": "my-new-service"
}
```

| Field | Description |
|---|---|
| `name` | Display name for the project |
| `path` | Directory name relative to `workspace_path` (`${WORKSPACE_ROOT}/`) |
| `repo` | `org/repo` format — no host prefix |
| `host` | `github.disney.com` or `gitlab.disney.com` |
| `memory_bank` | Optional — defaults to `name` if omitted |

### Adding team context

Drop markdown files into `context/`. These get loaded into agents automatically when the workspace is active:

```bash
# Examples:
workspaces/connected-products-team/context/architecture.md
workspaces/connected-products-team/context/deployment_process.md
workspaces/connected-products-team/context/api_conventions.md
```

### Adding team rules

Add rule files to `rules/` for coding conventions agents should follow:

```bash
workspaces/connected-products-team/rules/java-conventions.md
workspaces/connected-products-team/rules/flutter-conventions.md
```

### Overriding agent behavior

Place agent JSON overrides in `profiles/<profile>/agents/`:

```bash
workspaces/connected-products-team/profiles/dev-core/agents/orchestrator.json
```

---

## Environment Setup

Ensure `WORKSPACE_ROOT` is set in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export WORKSPACE_ROOT=<your-workspace-root>
```

This is used by `workspace_path` in workspace.json (`${WORKSPACE_ROOT}/`) to resolve project paths.

---

## Setup for New Team Members

1. Clone the steer-runtime repo:
   ```bash
   git clone git@github.disney.com:EDT/steer-runtime.git <steer-runtime-clone>
   ```
2. Set the workspace root env var (add to `~/.zshrc`):
   ```bash
   export WORKSPACE_ROOT=<your-workspace-root>
   ```
3. Apply the workspace:
   ```bash
   koda --steer-root <steer-runtime-clone> workspace apply connected-products-team
   ```
4. Install MCP tokens:
   ```bash
   koda mcp-install
   ```
   You'll need: Jira PAT, Confluence PAT, GitHub PAT.
5. Verify:
   ```bash
   koda doctor
   ```
6. Start chatting:
   ```bash
   koda chat
   ```

---

## Useful Commands

```bash
# Apply workspace (from local clone)
koda --steer-root <steer-runtime-clone> workspace apply connected-products-team

# Apply workspace (from installed copy — after your changes are released)
koda workspace apply connected-products-team

# Check health
koda doctor

# List available agents
koda agents

# Initialize memory bank for a project
koda init-memory <your-workspace-root>/cpx-task-manager-api

# Sync latest steer-runtime release
koda sync --update

# Chat with a specific agent
koda chat --agent orchestrator
koda chat --agent backend
koda chat --agent flutter
```
