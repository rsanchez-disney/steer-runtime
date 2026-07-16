# Spec: Database MCP server (JDBC connections)

## Overview

An MCP server that provides agents with read-only database access via named connections. Agents can register connections conversationally (natural language or JDBC URL parsing) and query databases to investigate incidents, validate data, or support development.

## Design principles

- **Read-only by default** — no accidental writes
- **Password never visible to agent** — stored in OS keychain, never in config or chat
- **Agent manages connections** — natural language or JDBC URL parsing
- **Auditable** — every query logged with timestamp, connection, SQL, row count

---

## Connection registration

### Natural language (agent parses intent)

```
User: "connect to the payments database at payments-db.internal:5432, user readonly_svc"

Agent → db_add_connection:
  name: "payments"
  driver: "postgresql"
  host: "payments-db.internal"
  port: 5432
  database: "payments"
  username: "readonly_svc"

MCP server → prompts user for password (secure, not through agent)
MCP server → stores password in OS keychain
MCP server → tests connection
MCP server → returns: "✓ Connection 'payments' added (PostgreSQL 15.2, read-only)"
```

### JDBC URL parsing

```
User: "connect to jdbc:postgresql://payments-db.internal:5432/payments?user=readonly_svc&ssl=true"

Agent → db_add_connection:
  name: "payments"
  jdbc_url: "jdbc:postgresql://payments-db.internal:5432/payments?user=readonly_svc&ssl=true"

MCP server → parses URL into components
MCP server → extracts password if present (removes from config, stores in keychain)
MCP server → tests connection
MCP server → returns: "✓ Connection 'payments' added"
```

### Supported JDBC formats

```
jdbc:postgresql://host:5432/dbname?user=X&password=Y&ssl=true
jdbc:mysql://host:3306/dbname?user=X&password=Y
jdbc:sqlserver://host:1433;databaseName=db;user=X;password=Y
jdbc:oracle:thin:@host:1521:SID
jdbc:sqlite:/path/to/file.db
```

---

## MCP tools

| Tool | Description | Safety |
|------|-------------|--------|
| `db_add_connection` | Register a new database connection | Stores config + password in keychain |
| `db_remove_connection` | Remove a connection | Deletes config + keychain entry |
| `db_list_connections` | List available connections (no passwords shown) | Safe |
| `db_test_connection` | Verify a connection works | Read-only connect + disconnect |
| `db_query` | Execute a SELECT query | Read-only, row-limited, timeout-enforced |
| `db_schema` | Show table/column definitions | Read-only metadata query |
| `db_tables` | List tables in a database | Read-only |
| `db_explain` | Show query execution plan | Read-only EXPLAIN |

### Tool schemas

#### db_add_connection

```json
{
  "name": "db_add_connection",
  "description": "Register a new database connection. Accepts either individual fields or a JDBC URL.",
  "inputSchema": {
    "properties": {
      "name": { "type": "string", "description": "Connection name (e.g., 'payments-prod')" },
      "jdbc_url": { "type": "string", "description": "JDBC connection string (alternative to individual fields)" },
      "driver": { "type": "string", "enum": ["postgresql", "mysql", "sqlserver", "oracle", "sqlite"], "description": "Database driver" },
      "host": { "type": "string" },
      "port": { "type": "number" },
      "database": { "type": "string" },
      "username": { "type": "string" },
      "read_only": { "type": "boolean", "default": true },
      "label": { "type": "string", "description": "Human-friendly description" }
    },
    "required": ["name"]
  }
}
```

#### db_query

```json
{
  "name": "db_query",
  "description": "Execute a read-only SQL query against a named connection. Returns up to max_rows results.",
  "inputSchema": {
    "properties": {
      "connection": { "type": "string", "description": "Connection name" },
      "query": { "type": "string", "description": "SQL SELECT query" },
      "max_rows": { "type": "number", "description": "Override max rows (default from connection config)" }
    },
    "required": ["connection", "query"]
  }
}
```

---

## Config file

`~/.kiro/settings/db-connections.json` — no passwords stored here:

```json
{
  "connections": {
    "payments-prod": {
      "driver": "postgresql",
      "host": "payments-db.internal.example.com",
      "port": 5432,
      "database": "payments",
      "username": "readonly_svc",
      "password_source": "keychain",
      "read_only": true,
      "max_rows": 100,
      "timeout_seconds": 30,
      "ssl": true,
      "blocked_tables": ["user_credentials", "api_keys", "tokens"],
      "allowed_schemas": ["public"],
      "label": "Payments Production (read-only)"
    }
  }
}
```

### Password sources

| Source | Format | Use case |
|--------|--------|----------|
| OS Keychain | `"password_source": "keychain"` | Default — interactive users |
| Environment variable | `"password_source": "env:VAR_NAME"` | CI, Docker, headless |
| Prompt at connect | `"password_source": "prompt"` | One-time queries |

