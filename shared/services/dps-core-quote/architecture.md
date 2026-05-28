# dps-core-quote — Architecture

## Description
Quote generation — locks price for a specific package configuration

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ, OpenFeign

## Source
- Repository: WDPR-Resort-Sales/dps-core-quote
- 390 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
dps-core-offer (offer data), DPE (pricing), Redis (cache + shedlock), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
