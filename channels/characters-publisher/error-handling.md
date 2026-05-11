# Characters Publisher — Error Handling

## Design Principles

1. **Per-market error isolation** — a failure in one market must not prevent other markets from completing
2. **No Dead Letter Queue (DLQ)** — failures are captured in-memory and reported in the sync result; retries rely on the next scheduled invocation (10-min cron)
3. **Graceful degradation** — partial success is acceptable; the system reports which markets succeeded/failed

## Per-Market Error Isolation (Reactor)

The `OpSheetSyncStrategy` uses Project Reactor's `onErrorResume` operator to isolate market failures:

```java
Flux.fromIterable(markets)
    .flatMap(market -> syncMarket(market)
        .onErrorResume(ex -> Mono.just(MarketSyncResult.failure(market, ex)))
    )
    .collectList()
    .block();
```

Each market stream is independent. If WDW fails, DLR continues processing unaffected.

### LegacySyncStrategy Fallback

The sequential fallback wraps each market sync in a try/catch, collecting results into the same `MarketSyncResult` structure. Errors are caught and recorded without halting the loop.

## MarketSyncResult Pattern

Each market produces a `MarketSyncResult` capturing:

| Field | Type | Description |
|-------|------|-------------|
| `market` | String | Market identifier (e.g., `WDW`, `DLR`) |
| `success` | boolean | Whether the sync completed without error |
| `documentsPublished` | int | Count of documents written to Couchbase |
| `error` | Throwable (nullable) | Exception if `success=false` |
| `durationMs` | long | Elapsed time for this market's sync |

The Lambda response aggregates all `MarketSyncResult` objects, giving callers visibility into partial failures.

## Timeout Configuration

| Layer | Timeout | Purpose |
|-------|---------|---------|
| Lambda execution | Configured in SAM template (typically 5–10 min) | Hard ceiling for entire invocation |
| OpenFeign client | Per-client read/connect timeout | Prevents hanging on upstream service calls |
| Couchbase SDK | Operation-level timeout (SDK 3.10.1 defaults + overrides) | Prevents hanging on bucket writes |
| Reactor `timeout()` | Per-market timeout (if configured) | Caps individual market processing time |

### Feign Timeout Defaults

Configured via `realtime-content-wrapper` properties:

```yaml
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 30000
```

### Couchbase Timeout

SDK 3.10.1 allows per-operation timeout overrides:

```java
collection.upsert(id, document, UpsertOptions.upsertOptions().timeout(Duration.ofSeconds(10)));
```

## Failure Scenarios

| Scenario | Behavior | Recovery |
|----------|----------|----------|
| Single upstream service down | Market using that service fails; others unaffected | Next cron invocation retries |
| Couchbase unreachable | All markets fail on publish step | Next cron invocation retries |
| Lambda timeout exceeded | Invocation killed; partial writes may exist | Next invocation performs full sync (idempotent upserts) |
| Vault/secrets unavailable | Lambda fails to initialize | CloudWatch alarm; manual intervention |

## Observability

- **No DLQ** — the 10-minute cron schedule provides natural retry
- Failures are logged (CloudWatch Logs) with market context
- `MarketSyncResult` in the API Gateway response enables monitoring/alerting on partial failures
- Idempotent upserts ensure partial writes are safe — next successful run overwrites stale data
