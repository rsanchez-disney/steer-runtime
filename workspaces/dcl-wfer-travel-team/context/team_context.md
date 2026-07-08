# DCL WFER Travel — Team Context

## Architecture

```text
┌─────────────────────┐     ┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│  dcl-apps-travel-ui │────▶│ dcl-apps-travel-webapi  │────▶│ dcl-apps-travel-service  │────▶│   MariaDB   │
│  (Angular 20)       │     │ (Node.js/Restify BFF)   │     │ (Java 21/Spring Boot)    │     │  (Schema in │
│  Port: 3000/8626    │     │ Port: 8625              │     │ Port: (Tomcat WAR)       │     │  datamodel) │
└─────────────────────┘     └─────────────────────────┘     └──────────────────────────┘     └─────────────┘
```

All repos at coordinated release version (currently 26.6.2). Default branch: `develop` for all (except datamodel: `main`).

## Tech Stack

| Layer | Tech | Key details |
|:------|:-----|:------------|
| Backend | Java 21, Spring Boot, Maven (WAR), Apache CXF (JAX-RS) | No JPA — uses Spring JDBC templates. Constructor injection. |
| BFF | Node.js 22, Restify, Axios, Grunt | Keycloak auth plugin. Feature toggles via feature-decider. |
| Frontend | Angular 20, TypeScript 5.8, AG Grid Enterprise, SCSS | Core/features/shared structure, lazy-loaded modules. |
| Database | MariaDB (RDS) | Schema in dcl-crew-travel-datamodel repo. |

## External Integrations

| System | Protocol | Notes |
|:-------|:---------|:------|
| SwellSteps | HTTP POST | 4 call sites in travel-service |
| Flowable | HTTP (shadow) | New — EFM 3 initiative, parallel dispatch |
| CMA (Crew Management) | HTTP + Keycloak OAuth | Token caching needed |
| IBM MQ (Amadeus) | JMS/MQ | Travel detail messages |
| Keycloak | OAuth2 token endpoint | Service-account tokens |
| MariaDB | JDBC | travel_svc_latest on RDS (port 4001) |

## Observability

| Resource | Value |
|:---------|:------|
| Splunk index | `dcl_dxp_s0001400` |
| Runbook | https://mywiki.disney.com/spaces/DCLCREWVSN/pages/585389695 |

## Conventions

- **Default branch**: `develop` (all repos except datamodel which uses `main`)
- **Java**: Constructor injection, no JPA, Spring JDBC templates, Disney copyright headers
- **Node**: Restify, Mocha+Chai+Sinon, feature-decider for toggles
- **Angular**: Core/features/shared structure, lazy-loaded modules, 80% coverage threshold
- **DB**: `main` branch = production schema representation
- **Releases**: Coordinated across all 4 repos (same version)

## Contacts

| Name | Role |
|:-----|:-----|
| Carlos Eduardo Silva Osores | Direct supervisor |
| Jorge Alfonso Garcia Espinosa | Technical guidance, architecture |
| Manuela Lopera Gil | Technical guidance, architecture |
| Cristina Boswell | Business requirements |

**Slack**: #glb-dcl-workflows
