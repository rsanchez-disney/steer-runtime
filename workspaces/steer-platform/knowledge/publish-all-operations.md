# publish-all operational notes

## Pipeline execution summary (v0.2.156 / v0.4.224)

### Timing (2026-07-10)

| Phase                   | Duration |
|-------------------------|----------|
| Pre-flight              | ~5s      |
| Koda cross-compile      | ~45s     |
| yax + prompt-scorer     | ~30s     |
| steer.vsix build        | ~10s     |
| Koda release + verify   | ~15s     |
| steer-runtime validate  | ~20s     |
| MCP bundle build (20)   | ~60s     |
| pack-steer (125MB)      | ~3min    |
| Upload + verify         | ~30s     |
| Total                   | ~6min    |

### Key observations

- `pack-steer` runs TWICE: once explicitly in publish-all, once as a dependency of `publish-steer`. Redundant but harmless (~3min wasted). Could optimize by removing the explicit call.
- The tarball is 125MB — this is because `dist/index.cjs` bundles are included for all 20 MCP servers. Source is excluded but bundles are large.
- `yax v0.3.5 already built — skipping` means yax hasn't changed since last build. The check is fast.
- steer.vsix is 16KB — tiny, just the VS Code extension shell.

### Artifacts produced per release

| Repo            | Assets                                                    |
|-----------------|-----------------------------------------------------------|
| Koda            | 5 binaries + 5 yax + 5 prompt-scorer + steer.vsix = 16   |
| steer-runtime   | 1 encrypted tarball + 1 sha256 checksum = 2              |

### Things that can go wrong

1. **GitHub rate limit** — if you run publish-all too frequently, `gh release create` can 429. Wait 5 minutes.
2. **yax source missing** — if `~/Workspace/Disney/SANCR225/yax` doesn't exist, yax-cross fails. Run `make yax-fetch` first.
3. **prompt-scorer tests fail** — blocks the entire pipeline. Fix tests first.
4. **steer-runtime validation warnings** — 20 workspace warnings + 3 agent warnings are normal (known tech debt). Only `❌` errors block.
5. **docs-deploy fails** — non-blocking warning but docs won't update on GitHub Pages.

### GitHub CLI auth requirements

Two hosts must be authenticated:

```bash
GH_HOST=github.disney.com gh auth status   # Private repos
GH_HOST=github.com gh auth status          # Public mirrors
```

If either is expired, the relevant publish step will fail with 401.
