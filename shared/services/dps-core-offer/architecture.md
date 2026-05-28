# dps-core-offer — Architecture

## Description
Package offer search with scoring and personalization

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ, OpenFeign

## Source
- Repository: WDPR-Resort-Sales/dps-core-offer
- 762 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
PAT Authoring (GraphQL), DPE (pricing), TBX Group Master, Redis (cache + shedlock), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
