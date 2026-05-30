# Business Rules — List Service

## Service Purpose

List Service is the front end for all other services on the PEP Platform. It gets content data from two primary systems:
- **Vendomatic** (BAPP0054821) — Configuration data

Every service calls List Service to provide the content of the page. RabbitMQ notifies List Service when there is a change in a file.

---

## Data Flow

### Vendomatic Flow
1. File sent to Vendomatic file server
2. Vendomatic file servers process file to new cloud file servers
3. Vendomatic media notifier sends requests to List Service through RabbitMQ
4. List Service processes changes from Vendomatic database (MariaDB)
5. Output stored in Couchbase
---

## Critical Dependencies

| Dependency | Criticality | Purpose |
|-----------|-------------|---------|
| RabbitMQ | **CRITICAL** | Event notification; app will NOT start without it |
| Vendomatic (BAPP0054821) | Highly Critical | Configuration data source |
| Redis | High | Caching layer |
| Couchbase | High | Content data storage |
| MariaDB | High | Vendomatic configuration data |

---

## Highly Critical Dependents (services that depend on List Service)

| Service | BAPP | Purpose |
|---------|------|---------|
| Authentication Service | BAPP0008237 | Session auth, pinned offer verification |
| Availability Service | BAPP0010370 | Product/service availability |
| Booking Service | BAPP0012680 | Multi-site booking (PII Data) |
| Recommendation Service | BAPP0008633 | Promotions, cart upgrades, personalization |
| Reservation Service | BAPP0008630 | Reservation lookup and retrieval |
| Cruise Booking Service | BAPP0054884 | DCL bookings |
| Facility Service | BAPP0010367 | Catalog content aggregation |
| Integrator | BAPP0054908 | Content integration |

---

## Impact Classification

- **Full outage:** All dependent services lose access to configuration and content data — booking, availability, authentication affected across all park sites
- **Degraded:** Slow responses from cache misses; stale data served if RMQ notifications delayed
- **RabbitMQ down:** Application cannot start; existing running instances continue but won't receive updates

---

## Key Constraints

- Application will NOT start without RabbitMQ (gathers mbeans on startup)
- Internal ALB has manual HTTP listener — never run Terraform on it
- Security: TLS 1.2 minimum, Entrust certificates (auto-renew on F5)
- External traffic routed through Akamai CDN
- Legacy F5 infrastructure coexists with new ALB routing
