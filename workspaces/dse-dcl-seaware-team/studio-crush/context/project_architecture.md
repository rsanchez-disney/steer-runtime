# Studio Crush — Project Architecture

> All repos are in Azure DevOps (`dev.azure.com/disney-cruise/shoreside/_git/`). No GitHub repos.

## Shared Stack (all services)

| Layer | Technology |
|-------|-----------|
| Language | C# / .NET Core + .NET Framework |
| Hosting | AWS ECS (containerized) |
| Database | Oracle (Seaware) via stored procedures |
| Caching | Redis / in-memory for availability |
| Messaging | ActiveMQ (QVA async eventing) |
| Packages | Seaware.DataManager, DataManagerEF, Services.Common, Shared (NuGet) |
| CI/CD | Azure DevOps Pipelines → ECS |
| Monitoring | AppDynamics, Splunk, Grafana |

## Service Catalog

### DCL Core APIs
| Service | Repo | Purpose |
|---------|------|---------|
| Amenity API | `Services.AmenityApi` | Amenity data lookup for cruise ships |
| Booking API | `Services.BookingApi` | Reservation create/modify for DCL.com |
| Client API | `Services.ClientApi` | Guest profile CRUD |
| Lookup API | `Services.LookupApi` | Reference data (ports, ships, voyages) |
| Reservation API | `Services.ReservationApi` | Reservation retrieval |
| Seaware Services API | `DCL.Services.SeawareApi` | Low-level Seaware wrapper |
| QVA (Data Eventing) | `DCL.Seaware.EventHandlers` | Queue-based data change propagation |

### Availability
| Service | Repo | Purpose |
|---------|------|---------|
| Cache Avail API | `Services.CachedAvailApi` | Cached cabin/pricing search (high-traffic) |
| Availability Services | `Seaware.Availability` | Availability computation engine |

### Travel Communications
| Service | Repo | Purpose |
|---------|------|---------|
| Collateral | `Collateral` | Guest communications (Seamail) |
| Responsys Import | `Seaware.ResponsysImport` | Email marketing integration |
| Guest Ticket Book | `GTB`, `GTBUI` | Digital travel documents |

### ABD APIs
| Service | Repo | Purpose |
|---------|------|---------|
| ABD Booking | `ABD.Services.BookingApi` | ABD reservation API |
| ABD Client | `ABD.Services.ClientApi` | ABD guest profiles |
| ABD Collateral | `ABD.Collateral` | ABD communications |
| ABD GTB | `ABD.GTB` | ABD travel documents |
| ABD Lookup | `ABD.Services.LookupApi` | ABD reference data |
| ABD Reservation | `ABD.Services.ReservationApi` | ABD reservation retrieval |

## Architecture Pattern

```
DCL.com / Mobile App
    ↓ (HTTPS REST)
.NET API (ECS container)
    ↓ (Stored procedures / ORM)
Oracle DB (Seaware)
    ↓ (ActiveMQ JMS)
QVA Event Handlers (async propagation)
```

## Migration Status
These services are being replaced by Studio Gadget Hackwrench's Java microservices. Crush maintains them in production until migration completes per-service.
