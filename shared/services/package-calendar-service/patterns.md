# package-calendar-service — Patterns

## Architecture Pattern
- Layered: Resource (JAX-RS) → Service → DAO/Client
- OpenFeign for inter-service calls
- Redis for caching and distributed locks (Shedlock)
- RabbitMQ for async event publishing

## Key Patterns
- Request validation at resource layer
- Business logic in service layer
- External calls via OpenFeign clients
- Cache-aside pattern with Redis
- Event-driven updates via RabbitMQ

## Testing
- Unit tests: JUnit 5 + Mockito
- Integration tests: against `latest` environment
- Contract tests: Pact (consumer-driven)
