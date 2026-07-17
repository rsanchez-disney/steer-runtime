# Database MCP — Quick Start

Query databases directly from your AI agent. Read-only by default, passwords stored securely in OS keychain.

## Supported databases

| Database | JDBC prefix | Driver |
|----------|-------------|--------|
| PostgreSQL | `jdbc:postgresql://` | pgx |
| MySQL | `jdbc:mysql://` | mysql |
| MariaDB | `jdbc:mariadb://` | mysql (compatible) |
| SQL Server | `jdbc:sqlserver://` | mssql |
| Oracle | `jdbc:oracle:thin:@` | oracle |
| SQLite | `jdbc:sqlite:` | sqlite3 |

## Setup

### Option 1: CLI

```bash
# Add a connection with JDBC URL
koda db add payments --jdbc 'jdbc:postgresql://db.example.com:5432/payments?user=readonly_svc&ssl=true'
# Password: **** (prompted securely)

# Verify it works
koda db list
koda db test payments  # (coming soon)
```

### Option 2: Let the agent do it

Just tell the agent in chat:

```
"Connect to jdbc:postgresql://payments-db.internal:5432/payments?user=svc_readonly&ssl=true"
```

The agent calls `db_add_connection`, prompts you for the password, and stores everything securely.

### Option 3: Environment variable for password

For CI/Docker where keychain isn't available:

```bash
export PAYMENTS_DB_PASSWORD=mysecret
```

Then in the connection config, set `password_source` to `env:PAYMENTS_DB_PASSWORD`.

## Using in chat

Once a connection is registered, the agent can query it:

```
"How many orders failed in the last hour?"
→ db_query(connection="payments", query="SELECT status, count(*) FROM orders WHERE ...")

"Show me the schema of the users table"
→ db_schema(connection="payments")

"What tables are in the orders database?"
→ db_tables(connection="orders-prod")

"Explain this slow query"
→ db_explain(connection="payments", query="SELECT * FROM orders WHERE ...")
```

## Available tools

| Tool | What it does |
|------|-------------|
| `db_add_connection` | Register a new connection (JDBC URL or individual fields) |
| `db_remove_connection` | Delete a connection and its stored password |
| `db_list_connections` | Show all connections (no passwords shown) |
| `db_test_connection` | Verify a connection works |
| `db_query` | Run a SELECT query (read-only, row-limited, timeout-enforced) |
| `db_schema` | Show table/column definitions |
| `db_tables` | List all tables |
| `db_explain` | Show query execution plan |

## Security

### What's enforced

- **Read-only by default** — INSERT/UPDATE/DELETE blocked unless explicitly enabled
- **DDL always blocked** — CREATE/ALTER/DROP/TRUNCATE never allowed
- **Row limit** — max 100 rows returned (configurable per connection)
- **Timeout** — queries killed after 30 seconds (configurable)
- **Table blocklist** — sensitive tables can be excluded from all queries
- **Schema allowlist** — restrict queries to specific schemas
- **Audit log** — every query logged to `~/.kiro/data/db-audit.jsonl`

### Where passwords are stored

| Platform | Storage |
|----------|---------|
| macOS | macOS Keychain (via `security` CLI) |
| Linux/Windows | `~/.kiro/data/db-secrets` (file, 0600 permissions) |
| CI/Docker | Environment variables (`password_source: "env:VAR_NAME"`) |

Passwords are **never**:
- Written to `db-connections.json`
- Shown in agent responses
- Included in audit logs

## Configuration

Connections stored at `~/.kiro/settings/db-connections.json`:

```json
{
  "connections": {
    "payments": {
      "driver": "postgresql",
      "host": "db.example.com",
      "port": 5432,
      "database": "payments",
      "username": "readonly_svc",
      "password_source": "keychain",
      "read_only": true,
      "max_rows": 100,
      "timeout_seconds": 30,
      "ssl": true,
      "blocked_tables": ["user_credentials", "api_keys"],
      "allowed_schemas": ["public"]
    }
  }
}
```

### Configuration options

| Field | Default | Description |
|-------|---------|-------------|
| `driver` | — | postgresql, mysql, sqlserver, oracle, sqlite |
| `host` | — | Database hostname |
| `port` | auto | Port (defaults: pg=5432, mysql=3306, mssql=1433, oracle=1521) |
| `database` | — | Database name |
| `username` | — | Username |
| `password_source` | keychain | Where to get password: `keychain`, `env:VAR`, `prompt` |
| `read_only` | true | Block write operations |
| `max_rows` | 100 | Maximum rows returned per query |
| `timeout_seconds` | 30 | Query timeout |
| `ssl` | false | Use SSL/TLS connection |
| `blocked_tables` | [] | Tables that cannot be queried |
| `allowed_schemas` | [] | Only allow queries on these schemas (empty = all) |

## CLI commands

```bash
koda db list                    # Show all connections
koda db add <name> --jdbc <url> # Register from JDBC URL
koda db remove <name>           # Delete connection + credentials
koda db mcp                     # Start MCP server (used internally)
```

## Workspace connections

Teams can share connection configs (without passwords) in `workspace.json`:

```json
{
  "db_connections": {
    "stage-orders": {
      "driver": "mysql",
      "host": "orders-stage.internal",
      "database": "orders",
      "username": "team_readonly",
      "password_source": "env:STAGE_DB_PASSWORD",
      "read_only": true
    }
  }
}
```

Each team member sets their own `STAGE_DB_PASSWORD` environment variable.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "password not found" | Run `koda db add <name> --jdbc <url>` again to re-store password |
| "connection refused" | Check host/port, VPN, firewall |
| "query rejected: DDL" | DDL (CREATE/ALTER/DROP) is never allowed |
| "query rejected: write" | Connection is read-only; can't INSERT/UPDATE/DELETE |
| "table blocked" | Table is in `blocked_tables` list |
| "timeout" | Query took longer than `timeout_seconds` — optimize or increase limit |
