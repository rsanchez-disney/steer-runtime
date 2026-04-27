<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-23 -->
# DPE Calculator Service — Architecture

## Tech Stack
- Language: Java 17
- Framework: Spring Boot 3.4.3
- API: GraphQL (spring-boot-starter-graphql)
- Database: MySQL 8.0 (RDS), DynamoDB, Redis
- Auth: OAuth2 (JWT + Opaque tokens)
- Build: Maven 3.8+
- Logging: wdpr-loggingapi (JSON → Splunk)

## Calculator Strategy Pattern

Calculators are Spring beans implementing a strategy pattern. Two architecture paths:

| Path | Base Class | Description |
|------|-----------|-------------|
| Legacy | BaseCalculator | Template method with helper-based price factors (10 subclasses) |
| Modern | ComponentCalculator | Config-driven via RateResolutionConfig (recommended for new products) |

### Calculator → DataContract Mapping

| Calculator | DataContract | Rate Fetching |
|-----------|-------------|---------------|
| ComponentCalculator | Per RateResolutionConfig | Configurable |
| StaticPriceCalculator ⚠️ | StaticDataContract | Date ranges |
| ArrivalDatePriceCalculator ⚠️ | StandardDataContract | Per date |
| SimpleDurationPriceCalculator | DurationBasedDataContract | Extended dates |
| ArrivalDateLosPriceCalculator | StandardDataContract | Arrival only |
| BundlePriceCalculator | StandardDataContract | Components |
| BundleDurationPriceCalculator | BundleDurationDataContract | Components × duration |
| MultiDayAverage* | DurationBasedDataContract | Components × duration |
| ZeroPriceCalculator | StandardDataContract | None |

⚠️ = Deprecated, use ComponentCalculator instead.

## Data Loading Modes

| Mode | Config | Behavior |
|------|--------|----------|
| Legacy | `dpeConfig.isEnableBatchDataLoading()` = false | Product data fetched 3× per request (controller, service, component) |
| Optimized | `dpeConfig.isEnableBatchDataLoading()` = true | Single batch fetch via DataContract — reduces DB round trips from N×3 to 1 |

## Calculation Pipeline

```
Phase 1 — Data Assembly (ProductAssemblyServiceImpl):
  Fetch hierarchy → load calculators → resolve attributes → resolve dates
  → batch fetch price factors → assemble CalculatorInput per product

Phase 2 — Price Calculation (PriceServiceImpl):
  Depth-first iteration (children first) → invoke calculator
  → store in calculatedPrices map → resolve guest associations → scale quantities
```

## Dependencies
| Service | Purpose |
|---|---|
| DataService (8080) | Product/pricing data queries |
| Cache Service | Cache invalidation notifications |
| MySQL (dpe) | Product metadata, rates, price factors |
| DynamoDB | Price token storage (TTL-based) |
| Redis | Calculation result cache |
| OAuth2 AuthZ Server | Token validation |

## Deployment
- AWS ECS (per site: WDW, DLR, DLP)
- Docker: non-root UID 1000 / GID 3000
- Health: `/actuator/health`
- CI/CD: Harness (`.harness/`)
