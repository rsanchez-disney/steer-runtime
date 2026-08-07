# DBE Team Context — Database Platform Engineering

## Team Mission

The Database Engineering (DBE) team builds and operates the multi-cloud database automation platform for Walt Disney Parks & Experiences. We provide self-service APIs, orchestration, monitoring, and infrastructure tooling that enable application teams to provision, manage connectivity infrastructure, and operate databases across AWS, GCP,  Azure cloud solutions among others like MongoDB, etc.

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                      Consumers (App Teams)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST/GraphQL
┌──────────────────────────────▼──────────────────────────────────┐
│                     DPE API Layer (FastAPI)                       │
│  ┌──────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────────┐   │
│  │ dpe_api  │ │ gcp_cloudsql │ │ azure_sql │ │  neo4j/ai    │   │
│  │(main API)│ │              │ │    mi     │ │              │   │
│  └────┬─────┘ └──────┬───────┘ └─────┬─────┘ └──────┬───────┘   │
└───────┼──────────────┼───────────────┼──────────────┼───────────┘
        │              │               │              │
┌───────▼──────────────▼───────────────▼──────────────▼───────────┐
│                        dpe_common (Nexus)                         │
│  UseCaseOutput │ ServiceManagers │ Models │ DI │ Decorators       │
└───────┬──────────────┬───────────────┬──────────────────────────┘
        │              │               │
┌───────▼──────┐ ┌─────▼─────┐ ┌───────▼──────┐
│wdpr-dpe-aws  │ │wdpr-dpe-  │ │wdpr-dpe-     │
│    -lib      │ │  gcp-lib  │ │  azure-lib   │
└───────┬──────┘ └─────┬─────┘ └───────┬──────┘
        │              │               │
┌───────▼──────────────▼───────────────▼──────────────────────────┐
│                     Cloud Providers                               │
│  AWS (RDS, DynamoDB,  │  GCP (CloudSQL,    │  Azure (SQL MI,     │
│   ECS, Lambda, S3)    │   Vertex AI, KMS)  │   Key Vault)        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Services

### dpe_api — MongoDB Atlas Automation API

- **Repo**: `DBE/dpe_api`
- **Branch strategy**: `develop` (default) → `main` (release)
- **Purpose**: MongoDB Atlas automation framework covering database provisioning and multi cloud related infrastructure, users provisioning, password reset and decommission, archive and data federation
- **Structure**: Each MongoDB Atlas service is a subdirectory under `api/` with its clean architecture structure
- **Auth**: JWT tokens from Authorization Service with scopes/roles validation

### dpe_common — Shared Library

- **Repo**: `DBE/dpe_common`
- **Version**: Published to Nexus (currently v0.16.4)
- **Purpose**: Foundation library consumed by ALL other DBE APIs
- **Key modules**:
  - `models/clean_architecture` — UseCase, UseCaseOutput base classes
  - `models/base` — Shared Pydantic base models
  - `models/aws`, `models/gcp`, `models/azure` — Cloud-specific models
  - `models/orchestrator` — Orchestration workflow models
  - `service_managers/` — AWS, GCP, Azure, MongoDB, Git, Email, Slack, RabbitMQ, Secrets, Password Builder
  - `decorators/` — `@with_logging` and others
  - `meta_patterns/` — Singleton, Multiton
  - `di/` — Dependency injection utilities
  - `interfaces/messaging/` — Event-driven abstractions
  - `enums/` — Shared enumerations
  - `exceptions.py` — Shared exception types
  - `middlewares/` — FastAPI middleware components
  - `config_loader.py` — Configuration management
  - `snow/` — ServiceNow API client

### wdpr-dpe-orchestrator — Central Orchestration

- **Repo**: `DBE/wdpr-dpe-orchestrator`
- **Branch strategy**: `develop` (default)
- **Purpose**: Orchestrates multistep database provisioning and management workflows
- **Has**: Makefile, docs/, Harness CI/CD

### Cloud-Specific APIs

