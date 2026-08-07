# DBE Team Workspace

Database Engineering — multi-cloud database platform, automation APIs, messaging infrastructure, and operational tooling for Walt Disney Parks & Experiences.

## Apply

```bash
koda workspace apply dbe-team
```

## Troubleshooting: `Error: workspace not found: dbe-team`

Koda resolves workspaces from `~/.kiro/steer-runtime/`, not your source checkout. If `dbe-team` hasn't been synced there yet:

1. If using a fork with `STEER_HOME`, verify the env var points to the correct directory:

   ```bash
   echo $STEER_HOME   # Should contain the parent of steer-runtime/
   ```

2. If using the default path, copy the workspace manually:

   ```bash
   cp -r <your-fork-path>/workspaces/dbe-team ~/.kiro/steer-runtime/workspaces/dbe-team
   ```

3. Verify it's available:

   ```bash
   koda
   ```

   Press `[w]` to select the `dbe-team` workspace.

## What's Included

### Projects (96 repos in DBE org)

The DBE GitHub organization contains 96 repositories organized by domain:

#### Core APIs (Python/FastAPI)

| Repo                   | Description                                         |
|------------------------|-----------------------------------------------------|
| `dpe_api`              | FastAPI service for MongoDB Atlas automation        |
| `dpe_common`           | Global package of shared utilities for all DPE APIs |
| `dpe_api_gcp_cloudsql` | FastAPI service for GCP CloudSQL automation         |
| `dpe_api_neo4j`        | FastAPI service for Neo4j graph database            |
| `dpe_api_gcp_vertexai` | FastAPI service for GCP Vertex AI                   |
| `dpe-api-azure-sql-mi` | DPE API service for Azure SQL Managed Instance      |
| `dpe_api_template`     | Template repo for new FastAPI projects              |

#### Orchestrator

| Repo                            | Description                     |
|---------------------------------|---------------------------------|
| `wdpr-dpe-orchestrator`         | Central orchestration service   |
| `wdpr-dpe-orchestrator-scripts` | Orchestrator automation scripts |

#### Shared Libraries

| Repo                 | Description                        |
|----------------------|------------------------------------|
| `wdpr-dpe-aws-lib`   | AWS service integration library    |
| `wdpr-dpe-gcp-lib`   | GCP service integration library    |
| `wdpr-dpe-azure-lib` | Azure service integration library  |
| `wdpr-dpe-email-lib` | Email integration library          |
| `wdpr-dpe-git-lib`   | Git operations library             |
| `wdpr-dpe-chat-lib`  | Chat/messaging integration library |
| `wdpr-dpe-otv-lib`   | OTV integration library            |
| `wdpr-dpe-snow-lib`  | ServiceNow integration library     |
| `api_security`       | MyID and AuthZ security module     |

#### Infrastructure / Terraform

| Repo                                 | Description                                 |
|--------------------------------------|---------------------------------------------|
| `terraform`                          | DBE Terraform repository                    |
| `cross-account-rds-access-workspace` | Cross-account RDS configuration (Terraform) |
| `python-docker-image-builder`        | Docker image build infrastructure           |

#### DXCP / Kubernetes Manifests

| Repo                                | Description                         |
|-------------------------------------|-------------------------------------|
| `dpe-dxcp-manifesto-combined`       | Combined application manifests      |
| `dpe-dxcp-manifesto-rabbitmq`       | RabbitMQ deployment manifests       |
| `dpe-dxcp-manifesto-mongodb`        | MongoDB deployment manifests        |
| `dpe-dxcp-manifesto-redis`          | Redis deployment manifests          |
| `dpe-dxcp-manifesto-dynamo-db`      | DynamoDB deployment manifests       |
| `dpe-dxcp-manifesto-aws-mariadb`    | AWS MariaDB deployment manifests    |
| `dpe-dxcp-manifesto-aws-mysql`      | AWS MySQL deployment manifests      |
| `dpe-dxcp-manifesto-gcp-mysql`      | GCP MySQL deployment manifests      |
| `dpe-dxcp-manifesto-gcp-postgresql` | GCP PostgreSQL deployment manifests |
| `dpe-dxcp-manifesto-kafka`          | Kafka deployment manifests          |

#### Score (IaC Deployment Tests)

| Repo                       | Description                          |
|----------------------------|--------------------------------------|
| `dpe_score_kafka`          | Kafka deployment validation          |
| `dpe_score_cloudsql_mysql` | CloudSQL MySQL deployment validation |
| `dpe_score_aurora`         | Aurora deployment validation         |
| `dpe_score_rds_mariadb`    | RDS MariaDB deployment validation    |
| `dpe_score_cloudsql`       | CloudSQL deployment validation       |
| `dpe_score_dynamodb`       | DynamoDB deployment validation       |
| `dpe_score_mongodb`        | MongoDB deployment validation        |

