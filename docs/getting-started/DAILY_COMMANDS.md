# Daily commands cheat sheet

The essential commands for day-to-day work with steer-runtime. For full details, see the [Koda CLI Reference][koda-ref].

---

## Chat

```bash
koda chat                           # Default agent
koda chat --agent orchestrator      # SDLC orchestrator (multi-step work)
koda chat --agent code_review_agent # Direct specialist (focused tasks)
kiro-cli chat --resume              # Resume most recent session
kiro-cli chat --resume-picker       # Pick a session to resume
```

---

## Context window management

Use these slash commands inside an active chat session to manage what the LLM sees:

```bash
/context show                   # View context usage (% of window per category)
/context add README.md          # Add a file to the current session
/context add docs/*.md          # Add multiple files via glob
/context remove src/temp.py     # Remove a file from session context
/context clear                  # Clear all session-added context
/compact                        # Summarize older messages to free up space
```

| Command           | What it does                                                        |
|-------------------|---------------------------------------------------------------------|
| `/context show`   | Shows context window breakdown (files, tools, prompts, responses)   |
| `/context add`    | Temporarily adds files to the session (not persisted)               |
| `/context remove` | Removes a file from session context                                 |
| `/context clear`  | Clears all temporary session context                                |
| `/compact`        | Compresses conversation history, frees token space (creates new session) |

!!! tip "When to use `/compact`"
    Use it when the agent starts losing track of earlier instructions or when you get context overflow warnings. After compaction you can resume the original session via `kiro-cli chat --resume`.

!!! note "Session vs agent context"
    `/context` commands only affect temporary session context. To permanently change what files are loaded, edit the `resources` field in your agent JSON.

---

## Persistent memory (yax)

```bash
yax save "Title" "What you learned"   # Save a decision or discovery
yax search "query"                    # Search across all memories
yax context                           # Show recent context
```

Agents auto-save decisions. Use manual saves for things you want remembered across sessions. See [yax Architecture][yax-arch] for details.

---

## Keep agents up to date

```bash
koda sync       # Pull latest agents, steering, MCP configs
koda diff       # Preview what would change (dry-run)
koda upgrade    # Update Koda binary itself
```

---

## Health checks

```bash
koda status     # Quick overview: profiles, tokens, branch
koda doctor     # Deep check: dependencies, tokens, MCP servers
koda ps         # Running kiro processes and memory usage
```

---

## Workspace and profiles

```bash
koda workspace select <name>    # Switch team context
koda install <profile>          # Add a profile (e.g., qa, pm)
koda remove <profile>           # Remove a profile
koda list                       # Show all available profiles
```

---

## Quick reference table

| Task                     | Command                                |
|--------------------------|----------------------------------------|
| Start chat               | `koda chat`                            |
| Specific agent           | `koda chat --agent <name>`             |
| Resume session           | `kiro-cli chat --resume`               |
| Show context usage       | `/context show`                        |
| Add session context      | `/context add <file>`                  |
| Clear session context    | `/context clear`                       |
| Compact conversation     | `/compact`                             |
| Save memory              | `yax save "<title>" "<content>"`       |
| Search memory            | `yax search "<query>"`                 |
| Sync latest              | `koda sync`                            |
| Preview sync             | `koda diff`                            |
| Health check             | `koda doctor`                          |
| Status                   | `koda status`                          |
| Switch workspace         | `koda workspace select <name>`         |
| Run a skill              | `kiro-cli chat --prompt <skill>.md`    |

<!-- Links -->
[koda-ref]: ../reference/KODA_CLI_REFERENCE.md
[yax-arch]: ../memory/yax-architecture.md
