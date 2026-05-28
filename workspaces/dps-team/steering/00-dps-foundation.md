---
inclusion: always
---

# DPS Foundation — Disney Package Service conventions

## Architecture
- All services are Java/Spring Boot microservices on AWS ECS
- Inter-service communication via REST APIs
- PAT (Product Authoring Tool) is the source of truth for package catalog data
- DPE (Disney Pricing Engine) handles pricing calculations

## Repositories
| Service | Purpose | Tech |
|---------|---------|------|
| dps-core-offer | Package offer search with scoring/personalization | Java, Spring Boot |
| dps-core-quote | Quote generation and price locking | Java, Spring Boot |
| dps-core-resflowmgmt | Reservation flow orchestration (freeze/confirm) | Java, Spring Boot |
| dps-core-scoreschemeconfig | Scoring scheme configuration management | Java, Spring Boot |
| package-calendar-service | Package availability calendar | Java, Spring Boot |
| package-calendar-service-sync | Calendar data synchronization from PAT | Java, Spring Boot |

## Key Concepts
- **Offer Search**: Queries PAT catalog, applies scoring, returns ranked packages
- **Quote**: Locks a price for a specific package configuration
- **Freeze**: Reserves inventory for a limited time before confirmation
- **Scoring Scheme**: Rules that rank/personalize offers per channel/market

## Environments
- latest → stage → load → prod
- DLR (Disneyland Resort) and DLP (Disneyland Paris) are separate deployments

## Conventions
- Branch naming: `feature/ISOPP-{id}-description`
- All PRs require at least 1 approval
- Integration tests run against `latest` environment