#### Monitoring & Observability

| Repo                                | Description                            |
|-------------------------------------|----------------------------------------|
| `dpe_pmm`                           | Percona Monitoring & Management        |
| `wdpr-dpe-log-aggregator-lambda`    | MongoDB log retrieval (Lambda)         |
| `wdpr-dpe-log-aggregator-ecs`       | MongoDB log aggregator (ECS migration) |
| `splunk-application-logs-processor` | S3→SNS→SQS→Lambda→Splunk log pipeline  |
| `rabbitmq-monitoring-extension`     | RabbitMQ monitoring extensions         |

#### RabbitMQ Platform

| Repo                   | Description                                |
|------------------------|--------------------------------------------|
| `k8s-rabbitmq`         | RabbitMQ on Kubernetes (Helm)              |
| `helm-rabbitmq`        | Helm charts for RabbitMQ K8s deployment    |
| `RabbitmqAssistTool`   | RabbitMQ management utilities              |
| `dxcp-gitops-rabbitmq` | GitOps for RabbitMQ                        |
| `rabbitmq_grafana`     | Grafana dashboard definitions for RabbitMQ |
| `rmq-shovel-manager`   | Shovel management between RMQ clusters     |
| `rmq-cluster-designer` | GUI tool for RabbitMQ cluster design       |
| `RMQ-Lab`              | Messaging/eventing test laboratory         |

#### Database Operations (Legacy & Ops)

| Repo                      | Description                               |
|---------------------------|-------------------------------------------|
| `ORACLE`                  | Standard Oracle scripts                   |
| `RDS_BUILD`               | RDS provisioning                          |
| `DCPT-Oracle`             | Oracle DCPT scripts                       |
| `DCPT-MariaDB`            | MariaDB DCPT scripts                      |
| `database-migrations`     | DDL storage                               |
| `MySQL_Purge_Process`     | Standard MySQL purge scripts              |
| `MYSQL_Refresh`           | MySQL user/password/grants backup/restore |
| `MSSQL-DB-Create-Scripts` | MSSQL database creation scripts           |
| `dpe_ra_liquibase`        | Liquibase database migrations             |
| `ansible_oracle`          | Oracle on RHEL9 — Grid Infra, 19c DB, OEM |
| `dpe_sysbench`            | Database benchmarking                     |

#### CI/CD

| Repo               | Description                        |
|--------------------|------------------------------------|
| `harness`          | Harness CI/CD pipeline definitions |
| `DBE-ECS-Pipeline` | ECS deployment pipeline            |

#### Other

| Repo               | Description                        |
|--------------------|------------------------------------|
| `ditto-bigpeer`    | Ditto Big Peer deployment scripts  |
| `dse-ditto`        | Ditto integration                  |
| `legacy_python`    | Rundeck Python execution server    |
| `rhel_boot_repair` | Boot partition resize and GRUB fix |
| `rundeck`          | Rundeck job repository             |

All repos resolved from `workspace_path` in `workspace.json`. Set this to your local clone directory of DBE org repos.

### Tech Stack

| Technology            | Usage                                                             |
|-----------------------|-------------------------------------------------------------------|
| **Python 3.12**       | Primary language (33 repos) — FastAPI, Poetry, Clean Architecture |
| **FastAPI**           | All automation APIs (dpe_api, dpe_api_gcp_cloudsql, etc.)         |
| **Terraform / HCL**   | Infrastructure provisioning (4 repos)                             |
| **Harness**           | CI/CD pipelines                                                   |
| **AWS**               | RDS, DynamoDB, ECS, Lambda, S3, CloudWatch                        |
| **GCP**               | CloudSQL, Vertex AI, Cloud KMS, IAM                               |
| **Azure**             | SQL Managed Instance, Key Vault                                   |
| **MongoDB**           | Atlas clusters, monitoring, log aggregation                       |
| **RabbitMQ**          | Messaging platform (8 dedicated repos)                            |
| **Kubernetes / DXCP** | Container orchestration (10 manifest repos)                       |
| **Oracle**            | Legacy database management (Ansible, Grid Infra)                  |
| **MariaDB / MySQL**   | RDS and on-prem database operations                               |
| **Splunk**            | Log processing and observability                                  |
| **Grafana / PMM**     | Monitoring dashboards                                             |
| **Docker**            | Container builds and image management                             |
| **Liquibase**         | Database schema migrations                                        |

### Architecture Patterns

