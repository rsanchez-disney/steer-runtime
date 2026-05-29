<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Characters Publisher — Patterns & Conventions

## Error Handling

### Per-Market Error Isolation

Failures in one market do not block others. The `OpSheetSyncStrategy` uses Project Reactor's `onErrorResume`:

```java
Flux.fromIterable(markets)
    .flatMap(market -> syncMarket(market)
        .onErrorResume(ex -> Mono.just(MarketSyncResult.failure(market, ex)))
    )
    .collectList()
    .block();
```

The `LegacySyncStrategy` fallback wraps each market in try/catch with the same result pattern.

### MarketSyncResult

| Field | Type | Description |
|-------|------|-------------|
| `market` | String | Market identifier (WDW, DLR) |
| `success` | boolean | Whether sync completed without error |
| `documentsPublished` | int | Documents written to Couchbase |
| `error` | Throwable | Exception if `success=false` |
| `durationMs` | long | Elapsed time for market sync |

### No DLQ

Failures are captured in-memory and reported in the sync result. The 10-minute cron provides natural retry. Idempotent upserts ensure partial writes are safe.

## Timeout Configuration

| Layer | Timeout | Purpose |
|-------|---------|---------|
| Lambda execution | 300s (SAM template) | Hard ceiling for entire invocation |
| OpenFeign client | connect: 5s, read: 30s | Prevents hanging on upstream calls |
| Couchbase SDK | Per-operation (10s default) | Prevents hanging on bucket writes |

## Idempotency

All Couchbase writes are upserts — safe to retry. A failed run followed by a successful run produces correct state.

## Common Gotchas

- Vault/secrets unavailable → Lambda fails to initialize (CloudWatch alarm, manual intervention needed)
- Lambda timeout exceeded → partial writes may exist, but next successful run overwrites stale data
- Market processing is concurrent in primary strategy — logs interleave between markets
