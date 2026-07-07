# Connected Products Team

Show Ready & SARG platform team — task management APIs, cast operations services, and the Big Belly mobile app for Walt Disney World connected products.

## Quick Start

```bash
# Apply the workspace
koda workspace apply connected-products-team

# Configure MCP tokens (Jira, Confluence, Compass)
koda mcp-install

# Start working
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

The `splunk_query_agent` (from dev-core profile) automatically loads `splunk_services.md` from this workspace's context. It knows how to query:


## Setup for New Team Members

1. **Clone the steer-runtime fork** (or upstream if no fork yet):
   ```bash
   git clone git@github.disney.com:SANCR225/steer-runtime.git
   cd steer-runtime
   ```

2. **Apply the workspace:**
   ```bash
   koda workspace apply connected-products-team
   ```

3. **Install MCP tokens** (you'll be prompted for PATs):
   ```bash
   koda mcp-install
   ```
   You'll need:
   - Jira PAT (for SHOWREADY/SARG projects)
   - Confluence PAT (team documentation)
   - Compass token (Splunk logs, ServiceNow)

4. **Verify setup:**
   ```bash
   koda doctor
   ```

5. **Start a chat session:**
   ```bash
   koda chat
   ```

## Useful Commands

```bash
# Switch to this workspace
koda workspace apply connected-products-team

# Check workspace health
koda doctor

# List available agents
koda agents

# Initialize memory bank for a project
koda init-memory ~/path/to/cpx-task-manager-api

# Sync with upstream steer-runtime
git fetch upstream && git merge upstream/main
```

See [Team Workspaces Guide](../../docs/reference/TEAM_WORKSPACES.md) for more on workspace configuration.
