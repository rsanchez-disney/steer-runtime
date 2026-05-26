# DPS — Splunk Queries

Production Splunk queries for monitoring DPS services and tracing offer/quote/freeze requests.

## Indexes & Source Patterns

index = wdpr-revmgmt

| App (Identifiers.App-Name) | Service |
|----------------|---------|
| `dps-core-offer` | Core Offer Search  |
| `dps-core-resflowmgmt` | Reservation Flow Management |
| `dps-core-quote` | Quote Service |
| `dps-core-scoreschemeconfig` | Score Scheme Configuration |
| `package-calendar-service` | Package Calendar Service |
| `package-calendar-service-sync` | Calendar Sync (Kafka consumer) |

## Environment Detection

| Pattern in source | Environment |
|-------------------|-------------|
| `*lst*` or `*latest*` | Latest |
| `*stg*` | Stage |
| `*lod*` | Load |
| No env suffix | Production |

## Site Detection

| Pattern | Site |
|---------|------|
| `*dlr*` | Disneyland Resort |
| `*dlp*` | Disneyland Paris |

---

## Common Queries

### All Errors (Last 15 Minutes)

```spl
index=wdpr-revmgmt level=ERROR earliest=-15m
| stats count by source
| sort -count
```

### Offer Search Trace by Correlation ID

```spl
index=wdpr-revmgmt Identifiers.App-Name=dps-core-offer "Correlation-Id"="<UUID>"
| sort _time
| table _time, source, level, Msg
```

### Failed Offer Searches (Last 1 Hour)

```spl
index=wdpr-revmgmt Identifiers.App-Name=dps-core-offer level=ERROR earliest=-1h
| stats count by Msg
| sort -count
```

### Quote Failures

```spl
index=wdpr-revmgmt Identifiers.App-Name=dps-core-quote level=ERROR earliest=-1h
| rex field=Msg "offerId=(?<offerId>[^ ,]+)"
| stats count by offerId, Msg
| sort -count
```

### Freeze Flow Errors

```spl
index=wdpr-revmgmt Identifiers.App-Name=dps-core-resflowmgmt level=ERROR earliest=-1h
| rex field=Msg "offerFreezeId=(?<freezeId>[^ ,]+)"
| stats count by freezeId, Msg
| sort -count
```

### Downstream Service Timeouts

```spl
index=wdpr-revmgmt ("timeout" OR "ConnectException" OR "CircuitBreaker") earliest=-30m
| rex field=Msg "service=(?<downstream>[^ ,]+)"
| stats count by downstream, source
| sort -count
```

### Kafka Consumer Lag (Calendar Sync)

```spl
index=wdpr-revmgmt Identifiers.App-Name=package-calendar-service-sync "consumer" "lag"
| timechart span=5m avg(lag) by partition
```

### Resilience4j Circuit Breaker State Changes

```spl
index=wdpr-revmgmt "CircuitBreaker" ("OPEN" OR "HALF_OPEN" OR "CLOSED")
| table _time, source, Msg
| sort -_time
```

### Slow Offer Responses (>3s)

```spl
index=wdpr-revmgmt Identifiers.App-Name=dps-core-offer "response_time"
| where response_time > 3000
| stats avg(response_time) as avg_ms, max(response_time) as max_ms, count by source
```
