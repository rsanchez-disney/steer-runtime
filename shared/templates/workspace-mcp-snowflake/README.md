# Snowflake MCP — Workspace Template

Adds a Snowflake data warehouse MCP server to your workspace. Agents can then query Snowflake using natural language.

## Setup

1. Copy this template to your workspace:

```bash
cp -r shared/templates/workspace-mcp-snowflake workspaces/<your-team>/mcp
```

2. Edit `defaults.env` with your team's Snowflake account and defaults.

3. Set the password in your tokens:

```bash
koda tokens set SNOWFLAKE_PASSWORD
```

4. Run `koda sync` to activate.

## Available tools (from snowflake-mcp)

- Execute SQL queries
- Browse databases, schemas, tables, views
- Describe table structures
- View sample data and row counts
- Explain query execution plans

## Security

- `SNOWFLAKE_READONLY=true` is set by default — agents cannot modify data
- Password stored in `~/.kiro/tokens.env` (never committed)
- Only warehouse/database/schema are in `defaults.env` (non-sensitive)

## Requirements

- Node.js 18+ (for npx)
- Snowflake account with read access
