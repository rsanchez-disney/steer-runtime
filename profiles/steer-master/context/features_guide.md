# Feature Gate System

Controls which TUI screens, keybindings, and CLI commands are enabled in Koda.

## Location

`internal/config/features.json` in the Koda repo. Embedded at build time via `//go:embed`.

## Schema

```json
{
  "tui": {
    "<feature_name>": true | false
  }
}
```

Unknown keys default to `true` (safe forward-compatible). The runtime check is `config.IsTUIEnabled(name)`.

## Current Features

| Key | Controls | Default |
|-----|----------|---------|
| `profiles` | Profiles screen + `[p]` keybinding | `true` |
| `agents` | Agents screen + `[a]` keybinding | `true` |
| `workspaces` | Workspaces screen + `[w]` keybinding | `true` |
| `rules` | Rules screen + `[r]` keybinding | `true` |
| `mcp` | MCP screen + `[m]` keybinding | `true` |
| `env_vars` | Env Vars screen + `[e]` keybinding | `true` |
| `kiro` | Kiro screen + `[k]` keybinding | `true` |
| `yax` | Yax screen + `[y]` keybinding | `true` |
| `sync` | Sync action + `[s]` keybinding | `true` |
| `doctor` | Doctor screen + `[d]` keybinding | `true` |
| `fork` | Fork/Unfork action + `[f]` keybinding | `true` |
| `reset` | Reset action + `[c]` keybinding | `true` |
| `chat` | Chat action + `[enter]` keybinding | `true` |
| `scorer` | Scorer/stats (alpha) | `false` |

## How to Toggle

1. Edit `internal/config/features.json` in the Koda repo
2. Rebuild: `make build` (or `make build TAGS=scorer` for full scoring)
3. Verify: `koda features`

**Changing the file requires rebuilding** — it's embedded at compile time, not read at runtime.

## Dual Gating: scorer

The `scorer` feature has two independent gates:

| Gate | Mechanism | What it does |
|------|-----------|-------------|
| Build tag `//go:build scorer` | Compile-time | Includes/excludes the `prompt-scorer` Go dependency |
| `features.json: scorer: false` | Runtime (embedded) | Hides the scorer UI and `koda stats` command |

Both must be enabled for full scoring: `make build TAGS=scorer` + `"scorer": true` in features.json.

## Adding a New Feature

1. Add key to `features.json` with initial value
2. Gate the TUI keybinding in `updateDashboard()` via the `keyFeature` map
3. Gate the dashboard menu item in `viewDashboard()` via the `menuEntry` list
4. Gate the CLI command with `config.IsTUIEnabled("key")` if needed
5. Run `koda features` to verify