| API           | Repo                       | Cloud | Database             |
|---------------|----------------------------|-------|----------------------|
| GCP CloudSQL  | `DBE/dpe_api_gcp_cloudsql` | GCP   | MySQL, PostgreSQL    |
| Azure SQL MI  | `DBE/dpe-api-azure-sql-mi` | Azure | SQL Managed Instance |
| Neo4j         | `DBE/dpe_api_neo4j`        | —     | Neo4j Graph          |
| GCP Vertex AI | `DBE/dpe_api_gcp_vertexai` | GCP   | Vertex AI            |

## Shared Libraries

| Library | Repo | Purpose |
|---------|------|---------||
| `wdpr-dpe-aws-lib` | DBE/wdpr-dpe-aws-lib | AWS service integrations (RDS, DynamoDB, ECS, Lambda) |
| `wdpr-dpe-gcp-lib` | DBE/wdpr-dpe-gcp-lib | GCP service integrations (CloudSQL, KMS, IAM) |
| `wdpr-dpe-azure-lib` | DBE/wdpr-dpe-azure-lib | Azure service integrations (SQL MI, Key Vault) |
| `wdpr-dpe-email-lib` | DBE/wdpr-dpe-email-lib | Email notifications |
| `wdpr-dpe-git-lib` | DBE/wdpr-dpe-git-lib | Git operations (PRs, branch management) |
| `wdpr-dpe-chat-lib` | DBE/wdpr-dpe-chat-lib | Chat/messaging integrations |
| `wdpr-dpe-otv-lib` | DBE/wdpr-dpe-otv-lib | OTV integrations |
| `wdpr-dpe-snow-lib` | DBE/wdpr-dpe-snow-lib | ServiceNow ticket management |
| `api_security` | DBE/api_security | MyID + AuthZ security module |

## Infrastructure

### Terraform

- **Repo**: `DBE/terraform` — Main IaC repository
- **Additional**: `DBE/cross-account-rds-access-workspace` — Cross-account RDS access

### DXCP / Kubernetes Manifests

Declarative deployment manifests for managed databases:

- RabbitMQ, MongoDB, Redis, DynamoDB, AWS MariaDB, AWS MySQL, GCP MySQL, GCP PostgreSQL, Kafka
- Pattern: `dpe-dxcp-manifesto-{service}`

### Score (IaC Validation)

Deployment test repos that validate infrastructure provisioning:

- Kafka, CloudSQL MySQL, Aurora, RDS MariaDB, CloudSQL, DynamoDB, MongoDB
- Pattern: `dpe_score_{service}`

## Messaging Platform — RabbitMQ

DBE owns the RabbitMQ platform with 8 dedicated repos:

- `helm-rabbitmq` — Helm charts for K8s deployment
- `k8s-rabbitmq` — Kubernetes configurations
- `dxcp-gitops-rabbitmq` — GitOps deployment
- `rmq-cluster-designer` — GUI cluster design tool
- `rmq-shovel-manager` — Cross-cluster shovel management
- `RabbitmqAssistTool` — Management utilities
- `rabbitmq_grafana` — Grafana dashboards
- `RMQ-Lab` — Testing laboratory

## Monitoring & Observability

| Tool | Repo | Purpose |
|------|------|---------||
| PMM (Percona) | `DBE/dpe_pmm` | Database performance monitoring |
| Log Aggregator (Lambda) | `DBE/wdpr-dpe-log-aggregator-lambda` | MongoDB log retrieval |
| Log Aggregator (ECS) | `DBE/wdpr-dpe-log-aggregator-ecs` | MongoDB logs — ECS migration |
| Splunk Processor | `DBE/splunk-application-logs-processor` | S3→SNS→SQS→Lambda→Splunk pipeline |
| RabbitMQ Monitoring | `DBE/rabbitmq-monitoring-extension` | RMQ extensions |

## Tech Stack Summary

