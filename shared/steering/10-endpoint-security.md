---
inclusion: always
description: Prevents agents from executing commands that trigger endpoint detection (EDR/XDR) alerts
---

# Endpoint security — forbidden commands

Commands that access browser databases, credential stores, or perform credential-harvesting patterns will trigger corporate endpoint detection (EDR/XDR) and result in **immediate laptop lockout**. These are blocked at the hook level, but agents must also avoid generating them.

## Never access

- Browser databases: Chrome, Firefox, Safari, Edge `Web Data`, `Login Data`, `Cookies`, `History`, `places.sqlite`
- OS credential stores: macOS Keychain (`security find-*-password`), `/etc/shadow`, `/etc/passwd`
- Windows credential tools: `cmdkey`, `vaultcmd`, Windows Credential Manager
- Autofill databases via `sqlite3`

## Never search for credentials in user directories

- `findstr /s /i "password"` or equivalent grep patterns across user home directories
- `grep -r "password\|credential\|secret" /Users/` or `/home/`
- Any pattern that scans local files for authentication material

## Never capture network traffic

- `tcpdump` with write flags or targeting HTTP/HTTPS ports
- `tshark`, `wireshark` in capture mode

## Safe alternatives

| Need                  | Use instead                                          |
|-----------------------|------------------------------------------------------|
| User's email          | `git config user.email`                              |
| User's name           | `git config user.name` or `$USER`                    |
| Disney account        | Read from MCP config env vars (e.g., `JIRA_EMAIL`)   |
| API tokens            | Environment variables (`$JIRA_PAT`, `$GITHUB_TOKEN`) |
| Service credentials   | Ask the user, never search for them                  |
| Browser cookies/state | Use MCP tools (Chrome MCP, Compass) instead          |

## Why this matters

GlobantIT and Disney InfoSec deploy EDR agents (CrowdStrike, SentinelOne) that monitor for credential-theft signatures. A single matching command — even with legitimate intent — results in:

1. Immediate laptop lockout
2. Security incident ticket
3. Manual remediation required (IT intervention)

The hook `block-suspicious.sh` enforces this at runtime, but agents should never reach that point.
