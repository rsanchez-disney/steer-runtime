# Dynamic Pricing Engine (DPE) — Team Context

## What DPE Does

DPE is the microservices platform that calculates dynamic prices for Walt Disney World Parks & Resorts products — tickets, hotel rooms, bundles, packages, dining, and experiences. It handles rates, discounts, commissions, taxes, adjustments, and currency conversions across multiple parks (WDW, DLR, DLP).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin UI (Port 8085)                        │
│                   [Spring Boot + Vaadin]                        │
└────────────┬────────────────────────────────────┬───────────────┘
             │                                    │
             ▼                                    ▼
┌────────────────────────┐      ┌────────────────────────────────┐
│   DataService (8080)   │◄────►│  Calculator Service (8181)     │
│   [GraphQL CRUD API]   │      │  [GraphQL Price Calculations]  │
└───┬────────────────┬───┘      └──┬─────────────────────────┬───┘
    │                │              │                         │
    ▼                ▼              ▼                         ▼
┌─────────┐    ┌──────────┐   ┌──────────┐           ┌──────────┐
│  MySQL  │    │    S3    │   │ DynamoDB │           │  Redis   │
│   dpe   │    │ Exports  │   │  Tokens  │           │  Cache   │
└─────────┘    └──────────┘   └──────────┘           └──────────┘
    ▲                                                       ▲
    │                                                       │
    │                                              ┌────────┴────────┐
    │                                              │ Cache Service   │
    │                                              │  (CXF REST)     │
    │                                              └─────────────────┘
    ▼
