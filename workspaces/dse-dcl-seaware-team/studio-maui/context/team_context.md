# Studio Maui — Revenue Management

## Mission
Solution design, development, testing, and deployment of Revenue Management services that integrate with DCL Seaware — including insurance, bulk uploaders (Scuttle), event propagation (Zazu), and room assignment operations.

## Team
| Role | Name |
|------|------|
| Tech Manager | Mark Birmingham |
| Tech Lead | Marcelo Castro |
| Product Manager | Jay Shahi |
| Data Product Manager | Aaron Brown |
| RMS Product Manager | Cesar Quijano |
| Lead Product Manager | Daniel Hutson |
| Business Analysis | Sheri Gilbride |
| Scrum Master | Christopher Furtado |
| Dev | Amritesh Singh, Dhanashree Dateer, Kamal Kant Pandey |
| QA | Salvador Vega, Eric Rivera, Shrivatsav Sundar, Jorge Gomez |

## Business Context
Maui spun off from Triton to specialize in **revenue optimization** for DCL. The studio manages:
- **Insurance** integration with AON (travel protection sold with cruise bookings)
- **Scuttle** — an Angular web portal giving operations teams self-service tools for bulk data uploads to Seaware (IRGS room assignments, dry dock configurations, charter setups)
- **Zazu** — a Java event-driven service that propagates data changes from Seaware to downstream consumers via Kafka and webhooks
- **RMS batch jobs** — scheduled extracts/imports for the external Revenue Management System (pricing, inventory, rules)

## Supported BAPPs

### Revenue Management
| BAPP ID | Name | Description |
|---------|------|-------------|
| BAPP0248396 | ABD Insurance Services | ABD insurance integration with AON |
| BAPP0248458 | DCL Insurance Services | DCL insurance integration with AON |
| BAPP0243754 | DCL SW Executor | Bulk operations engine (shared with Triton) |
| BAPP0252998 | DCL Scuttle | Angular web portal for uploaders/tools |
| BAPP0255275 | DCL Room Assignment Operations | Automated room assignment |

### Back Office
| BAPP ID | Name | Description |
|---------|------|-------------|
| BAPP0012374 | DCL Booking Alert | Booking notification service |

## Repositories

### Azure DevOps (`dev.azure.com/disney-cruise/shoreside/_git/`)
| Repository | Purpose |
|------------|---------|
| `Seaware.Insurance` | DCL Insurance integration |
| `ABD.Seaware.Insurance` | ABD Insurance integration |
| `Services.BookingAlert.Api` | Booking Alert API |
| `Services.BookingAlert.Batch` | Booking Alert batch processor |
| `Services.BookingAlert.Web` | Booking Alert UI |
| `Seaware.RMS.AppCouponReport` | RMS coupon reporting |
| `Seaware.RMS.AvailabilityExtract` | RMS availability data extract |
| `Seaware.RMS.Common` | RMS shared libraries |
| `Seaware.RMS.IntradayBatchExtract` | Intraday batch data |
| `Seaware.RMS.InventoryExtract` | Inventory data for RMS |
| `Seaware.RMS.LookupDataExtract` | Reference data extract |
| `Seaware.RMS.ResDataExtract` | Reservation data for RMS |
| `Seaware.RMS.ResUpdate` | Reservation updates from RMS |
| `Seaware.RMS.RuleExtract` | Pricing rule extraction |
| `Seaware.RMS.RuleImport` | Pricing rule import |
| `Scheduler.RevenueManagement` | RMS batch scheduler |
| `Scheduler.RevenueManagement.LocalBatch` | Local batch scheduler |

### GitHub (`github.disney.com/dcl/`)
| Repository | Purpose |
|------------|---------|
| `dcl-scuttle` | Scuttle Angular web portal |
| `dcl-zazu-eventing-service` | Zazu event-driven service |

## Architecture

### Scuttle (Web Portal)
- **Language:** TypeScript / Angular (per RA guidance)
- **Purpose:** Self-service portal for BSM and operations teams
- **Features:** File uploaders (IRGS, Dry Dock, Charter, Groups, Shipboard), dashboards, research tools
- **Hosting:** GitHub → Harness → Kubernetes
- **URL:** `https://latest.scuttle.wdprapps.disney.com/`
- **Pattern:** Micro-app architecture — each uploader is a feature module integrating with different backend APIs
- **Future use cases:** FX Uploader, Bulk Dining Assignment, TA Commission Recalc, Executor Uploader

### Zazu (Eventing Service)
- **Language:** Java 21 / Spring Boot 3
- **Purpose:** Event-driven data propagation from Seaware to downstream consumers
- **Pattern:** Sharded pollers + Kafka/Webhook sinks
- **Key Components:**
  - **EventRegistry** — YAML-based event definitions
  - **Poller Orchestrator** — sharded parallel polling with ShedLock
  - **Source Connectors** — JDBC (stored procedures)
  - **Transformer** — DB rows → canonical ZazuEvent JSON
  - **Router** — SpEL rule-based destination selection
  - **KafkaSink** — publishes with keys/headers, acks, retries, DLQ
  - **WebhookSink** — POST/PUT with auth, signing, retries/backoff, circuit breaker
  - **Offset/Dedup Store** — watermarks per (event, shard), idempotency per (destination, eventId)
  - **ShedLock** — cluster-safe distributed scheduling (JDBC backend)
- **Scalability:** Horizontal via sharding + ShedLock
- **Metrics:** lag (now − watermark), rows pulled, sent, failures, retry depth

### Insurance Service (.NET)
- **Integration:** AON Insurance API
- **Flow:** DCL/ABD reservation events → Insurance API → coverage confirmation
- **Modernization:** Moving to Zazu-based event flow (future state)

### RMS Batch Jobs (.NET)
- **Pattern:** Scheduled .NET console apps (Automic-triggered)
- **Data Flow:** Bidirectional — extracts go out to RMS, rule imports come back
- **Scope:** Inventory, availability, reservations, pricing rules

## Products
- AON Insurance integration (travel protection)
- Scuttle self-service portal (bulk uploaders)
- Zazu event propagation (Kafka/webhook)
- Bulk Seaware Uploaders (IRGS, Dry Dock, New Ship, Charter, Crossover)
- GTY Room Assignment (revenue-optimized cabin allocation)
- Booking Alert notifications
