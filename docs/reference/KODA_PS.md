# koda ps — process management

List, monitor, and kill kiro-cli, cursor, and MCP server processes.

---

## Usage

```bash
koda ps              # List all running processes
koda ps --kill       # Kill sessions, sub-agents, and MCP servers
koda ps --kill nuke  # Kill EVERYTHING (sessions, daemons, MCP, cursor, tray)
```

---

## Output

```text
PID           MEM  NAME                     TYPE       AGE
53469      44.6 MB  kiro-cli                 daemon     1h 41m
53476      26.9 MB  kiro-cli-chat            session    1h 41m
55984      24.8 MB  cursor                   other      1h 32m
53494       7.2 MB  chrome-mcp-mcp           mcp        1h 41m

Total: 242.6 MB across 19 processes (6 kiro, 2 cursor, 11 mcp)
System: 32 GB RAM — standard tier (max 4 agents)
```

### Columns

| Column | Description                                              |
|--------|----------------------------------------------------------|
| PID    | Operating system process ID                              |
| MEM    | Resident memory (RSS) in megabytes                       |
| NAME   | Process display name (derived from command args)         |
| TYPE   | Classification: session, daemon, sub-agent, mcp, other   |
| AGE    | Elapsed time since process started                       |

### Color coding

| Color  | Meaning                                        |
|--------|------------------------------------------------|
| Green  | Kiro processes (sessions, daemons)             |
| Cyan   | Cursor processes                               |
| Dim    | MCP servers and background daemons             |
| Yellow | Age > 48h (stale warning)                      |
| Red    | Age > 200h (very stale)                        |

---

## Process types

| Type      | Description                                  | Example                          |
|-----------|----------------------------------------------|----------------------------------|
| session   | Active chat session (kiro-cli or cursor)     | `kiro-cli-chat`, `cursor-agent`  |
| sub-agent | Child process spawned by a session           | Subagent delegations             |
| daemon    | Background kiro-cli process (non-chat)       | `kiro-cli` (workspace watchers)  |
| mcp       | MCP server process                           | `jira-mcp`, `github-mcp`        |
| tray      | System tray daemon                           | `kiro-cli tray`                  |
| other     | Unclassified cursor/kiro-related process     | `cursor` (non-agent)             |

---

## Kill filters

```bash
koda ps --kill [filter]
```

| Filter   | What it kills                                      | What it skips              |
|----------|----------------------------------------------------|-----------------------------|
| *(none)* | Same as `all`                                      | —                           |
| `all`    | Sessions, sub-agents, MCP servers                  | Daemons, tray, cursor other |
| `nuke`   | Everything — no exceptions                         | Nothing                     |
| `kiro`   | Only processes with "kiro" in name                 | Cursor, MCP                 |
| `cursor` | Only processes with "cursor" in name               | Kiro, MCP                   |
| `mcp`    | Only MCP server processes                          | Sessions, daemons, cursor   |

### Behavior

- **Sessions** receive `SIGTERM` first, with a 5-second grace period for memory save, then `SIGKILL` if still running
- **All other processes** receive `SIGKILL` immediately
- The current `koda ps` process is never killed (self-protection)
- On Windows, `taskkill /F` is used for all process types

---

## When to use each filter

| Scenario                                               | Command               |
|--------------------------------------------------------|-----------------------|
| Clean up after a normal work session                   | `koda ps --kill`      |
| Full reset — something is stuck or memory is high      | `koda ps --kill nuke` |
| Kill only cursor sessions (keep kiro running)          | `koda ps --kill cursor` |
| Kill only MCP servers (restart them fresh)             | `koda ps --kill mcp`  |
| Kill only kiro sessions (keep cursor running)          | `koda ps --kill kiro` |

---

## System profile

The summary line shows your system tier based on available RAM:

| Tier     | RAM     | Max concurrent agents |
|----------|---------|:---------------------:|
| minimal  | ≤ 8 GB  |           1           |
| standard | ≤ 32 GB |           4           |
| power    | > 32 GB |           8           |

---

## Stale process warnings

Processes running longer than 48 hours trigger a warning:

```text
⚠ 3 process(es) running > 48h — consider: koda ps --kill
```

These are typically orphaned sessions from previous work that were never terminated. They consume memory but provide no value.

---

## Integration with other commands

| Command          | Relationship to `koda ps`                                    |
|------------------|--------------------------------------------------------------|
| `koda upgrade`   | Calls `CleanStaleProcesses()` before upgrading the binary    |
| `koda chat`      | Spawns a new session (shows as `kiro-cli-chat`)              |
| `koda mcp-install` | Restarts MCP servers (old ones appear stale in `koda ps`)  |
| `koda doctor`    | Reports process health alongside MCP and token status        |

---

## Examples

List processes sorted by memory usage:

```bash
koda ps
```

Kill everything and start fresh:

```bash
koda ps --kill nuke
```

Check if any MCP servers are running:

```bash
koda ps | grep mcp
```
