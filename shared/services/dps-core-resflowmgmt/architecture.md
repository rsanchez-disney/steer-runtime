# dps-core-resflowmgmt — Architecture

## Description
Reservation flow management — freeze, confirm, cancel, reprice

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ, OpenFeign

## Source
- Repository: WDPR-Resort-Sales/dps-core-resflowmgmt
- 672 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
dps-core-offer, dps-core-quote, inventory systems, Redis (cache + shedlock), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
