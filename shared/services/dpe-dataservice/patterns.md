<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Data Service — Patterns

## Change Set Pattern
- All pricing changes go through change sets (never direct DB updates)
- Change sets have effective dates — applied when date arrives
- Price change sets: rate/discount changes
- Product change sets: product config changes (calculator, components)

## Configuration Toggles
- Feature flags control past-date operations (create/delete)
- S3 export toggle for change set JSON backup
- All toggles default to `false` (safe by default)

## Cache Invalidation
- Data mutations trigger cache invalidation via Cache Service
- Price Factor Change Broker handles event-driven eviction
- Pattern: write → invalidate → confirm
