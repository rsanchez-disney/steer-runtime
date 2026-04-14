# Architecture Patterns

## Config Studio Architecture
```
UI (Angular) → WebAPI (Node/Express) → Backend (Java/Spring) → Data (PostgreSQL, Redis, Kafka)
```
No layer skipping — UI never calls Backend directly.

## Backend Patterns (Java/Spring)
- Controller → Service → Repository → Database
- DTOs for data transfer (never expose entities)
- Services contain business logic, repositories handle data access
- Events via Kafka for async communication

## WebAPI Patterns (Node/Express)
- API gateway: aggregates backend services
- Handles auth, rate limiting, request transformation
- Service clients with retry logic for backend calls

## UI Patterns (Angular)
- Smart components (containers) manage state and call services
- Dumb components (presentational) receive @Input, emit @Output
- Services for API calls and shared logic
- RxJS for reactive data flow

## Design Principles
- Backward compatibility: never break existing APIs, use versioning
- Separation of concerns: single responsibility per component
- Loose coupling, high cohesion
- SOLID principles throughout

## Decision Framework
When designing a feature:
1. What problem are we solving? What are the constraints?
2. What patterns already exist in the codebase?
3. Which layers/components are affected?
4. What are the trade-offs (performance vs complexity)?
5. What's the testing strategy?
