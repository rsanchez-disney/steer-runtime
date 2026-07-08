# POS Platform Architecture Principles

## Core Principles

1. **Backward compatible by default** — additive schema changes, no breaking contracts
2. **Feature flags for all new features** — planned migration path, not long-lived
3. **Service boundaries are strict** — no direct DB access across services
4. **gRPC contracts are versioned** — proto changes must be backward compatible
5. **Monolith extractions are incremental** — extract to service only when justified
6. **DependencyInjection for service resolution** — never instantiate directly

## Anti-Patterns to Flag

| Anti-Pattern | Why It's Bad | Alternative |
|-------------|-------------|-------------|
| Shared database between services | Tight coupling, migration hell | Service-owned DB, sync via gRPC/events |
| Synchronous chains of >3 gRPC hops | Latency, cascade failure | Async events, pre-computed views |
| Business logic in controllers | Untestable, scattered logic | Service/Interactor layer |
| Feature flags without expiration plan | Permanent complexity | Add removal date to flag definition |
| Circular dependencies between services | Deployment deadlocks | Unidirectional, event-based decoupling |
| Direct SQL in controllers | SQL injection risk, no abstraction | Repository pattern |

## When to Extract a Microservice

Only when ALL of these apply:
- ☐ Independent scaling requirement
- ☐ Different deployment cadence needed
- ☐ Clear domain boundary (its own aggregate)
- ☐ Team ownership is distinct

Otherwise → keep in monolith or extend an existing service.

## System Topology

```
ActivateX (Android) ←→ Connect API (PHP) ←→ Go/PHP Microservices
                                          ←→ RabbitMQ (async)
                                          ←→ Database (per service)
```

## Communication Patterns

| Pattern | When to Use | POS Example |
|---------|-------------|-------------|
| gRPC (sync) | Real-time request/response, tight coupling OK | Product catalog lookup |
| REST (sync) | External clients, simple CRUD | Connect API to frontend |
| RabbitMQ (async) | Fire-and-forget, eventual consistency | Audit events, reports |
| Feature flag | Progressive rollout | New payment flow |

## ActivateX Compatibility Checklist

Before approving any API change:
- [ ] Is the change additive? (new fields, new endpoints)
- [ ] Are removed/renamed fields still served for old clients?
- [ ] Is there a version negotiation mechanism?
- [ ] Has the mobile team been consulted?
- [ ] Is there a minimum app version requirement?