| Layer             | Technology                                                                                                 |
|-------------------|------------------------------------------------------------------------------------------------------------|
| Language          | Python 3.12                                                                                                |
| Framework         | FastAPI + Pydantic v2                                                                                      |
| Build             | Poetry 2.x                                                                                                 |
| Package Registry  | Nexus (internal PyPI)                                                                                      |
| Databases Managed | MongoDB, RDS (MySQL/MariaDB/PostgreSQL), DynamoDB, CloudSQL, Azure SQL MI, MSSQL, Neo4j, OpenSearch, Redis |
| Messaging         | RabbitMQ (aio-pika), Kafka                                                                                 |
| Cloud SDKs        | boto3, google-cloud-*, azure-*                                                                             |
| Auth              | JWT + OAuth2 client credentials, HVAC (Vault)                                                              |
| HTTP Client       | httpx                                                                                                      |
| CI/CD             | Harness pipelines                                                                                          |
| IaC               | Terraform, DXCP Manifests, Score                                                                           |
| Containers        | Docker, ECS, Kubernetes                                                                                    |
| Monitoring        | PMM, Splunk, Grafana                                                                                       |
| SCM               | GitHub Enterprise (github.disney.com/DBE)                                                                  |
| Formatting        | black (line-length=120), isort, flake8                                                                     |
| Testing           | pytest, pytest-mock, pytest-asyncio, pytest-cov                                                            |
| Pre-commit        | black, isort, flake8, (optional: mypy)                                                                     |

## Development Conventions

### Branch Strategy

- Default branch: `develop` (most repos)
- Release branch: `main`
- Feature branches: `feat/`, `fix/`, `chore/`, `docs/`
- PR required for all merges

### Dependency Flow

```text
dpe_common (Nexus v0.16.x)
    ↑ consumed by
├── dpe_api
├── dpe_api_gcp_cloudsql
├── dpe-api-azure-sql-mi
├── dpe_api_neo4j
├── dpe_api_gcp_vertexai
└── wdpr-dpe-orchestrator

Cloud libs (Nexus)
    ↑ consumed by
├── dpe_common (service_managers layer)
└── Individual APIs (infrastructure layer)
```

### Publishing Workflow (dpe_common)

1. PR to `dpe_common` with changes
2. Bump version in `VERSION` file + `pyproject.toml`
3. Merge → Harness pipeline publishes to Nexus
4. Consumer APIs: `poetry update dpe_common` → PR with updated lock file

### Authentication

- **API consumers**: JWT tokens from Authorization Service with scope validation
- **Cloud access**: Service accounts / IAM roles per cloud
- **Secrets**: HashiCorp Vault (HVAC client)
- **Local dev**: `AUTHZ_ENABLED: false` to disable token validation

### Database Operations (Legacy)

DBE also maintains legacy database scripts:

- Oracle: Ansible playbooks (RHEL9, Grid Infra, 19c)
- MySQL: Purge processes, refresh scripts
- MSSQL: Database creation scripts
- Liquibase: Schema migrations (`dpe_ra_liquibase`)
- Rundeck: Job automation

## Key Domain Terms

| Term | Meaning |
|------|---------||
| DPE | Data Platform Engineering |
| DBE | Database Engineering (the team) |
| DXCP | Disney Experience Cloud Platform (Kubernetes) |
| Score | IaC deployment validation framework |
| PMM | Percona Monitoring and Management |
| Manifesto | DXCP deployment manifest definition |
| Shovel | RabbitMQ mechanism to move messages between clusters |
| OTV | One-Time Verification/Link |
| SNOW | ServiceNow (incident/change management) |

## GitHub Organization

- **Org**: `DBE` on github.disney.com
- **Total repos**: 96
- **Active repos** (updated last 30 days): dpe_common, wdpr-dpe-orchestrator, dpe_api, dpe_api_gcp_cloudsql, terraform, dpe_pmm, dpe-api-azure-sql-mi, dpe_ra_liquibase, rmq-cluster-designer, dpe-dxcp-manifesto-mongodb, wdpr-dpe-orchestrator-scripts
- **Template**: `DBE/dpe_api_template` for new FastAPI projects
