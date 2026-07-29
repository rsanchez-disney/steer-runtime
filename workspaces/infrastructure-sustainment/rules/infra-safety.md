---
inclusion: always
description: Safety guardrails for infrastructure operations
---

# Infrastructure safety rules

## Change management

- No production changes without an approved CHG ticket
- All changes must have a rollback plan documented before execution
- Validate the target environment (nonprod vs prod) before any write operation

## Cloud CLI safety

- Prefer read-only commands first (`describe`, `list`, `get`)
- Use `--dry-run` when available before applying changes
- Never use `--force` flags without explicit user confirmation
- Always specify `--region` / `--project` / `--profile` explicitly (never rely on defaults)

## Akamai safety

- Cache purge is irreversible — confirm URL patterns with the user before executing
- Property activations require user confirmation and a CHG reference
- Never modify WAF rules without security team sign-off

## Incident response

- During active incidents, read-only operations are pre-approved
- Write operations during incidents require verbal confirmation from the user
- Document all commands executed during incident response in the BEAN ticket
