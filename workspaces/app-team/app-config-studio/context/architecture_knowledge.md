## Config Studio Architecture Knowledge

### System Overview

**Config Studio** is a multi-tier payment configuration platform:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Angular)                    │
│              wdpr-payment-control-client                 │
└─────────────────────────────────────────────────────────┘
                           ↓ REST API
┌─────────────────────────────────────────────────────────┐
│                 WebAPI Layer (Node/Express)              │
│              wdpr-payment-control-api                    │
└─────────────────────────────────────────────────────────┘
                           ↓ gRPC/REST
┌─────────────────────────────────────────────────────────┐
│              Backend Services (Java/Spring)              │
│                wdpr-config-services                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│         Data Layer (PostgreSQL, Redis, Kafka)            │
└─────────────────────────────────────────────────────────┘
```

### Architectural Patterns

**1. Layered Architecture**
- UI → WebAPI → Backend → Data
- Each layer has clear responsibilities
- No layer skipping (UI doesn't call Backend directly)

**2. Service Layer Pattern (Backend)**
- Controllers handle HTTP/gRPC
- Services contain business logic
- Repositories handle data access
- DTOs for data transfer

**3. Component-Based UI (Angular)**
- Smart components (containers) manage state
- Dumb components (presentational) display data
- Services for shared logic and API calls
- RxJS for reactive data flow

**4. API Gateway Pattern (WebAPI)**
- Aggregates backend services
- Handles authentication/authorization
- Request/response transformation
- Rate limiting and caching

**5. Event-Driven (Kafka)**
- Async communication between services
- Event sourcing for audit trail
- CQRS for read/write separation

### Technology Stack

**UI (wdpr-payment-control-client)**:
- Angular 15+
- TypeScript
- RxJS
- Angular Material
- Jest for testing

**WebAPI (wdpr-payment-control-api)**:
- Node.js 18+
- Express
- TypeScript
- Joi for validation
- Jest for testing

**Backend (wdpr-config-services)**:
- Java 17+
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- JUnit 5 + Mockito

**Data**:
- PostgreSQL (primary data store)
- Redis (caching, sessions)
- Kafka (event streaming)

### Design Principles

**1. Backward Compatibility**
- Never break existing APIs
- Use versioning for breaking changes
- Deprecate before removing

**2. Separation of Concerns**
- Each component has single responsibility
- Clear boundaries between layers
- Loose coupling, high cohesion

**3. DRY (Don't Repeat Yourself)**
- Shared logic in services/utilities
- Reusable components
- Common patterns extracted

**4. SOLID Principles**
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

**5. Security by Design**
- Authentication at API gateway
- Authorization at service level
- Input validation everywhere
- No secrets in code
