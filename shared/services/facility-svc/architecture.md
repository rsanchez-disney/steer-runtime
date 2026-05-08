# Facility Service — Architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 8 |
| Framework | Spring 4.1.6 (XML config) |
| REST | Apache CXF 3.4.0 (JAX-RS) |
| Cache | Redis (Redisson, wdpr-ra-java-cache-manager) |
| Database | Oracle / MySQL / MariaDB |
| Auth | wdpr-authz 3.25.0 (OAuth 2.0 / JWT) |
| Logging | wdpr-loggingapi |
| Config | mpropz + Consul |
| Server | Tomcat 8 (WAR deployment) |
| Container | Docker (ECR) |
| CI/CD | Jenkins |

## Layered Architecture

```
┌─────────────────────────────────┐
│  JAX-RS Webservice Layer        │  ← CXF endpoints, request/response handling
│  (@Path, @CacheControlHeader)   │
├─────────────────────────────────┤
│  Service Layer                  │  ← Business logic, orchestration
│  (Spring-managed beans)         │
├─────────────────────────────────┤
│  DAO Layer                      │  ← Data access, DB queries, cache reads
│  (JDBC / Redis / external APIs) │
├─────────────────────────────────┤
│  Data Stores                    │  ← Oracle/MySQL/MariaDB, Redis
└─────────────────────────────────┘
```

### Flow: webservice → service → dao

1. **Webservice** — CXF JAX-RS resource classes receive HTTP requests, apply auth (`@ClientIdControl`), cache headers (`@CacheControlHeader`), and delegate to service beans.
2. **Service** — Spring beans containing business logic, data transformation, and orchestration across multiple DAOs.
3. **DAO** — Data access objects query databases and Redis cache. Multi-tier caching checks Redis first, falls back to DB.

## Spring XML Configuration

The application uses Spring XML-based configuration (not annotation-driven component scan for wiring). Key config files:

- `applicationContext.xml` — Root context: datasources, cache managers, service beans
- `cxf-servlet.xml` — CXF JAX-RS server definition, endpoint registration, interceptors
- Property placeholders resolved via **mpropz** (environment-specific) and **Consul** (dynamic)

## Data Flow

```
Client → Tomcat → CXF (JAX-RS) → Auth Filter (wdpr-authz)
  → Resource Class → Service Bean → DAO
  → Redis Cache (hit?) → DB (miss) → Response + ETag
```

## Deployment

| Environment | URL |
|-------------|-----|
| Latest | https://latest.facility.wdprapps.disney.com/facility-service |
| Stage | https://stage.facility.wdprapps.disney.com/facility-service |
| Load | https://load.facility.wdprapps.disney.com/facility-service |
| Production | https://prod.facility.wdprapps.disney.com/facility-service |

- **Build**: Jenkins pipeline builds WAR, packages Docker image
- **Registry**: Docker images pushed to AWS ECR
- **Runtime**: Tomcat 8 inside Docker container
- **Context path**: `/facility-service`
- **Config injection**: mpropz properties per environment, Consul for dynamic values

## Repository

`wdpro-development/wdpr-content-facility-svc`
