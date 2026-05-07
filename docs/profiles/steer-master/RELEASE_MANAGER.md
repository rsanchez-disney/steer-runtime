# Steer Release Manager Agent

Manages the release lifecycle for **steer-runtime**, **Koda**, and **KiteStream** — version bumps, release notes, changelog updates, git tagging, and GitHub release creation.

## Release Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        make publish-all                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────┐
                    │   git pull --ff-only   │
                    │   (both repos)         │
                    └───────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                    ▼
     ┌──────────────┐   ┌────────────────┐   ┌──────────────┐
     │     Koda     │   │ steer-runtime  │   │  KiteStream  │
     └──────────────┘   └────────────────┘   └──────────────┘
              │                   │                    │
              ▼                   ▼                    ▼
     ┌──────────────┐   ┌────────────────┐   ┌──────────────┐
     │ Last tag:    │   │ Query public   │   │ Query public │
     │ git tag      │   │ gh release     │   │ gh release   │
     │ --sort       │   │ (github.com)   │   │ (github.com) │
     └──────────────┘   └────────────────┘   └──────────────┘
              │                   │                    │
              ▼                   ▼                    ▼
     ┌──────────────┐   ┌────────────────┐   ┌──────────────┐
     │ Commits      │   │ ⚠ Validate     │   │ Commits      │
     │ since tag?   │   │ v0.2.x scheme  │   │ since tag?   │
     └──────────────┘   └────────────────┘   └──────────────┘
         │    │                │    │              │    │
        >0   =0          PASS   FAIL            >0   =0
         │    │              │      │              │    │
         ▼    ▼              ▼      ▼              ▼    ▼
     ┌──────┐ skip    ┌────────┐ ┌─────┐    ┌──────┐ skip
     │PATCH │         │rev-parse│ │ABORT│    │PATCH │
     │bump  │         │locally? │ │ ❌  │    │bump  │
     └──────┘         └────────┘ └─────┘    └──────┘
         │                │    │                 │
         ▼              FOUND  NOT FOUND         ▼
     ┌──────────┐        │      │           ┌──────────┐
     │ cross-   │        ▼      ▼           │ npm build│
     │ compile  │   ┌────────┐ ┌─────┐     │ + pack   │
     │ koda     │   │count   │ │ABORT│     └──────────┘
     │ + yax    │   │commits │ │ ❌  │          │
     │ + scorer │   └────────┘ └─────┘          ▼
     │ + plugins│        │              ┌──────────────┐
     └──────────┘        ▼              │ tag + upload │
         │          ┌──────────┐        └──────────────┘
         ▼          │ MCP build│              │
     ┌──────────┐   │ (parallel)│             ▼
     │ tag +    │   └──────────┘        ┌──────────────┐
     │ gh release│       │              │ cleanup old  │
     │ create   │        ▼              │ (keep 3)     │
     └──────────┘   ┌──────────┐        └──────────────┘
         │          │ pack +   │
         ▼          │ encrypt  │
     ┌──────────┐   │ tarball  │
     │ cleanup  │   └──────────┘
     │ old      │        │
     │ (keep 3) │        ▼
     └──────────┘   ┌──────────┐
                    │ gh release│
                    │ upload   │
                    └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ cleanup  │
                    │ old      │
                    │ (keep 3) │
                    └──────────┘
```

## Version Scheme

| Repo | Internal (GHE) | Public (github.com) | Notes |
|------|----------------|---------------------|-------|
| steer-runtime | `v3.x.x` | `v0.2.x` | **Different schemes** — never publish internal version publicly |
| Koda | `v0.4.x` | `v0.4.x` | Same scheme |
| KiteStream | `v0.x.x` | `v0.x.x` | Same scheme |

## Prompt Examples

### Full Release (all repos)

```
cut a release for all repos
```

```
make publish-all — release everything with changes
```

```
publish steer-runtime and koda together
```

### Single Repo

```
release steer-runtime only
```

```
publish a new koda version
```

```
cut a kitestream release
```

### Explicit Bump Type

```
this is a minor release — we added the inspector profile and 3 new agents
```

```
major release — workspace schema changed, profiles field renamed
```

```
patch release — just prompt fixes and doc updates
```

### Preview / Dry Run

```
what would the next release look like?
```

```
show me changes since last tag for both repos
```

```
how many commits since last release?
```

```
generate release notes but don't publish yet
```

### Hotfix

```
hotfix release for koda — the MCP toggle fix needs to ship now
```

```
emergency patch for steer-runtime — broken confluence-mcp bundle
```

### Release Notes Only

```
update RELEASE_NOTES.md for the upcoming release
```

```
write changelog entries for the commits since v0.2.72
```

### Post-Release Verification

```
verify the last release has binaries uploaded
```

```
check if v0.4.123 has all expected assets
```

### Cleanup

```
delete the broken v3.9.0 release from the public steer-runtime repo
```

```
clean up old releases, keep only the last 3
```

## Safety Guards

The `publish-all` Makefile target includes two guards for steer-runtime:

1. **Version scheme validation** — aborts if the public repo's latest release doesn't match `v0.2.x`
2. **Tag resolution check** — aborts if the public release tag can't be found in the local GHE clone (instead of silently proceeding with a bogus commit count)

## Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| `make publish-steer TAG=v3.9.0` | `make publish-all` (auto-detects correct version) |
| `git tag` before `make release` | Let Make targets create tags internally |
| `gh release create` directly | Use Make targets which handle cross-compilation |
| Assume release succeeded | Always verify asset count > 0 |
| Leave broken release live | Delete release + tag from all remotes immediately |