---

## Security guardrails

| Guard | Behavior |
|-------|----------|
| Read-only enforcement | Wraps connection in `SET TRANSACTION READ ONLY` or uses read-only user |
| Query timeout | Kills query after `timeout_seconds` (default 30) |
| Row limit | Caps results at `max_rows` (default 100) |
| Table blocklist | Rejects queries touching `blocked_tables` |
| Schema allowlist | Only allows queries on `allowed_schemas` |
| DDL rejection | Rejects CREATE, ALTER, DROP, TRUNCATE regardless of settings |
| DML rejection | Rejects INSERT, UPDATE, DELETE when `read_only: true` |
| No password in output | Password never appears in agent responses, tool results, or logs |
| Audit log | Every query logged to `~/.kiro/data/db-audit.jsonl` |

### Audit log format

```jsonl
{"ts":"2026-07-16T15:30:00Z","connection":"payments-prod","query":"SELECT count(*) FROM orders","rows":1,"duration_ms":45,"user":"SANCR225"}
```

---

## Implementation

### Files (in Koda)

| File | Purpose |
|------|---------|
| `internal/db/mcp.go` | MCP server (stdio JSON-RPC) |
| `internal/db/connections.go` | Config CRUD (add, remove, list, load) |
| `internal/db/executor.go` | Query execution with guardrails |
| `internal/db/jdbc_parser.go` | JDBC URL → config parsing |
| `internal/db/keychain.go` | OS keychain integration (store/retrieve passwords) |
| `internal/db/keychain_darwin.go` | macOS Keychain |
| `internal/db/keychain_windows.go` | Windows Credential Manager |
| `internal/db/keychain_linux.go` | Linux secret-service (D-Bus) |
| `internal/db/audit.go` | Query audit logger |
| `internal/cli/db.go` | `koda db mcp` subcommand to start server |

### Driver dependencies (Go)

| Driver | Package |
|--------|---------|
| PostgreSQL | `github.com/jackc/pgx/v5` |
| MySQL | `github.com/go-sql-driver/mysql` |
| SQL Server | `github.com/microsoft/go-mssqldb` |
| Oracle | `github.com/sijms/go-ora/v2` |
| SQLite | `github.com/mattn/go-sqlite3` (already have) |

### MCP registration

Auto-registered in `mcp.json` when connections exist:

```json
{
  "db": {
    "command": "koda",
    "args": ["db", "mcp"],
    "env": {}
  }
}
```

---

## Workspace-level connections

Teams can share connection configs (without passwords) in workspace.json:

```json
{
  "name": "my-team",
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

On `koda workspace apply`, these merge into the user's connection config.

---

## User flow examples

### Conversational setup

```
User: "I need to query the orders database. 
       Connection string: jdbc:postgresql://orders.prod.internal:5432/orders?user=svc_readonly&ssl=true"

Agent: I'll set up that connection for you.

→ db_add_connection(name="orders-prod", jdbc_url="jdbc:postgresql://...")

MCP: Please enter the password for svc_readonly@orders.prod.internal:
User: ****

Agent: ✓ Connection 'orders-prod' registered (PostgreSQL 16.1, read-only, 42 tables)
       What would you like to query?

User: "How many orders failed in the last hour?"

Agent: → db_query(connection="orders-prod", query="SELECT status, count(*) FROM orders WHERE created_at > now() - interval '1 hour' AND status = 'failed' GROUP BY status")

Result:
| status | count |
|--------|-------|
| failed | 23    |

Agent: There were 23 failed orders in the last hour. Want me to investigate the failure reasons?
```

### Incident investigation

```
User: "INC0012345 — checkout 500 errors. Check the payment_transactions table for the last 30 minutes"

Agent: → db_query(connection="payments-prod", query="SELECT status, error_code, count(*) FROM payment_transactions WHERE created_at > now() - interval '30 minutes' GROUP BY status, error_code ORDER BY count DESC LIMIT 20")
```

---

## Effort

| Phase | Work | Days |
|-------|------|:----:|
| JDBC parser + config CRUD | Parse URLs, read/write config | 1 |
| Keychain integration (macOS + env fallback) | Secure password storage | 1 |
| Query executor + guardrails | Read-only, timeout, row limit, blocklist | 1 |
| MCP server (stdio) | JSON-RPC, tool routing | 1 |
| PostgreSQL + MySQL drivers | First two drivers | 0.5 |
| Audit logger | JSONL logging | 0.5 |
| CLI (`koda db mcp`) + auto-registration | Start server, register in mcp.json | 0.5 |
| **Total** | | **5.5 days** |

### Follow-up (not in initial release)

- SQL Server + Oracle drivers
- PII masking (auto-redact email, phone, SSN columns)
- SSH tunnel support
- Connection pooling
- Query history (recent queries per connection)
- Windows Credential Manager + Linux secret-service keychain backends
