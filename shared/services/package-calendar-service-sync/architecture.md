# package-calendar-service-sync — Architecture

## Description
Calendar data synchronization from PAT Authoring to local cache

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ, Kafka, OpenFeign

## Source
- Repository: WDPR-Resort-Sales/package-calendar-service-sync
- 299 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
PAT Authoring (GraphQL), Kafka (event stream), Redis (cache + shedlock), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ, MSK (Kafka)

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