┌────────────────────────┐     ┌──────────────────────────────────┐
│ Product Adapter        │     │ Impact Analysis (Lambda)          │
│    (Lambda)            │     │ Price Factor Change Broker        │
└────────────────────────┘     └──────────────────────────────────┘
```

## Repos & Tech Stack

| Repo | Layer | Tech | Spring Boot | Port |
|------|-------|------|-------------|------|
| Dynamic-Pricing-Engine-Service | Calculator / pricing engine | Java 17, GraphQL, Redis, DynamoDB | 3.4.3 | 8181 |
| Dynamic-Pricing-Engine-DataService | Data CRUD API | Java 17, GraphQL, Spring Data JPA, MySQL | 3.4.3 | 8080 |
| dpe-cache-service | Cache management | Java 17, Apache CXF, Redis, OAuth2 | 2.7.18 | 8080 |
| Dynamic-Pricing-Engine-Admin-UI | Admin web interface | Java 17, Vaadin | 3.4.2 | 8085 |
| Dynamic-Pricing-Engine-Impact-Analysis-Java | Change impact analysis | Java 17, AWS Lambda, Step Functions | — | — |
| Dynamic-Pricing-Engine-Product-Adapter | External product ingestion | Java 17, AWS Lambda, API Gateway | — | — |
| Dynamic-Pricing-Engine-CurrencyService | Currency conversion | Java 17, MySQL | 2.7.5 | — |
| Dynamic-Pricing-Engine-Price-Factor-Change-Broker | Price factor event broker | Java 17, Lambda | — | — |
| Product-Price-Promotion-Service | Promotional pricing | Java 17, GraphQL, MySQL | 3.4.3 | 8080 |
| Product-Price-Promotion-UI | Promotion admin UI | Java 17, Vaadin | — | — |
| pricing-shared | Shared libraries | Java 17 (multi-module Maven) | — | — |
| Event-Service | Event processing | Java 17, Lambda, API Gateway | — | — |
| wdw-publishing | WDW price publishing | Java (multi-module) | — | — |
| dpe-monorepo | Python tooling, scripts, agent-os | Python (uv), Node.js | — | — |

> **Legacy services**: Cache Service (2.7.18) and Currency Service (2.7.5) are on Spring Boot 2.x. All others are on 3.4.x.

## Common Tech Across All Java Services

- Java 17, Maven 3.8+
- Spring Boot (3.x for newer services, 2.x for legacy)
- OAuth2 with JWT/Opaque tokens (AuthZ: stg.authorization.go.com)
- MyID/Okta for user auth
- Vault for secrets (Mpropz integration)
- Docker (non-root UID 1000 / GID 3000)
- AWS ECS deployment
- Harness CI/CD pipelines
- Splunk for logging (wdpr-loggingapi JSON format)
- Lombok for boilerplate reduction
- MapStruct for object mapping

## Calculator System (Critical Domain Knowledge)

The Calculator Service is the heart of DPE. Calculators are Spring beans implementing a strategy pattern.

### Calculator Implementations

| Calculator | Code | Type | Components? | Duration? | Status | Use Case |
|---|---|---|---|---|---|---|
| ComponentCalculator | `COMPONENT` | Leaf | No | Yes | ⭐ Recommended | Flexible leaf — replaces Static/ArrivalDate via RateResolutionConfig |
| StaticPriceCalculator | `STATIC` | Leaf | No | No | ⚠️ Deprecated | Season passes, memberships |
| ArrivalDatePriceCalculator | `ARRIVAL_DATE` | Leaf | No | No | ⚠️ Deprecated | Single-day park tickets |
| SimpleDurationPriceCalculator | `SIMPLE_DURATION` | Leaf | No | Yes | Active | Multi-day tickets |
| ArrivalDateLosPriceCalculator | `ARRIVAL_DATE_LOS` | Leaf | No | Yes | Active | Hotel stays (fixed nightly rate) |
| BundlePriceCalculator | `BUNDLE` | Bundle | Yes | No | Active | Simple bundles (ticket + dining) |
| BundleWithAdjustmentPriceCalculator | `BUNDLE_WITH_ADJUSTMENT` | Bundle | Yes | No | Active | Bundles with component promos |
| BundleDurationPriceCalculator | `BUNDLE_DURATION` | Bundle | Yes | Yes | Active | Multi-day bundles |
| MultiDayAveragePriceCalculator | `MULTI_DAY_AVERAGE` | Averaging | Yes | Yes | Active | Avg pricing across duration |
| MultiDayAverageWithAdjustmentPerDayPriceCalculator | `MULTI_DAY_AVERAGE_ADJUSTMENT_PER_DAY` | Averaging | Yes | Yes | Active | Avg pricing with daily promos |
| MultiDayAverageWithAdjustmentPerTotalPriceCalculator | `MULTI_DAY_AVERAGE_ADJUSTMENT_PER_TOTAL` | Averaging | Yes | Yes | Active | Avg pricing with total discount |
| ZeroPriceCalculator | `ZERO` | Special | — | — | Active | Free products |

### ComponentCalculator (New Architecture)

The ComponentCalculator uses `RateResolutionConfig` to determine rate behavior:
- **STATIC**: Evergreen rates (most recent rate applies to all dates)
- **ARRIVAL_DATE**: Arrival date rate replicated to all nights
- **SIMPLE_DURATION**: Exact date matching with duration extension

New products should use ComponentCalculator instead of the deprecated Static/ArrivalDate calculators.

### Calculator Selection Decision Tree

```
Is the product free? → ZeroPriceCalculator
Is it a bundle?
  ├─ Needs component adjustments? → BundleWithAdjustmentPriceCalculator
  ├─ Needs duration extension? → BundleDurationPriceCalculator
  ├─ Needs averaging? → MultiDayAverage variants
  └─ Simple bundle → BundlePriceCalculator
Leaf product:
  ├─ Evergreen/Static → ComponentCalculator (STATIC)
  ├─ Arrival-locked → ComponentCalculator (ARRIVAL_DATE) or ArrivalDateLosPriceCalculator
  └─ Duration-based → ComponentCalculator (SIMPLE_DURATION)
