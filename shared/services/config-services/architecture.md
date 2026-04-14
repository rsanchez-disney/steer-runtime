<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Services — Architecture

## Tech Stack
- Language: Java
- Framework: Spring Boot
- Database: Oracle DB
- Message broker: N/A (synchronous REST)

## Dependencies
| Service | Purpose |
|---|---|
| wdpr-payment-controls-api | Node.js BFF — proxies UI requests |
| wdpr-payment-controls-client | Angular UI — consumes via BFF |
| Payment Gateway | Downstream payment processing |

## Data Flow
```
Angular UI → payment-controls-api (Node BFF) → config-services (Java) → Oracle DB
```

## Deployment
- Cluster: ECS
- Namespace: payments
- Scaling: 2-4 replicas (auto-scaled)
