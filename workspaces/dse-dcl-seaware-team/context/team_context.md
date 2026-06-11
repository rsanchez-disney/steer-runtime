# SEAS — Team Context

## Organization

**Portfolio:** Seaware Engineering & Application Solutions (SEAS)
**Division:** Disney Signature Experiences (DSE) → Disney Cruise Line & Adventures by Disney
**Jira Project:** SEAS
**Release Cadence:** Bi-Weekly
**Sr. Manager:** Kristin Lozito
**TPM / Scrum Master:** Chris Furtado

## Business Domain

SEAS owns mission-critical middleware, APIs, batch jobs, and reporting that bridges Versonix's **Seaware Reservation System** to Disney's digital properties (DCL.com, mobile apps, internal tools). The portfolio serves:

- **Disney Cruise Line (DCL)** — reservations, booking, availability, pricing, guest management, finance
- **Adventures by Disney (ABD)** — guided vacation packages with shared reservation infrastructure

## Architecture Overview

### Legacy Stack (.NET / Azure DevOps)
- **Language:** C# / .NET Framework + .NET Core
- **Source:** Azure DevOps `disney-cruise/shoreside` organization
- **Hosting:** ECS on AWS, some EC2 instances
- **Database:** Oracle (Seaware), MariaDB, SQL Server
- **Packages:** Internal NuGet packages (DataManager, DataManagerEF, Services.Common, Shared)
- **CI:** Azure DevOps Pipelines

### New Stack (Java / GitHub)
- **Language:** Java 21
- **Framework:** Spring Boot 3, Spring WebFlux (reactive), Project Reactor
- **Source:** GitHub `github.disney.com/dcl/` organization
- **Build:** Maven, Harness CI/CD
- **Container Registry:** AWS ECR
- **Deployment:** Kubernetes via Rancher + Helm charts (stored in GitLab)
- **Data Access:** GraphQL (via Seaware GraphQL service), JDBC for direct DB
- **Caching:** Caffeine (in-memory), Redis
- **Observability:** OpenTelemetry, Micrometer, Splunk, AppDynamics, Grafana, Datadog
- **Security:** OAuth2 (B2B JWT), OWASP Top 10, Semgrep, Sonar, IAGO scanning
- **Quality Gates:** JaCoCo (100% class, 95% line/method coverage), Sonar

### Infrastructure (GitLab)
- **Helm Charts:** `gitlab.disney.com/dse/helm-deploys/`
- **Ansible:** `gitlab.disney.com/dse/ansible-playbooks/seawarefull/`
- **Container Images:** `gitlab.disney.com/dse/container-applications/seaware/`

### CI/CD Pipeline
```
GitHub (merge to main) → Harness CI (build + test + image) → AWS ECR
                       → Harness CD → GitLab (Helm chart) → Rancher/Kubernetes
                       → AWX (optional pre/post tasks: DB migrations, config)
```

### Environments
| Environment | DNS Pattern | Purpose |
|-------------|-------------|---------|
| Latest | `latest.*.wdprapps.disney.com` | Dev integration |
| Stage | `stage.*.wdprapps.disney.com` | QA testing |
| Load | `load.*.wdprapps.disney.com` | Performance testing |
| Prod | `*.wdprapps.disney.com` | Production |

## Monitoring & Dashboards

- **Grafana:** `dse-grafana-internal.wdprapps.disney.com/dashboards/f/8kt0Dx4Vz/dcl-seaware`
- **Grafana (ABD):** `dse-grafana-internal.wdprapps.disney.com/dashboards/f/4yksr7j4z/abd-seaware`
- **Datadog:** `app.datadoghq.com/dashboard/lists`
- **AppDynamics:** DCL Seaware Health Check alerts

## ServiceNow Groups

| Level | Assignment Group |
|-------|-----------------|
| L1 | ops-global-DCL-L2 (Accenture) |
| L2 | app-global-DCL-ADM-sales (CapGemini) |
| L3 | app-global-Seaware Engineering (SEAS) |

## Key Technologies

| Category | Technologies |
|----------|-------------|
| Languages | Java 21, C# (.NET), Angular, TypeScript |
| Frameworks | Spring Boot 3, WebFlux, .NET Core |
| Databases | Oracle (Seaware), MariaDB, SQL Server |
| Messaging | ActiveMQ, Kafka |
| Eventing | Zazu (custom Spring Boot event router) |
| CI/CD | Harness, Azure DevOps Pipelines |
| Infrastructure | AWS (ECS, ECR, EC2), Kubernetes, Rancher, Helm |
| Configuration | Ansible (AWX), GitLab |
| Reporting | MicroStrategy |
| Vendor | Versonix Seaware |


