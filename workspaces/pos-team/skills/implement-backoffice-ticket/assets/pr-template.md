## Summary

{One paragraph describing what this PR does and why}

## Jira Ticket

- [{TICKET_KEY}](https://myjira.disney.com/browse/{TICKET_KEY}): {ticket summary}

## Changes

| File | Change Type | Description |
|------|------------|-------------|
| `path/to/file` | {Added/Modified/Deleted} | {what changed} |

## Acceptance Criteria Mapping

| AC# | Criteria | Status |
|-----|----------|--------|
| AC1 | {criteria} | ✅ Implemented |
| AC2 | {criteria} | ✅ Implemented |

## Testing

- [ ] Unit tests added/updated (coverage ≥90% on new code)
- [ ] Existing tests pass
- [ ] Manual verification performed

### Test Coverage
```
{test coverage output}
```

## Breaking Changes

{None | Description of breaking changes and migration path}

## Backward Compatibility

- [ ] API changes are additive only
- [ ] gRPC proto changes are backward compatible
- [ ] ActivateX mobile client not impacted
- [ ] Feature flag: `{flag_name}` (default: OFF)

## Checklist

- [ ] Code follows project conventions
- [ ] No hardcoded secrets or credentials
- [ ] Error handling is meaningful
- [ ] Logging is structured (no PII)
- [ ] Feature flag configured (if applicable)
