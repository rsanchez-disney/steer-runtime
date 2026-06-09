# Spec: kiro-cli Feature Integration in Koda

## Objective

Close the gaps between kiro-cli features and Koda's CLI surface. Users should access all kiro-cli capabilities through Koda's unified interface, with workspace-awareness and steer-runtime conventions applied.

---

## Priority Matrix

| Priority | Feature | User Value | Effort |
|----------|---------|-----------|--------|
| P0 | MCP status health check | Diagnose broken MCP servers | Small |
| P0 | Agent validate | Catch config errors before apply | Small |
| P1 | Inline completions | AI shell completions for all users | Small (proxy) |
| P1 | Translate (NL→shell) | Quick command generation | Small (proxy) |
| P2 | MCP unification | Single source of truth for MCP config | Medium |
| P2 | Agent management | Create/edit agents from CLI | Medium |
| P3 | Doctor unification | Single diagnostic flow | Low priority |

---

## P0: MCP Status Health Check

### Problem
Users have no way to know if an MCP server is running/healthy. When an agent fails to use a tool, the root cause is hidden.

### Implementation

```
koda mcp status [server-name]
```

**Approach:** Proxy to `kiro-cli mcp status --name <server>` for individual checks. For bulk, iterate all configured servers.

**Changes:**
- `internal/cli/mcp.go` — add `mcpStatusCmd` (already exists at line 88 but may be incomplete)
- Call `kiro-cli mcp status --name <server>` for each server in mcp.json
- Display: `✓ server-name (connected, N tools)` or `✗ server-name (error: ...)`

**Output:**
```
$ koda mcp status
  ✓ jira          (connected, 8 tools)
  ✓ github        (connected, 12 tools)
  ✗ newrelic      (timeout — check NEW_RELIC_API_KEY)
  ✓ yax           (connected, 14 tools)
  ○ charles-mcp   (not started — workspace: sustainment-dcl)
```

---

## P0: Agent Validate

### Problem
Malformed agent JSON configs silently break. Users discover issues only at runtime when an agent fails to load.

### Implementation

```
koda agent validate [path-or-name]
```

**Approach:** Call `kiro-cli agent validate --path <path>` for the specified agent, or validate all agents in the active workspace.

**Changes:**
- `internal/cli/agent.go` (new file) — `agentValidateCmd`
- If no arg: validate all `~/.kiro/agents/*.json` + active workspace agents
- Show: field missing, invalid JSON, broken file:// references, unknown tools

**Output:**
```
$ koda agent validate
  ✓ orchestrator.json (valid)
  ✓ sustainment_orchestrator_agent.json (valid)
  ✗ my_custom_agent.json:
      - missing required field: default_agent
      - resource not found: file://.kiro/context/nonexistent.md
```

---

## P1: Inline Completions

### Problem
AI shell completions are available in kiro-cli but not discoverable/manageable through Koda.

### Implementation

```
koda inline enable    # enables AI shell completions
koda inline disable   # disables
koda inline status    # shows current state
```

**Approach:** Direct proxy to `kiro-cli inline <subcommand>`. No additional logic needed.

**Changes:**
- `internal/cli/inline.go` (new file) — proxy commands
- `internal/cli/root.go` — register `inlineCmd`
- During `koda setup`: prompt user "Enable AI shell completions? [y/n]" → call `kiro-cli inline enable`

**Code:**
```go
var inlineCmd = &cobra.Command{
    Use:   "inline",
    Short: "Manage AI shell completions (powered by kiro-cli)",
}

var inlineEnableCmd = &cobra.Command{
    Use: "enable",
    RunE: func(cmd *cobra.Command, args []string) error {
        return exec.Command(ops.FindKiroCLI(), "inline", "enable").Run()
    },
}
```

---

## P1: Translate (NL → Shell)

### Problem
`kiro-cli translate` is a useful feature not exposed through Koda.

### Implementation

