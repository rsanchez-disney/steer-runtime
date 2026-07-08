# Estimation Guide

## Task Effort Sizing

| Size | Time | Description |
|------|------|-------------|
| XS | < 1h | Config change, simple string fix, one-liner |
| S | 1-2h | Simple function, model field, straightforward test |
| M | 2-4h | New endpoint, component, use case with tests |
| L | 4-8h | Feature module, complex business logic, multi-file change |
| XL | 8h+ | Cross-service integration, architectural change, new service |

## Complexity Assessment

### High Complexity
- Multiple business models affected (Merchandise + QSR + Table Service)
- Cross-service communication changes (gRPC proto + client + server)
- State management (transactions, check sync, concurrent access)
- Payment flows (PCI considerations, FiPay integration)
- Database migrations with data transformation

### Standard Complexity
- Single module, single language
- Follows existing pattern closely
- Clear requirements, no ambiguity
- Isolated change (no cross-service impact)

## Task Types

| Type | Description | Example |
|------|-------------|---------|
| implement | Write or modify code | New API endpoint |
| test | Write tests | Unit tests for new logic |
| config | Configuration change | Feature flag, env var |
| migrate | Schema/data change | New DB column, data backfill |
| integrate | Cross-service work | gRPC proto + client + server |
| document | Documentation | ADR, API docs, README |

## Overhead Estimates

Always add these to raw implementation time:
- Code review: +30min per L/XL task
- Integration testing: +1h for cross-service changes
- Security review: +30min for auth/payment changes
- QA handoff: +30min for new features

## Story Point Mapping

| Points | Effort Total | Risk |
|--------|-------------|------|
| 1 | XS-S (< 2h) | Low |
| 2 | S-M (2-4h) | Low |
| 3 | M (4-6h) | Low-Medium |
| 5 | M-L (6-12h) | Medium |
| 8 | L-XL (12-20h) | Medium-High |
| 13 | XL+ (20h+) | High — consider splitting |
