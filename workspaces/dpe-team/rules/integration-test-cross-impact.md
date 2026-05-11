# Integration Test Cross-Impact Rule

When code changes touch shared components, data flows, or service boundaries, validate that integration tests cover non-obvious downstream impacts.

## When This Rule Activates

- Any code change to calculators, data loaders, cache logic, GraphQL resolvers, or shared libraries
- Any change to database schema, queries, or entity mappings
- Any change to event publishing, S3 file formats, or inter-service DTOs

## Cross-Impact Detection

For every changed file, identify **indirect consumers** — code paths that depend on the changed behavior without directly calling it.

### DPE Cross-Impact Map

| Changed Area | Non-Obvious Impact | Required Integration Test |
|---|---|---|
| Rate resolution logic | Bundle calculators that inherit component rates | Test bundle pricing with modified rate behavior |
| Discount group assignment | Impact Analysis pre-calculation results | Test impact pipeline produces correct prices after discount change |
| Cache key format | Price token lookups (DynamoDB stores cache key reference) | Test price token retrieval after cache key change |
| DataContract declaration | Batch data loading fetches wrong/missing data for other calculators in same request | Test multi-product request mixing calculator types |
| GraphQL input validation | Admin UI bulk import (sends same payload shape) | Test bulk import with edge-case inputs |
| Schema migration (column change) | Calculator Service startup validation + DataService queries | Test both services start and query correctly against migrated schema |
| Product hierarchy changes | Duration override resolution, pricing date derivation | Test child products still resolve dates correctly from parent |
| Adjustment timing | Multi-day average calculators that apply adjustments per-day vs per-total | Test averaging calculators with adjustments after timing change |
| Event Manager notification payload | Downstream subscribers (external systems) | Test notification consumers can parse new payload |
| Classification changes | Data filtering, role-based access, partial impact segmentation | Test impact analysis segmentation with modified classifications |

## Validation Checklist

For each code change, the developer must confirm:

- [ ] Identified all indirect consumers of the changed behavior (use cross-impact map above)
- [ ] Integration tests exist that exercise the changed code path **through** the indirect consumer
- [ ] If no integration test exists, one is added covering the cross-functional scenario
- [ ] Multi-product scenarios tested (not just single-product happy path)
- [ ] Error/edge cases tested through the indirect path (null values, empty collections, boundary dates)

## What Qualifies as an Integration Test Here

- Tests that start Spring context with real (or test-container) database, Redis, and/or DynamoDB
- Tests that call the GraphQL endpoint and verify the full response (not just the changed method in isolation)
- Tests that exercise the calculation pipeline end-to-end with multiple products of different calculator types
- Tests that verify Impact Analysis output files contain correct data after upstream changes

## Output Format

When reviewing code, flag missing cross-impact integration tests as:

```
### ⚠️ Missing Cross-Impact Integration Test

**Changed:** `<file>` line N — <what changed>
**Indirect consumer:** <who is affected non-obviously>
**Risk:** <what breaks if untested>
**Suggested test:** <brief description of what the integration test should verify>
```

## Language

Always write findings in English.
