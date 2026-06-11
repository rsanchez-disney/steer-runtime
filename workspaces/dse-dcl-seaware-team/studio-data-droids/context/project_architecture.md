# Studio Data Droids — Project Architecture

> No application code repositories. Deliverables are SQL, stored procedures, ETL jobs, and MicroStrategy objects.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| BI Platform | MicroStrategy (web self-service + scheduled distribution) |
| Source DBs | Oracle (Seaware), SQL Server (warehouse, shipboard systems) |
| ETL | Stored procedures + scheduled jobs |
| Delivery | Web portal (role-based) + email distribution |

## Data Pipeline Architecture

```
Source Systems (15+ databases)
    ↓ (Scheduled ETL/ELT — stored procedures)
Reporting Data Warehouse (SQL Server)
    ↓ (MicroStrategy cubes/datasets)
MicroStrategy Server
    ↓ (Web portal + scheduled reports)
Business Users
```

## Data Source Connectivity

### Shoreside (Oracle / SQL Server)
| System | Database | Refresh |
|--------|----------|---------|
| DCL Seaware | Oracle | Near real-time |
| ABD Seaware | Oracle | Near real-time |
| Affairware | SQL Server | Daily |
| Trip DB | SQL Server | Daily |
| mBark | SQL Server | Event-driven |

### Shipboard (SQL Server — ship-to-shore sync)
| System | Purpose |
|--------|---------|
| Fidelio | Property management (staterooms) |
| OARS | Onboard Activity Reservations |
| CDA | Crew deployment |
| ERC | Employee resources |
| GRATS | Gratuity tracking |
| X-Dining | Dining management |
| Superstar2 | Retail POS |
| TACK | Training compliance |

## Report Categories
- **Operational** — booking volume, occupancy, yield
- **Financial** — GL extracts, settlement, reconciliation
- **Shipboard** — dining, activities, retail, embarkation
- **Executive** — revenue dashboards, voyage performance
- **Ad-hoc** — self-service MicroStrategy queries

## Retired Platforms (as of Q1 2026)
- Crystal Reports 2016
- SAP Business Objects 4.2
