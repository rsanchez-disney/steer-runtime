# Finder Assembler Service (FAS) — Patterns

## Multi-Tier Caching (Redis + Couchbase)

FAS uses a two-tier cache strategy:

| Tier | Store | Purpose | Characteristics |
|------|-------|---------|-----------------|
| Hot | Redis | Low-latency reads for downstream services | In-memory, volatile, short TTL |
| Warm | Couchbase 3.10.1 | Persistent cache, survives Redis eviction | Document store, longer TTL, durable |

### Write Strategy
- **Write-through**: On assembly, FAS writes to both Redis and Couchbase atomically
- **Redis-first reads**: Consumers hit Redis; on miss, fall back to Couchbase
- **Couchbase as source-of-recovery**: If Redis is flushed, Couchbase repopulates it

### Cache Models
Defined in `finder-cache-models` (v465.0.0.340). Shared across FAS and consuming services to ensure schema consistency.

### TTL Management
- Redis TTLs configured per entity type via mpropz/Consul
- Couchbase TTLs are longer (or infinite) to serve as recovery layer
- Quartz jobs evict stale entries that exceed TTL without refresh

## Event-Driven Architecture (AWS SNS/SQS)

FAS publishes cache-change events so downstream services react without polling.

```
FAS → SNS Topic → SQS Queues (fan-out)
                      │
                      ├── Consumer Service A
                      ├── Consumer Service B
                      └── Consumer Service C
```

### Guarantees
- **At-least-once delivery**: Consumers must be idempotent
- **Ordering**: Not guaranteed across partitions; use `correlationId` + `timestamp` for sequencing
- **Deduplication**: Javers diffing prevents publishing when content hasn't actually changed

### Event Triggers
- Notification received from DScribe → content changed → event published
- Quartz rebuild detects drift → event published
- Admin manual refresh → event published

## Feature Flags (LaunchDarkly)

LaunchDarkly controls runtime behavior without redeployment:

| Flag Pattern | Use Case |
|--------------|----------|
| `fas.cache.rebuild.enabled` | Enable/disable scheduled full rebuilds |
| `fas.notify.processing.async` | Toggle sync vs async notification processing |
| `fas.debug.endpoints.enabled` | Gate debug endpoint access in production |
| `fas.entity.{type}.enabled` | Enable/disable processing per entity type |
| `fas.sns.publish.enabled` | Kill-switch for SNS publishing |

### Rollout Strategy
- Flags evaluated per-request or per-job execution
- Percentage rollouts used for gradual feature enablement
- Environment-level targeting (e.g., enabled in stage, disabled in prod)

## Object Diffing (Javers)

FAS uses Javers to compare assembled cache models against existing cached state.

### Purpose
- **Avoid unnecessary writes**: If assembled content matches cached content, skip write + publish
- **Change tracking**: Record what fields changed for downstream consumers
- **Audit trail**: Diff history available via debug endpoints

### Flow
```
Assembled Model (new) ──┐
                         ├── Javers.compare() ──→ Diff
Cached Model (existing) ─┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                              No changes?    Has changes?    Delete action?
                              → No-op        → Write cache   → Evict cache
                                             → Publish event → Publish event
```

### Diff Output
Javers produces a structured diff including:
- Changed property paths
- Old vs new values
- Change type (VALUE_CHANGE, OBJECT_ADDED, OBJECT_REMOVED)

This diff is included in SNS events (`diff.changedPaths`) so consumers can react selectively.