```

### Key Concepts

- **DataContract**: Each calculator declares data requirements (StandardDataContract, DurationBasedDataContract, BundleDurationDataContract, StaticDataContract)
- **Batch data loading**: Single fetch of entire product hierarchy when `dpeConfig.isEnableBatchDataLoading()` is true — reduces DB round trips from N×3 to 1
- **Price tokens**: Stored in DynamoDB for transaction consistency
- **Freeze duration**: 30 min guarantee that calculated price won't change
- **Calculator bean caching**: 60s TTL
- **Max products per request**: 10

### Calculation Pipeline

**Phase 1 — Data Assembly** (`ProductAssemblyServiceImpl.assembleProducts`):
1. Fetch product hierarchy from DB, resolve bundle categories into BundleComponent objects
2. Batch-load calculators for all products in hierarchy
3. Resolve product attributes (ages, discount groups, commission groups) via ProductAttributeResolver
4. Resolve frequency/method: classification default → bundle category override → normalize PER_PAX → PER_GUEST
5. Enrich with duration overrides (pricing buffer + duration override)
6. Resolve pricing dates via PricingDateResolver (4 cases: explicit arrivals, derive from child, inherit parent dates, V1 fallback)
7. Fetch all price factors in parallel: rates, discounts, taxes, commissions, adjustments, classifications, duration overrides
8. Assemble per-product PriceFactorData with rate behavior filtering/replication
9. Build CalculatorInput per product, return ProductHierarchyWithData

**Phase 2 — Price Calculation** (`PriceServiceImpl.calculatePricesWithDataLoading`):
1. Iterate products in depth-first order (deepest children first, parents last)
2. For each product: collect component prices from already-calculated children, invoke calculator
3. Store result in calculatedPrices map for parent consumption
4. Resolve guest associations via GuestAssociationResolver
5. Scale PER_GUEST/PER_PAX prices by guest count via ItemTotalHelper

### Rate Resolution

Before a calculator runs, rates are pre-processed based on RateResolutionConfig.RateBehavior:

| Behavior | Description |
|----------|-------------|
| `USAGE_DATE` | Rates filtered to exact usage dates (default) |
| `STATIC` | No date filtering — calculator selects most recent effective rate |
| `ARRIVAL_DATE` | Arrival date rates replicated to all usage dates |

## Key Domain Terms

- **Rate**: Base price for a product on a specific date and age type
- **Rate Grid**: Template structure for managing rates across multiple products with similar pricing patterns
- **Price Change Set**: Scheduled pricing update with an effective date
- **Product Change Set**: Scheduled product config change with an effective date
- **Effective Date**: When a change set becomes active
- **Usage Date**: Date range when a product/price is valid for customer use
- **Preprocessing Window**: Configurable time (minutes) before effective date for validation
- **Classification**: Hierarchical product categorization (used for access control + filtering)
- **Price Factor**: Generic term for discounts, commissions, taxes, adjustments
- **Bundle Component**: Child product within a bundle
- **Bundle Category**: Grouping mechanism for optional/selectable bundle components
- **Arrival Date / Length of Stay (LOS)**: Check-in date and number of nights
- **Price Token**: Unique ID in DynamoDB representing a calculation result — used for transaction consistency
- **Gross Price**: Base price before discounts but after initial adjustments
- **Duration Override**: Overrides default product duration; includes buffer days for averaging calculators
- **Age Type**: Categories for age-based pricing (Adult, Child, Senior, etc.) with defined age ranges
- **RateResolutionConfig**: Configuration that determines how ComponentCalculator resolves rates (STATIC, ARRIVAL_DATE, SIMPLE_DURATION)
- **DataContract**: Declaration by a calculator of its data requirements — enables optimized batch loading
- **Time Machine**: Feature to query historical prices or simulate future pricing by specifying a different effective date

## Price Factor Types

| Factor | Description | Managed In |
|--------|-------------|------------|
| Rates | Base prices per date/age | Admin UI, DataService |
| Discounts | Price reductions (% or fixed), organized in discount groups | Admin UI, DataService |
| Commissions | Partner fees added to prices, organized in commission groups | Admin UI, DataService |
| Taxes | Tax amounts (% or fixed), organized in tax groups | Admin UI, DataService |
| Adjustments | Price modifications at various stages (including DOD — day-of-departure) | Admin UI, DataService |
| Payment Setups | Payment terms, frequencies, methods | Admin UI, DataService |

## Admin UI Sections

The Admin UI (Vaadin) provides management screens for all DPE entities:

| Section | Purpose |
|---------|--------|
| Products & Rates | Manage products, rates by date/age, assign calculators, product hierarchies |
| Rate Grids | Bulk rate management templates, import from Excel |
| Imports | Bulk Excel imports: TSR, Rate Grid, Adjustment DOD, Price Factors |
| Currency | Conversion rates, supported currencies, effective dates |
| Discounts | Discount groups, rules, amounts, effective/usage dates |
| Change Sets | Schedule pricing/product updates, preview impact, approve/reject |
| Commissions | Commission groups, rules, rates, partner assignments |
| Taxes | Tax groups, rules, rates, effective/usage dates |
| Duration Overrides | Override product durations, buffer days for averaging |
| Adjustments | Adjustment groups, DOD adjustments |
| Age Management | Age types, ranges, age-based pricing rules |
| Payment Setup | Payment rules, frequencies, methods |
| Calculator Management | View/assign calculator implementations |
| Audit History | Full change history with before/after comparison |
| Impact Analysis | Calendar/list view of change impact, integration with Lambda |

## Impact Analysis Pipeline

The Impact Analysis answers: "When a price factor change becomes effective, which products are affected, on which dates, and what are their new prices?"

### Trigger Paths

1. **Manual** — Admin UI → GraphQL mutation → DataService → start-step-function.js Lambda → Step Function
2. **Automatic** — Price Factor Change Broker Lambda receives event → cache eviction → dedup check (impact_job_history) → Step Function

| Trigger | Pre-Calculation | Cache Eviction | Notifications |
|---------|----------------|----------------|---------------|
| Manual (interactive) | Yes | Yes | No |
| Automatic (PFCB) | Yes | Yes | Yes |

### Step Function Flow

1. **Wait Until** — pauses until effective date minus preprocessing window
2. **IdentifyImpacts Lambda** — runs 6 sequential DB queries (rates, adjustments, discounts, commissions, taxes, payment/cancellation), adds product/rate-grid/bundle cascades, filters by usage range, merges date ranges, writes to S3. If `ENABLE_NEW_PARTIAL_IMPACT_PROCESS=true`, also segments by classification producing one S3 file per group.
3. **Map State** (MaxConcurrency=1, per ImpactFileResult) — two parallel branches:
   - **Branch A — PreCalculation Lambda**: reads impact file from S3, calls Calculator Service in parallel (10 threads) for each product, writes precalc to S3
   - **Branch B — CacheEviction + Notifications**: evicts cache for affected products; sends notifications to Event Manager (only for automatic triggers, chunked at 1000 products)

### Known Issues

- CacheEviction fires CompletableFutures but never awaits them — Lambda may terminate before evictions complete
- Partial impact process re-queries identifyProductImpacts() and identifyRateGridRateImpacts() (duplicate queries)
- Date ranges within each product in PreCalculation are called sequentially (performance gap)
- Notification chunks sent sequentially

## Deployment

- **Sites**: WDW (us-east-1), DLR (us-west-2), DLP (us-east-1), Sandbox (us-east-1)
- **Environments**: latest → latest2 → stage → stage2 → load → prod
- **CI/CD**: Harness pipelines (see `.harness/` in each repo)
- **Infra**: AWS ECS, RDS MySQL, ElastiCache Redis, DynamoDB, S3, Lambda, Step Functions
- **Ephemeral environments**: Supported via `ephemeral-*.yaml` Harness configs
- **AWS Accounts**: dev (381076902228), test (057099829492), prod (574510687300)
- **AWS Profiles**: wdpr-packaging-dev, wdpr-packaging-test, wdpr-packaging-prod

> See `aws_applications.md` for full service name → site → environment mapping.

## Database

- MySQL 8.0 (RDS), schema name: `dpe`
- Schema version validation on service startup (v2.5+ for DataService, v3.6+ for Calculator)
- Connection pooling: HikariCP (max 100 connections)
- Key tables: product, rate, rate_grid, discount, commission, tax, adjustment, price_change_set, product_change_set, impact_job_history, bundle_category, classification
- Audit trail: full change history for all entities (who, when, what changed)

## Security

- OAuth2 scopes: `tpr-dpe-svc-query-price`, `tpr-dpe-svc-query-product`, `tpr-dpe-svc-price-token`, `tpr-dpe-svc-actuator`
- All services require VPN access for AWS RDS
- Vault for credentials (never hardcode)
- Non-root Docker containers (UID 1000, GID 3000)
- MyID/Okta for Admin UI user authentication (form-based in local dev)
- Classification-based data filtering and role-based access control

## Configuration Conventions

DPE services use a kind-first property path pattern:

```
<kind>.<...segments>   (kebab-case after kind)
```

| Kind | Purpose | Example |
|------|---------|--------|
| `flag` | Boolean toggles (use `is-`/`are-` predicates) | `flag.is-simple-ttl-enabled` |
| `config` | Application settings | `config.stale-threshold-seconds` |
| `external` | External service URLs | `external.calculator.base-url` |
| `auth` | Authentication config | `auth.oauth.client-id` |
| `integration` | Integration settings | `integration.dynamodb.price-token-table` |
| `context` | Runtime context | `context.site-code` |

Key DataService toggles:
- `ENABLE_CREATE_PAST_EFFECTIVE_DATES` / `ENABLE_DELETE_PAST_EFFECTIVE_DATES_OVERRIDE`
- `ENABLE_CREATE_PAST_USAGE_DATES` / `ENABLE_DELETE_PAST_USAGE_DATES_OVERRIDE`
- `ENABLE_CHANGE_SET_JSON_S3_EXPORT`

Key Impact Analysis toggles:
- `ENABLE_NEW_PARTIAL_IMPACT_PROCESS` — segments impacts by classification
- `ENABLE_PRECALCULATION` — enables/disables precalculation Lambda
- `ENABLE_MULTIPLE_TYPES_IN_EVENT_MANAGER_REQUEST` — joins topics into one multicast request
- `PRE_PROCESSING_WINDOW` — minutes before effective date to start pipeline

## Local Development

Startup order:
1. Infrastructure: MySQL, Redis, DynamoDB (`docker-compose-local.yml`)
2. DataService (port 8080)
3. Cache Service
4. Calculator Service (port 8181)
5. Admin UI (port 8085)

All services need `application-local.yml` with DB credentials, OAuth2 config, and service URLs.

GraphQL endpoints:
- DataService: `http://localhost:8080/graphql` (GraphiQL available)
- Calculator Service: `http://localhost:8181/graphql` (GraphiQL available)

