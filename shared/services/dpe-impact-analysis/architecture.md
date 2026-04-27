<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-23 -->
# DPE Impact Analysis — Architecture

## Overview
AWS Step Functions pipeline that answers: "When a price factor change becomes effective, which products are affected, on which dates, and what are their new prices?"

## Tech Stack
- Language: Java 17
- Runtime: AWS Lambda
- Orchestration: AWS Step Functions
- Storage: S3 (impact files, precalculation results)
- Database: MySQL (RDS) — read-only queries
- Auth: OAuth2 (token fetched per invocation)

## Lambda Functions

| Function | Purpose | Thread Pool |
|----------|---------|-------------|
| start-step-function.js | Validates site, starts Step Function execution | — |
| IdentifyImpacts | Runs 6 DB queries, identifies impacted products, writes to S3 | Sequential |
| PreCalculation | Calls Calculator Service for each impacted product, writes precalc to S3 | CALC_SVC_THREADS (default 10) |
| CacheEviction | Evicts cached prices for impacted products | CACHE_SVC_THREADS |
| SendNotifications | POSTs impact chunks to Event Manager | Sequential |

## Step Function Flow

```
Wait Until (effective date - preprocessing window)
  → IdentifyImpacts Lambda
  → Map State (MaxConcurrency=1, per ImpactFileResult)
    → Parallel:
      Branch A: PreCalculation Lambda
      Branch B: CacheEviction Lambda → (if automatic) SendNotifications Lambda
```

## Trigger Paths

| Trigger | Source | interactiveImpactAnalysis | Notifications? |
|---------|--------|--------------------------|----------------|
| Manual | Admin UI → DataService GraphQL mutation | true | No |
| Automatic | Price Factor Change Broker Lambda | false | Yes |

## Configuration Toggles

| Toggle | Description |
|--------|-------------|
| `ENABLE_NEW_PARTIAL_IMPACT_PROCESS` | Segments impacts by classification (one S3 file per group) |
| `ENABLE_PRECALCULATION` | Enables/disables PreCalculation Lambda |
| `ENABLE_MULTIPLE_TYPES_IN_EVENT_MANAGER_REQUEST` | Joins topics into one multicast request |
| `PRE_PROCESSING_WINDOW` | Minutes before effective date to start pipeline |
| `CALC_SVC_THREADS` | Thread pool size for PreCalculation (default 10) |
| `CACHE_SVC_THREADS` | Thread pool size for CacheEviction |

## Known Issues

| Issue | Severity | Location |
|-------|----------|----------|
| CacheEviction fires CompletableFutures but never awaits them — Lambda may terminate before evictions complete | P1 | CacheEvictionService |
| Partial impact process re-queries identifyProductImpacts() and identifyRateGridRateImpacts() (duplicate queries) | P2 | IdentifyImpactsService |
| Date ranges within each product in PreCalculation are called sequentially (performance gap) | P2 | PreCalculationService |
| Notification chunks sent sequentially | P2 | SendNotificationsService |
| Step Function Map MaxConcurrency=1 is a serial bottleneck with multiple ImpactFileResults | P1 | Step Function ASL |
| New ExecutorService created on every Lambda invocation (should reuse across warm starts) | P3 | PreCalculationService, CacheEvictionService |

## Dependencies

| Service | Purpose |
|---|---|
| MySQL (dpe) | Read-only queries for impact identification |
| S3 | Impact files, precalculation results |
| Calculator Service | Price computation for impacted products |
| Cache Service | Cache eviction for impacted products |
| Event Manager | Downstream notifications |
| OAuth2 AuthZ Server | Token for service-to-service calls |
