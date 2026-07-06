# Disney Package Service (DPS) — Team Context

## What DPS Does

DPS is the backend service platform that handles resort package offer search, quote generation, and reservation flow management for Disneyland Resorts. It assembles package offers (room + tickets + ancillaries), checks availability across multiple systems, calculates pricing via DPE, scores and personalizes offers, and manages the freeze/confirm lifecycle. Supports DLR (Disneyland Resort) and DLP (Disneyland Paris).

Part of the **Yield Management Platform (YMP)** initiative.

## Team

| Role | Person |
|------|--------|
| Sr Manager | Parthiban Subramaniam |
| Studio Manager | Prabesh Bhaskaran |
| Studio Architect | Benas Vaiciunas |
| Scrum Master | Neha Noonemunthala |
| Product Owner | Richard Santos |
| TPM | Jamie Stutz, Brett Johnson |

### Globant team

- Jenisse Vereau
- Juan Carassai
- Jonathan Garzon
- Macarena Quiroz

**Team DL**: DX.DL-YMP.DPS.Team@disney.com

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              CLIENTS                                             │
│                    DO (Disney Online) │ EAI Adapter (DLP SBC) │ TravelBox (TBX) |                │
│                                       DLR UAD/Online │ DLP                                       │
└────────────┬─────────────────────────────┬────────────────────────────────────┬──────────────────┘
             │ POST /packages              │ POST /quote-offer                  | POST /offer-freeze
             ▼  /selected-package-offers   ▼                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         DPS (Orchestrator)                                       │
│                                                                                                  │
│                ┌──────────────────────────────────────────────────────────────┐                  │
│                │  Coordinates scoring, eligibility, availability, pricing     │                  │
│                └──────────────────────────────────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
          | (offer)                      |                                         |
          ▼                              ▼                                         ▼
  ┌──────────────────┐    ┌──────────────────────────────────────┐     ┌───────────────────────┐   
  │  OS (Offer       │    │  DPOS (Disney Offer Service)         │     │          PAT          |
  │  Scoring)        │    │  Availability + Pricing processor    │     | Eligibility + Catalog |
  └──────────────────┘    └──────────────────────────────────────┘     └───────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OTHER DOWNSTREAM SERVICES                         │
│                                                                      │
│  PAT (Product Attribute Tool) — eligibility, product data, TBX codes │
│  RAS (Room Availability Service) — room availability by rate plan    │
│  TAS (Ticket Availability Service) — ticket group availability       │
│  AAS (Ancillary Availability Service) — ancillary availability       │
│  DPE (Dynamic Pricing Engine) — nightly rates, total offer pricing   │
│  CEA (Personalization) — segmentation, optimization, upsell          │
│  RIS (Room Inventory Service) — room inventory freeze (→ TravelBox)  │
└─────────────────────────────────────────────────────────────────────┘
```
- From [DPS Context Diagram](https://disneyexperiences.atlassian.net/wiki/spaces/DisneyPackageService/pages/1050286326/Context+Diagram+%E2%80%94+Disney+Package+Service)

## Repos & Tech Stack

| Repo | Purpose | Unique Aspects |
|------|---------|----------------|
| `dps-core-offer` | Core offer search (ROH + DOS orchestration) | Separate DLR + DLP Harness pipelines |
| `dps-core-resflowmgmt` | Reservation flow: freeze, validate, confirm, cancel | SOAP/JAX-WS for TravelBox integration |
| `dps-core-quote` | Package quote generation and price validation | OpenFeign for downstream calls |
| `dps-core-scoreschemeconfig` | Score scheme configuration CRUD | No Pact tests |
| `package-calendar-service-sync` | DLP calendar sync from RAS via Kafka | Kafka consumer, Redis cluster (6-node) |
| `package-calendar-service` | Package calendar service (DLP) | Newer dependency versions |

## Common Tech Across All 6 Services

| Aspect | Technology |
|--------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.x (Jakarta EE namespace) |
| Build | Maven with `core-api-foundation-parent` 3.0.0-239 |
| Packaging | WAR deployed to Tomcat 10 |
| API Style | JAX-RS (Apache CXF) |
| Caching | Redis (Lettuce 6.3–6.4) |
| Resilience | Resilience4j circuit breaker |
| Observability | OpenTelemetry Java agent |
| Auth | WDPR AuthZ client (OAuth2) |
| Config | WDPR mpropz (managed properties) |
| Logging | WDPR loggingapi (JSON structured) |
| SOAP | TravelBox WS Client (JAX-WS 4.0, SAAJ) |
| Contract Testing | Pact 4.6.14 (consumer + provider) |
| Docker | Tomcat10-JRE21 base, non-root (UID 1000 / GID 3000) |
| CI/CD | Harness pipelines (no Jenkins) |
| Static Analysis | Checkstyle + SonarQube |
| Testing | Spring Boot Test, WireMock, REST Assured, Serenity BDD |
| Cloud | AWS (S3, ECS) |
| Scheduling | ShedLock (distributed lock) |
| Mapping | MapStruct, Lombok |
| Default Branch | `develop` |

## Deployment

### Sites

- **DLR** — Disneyland Resort (California)
- **DLP** — Disneyland Paris

### Environments

| Environment | URL Pattern |
|-------------|-------------|
| Development | `https://dev1.dps-core-{service}-{site}.wdprapps.disney.com` |
| Latest | `https://latest2.dps-core-{service}-{site}.wdprapps.disney.com` |
| Stage | `https://stage.dps-core-{service}-{site}.wdprapps.disney.com` |
| Prod | `https://dps-core-{service}-{site}.wdprapps.disney.com` |

## Sites supported

| Site | Region         | AWS Region   |
|------|----------------|--------------|
| DLR  | Disneyland Resort (California) | us-west-2    |
| DLP  | Disneyland Paris               | us-east-1    |

### Pipeline Strategy

- `dps-core-offer`: Separate DLR and DLP pipelines (different configs per site)
- `dps-core-resflowmgmt`, `dps-core-quote`, `dps-core-scoreschemeconfig`: DLR pipeline
- `package-calendar-service`, `package-calendar-service-sync`: Unified pipeline with triggers

## Local Development

### Prerequisites

- Java 21 (SDKMAN recommended)
- Maven 3.8+
- Docker & Docker Compose
- Redis (local or Docker)
- AWS CLI with `awsmyid` for ECR auth

### Running Locally

```bash
# Build
mvn clean install

# Fast build (skip tests)
mvn clean install -Dfast

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Docker Build

```bash
# Authenticate to ECR
awsmyid login

# Build image
docker build -t dps-core-offer .
```

### Key Endpoints (local)

- Health: `/{context-path}/actuator/health`
- Info: `/{context-path}/actuator/info`
- Metrics: `/{context-path}/actuator/metrics`

## Monitoring & Observability

- **Tracing**: OpenTelemetry (distributed traces across services)
- **Logging**: WDPR loggingapi → Splunk (JSON structured)
- **Health Check**: Spring Actuator `/actuator/health`
- **Static Analysis**: SonarQube + Checkstyle

# Wiki
- [DPS Wiki Home](https://disneyexperiences.atlassian.net/wiki/pages/viewpage.action?pageId=1021186767&spaceKey=DisneyPackageService)

