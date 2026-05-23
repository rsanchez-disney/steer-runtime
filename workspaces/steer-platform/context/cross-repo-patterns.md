# Cross-Repo Development Patterns

## Making Changes Across Repos

Most features touch multiple repos. Follow this order:

### Pattern 1: New Agent or Profile
1. **steer-runtime** — add agent JSON, prompt, context files
2. **steer-runtime** — update AGENTS.md, run `setup.sh sync`
3. **Koda** — if new MCP server needed, add to `knownServers`
4. **Test** — `koda install <profile>` + `kiro-cli chat --agent <name>`

### Pattern 2: New MCP Server
1. **steer-runtime** — add `shared/tools/mcp-servers/<name>/` with source + dist + mcp-meta.json
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

### Pattern 6: Kite Feature
1. **Kite** — implement in packages/main (backend) or packages/renderer (UI)
2. **Kite** — if new runtime dep, add to BOTH packages/main/package.json AND root package.json
3. **Test locally** — `make package && open out/mac-arm64/Kite.app`
4. **Deploy** — push to main, Koda rebuilds via `make package-all`
5. **Install** — `koda apps update kite && koda apps start kite`

### Pattern 7: Koda App Marketplace
1. **Koda** — add app to `internal/apps/catalog.go`
2. **App repo** — ensure `make package-all` produces encrypted artifacts in `bin/`
3. **App repo** — `make release TAG=v0.x.x` publishes to github.com
4. **Test** — `koda apps install <name> && koda apps start <name>`

## PR Conventions

- **steer-runtime**: `feat(profile):`, `fix(mcp):`, `docs:` prefixes
- **Koda**: `feat(tui):`, `feat(apps):`, `fix:` prefixes
- **Kite**: `feat:`, `fix:`, `docs:` prefixes
- **steer-plugins**: `feat(vscode):`, `feat(intellij):` prefixes
- All repos use conventional commits

## Breaking Change Protocol

1. Add entry to `shared/memory-bank/steer-master/breaking-change-log.md`
2. If Koda model changes: add `omitempty` to new fields for backward compat
3. If ACP protocol changes: bump version, update all consumers
4. If hook format changes: update both `.sh` and `.ps1`
5. If Kite IPC changes: update shared types package

## Testing Across Repos

```bash
# After steer-runtime changes
koda sync                    # Re-install profiles
koda doctor                  # Verify everything healthy

# After Koda changes
go test ./...                # Unit tests
koda install dev-core        # Integration test
koda workspace apply <name>  # Workspace test

# After Kite changes
cd Kite && make package      # Build packaged app
open out/mac-arm64/Kite.app  # Test locally
# Verify: no ERR_MODULE_NOT_FOUND errors

# After steer-plugins changes
cd vscode && npm run build   # Build extension
# F5 in VS Code to test      # Launch dev host
```

## Common Pitfalls

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `ERR_MODULE_NOT_FOUND` in Kite | Dep in packages/main but not root package.json | Add to root deps |
| `koda apps start` crash | Stale binary, missing native modules | `koda apps update --force` |
| Agent not found after profile change | `setup.sh sync` not run | `koda sync` |
| MCP server not connecting | Token not in tokens.env | `koda tokens set <name>` |
| Version tag conflict | Publishing to wrong repo | Use `make publish-all` only |
