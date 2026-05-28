# dps-core-scoreschemeconfig — Architecture

## Description
Scoring scheme configuration — manages rules that rank/personalize offers

## Tech Stack
Java 21, Spring Boot, Apache CXF (JAX-RS), Redis, RabbitMQ

## Source
- Repository: WDPR-Resort-Sales/dps-core-scoreschemeconfig
- 139 Java source files
- Package: com.disney.wdpr.pkg.svc

## Dependencies
Redis (cache), RabbitMQ (events)

## Infrastructure
AWS ECS, Redis ElastiCache, RabbitMQ

## Deployment
- Platform: AWS ECS (Fargate)
- Environments: latest → stage → load → prod
- Sites: DLR (Disneyland Resort), DLP (Disneyland Paris)