## Performance Considerations

- Calculator Service: max 10 products per request
- Database connection pooling: HikariCP (100 max connections)
- Redis connection pooling: 100 max active
- Request timeouts: 60s–300s depending on service
- Batch data loading eliminates redundant fetches (3× → 1×)
- Calculator bean caching: 60s TTL
- Impact Analysis PreCalculation: 10 threads default (CALC_SVC_THREADS)
- Impact Analysis Map MaxConcurrency=1 is a known serial bottleneck when partial impact produces multiple files

## Common Pitfalls

1. Forgetting cache invalidation when data changes
2. Ignoring preprocessing window constraints
3. Storing state in calculator beans (must be stateless)
4. Schema version mismatch between services and DB
5. Missing OAuth2 scope definitions for new endpoints
6. Connection pool exhaustion under load
7. Bundle component writing strategy not tested thoroughly
8. Time zone handling for effective/usage dates

## Team Structure

DPE is a cross-functional team with multiple sub-teams:

| Sub-Team | Role | Key Agents |
|----------|------|------------|
| **Development** | Backend services, calculator logic, GraphQL APIs, infrastructure | `orchestrator`, `code_review_agent`, `pr_creator_agent`, `architecture_agent` |
| **Product** | Product ownership, roadmap, feature prioritization, stakeholder alignment | `story_analyzer_agent`, `prd_generator_agent`, `orchestrator` |
| **Business Analysis** | Requirements gathering, story writing, acceptance criteria, scope definition | `ba_orchestrator_agent`, `requirements_analyst_agent`, `scope_definer_agent`, `estimation_agent` |
| **QA / Automation** | Test planning, test automation, defect analysis, coverage tracking | `qa_orchestrator_agent`, `test_planner_agent`, `test_automation_agent`, `defect_analyst_agent` |
| **Ops / SRE** | Deployments, infrastructure, monitoring, incident response | `ops_orchestrator_agent`, `deployment_agent`, `release_manager_agent` |

## Jira

- Project: **PPODPE** (Parks Pricing Operations DPE)
- URL: https://myjira.disney.com/projects/PPODPE
- Prefix: `PPODPE-`
- Board: PPODPE Kanban/Sprint board

## Wiki

- Home: https://mywiki.disney.com/spaces/DPE/pages/681902331/Dynamic+Pricing+Engine+Home
- Instance: MyWiki (`mywiki.disney.com`) — use `@mywiki/*` MCP tools, not `@confluence/*`
- Contains: architecture docs, onboarding guides, design specs, runbooks, calculator specifications

## GitHub

- Org: `WDPR-SPS` on github.disney.com
- All repos under: `github.disney.com/WDPR-SPS/`
- Each repo has `.harness/` for CI/CD pipeline definitions