- **Clean Architecture** — Domain/Application/Infrastructure/Presentation layers (see context/70_clean_architecture.md)
- **Multi-cloud abstraction** — Separate libraries per cloud provider (aws-lib, gcp-lib, azure-lib)
- **Factory + Strategy** — Cloud provider selection at runtime
- **Shared library model** — dpe_common as foundation, domain-specific libs on top
- **GitOps** — DXCP manifests for declarative infrastructure
- **Score** — IaC deployment testing/validation framework

### Context Files

| File                      | Content                                                                                       |
|---------------------------|-----------------------------------------------------------------------------------------------|
| `context/team_context.md` | Team architecture, repos, tech stack, multi-cloud strategy, deployment topology, domain terms |

> **Note:** Context files will be populated as the workspace matures. Start with `team_context.md` and add service-specific context as needed.

### Rules

| Rule | Source | Purpose |
|------|--------|---------||
| `conventional_commit` | Common | Conventional commit message format |
| `general-python-development` | Common | Python/SOLID/Clean Architecture best practices |
| `general-sql-database` | Common | SQL best practices |
| `general-docker` | Common | Docker best practices |
| `general-aws` | Common | AWS best practices |
| `general-api-design` | Common | API design patterns |
| `general-testing-strategies` | Common | Testing strategies |

> **TODO:** Add DBE-specific rules for multi-cloud patterns, RabbitMQ conventions, database migration standards, and Harness pipeline conventions.

## Profiles

| Profile      | Agents | Focus                                              |
|--------------|--------|----------------------------------------------------|
| `dev-core`   | 16+    | Code review, architecture, security, PRs, planning |
| `dev-python` | 1      | Python/FastAPI specialist                          |
| `dev-infra`  | 1      | Terraform/IaC specialist                           |
| `ops`        | 8      | Deployments, infra, log analysis, releases         |

> **TODO:** Evaluate adding `qa`, `ba`, `pm` profiles based on team needs.

## Jira & Confluence

- **Jira**: `<JIRA_PREFIX>` — MERCURY
- **Confluence**:  <https://confluence.disney.com/spaces/DPEPRAInternal/pages/1012377077/Data+Platform+Engineering>
- **GitHub**: `DBE` on github.disney.com

## Environment Setup

### Prerequisites

- Python 3.12+
- Poetry 2.x
- Docker
- `gh` CLI authenticated to github.disney.com
- Terraform (for infra repos)
- Harness CLI (for CI/CD)

### 1. Clone the Fork

```bash
git clone git@github.disney.com:GONZN148/wdpr-dpe.git
git remote add upstream git@github.disney.com:SANCR225/steer-runtime.git
```

### 2. Configure STEER_HOME

Point koda to your fork instead of the default `~/.kiro/steer-runtime/`:

**Windows (PowerShell):**

```powershell
[System.Environment]::SetEnvironmentVariable("STEER_HOME", "C:\Users\<your-user>\Documents\koda\wdpr-dpe", "User")
# Restart terminal
```

**macOS/Linux:**

```bash
export STEER_HOME="$HOME/Documents/koda/wdpr-dpe"
# Add to ~/.zshrc or ~/.bashrc
```

> **Note:** `STEER_HOME` should point to the **parent directory** if your repo is named `steer-runtime`, OR directly to the repo if it has a different name. Verify with `koda workspace list` after setting.

### 3. Apply the Workspace

```bash
koda workspace apply dbe-team
koda mcp-install
```

### 4. Verify

```bash
koda check
koda workspace show dbe-team
```

### 5. Keeping in Sync

```bash
# Sync upstream improvements (weekly)
cd ~/Documents/koda/wdpr-dpe
git fetch upstream
git merge upstream/main
git push origin main

# Re-apply workspace after changes
koda workspace apply dbe-team
```

## Team Coordination

### Fork Governance

| Role         | Responsibility                                           | Who              |
|--------------|----------------------------------------------------------|------------------|
| Fork owner   | Weekly syncs, conflict resolution, workspace maintenance | _TODO: Assign_   |
| Contributors | Push workspace changes, context files, rules             | All team members |

### What to Commit to the Fork

- ✅ Workspace configuration (`workspaces/dbe-team/`)
- ✅ Context files (architecture docs, conventions)
- ✅ Team-specific rules
- ✅ Custom steering files
- ❌ Tokens, credentials, `.env` files
- ❌ Personal preferences (go in `~/.kiro/tokens.env`)

### Adding a New Project to the Workspace

1. Edit `workspaces/dbe-team/workspace.json`
2. Add the repo to the `projects` array
3. Commit and push
4. Team members: `git pull && koda workspace apply dbe-team`
