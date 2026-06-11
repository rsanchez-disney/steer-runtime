# Studio Triton — Finance & Back Office

## Mission
Solution design, development, testing, and deployment of Back Office and Finance services that interface between shoreside Seaware and shoreside financial/operational systems.

## Team
| Role | Name |
|------|------|
| Tech Manager | Mark Birmingham |
| Tech Lead | Dominic Foti |
| Business Analysis | Sheri Gilbride |
| Product Manager | Jay Shahi |
| Data Product Manager | Aaron Brown |
| Financial PM Lead | Robyn Turpish |
| Lead Product Manager | Daniel Hutson |
| Scrum Master | Christopher Furtado |
| Dev | Sara Abdulla, Fabio Quintero, Brian Ocasio |
| QA | Salvador Vega, Eric Rivera, Jorge Gomez, Shrivatsav Sundar |

## Business Context
Triton handles the **financial plumbing** of DCL/ABD — ensuring payments are captured, refunds processed, accounting records reconciled, and back-office operations run smoothly. The studio owns CAP (Credit Account Processing) which handles guest folio transactions, the Refund interface for payment reversals, and DICE for internal resort booking operations. It also owns the GraphQL service that provides a unified data access layer for Seaware, which is consumed by other studios.

## Supported BAPPs

### Back Office
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0248380 | ABD Air Services | `ABD.Seaware.Console.AirItnImport` |
| BAPP0230199 | DCL Client Merge | `Services.ClientMerge.App/Common/Web` |
| BAPP0012395 | DCL DICE | `ResortBookings.Dice`, `ResortBookings.DiceUI` |
| BAPP0248418 | DCL Screen Pops | `dcl-seaware-genesys-screenpop` (GitHub) |
| BAPP0248404 | ABD Seaware Automic Jobs | `Scheduler.ABD`, `ABD.Seaware.*Extract` |
| BAPP0248474 | DCL Seaware Automic Jobs | `Scheduler.Seaware`, `Scheduler.DCLCommon` |

### Finance
| BAPP ID | Name | Repo |
|---------|------|------|
| BAPP0012365 | DCL Air Accounting Audit (AAA) | `Seaware.AAA.Api`, `Seaware.AAA.Web` |
| BAPP0248390 | ABD CAP Services | `ABD.Seaware.CAP` |
| BAPP0248454 | DCL CAP Services | `Seaware.CAP` |
| BAPP0246600 | DCL GDS Tokenizer | `Services.OtaProxy.Api` |
| BAPP0248400 | ABD Refund Services | `ABD.Seaware.RefundInterface` |
| BAPP0248464 | DCL Refund Services | `Seaware.RefundInterface` |
| BAPP0243754 | DCL SW Executor | `DCL.Services.Executor` |
| BAPP0248416 | DCL APP API | `DCL.Services.AppServicesApi` |

## Repositories

### Azure DevOps (`dev.azure.com/disney-cruise/shoreside/_git/`)
| Repository | Purpose |
|------------|---------|
| `Seaware.CAP` | DCL Credit Account Processing |
| `ABD.Seaware.CAP` | ABD Credit Account Processing |
| `Seaware.RefundInterface` | DCL Refund processing |
| `ABD.Seaware.RefundInterface` | ABD Refund processing |
| `Services.ClientMerge.App` | Client merge logic |
| `Services.ClientMerge.Common` | Shared merge utilities |
| `Services.ClientMerge.Web` | Client merge UI |
| `ResortBookings.Dice` | DICE backend |
| `ResortBookings.DiceUI` | DICE UI |
| `DCL.Services.Executor` | Seaware bulk executor |
| `DCL.Services.AppServicesApi` | APP API (financial) |
| `Seaware.AAA.Api` | Air Accounting API |
| `Seaware.AAA.Web` | Air Accounting Web UI |
| `Services.OtaProxy.Api` | GDS Tokenizer / OTA proxy |
| `Seaware.AutoCancel` | Auto-cancel batch job |
| `Seaware.CcRateImport` | CC Rate import batch |
| `Scheduler.Seaware` | Main batch scheduler |
| `Scheduler.DCLCommon` | Shared scheduler utilities |

### GitHub
| Repo | Purpose |
|------|---------|
| `github.disney.com/dcl/dcl-seaware-genesys-screenpop` | Contact center screen pop |

### GitLab
| Repo | Purpose |
|------|---------|
| `gitlab.disney.com/dse/container-applications/seaware/seaware-graphql` | GraphQL data access |

## Architecture
- **Language:** C# / .NET (most services), Java (GraphQL service)
- **GraphQL Service:** Unified data access layer to Seaware Oracle DB (used by Gadget Hackwrench services)
- **Executor:** Bulk operation engine — runs configurable stored-procedure-based operations against Seaware
- **CAP:** Credit/debit account processing for guest folios (payment capture, settlement)
- **Refund:** Automated refund interface to downstream payment systems
- **DICE:** Internal resort bookings tool with API + Web UI
- **Batch Jobs:** Automic-scheduled .NET console apps for extracts, imports, reconciliation
- **CI/CD:** Azure DevOps Pipelines (most), Harness (GraphQL)
- **Hosting:** AWS ECS, some legacy EC2

## Products
- Accounting (financial record keeping)
- Travel Operations support
- AAA (Air Accounting Audit)
- Data Extracts (financial reconciliation)
- Refund processing
- BizLogic (core transaction engine)
- GraphQL data access layer
- Client Merge (duplicate guest profile resolution)
- Screen Pops (Genesys contact center integration)
