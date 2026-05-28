# package-calendar-service — Architecture

## Description
Package availability calendar — serves cached calendar data to consumers

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ, OpenFeign

## Source
- Repository: WDPR-Resort-Sales/package-calendar-service
- 248 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
package-calendar-service-sync (data source), Redis (cache + shedlock), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
