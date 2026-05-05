# Cross-Repo Development Patterns

## Making Changes Across Repos

Most features touch multiple repos. Follow this order:

### Pattern 1: New Agent or Profile
1. **steer-runtime** — add agent JSON, prompt, context files
2. **steer-runtime** — update AGENTS.md
3. **Koda** — if new MCP server needed, add to `knownServers`
4. **Test** — `koda install <profile>` + `kiro-cli chat --agent <name>`

### Pattern 2: New MCP Server
1. **steer-runtime** — add `shared/tools/mcp-servers/<name>/` with source + dist
2. **Koda** — add to `knownServers` if it needs tokens/env vars
3. **Koda** — add token to `KnownTokens` or env var to `KnownEnvVars`
4. **Test** — `koda mcp-install` + verify in mcp.json

### Pattern 3: Workspace Schema Change
1. **steer-runtime** — update workspace.json files
2. **Koda** — update `model.Workspace` struct (add fields with `omitempty`)
3. **Koda** — update `ApplyWorkspace` if new behavior needed
4. **Test** — `koda workspace apply <name>`

### Pattern 4: Hook Change
1. **steer-runtime** — update `.sh` file in `shared/hooks/`
2. **steer-runtime** — update matching `.ps1` file (Windows parity)
3. **Test** — `koda sync` + verify hook runs on agent spawn

### Pattern 5: IDE Plugin Feature
1. **steer-plugins** — implement in `vscode/src/` or `intellij/src/`
2. **steer-plugins** — build + tag release
3. **Koda** — `koda ide install vscode` picks up new release
4. **Test** — install extension, verify feature in IDE

### Pattern 6: Autopilot Pipeline Template
1. **steer-autopilot** — add YAML template
2. **steer-runtime** — ensure required agents exist in profiles
3. **Test** — `autopilot run <template> --jira <ticket>`

## PR Conventions

- **steer-runtime**: `feat(profile):`, `fix(mcp):`, `docs:` prefixes
- **Koda**: `feat(tui):`, `fix:`, `feat:` prefixes
- **steer-plugins**: `feat(vscode):`, `feat(intellij):` prefixes
- All repos use conventional commits

## Breaking Change Protocol

1. Add entry to `shared/memory-bank/steer-master/breaking-change-log.md`
2. If Koda model changes: add `omitempty` to new fields for backward compat
3. If ACP protocol changes: bump version, update all consumers
4. If hook format changes: update both `.sh` and `.ps1`

## Testing Across Repos

```bash
# After steer-runtime changes
koda sync                    # Re-install profiles
koda doctor                  # Verify everything healthy

# After Koda changes
go test ./...                # Unit tests
koda install dev-core        # Integration test
koda workspace apply <name>  # Workspace test

# After steer-plugins changes
cd vscode && npm run build   # Build extension
# F5 in VS Code to test      # Launch dev host
```
