# Studio Data Droids — Reporting & Insights

## Mission
Report development and maintenance for shoreside (ABD & DCL Seaware) and shipboard (Fidelio, CDS, ERC, GRATS, OARS, X-Dining, Superstar2, TACK) applications. Provides business intelligence and operational reporting across the entire DCL/ABD ecosystem.

## Team
| Role | Name |
|------|------|
| Tech Manager / Lead | Cory Marshall |
| Business Analysis | Krishna Parashar |
| Lead Product Manager | Daniel Hutson |
| Data Product Manager | Aaron Brown |
| Financial PM Lead | Robyn Turpish |
| Scrum Master | Christopher Furtado |
| Dev | Dhiwahar Vadivel, Shanmathee Saravanagopalan, Esha Aggarwal |
| QA | Eric Rivera |

## Business Context
Data Droids provides the **reporting layer** across all of DCL and ABD. Business users rely on Data Droids reports for operational decisions (occupancy, yield, revenue), financial reconciliation (GL extracts, settlement), and shipboard operations (dining capacity, activity participation, retail sales). The studio migrated from Crystal Reports / SAP Business Objects (retired May 2026) to MicroStrategy as the sole BI platform.

Unlike other SEAS studios, Data Droids does not own typical application code repos — their deliverables are SQL queries, stored procedures, ETL processes, and MicroStrategy report/dashboard objects.

## Data Sources

### Shoreside Systems
| System | Purpose | Database |
|--------|---------|----------|
| DCL Seaware | DCL reservation data | Oracle |
| ABD Seaware | ABD reservation data | Oracle |
| Affairware | Travel agent commissions | SQL Server |
| Trip DB | Trip planning data | SQL Server |
| mBark | Embarkation/debarkation | SQL Server |

### Shipboard Systems
| System | Purpose |
|--------|---------|
| Fidelio | Ship property management (staterooms, housekeeping) |
| OARS | Onboard Activity Reservation System |
| CDA | Cast deployment / crew management |
| ERC | Employee resource center |
| GRATS | Gratuity tracking and distribution |
| mBark | Mobile embarkation |
| X-Dining | Dining management and assignments |
| Superstar2 | Retail/merchandise POS |
| TACK | Training & compliance tracking |
| DXP | Digital experience platform (deprecated) |
| Silverwhere | Table management (deprecated) |

## Technology Stack

### Current (2026)
| Technology | Purpose |
|-----------|---------|
| MicroStrategy | Primary BI/reporting platform |
| Oracle DB | Seaware source data |
| SQL Server | Reporting data warehouse |
| Stored Procedures | Data extraction and transformation |
| ETL/ELT Jobs | Scheduled data pipeline refreshes |

### Retired (as of Q1 2026)
- Crystal Reports 2016 (end of support 12/31/24)
- SAP Business Objects 4.2 (end of support 12/31/24)

## Architecture
```
Source Systems (Oracle/SQL Server)
    ↓ (Scheduled ETL/ELT)
Reporting Data Warehouse (SQL Server)
    ↓ (MicroStrategy cubes/datasets)
MicroStrategy Server
    ↓ (Web portal)
Business Users (Reports + Dashboards)
```

- **Reporting Platform:** MicroStrategy (web-based self-service + scheduled distribution)
- **Data Pipeline:** Source systems → Oracle/SQL Server → MicroStrategy cubes → Reports/Dashboards
- **Refresh Frequency:** Ranges from real-time (transactional) to daily (aggregate)
- **Access:** Role-based MicroStrategy portal for business users
- **Delivery:** Scheduled report distribution via email + on-demand web access

## Repositories
Data Droids primarily works with SQL objects, MicroStrategy report definitions, and stored procedures rather than traditional application code. No GitHub/GitLab application repos.

## Products
- **Operational Reports** — booking volume, occupancy rates, yield management
- **Financial Reports** — accounting reconciliation, GL extracts, settlement
- **Shipboard Reports** — dining capacity, activity participation, retail sales, embarkation
- **Executive Dashboards** — revenue, passenger counts, voyage performance
- **Ad-hoc Analytics** — self-service MicroStrategy queries for business users
