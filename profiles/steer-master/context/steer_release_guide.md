# Steer Release Manager — Usage Guide

## Overview

The `steer_release_manager_agent` handles version bumps, release notes, changelog updates, and publishing for steer-runtime and Koda. It wraps `make publish-all` with an intelligence layer that determines correct version bumps and writes meaningful release notes.

> **Note:** This is distinct from the `release_manager_agent` in the `ops` profile, which handles generic project releases (tag comparison, Jira-linked notes, GitHub releases). This agent is specific to the steer-runtime/Koda toolchain.

Access it via the steer_orchestrator — it delegates automatically when it detects a release-related request.

---

## Prompt Examples

### Full Release (both repos)

```
cut a release for steer-runtime and koda
```

The agent will:
1. Analyze commits since last tag in both repos
2. Determine bump type for each (PATCH/MINOR/MAJOR)
3. Generate RELEASE_NOTES.md and CHANGELOG.md updates
4. Show summary and wait for approval
5. Execute `make publish-all` or manual override

---

### Single Repo Release

```
prepare a release for steer-runtime
```

```
release koda only
```

---

### Explicit Bump Type

When you know the release warrants more than a PATCH:

```
cut a minor release — we added the inspector profile and release manager agent
```

```
this is a major release — we renamed the workspace schema fields
```

---

### Preview / Dry Run

See what would ship without actually publishing:

```
what would the next release look like?
```

```
show me changes since last tag for both repos
```

```
generate release notes for the next version but don't publish yet
```

---

### Hotfix

For urgent patches that need to ship immediately:

```
hotfix release for koda — the MCP toggle fix needs to ship now
```

The agent will:
1. Branch from the latest tag
2. Cherry-pick or verify the fix is on main
3. Bump PATCH
4. Publish only that repo

---

### Release Notes Only

When you want to update notes without publishing:

```
update RELEASE_NOTES.md for the upcoming release
```

```
move the unreleased changelog entries into a new version section
```

---

### Post-Release Verification

```
verify the last release — check GitHub releases exist and koda upgrade shows the notes
```

---

### Release History

```
what was in the last 3 releases?
```

```
when did we last release steer-runtime?
```

The agent queries yax for release history it has tracked.

---

## What the Agent Does vs. What You Do

| Step | Agent | You |
|------|-------|-----|
| Analyze commits | ✅ Categorizes feat/fix/breaking | |
| Determine version | ✅ Proposes bump type | Override if needed |
| Write release notes | ✅ Curated summaries | Review for accuracy |
| Update CHANGELOG | ✅ Grouped entries with PR refs | |
| Approval gate | | ✅ Say "go ahead" or request changes |
| Execute publish | ✅ Runs make targets | |
| Verify | ✅ Checks GitHub releases | |
| Track in yax | ✅ Saves release record | |

---

## Tips

- **Always review the release notes preview** — the agent summarizes commits but may miss nuance
- **Say "minor" or "major" upfront** if you know — saves the back-and-forth
- **For breaking changes**, the agent will flag them and ask for migration notes before proceeding
- **If `make publish-all` fails** (network, auth), the agent will show the error and suggest retry or manual steps
- **The agent never publishes without approval** — even in autopilot mode, the approval gate is mandatory for releases
