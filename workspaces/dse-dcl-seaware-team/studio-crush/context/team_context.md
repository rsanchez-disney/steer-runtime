# Studio Crush — Digital Interfaces (.NET)

## Mission
Solution design, development, testing, and deployment of Travel Communications, Web/App, and Shared Platform .NET services that integrate with ABD and DCL Seaware for digital consumption (DCL.com, mobile apps, internal platforms).

## Team
| Role | Name |
|------|------|
| Tech Manager | Kim Baker |
| Tech Lead | John Madrid |
| Business Analysis | John Iannone |
| Lead Product Manager | Daniel Hutson |
| Scrum Master | Christopher Furtado |
| Dev | Coumar Kaliaperumal, Axel Velasquez, Alejandro Becerra, Roger Pereira |
| QA | Salvador Vega, Eric Rivera, Shrivatsav Sundar, Jorge Gomez |

## Business Context
Crush owns the **existing production .NET APIs** that DCL.com and the Disney Cruise Line mobile app rely on. These services wrap Seaware's reservation engine and expose cleaner REST APIs for digital teams. Crush handles the full guest lifecycle from availability search → booking → guest communications.

Studio Gadget Hackwrench is rebuilding these services in Java; Crush maintains them in production until migration completes.

## Supported BAPPs

### DCL Core APIs
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0248446 | DCL Amenity API | `Services.AmenityApi` |
| BAPP0248450 | DCL Booking API | `Services.BookingApi` |
| BAPP0248456 | DCL Client API | `Services.ClientApi` |
| BAPP0248460 | DCL Lookup API | `Services.LookupApi` |
| BAPP0248472 | DCL Reservation API | `Services.ReservationApi` |
| BAPP0248476 | DCL Seaware Services API | `DCL.Services.SeawareApi` |
| BAPP0243228 | DCL QVA (Data Eventing) | `DCL.Seaware.EventHandlers` |

### DCL Availability
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0248452 | DCL Cache Avail API | `Services.CachedAvailApi` |
| BAPP0248448 | DCL Availability Services | `Seaware.Availability` |

### Travel Communications
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0012377 | DCL Collateral Services | `Collateral`, `Seaware.ResponsysImport` |
| BAPP0004691 | DCL Guest Ticket Book (GTB) | `GTB`, `GTBUI` |

### ABD APIs
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0248382 | ABD Booking API | `ABD.Services.BookingApi` |
| BAPP0248386 | ABD Client API | `ABD.Services.ClientApi` |
| BAPP0248392 | ABD Collateral Services | `ABD.Collateral` |
| BAPP0248394 | ABD Guest Ticket Book | `ABD.GTB` |
| BAPP0248398 | ABD Lookup API | `ABD.Services.LookupApi` |
| BAPP0248402 | ABD Reservation API | `ABD.Services.ReservationApi` |

## Repositories (Azure DevOps — `dev.azure.com/disney-cruise/shoreside/_git/`)

| Repository | Service | Test Coverage |
|------------|---------|--------------|
| `Services.AmenityApi` | Amenity data lookup | Automated |
| `Services.BookingApi` | DCL Booking | Automated |
| `Services.CachedAvailApi` | Cached availability | Automated |
| `Services.ClientApi` | DCL Client/Guest | Automated |
| `Services.LookupApi` | Reference data | Automated |
| `Services.ReservationApi` | DCL Reservation | Automated |
| `DCL.Services.SeawareApi` | Seaware Services | Automated |
| `DCL.Seaware.EventHandlers` | QVA data eventing | Manual |
| `Seaware.Availability` | Availability engine | Automated |
| `Collateral` | Guest communications | Manual |
| `Seaware.ResponsysImport` | Responsys email | Manual |
| `GTB` | Guest Ticket Book backend | Manual |
| `GTBUI` | Guest Ticket Book UI | Manual |
| `ABD.Services.BookingApi` | ABD Booking | In progress |
| `ABD.Services.ClientApi` | ABD Client | In progress |
| `ABD.Collateral` | ABD Collateral | Manual |
| `ABD.GTB` | ABD Guest Ticket Book | Manual |
| `ABD.Services.LookupApi` | ABD Lookup | Automated |
| `ABD.Services.ReservationApi` | ABD Reservation | In progress |

## Architecture
- **Language:** C# / .NET Core + .NET Framework
- **Hosting:** AWS ECS (containerized)
- **Database:** Oracle (Seaware) via stored procedures
- **Caching:** Redis / in-memory for availability
- **Messaging:** ActiveMQ for QVA async eventing
- **Integration:** Responsys for guest email communications
- **CI/CD:** Azure DevOps Pipelines → ECS deployment
- **Monitoring:** AppDynamics, Splunk, Grafana
- **Shared NuGet Packages:** `Seaware.DataManager`, `Seaware.DataManagerEF`, `Services.Common`, `Shared`

## Products
- Cached Availability (cabin/pricing search for DCL.com)
- Booking API (reservation creation/modification)
- Guest Communications (Collateral / Seamail to guests)
- Reference Data Lookup (ports, ships, voyage types)
- Reservation Data Lookup
- Guest Data Lookup / Client API
- Guest Ticket Book (GTB)
- Data Eventing Service (QVA — queue-based data changes)
