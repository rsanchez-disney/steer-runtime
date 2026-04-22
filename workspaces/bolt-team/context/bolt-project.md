# BOLT Project Context

## Overview
BOLT (Bulk Order and Logistics Tool) is Disney Parks & Resorts' internal admin platform for managing bulk ticket orders, store configurations, product subsets, entry codes, reports, and billing across WDW and DLR.

## Architecture (Current → Target)
```
Current: Browser → AngularJS SPA (:8626) → WAM (wdpr-wam :8625) → bolt-service (Java 11 :8080)
Target:  Browser → Angular 20 SPA (:4200) → WebTier BFF (Node.js :8625) → bolt-service (Java 11 :8080)
```

## Migration Scope (v2)
- **Frontend**: AngularJS 1.4 → Angular 20 (10 epics, 476 SP AI-adjusted)
- **WebTier BFF**: WAM → Node.js Express/Fastify proxy (1 epic, 141 SP AI-adjusted)
- **bolt-service**: UNCHANGED (Java 11, Spring 5.2, CXF 3.4, Hystrix)
- **Total**: 11 epics, 797 SP raw / 617 SP AI-adjusted
- **Team**: 9 people (5 FE + 2 Node.js + QA + BA)
- **Timeline**: May 5 → September 22, 2026 (11 sprints)

## Repositories
| Repo | Type | Status |
|---|---|---|
| wdprt-bolt-admin-spa | Legacy SPA (AngularJS 1.4) | 🟡 Being replaced |
| wdprt-bolt-admin-wam | Legacy WAM (Node.js) | 🟡 Being replaced |
| wdprt-bolt-service | Java backend (Spring/CXF) | 🟢 Unchanged |
| bolt-admin | New Angular 20 SPA | 🔵 In development |
| bolt-docs | Migration planning & documentation | 🟢 Active |

## Key Domain Concepts
- **Store Instance**: Configured store with products, delivery methods, payment methods
- **Store Order**: Bulk ticket order with line items, billing, shipping
- **Product Subset**: Curated product set per store
- **Entry Code**: Access codes for store entry
- **BOLT Config**: Configuration templates for store behavior

## External Integrations
Lexicon (WDW/DLR), Booking, PEOS, Adaptive Payment, SparkPost, LightYear, D-Scribe, DPE, MyID (OIDC), Keystone

## Documentation
Migration docs at: docs/BOLT Migration/
- BOLT-MIGRATION-PLAN-v2.md (current plan)
- BOLT-MIGRATION-ESTIMATION-v2.md (team & estimation)
- BOLT-MIGRATION-SIMULATION-v2.md (sprint simulation)
- BOLT-FULL_MIGRATION-DRIFT-ESTIMATION-v2.md (token economics)
