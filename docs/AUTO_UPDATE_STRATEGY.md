# Auto-update strategy

## Overview

Koda includes a self-update mechanism that checks for new versions and downloads them. This document explains how it works, how to control it, and the pre-release channel system.

---

## Update channels

| Channel | Who gets it | Flag | Version format | Example |
|---------|-------------|------|----------------|---------|
| **stable** (default) | All users | none (default) | `v0.4.225` | Final, certified releases |
| **pre-release** | Opt-in testers | `preRelease: true` | `v0.4.226-rc.1` | Release candidates for validation |

### How channels work

```text
Developer publishes:
  v0.4.226-rc.1  →  pre-release channel (GitHub pre-release flag)
  v0.4.226-rc.2  →  pre-release channel (fixes from rc.1 feedback)
  v0.4.226       →  stable channel (promoted from rc.2)
```

Users on **stable** (default) never see `-rc.*` versions. Users on **pre-release** get both.

---

## Auto-update behavior

### Scheduled auto-update

When enabled, Koda checks for updates daily at 9:00 AM (local time):

| Platform | Mechanism | Log location |
|----------|-----------|--------------|
| macOS | LaunchAgent (`com.koda.autoupdate`) | `/tmp/koda-autoupdate.log` |
| Linux | cron (`0 9 * * *`) | `/tmp/koda-autoupdate.log` |
| Windows | Task Scheduler (`KodaAutoUpdate`) | `%TEMP%\koda-autoupdate.log` |

The scheduled job runs:
```bash
koda upgrade --skip-tools    # update binary only (EDR safe)
koda sync --update --skip-dirty   # update steer-runtime
```

### Manual update

```bash
koda upgrade              # full upgrade (binary + tools)
koda upgrade --skip-tools # binary only (safe for corporate EDR)
```

---

## Commands

### Enable/disable auto-update

```bash
koda auto-update enable   # register daily job
koda auto-update disable  # remove daily job
koda auto-update status   # check current state
```

### Switch to pre-release channel

```bash
koda configure set preRelease true    # opt into pre-releases
koda configure set preRelease false   # back to stable only
```

Or in `~/.kiro/settings/steer.json`:
```json
{
  "preRelease": true
}
```

### Check current version and channel

```bash
koda version         # shows: v0.4.225 (stable)
koda version         # shows: v0.4.226-rc.1 (pre-release)
```

---

## Pre-release workflow

### For maintainers: publishing a pre-release

```bash
# 1. Tag a release candidate
make publish TAG=v0.4.226-rc.1 PRERELEASE=1

# 2. After validation, promote to stable
make promote TAG=v0.4.226-rc.1
# This creates v0.4.226 (stable) from the same commit
```

### For testers: opting in

```bash
# Enable pre-release channel
koda configure set preRelease true

# Upgrade will now pull rc versions
koda upgrade
# → Downloaded v0.4.226-rc.1
```

### For testers: reporting issues

Pre-release users should report issues via:
- `koda feedback` (submits directly to the team)
- Steer-runtime GitHub issues with label `pre-release`

### Promotion criteria

A release candidate is promoted to stable when:
1. Certification passes (`make certify` → trust score ≥ 90)
2. No critical bugs reported within 48 hours
3. At least 3 pre-release testers have used it

---

## EDR safety

All auto-update operations use `--skip-tools` to prevent downloading companion binaries (yax, prompt-scorer) in the background. This avoids corporate EDR quarantine.

Users who need the companion tools install them manually:
```bash
koda upgrade   # without --skip-tools (interactive, user-initiated)
```

---

## First-time setup

On first install (`koda sync` bootstrap), the user is asked:
```
Enable daily auto-update? (checks for new versions at 9 AM) [y/N]:
```

Auto-update is NOT enabled silently. The user must opt in.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Auto-update enabled but never updates" | Check log: `cat /tmp/koda-autoupdate.log` |
| "Machine quarantined after update" | Run: `koda upgrade --skip-tools` and `koda auto-update disable` |
| "Want pre-release but getting stable" | Set: `koda configure set preRelease true` then `koda upgrade` |
| "Want to go back to stable from RC" | Set: `koda configure set preRelease false` then `koda upgrade` |
| "Auto-update running old --skip-tools" | Re-register: `koda auto-update disable && koda auto-update enable` |
