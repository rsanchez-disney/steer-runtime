# Business Rules — Vendomatic

## Service Purpose

Vendomatic manages toggles, configuration data, and glue text for WDW, DLR, and HKDL sites. It stores structured configuration in MySQL (not JSON in a CMS) with a purpose-built PHP UI to reduce errors.

---

## Data Types Managed

- **Toggles:** Feature flags and configuration switches across park sites
- **Configuration Data:** Structured settings consumed by downstream services via List Service
- **Glue Text:** Miscellaneous UI text (button labels, form field labels, error messages)
  - Developers create/manage keys
  - Producers manage base text and translations

---

## Data Flow

1. Producers/developers manage data via Vendomatic PHP UI
2. Data stored in MySQL tables
3. RabbitMQ notifies List Service when a file/config changes
4. List Service processes changes from Vendomatic database
5. Output stored in Couchbase (via List Service)
6. Consumer applications retrieve config via List Service REST endpoints (`Get Configuration` / `Get Configurations`)

---

## Dependencies

| Direction | Service | BAPP | Relationship |
|-----------|---------|------|-------------|
| Downstream | List Service | BAPP0012686 | Serves Vendomatic config to consumers via REST |
| Infrastructure | MySQL | — | Primary data store |
| Infrastructure | RabbitMQ | — | Change notifications to List Service |

---

## Dependents (via List Service)

All services that call List Service for configuration data depend on Vendomatic indirectly:
- Authentication Service (BAPP0008237)
- Availability Service (BAPP0010370)
- Booking Service (BAPP0012680)
- Recommendation Service (BAPP0008633)
- Reservation Service (BAPP0008630)
- Facility Service (BAPP0010367)
- And many others

---

## Impact Classification

- **Full outage:** Configuration changes cannot be made; existing cached data continues to serve
- **Degraded:** UI slow or partially functional; changes may not propagate if RabbitMQ is down
- **Data corruption:** Incorrect toggles could affect guest-facing site behavior across all parks

---

## Key Constraints

- No automated regression testing (known gap)
- Legacy PHP application — changes require careful testing
- Manages data for 3 park sites (WDW, DLR, HKDL)
