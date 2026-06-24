# TEP3 — Splunk Indexes & Query Patterns

## Service Indexes

| Service | Index | Source (Latest) | Source (Stage) |
|---------|-------|-----------------|----------------|
| Cart Service | `wdpr_commerce_cart` | `source=*latest*` | `source=*stage*` |
| Order VAS / UC | `wdpr-ecommerce` | `source=*latest*` | `source=*stage*` |
| PEOS | `wdpr_peos` | `source=*latest*` | `source=*stage*` |
| DTI | `wdpr_dti*` | `source=*latest*` | `source=*stage*` |

## Log Format (Cart Service)

```
{timestamp} {LEVEL} {thread} ConvoId={convoId} CorrId={corrId} PageId={pageId} StoreId={storeId} Mode={mode} [{class}] {message}
```

### Key Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `ConvoId` | User session / cart conversation (UUID) | `441a8c60-3537-11f1-ada4-355e34b3c731` |
| `CorrId` | Single request across service chain | `SYS501724690735-4404633-3668473-4296733` |
| `StoreId` | Store/channel identifier | `dlr`, `dlr_bolt_dlr_youth_dpa_00001` |
| `Mode` | Operation mode | `STANDARD` |

**ConvoId** groups all interactions within a single user session. **CorrId** traces one specific API call end-to-end across the service chain.

## Useful Queries

### Trace by CorrelationId
```spl
index=wdpr_commerce_cart source=*latest* CorrId="{CORRELATION_ID}"
| sort _time
| table _time CorrId ConvoId StoreId Mode _raw
```

### Trace by ConversationId
```spl
index=wdpr_commerce_cart source=*latest* ConvoId="{CONVERSATION_ID}"
| sort _time
| table _time CorrId ConvoId StoreId Mode _raw
```

### Redis Response Time P95 (5-min buckets)
```spl
index=wdpr_commerce_cart source=*latest* "RedisConnectionUtils" ("Opening RedisConnection" OR "Closing Redis Connection")
| rex field=_raw "(?<thread>http-nio-\\S+)"
| rex field=_raw "CorrId=(?<corr_id>\\S+)"
| transaction thread corr_id startswith="Opening RedisConnection" endswith="Closing Redis Connection" maxspan=5s
| eval duration_ms=duration*1000
| where duration_ms>0
| bin _time span=5m
| stats perc95(duration_ms) as p95_ms avg(duration_ms) as avg_ms median(duration_ms) as median_ms max(duration_ms) as max_ms count by _time
| sort _time
```

### Redis Command Volume (5-min buckets)
```spl
index=wdpr_commerce_cart source=*latest* "CommandHandler" "Received"
| rex field=_raw "Received:\\s+(?<bytes>\\d+)\\s+bytes"
| bin _time span=5m
| stats count sum(bytes) as total_bytes by _time
| sort _time
```

### Last Event (Healthcheck)
```spl
index=wdpr_commerce_cart source=*latest* | head 1
```

## MDC Context Notes

- `RedisConnectionUtils` (Spring Data Redis) logs on `http-nio-8080-exec-*` threads → **full MDC context** (ConvoId, CorrId, StoreId)
- Lettuce `RedisStateMachine` / `CommandHandler` logs on `lettuce-nioEventLoop-*` threads → **MDC context is empty** — cannot correlate back to specific requests
- Use `Opening RedisConnection` / `Closing Redis Connection` pairs for accurate Redis timing with correlation

## Environments

| Environment | Source Filter | Description |
|-------------|--------------|-------------|
| Latest | `source=*latest*` | Development / integration |
| Stage | `source=*stage*` | Pre-production |
| Load | `source=*load*` | Performance / load testing |
