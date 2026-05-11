# Characters Publisher — Data Flows

## Overview

The Characters Publisher is a Java 11 AWS Lambda (SAM-deployed, Maven multi-module: `characters-core` + `characters-lambda`) that aggregates character data from multiple upstream services, transforms it per market, and publishes to Couchbase.

## Trigger Patterns

| Trigger | Mechanism | Frequency |
|---------|-----------|-----------|
| Scheduled | CloudWatch Events cron | Every 10 minutes |
| On-demand | API Gateway GET | Manual / ad-hoc invocation |

Both triggers invoke the same Lambda handler. A custom Spring invocation scope manages per-request bean lifecycle within the Lambda execution context.

## Data Flow: Sources → Transform → Destination

```
┌─────────────────────┐
│   Explorer Service   │──┐
└─────────────────────┘  │
┌─────────────────────┐  │    ┌──────────────────────────┐    ┌─────────────────────────┐
│   OpSheet Service    │──┼───▶│  Transform (per market)  │───▶│  Couchbase              │
└─────────────────────┘  │    └──────────────────────────┘    │  bucket: park-platform-pub│
┌─────────────────────┐  │                                    │  channel: {dest}.characters.{ver}│
│  Facility Service    │──┘                                    └─────────────────────────┘
└─────────────────────┘
```

### 1. Source Fetching

All upstream HTTP calls use **OpenFeign** clients (via `realtime-content-wrapper 7.6.0`):

- **Explorer Service** — primary character entity data
- **OpSheet Service** — operational schedule/status data
- **Facility Service** — facility-to-character associations

Secrets for service authentication are retrieved from **Vault** and decrypted via **Jasypt** encrypted properties.

### 2. Transform (Market Processing)

Two strategies are available, selected at runtime:

| Strategy | Class | Behavior |
|----------|-------|----------|
| Primary | `OpSheetSyncStrategy` | Reactive (Project Reactor), processes markets **concurrently** |
| Fallback | `LegacySyncStrategy` | Sequential per-market processing |

#### Market Processing

Markets are processed independently:

- **WDW** (Walt Disney World) — with locale variants
- **DLR** (Disneyland Resort) — with locale variants

Each market sync:
1. Fetches source data for that market/locale combination
2. Merges Explorer + OpSheet + Facility data into a unified character document
3. Writes the transformed document to Couchbase

### 3. Destination (Couchbase Publish)

- **Bucket:** `park-platform-pub`
- **SDK:** Couchbase SDK 3.10.1
- **Channel pattern:** `{destination}.characters.{version}`
- Documents are upserted per character per market/locale combination

## Concurrency Model (OpSheetSyncStrategy)

```
Lambda invocation
  └─▶ Reactor Flux of markets [WDW, DLR]
       ├─▶ WDW (concurrent)
       │    ├─ fetch sources
       │    ├─ transform
       │    └─ publish to Couchbase
       └─▶ DLR (concurrent)
            ├─ fetch sources
            ├─ transform
            └─ publish to Couchbase
```

Markets execute concurrently; errors in one market do not block others (see `error-handling.md`).
