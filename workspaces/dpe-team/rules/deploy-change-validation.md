# Deploy Change Validation — DB & Nimbus Change Log Gate

## Purpose

Every PR that introduces DB schema changes or Nimbus/env variable changes MUST have a corresponding entry in the DPE wiki change logs. If not documented, flag as 🔴 CRITICAL in the code review.

## Wiki References

- **DB Change Log:** https://disneyexperiences.atlassian.net/wiki/spaces/DPE/pages/220922981/DB+Change+log
- **Nimbus Change Log:** https://disneyexperiences.atlassian.net/wiki/spaces/DPE/pages/220922983/Nimbus+change+log

## Detection Patterns

### DB Changes — flag if PR contains:
- SQL migration files (Flyway `V*.sql`, Liquibase changelogs)
- New/modified JPA entity annotations (`@Column`, `@Table`, `@Entity`)
- Schema version references (e.g., `7.xx`)
- DDL statements (`CREATE TABLE`, `ALTER TABLE`, `ADD COLUMN`, `DROP`)

### Nimbus/Env Variable Changes — flag if PR contains:
- New/modified entries in `application.yml`, `application.properties`, `nimbus_config.yaml`, `nimbus_cfg.json`
- New `@Value("${...}")` annotations referencing undocumented properties
- New `ENABLE_*` or `dpe.*` feature toggles
- New environment variable references (`System.getenv`, `process.env`)
- Spring config changes (`spring.datasource.*`, `resilience4j.*`, `spring.graphql.*`)

## Review Action

When a change is detected:

1. **Check the Jira ticket** linked to the PR
2. **Verify documentation exists** in the corresponding wiki change log for that ticket
3. If NOT documented, add this alert to the review:

```
🔴 CRITICAL — Undocumented infrastructure change

**Type:** [DB Change | Nimbus/Env Variable Change]
**File:** <file path>
**Change:** <description of what was added/modified>
**Jira Ticket:** <ticket from PR>

⚠️ This change is NOT documented in the DPE wiki change log.
Before merging, add an entry to:
- DB changes → https://disneyexperiences.atlassian.net/wiki/spaces/DPE/pages/220922981/DB+Change+log
- Nimbus changes → https://disneyexperiences.atlassian.net/wiki/spaces/DPE/pages/220922983/Nimbus+change+log

Required fields: Sprint, Jira Ticket, DB version/Setting key, Description, Release
```

## Wiki Entry Format

### DB Change Log columns:
| Sprint | Jira ticket | DB version | DB backup version | Description | Owner | Releases |
|--------|-------------|------------|-------------------|-------------|-------|----------|

### Nimbus Change Log columns:
| Sprint | Jira ticket | App/service | Setting key | Setting value | Description | Owner | Releases | Action (Add/Modify/Remove) |
|--------|-------------|-------------|-------------|---------------|-------------|-------|----------|----------------------------|

## Exceptions
- Test-only config (`src/test/resources`) — no wiki entry needed
- Dev-only config files — no wiki entry needed
- Config changes that only affect test profiles — no wiki entry needed

## Context — Why This Exists

A past release deployed code that required a newer DB schema version, but the schema wasn't applied before deployment. The DB change was documented in the wiki but the deploy sequencing wasn't enforced. This rule ensures changes are at minimum documented, making them visible during code review so the release coordinator can sequence them correctly.
