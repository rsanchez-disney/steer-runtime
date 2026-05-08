# ADR-001: Multi-prefix jira_prefix support

**Status:** Accepted
**Date:** 2026-05-08
**Deciders:** Ricardo Sanchez

## Context

Teams like Studio Shield work across multiple Jira projects simultaneously (AEXP-, IEXP-, COREEXP-). The workspace schema only supported a single string for `jira_prefix`, forcing teams to either pick one prefix or use a non-standard comma-separated string that tooling couldn't parse correctly.

## Decision

`jira_prefix` accepts `string | string[]`. A single string remains the default for teams with one prefix. Teams with multiple prefixes use a JSON array.

```json
"jira_prefix": "DPAY-"
```

```json
"jira_prefix": ["AEXP-", "IEXP-", "COREEXP-"]
```

Display logic joins arrays with `", "`. All existing workspaces continue to work without modification.

## Consequences

### Positive
- Teams with multiple Jira projects can declare all prefixes
- Zero migration required for existing workspaces
- Shell hooks handle both formats with a simple type check

### Negative
- Koda Go binary needs a `StringOrSlice` custom unmarshal type
- Consumers must check type before using the value

### Neutral
- Schema doc updated to reflect union type
- No change to workspace inheritance behavior (child still overrides parent)

## Alternatives Considered

### Option A: Comma-separated string
- Pros: No schema change needed
- Cons: Ambiguous parsing, no schema enforcement, breaks tooling that does `prefix + ticketNum`

### Option B: New `jira_prefixes` field
- Pros: Clean separation
- Cons: Two fields for same concept, confusing precedence, migration burden

### Option C: `string | string[]` (chosen)
- Pros: Backward-compatible, JSON-native, explicit
- Cons: Requires type-checking in consumers

## References
- PR #317 (Shield workspace — first multi-prefix consumer)
- `profiles/steer-master/context/workspace_schema.md`
- `internal/model/workspace.go` in Koda