```
koda translate "find all large files modified today"
# Output: find . -size +100M -mtime 0
```

**Approach:** Direct proxy to `kiro-cli translate <input>`.

**Changes:**
- `internal/cli/translate.go` (new file)
- Pass through stdin/stdout for interactive use
- Optional: `koda t` alias for quick access

**Code:**
```go
var translateCmd = &cobra.Command{
    Use:     "translate [natural language]",
    Aliases: []string{"t"},
    Short:   "Translate natural language to shell commands",
    RunE: func(cmd *cobra.Command, args []string) error {
        c := exec.Command(ops.FindKiroCLI(), append([]string{"translate"}, args...)...)
        c.Stdin, c.Stdout, c.Stderr = os.Stdin, os.Stdout, os.Stderr
        return c.Run()
    },
}
```

---

## P2: MCP Unification

### Problem
Koda manages mcp.json directly (`GenerateMcpJson`) while kiro-cli has its own `mcp add/remove/import`. They can conflict — kiro-cli additions get overwritten on next `koda mcp-install`.

### Implementation

**Approach:** Make Koda respect user-added servers when regenerating mcp.json.

**Current behavior:**
1. `koda mcp-install` regenerates mcp.json from scratch (known + fork + workspace servers)
2. Any server added via `kiro-cli mcp add` gets wiped

**Target behavior:**
1. `koda mcp-install` preserves a `_userAdded: true` section in mcp.json
2. Servers added via `kiro-cli mcp add` are tagged and preserved across regeneration
3. `koda mcp list` shows source: `global | fork | workspace | user`

**Changes:**
- `internal/ops/mcp.go` — in `GenerateMcpJson`, read existing mcp.json first, preserve entries with `_source: "user"`
- `koda mcp add` proxies to `kiro-cli mcp add` then tags the entry
- `koda mcp remove` proxies to `kiro-cli mcp remove`

---

## P2: Agent Management

### Problem
Creating agents requires manually writing JSON. kiro-cli has `agent create/edit` but it's not workspace-aware.

### Implementation

```
koda agent create my-agent          # interactive: pick profile, tools, prompt
koda agent edit orchestrator        # opens in $EDITOR
koda agent list                     # list all agents (workspace + global)
```

**Approach:** Wrap kiro-cli commands with workspace context.

**Changes:**
- `internal/cli/agent.go` — `agentListCmd`, `agentCreateCmd`, `agentEditCmd`
- `list`: discover from active workspace dir + global agents dir
- `create`: scaffold JSON + prompt .md, place in workspace dir
- `edit`: open agent JSON in `$EDITOR`, validate after save

---

## P3: Doctor Unification

### Problem
Both `koda doctor` and `kiro-cli doctor` exist. Users don't know which to run.

### Implementation

`koda doctor` should call `kiro-cli doctor` as part of its checks.

**Changes:**
- `internal/ops/doctor.go` — add a step that runs `kiro-cli doctor` and includes its output
- Present unified results

---

## Implementation Order

```
Sprint 1 (quick wins):
  ├── P0: koda mcp status (1 file, ~40 lines)
  ├── P0: koda agent validate (1 file, ~50 lines)
  ├── P1: koda inline enable/disable/status (1 file, ~30 lines)
  └── P1: koda translate (1 file, ~20 lines)

Sprint 2 (medium effort):
  ├── P2: MCP unification (modify GenerateMcpJson, ~100 lines)
  └── P2: koda agent create/edit/list (1 file, ~150 lines)

Sprint 3 (low priority):
  └── P3: Doctor unification (~20 lines addition)
```

---

## Success Criteria

- `koda mcp status` shows health of all configured servers
- `koda agent validate` catches malformed configs before runtime
- `koda inline enable` sets up AI shell completions in one command
- `koda translate` accessible without knowing about kiro-cli
- `koda mcp-install` preserves user-added servers
- Zero features require users to call kiro-cli directly (Koda is the unified entry point)
