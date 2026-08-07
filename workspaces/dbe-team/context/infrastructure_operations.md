# Infrastructure & Operations Context

> **⚠️ TEAM ACTION REQUIRED**: This document contains placeholders that must be filled by the DBE team.
> Each section marked with `📝 TODO` needs real content from team members who own that domain.

## AWS Infrastructure

### Account Structure

📝 TODO: Document AWS account structure

| Account              | ID (BAPP) | Purpose         | Region(s) |
|----------------------|-----------|-----------------|-----------|
| DPE API - Latest     | B0247209  | Dev/Integration | us-east-1 |
| DPE API - Staging    | 📝 TODO   | Pre-prod        | 📝 TODO   |
| DPE API - Production | 📝 TODO   | Live            | 📝 TODO   |
| DLR                  | S0001645  | DLR-specific    | us-west-2 |
| 📝 TODO              |           |                 |           |

### ECS Services (API Lifecycle)

📝 TODO: Document the full API lifecycle on ECS

```text
Developer → PR → Merge → Harness Build → ECR Image → ECS Deploy
```

| Service               | ECS Cluster | Task Definition | Auto-scaling |
|-----------------------|-------------|-----------------|--------------|
| dpe_api               | 📝 TODO     | 📝 TODO         | 📝 TODO      |
| dpe_api_gcp_cloudsql  | 📝 TODO     | 📝 TODO         | 📝 TODO      |
| dpe-api-azure-sql-mi  | 📝 TODO     | 📝 TODO         | 📝 TODO      |
| wdpr-dpe-orchestrator | 📝 TODO     | 📝 TODO         | 📝 TODO      |
| dpe_pmm               | 📝 TODO     | 📝 TODO         | 📝 TODO      |

### Lambda Functions

📝 TODO: Document Lambda functions

| Function | Trigger | Purpose |
|----------|---------|---------||
| log-aggregator | 📝 TODO | MongoDB log retrieval |
| splunk-processor | S3 → SNS → SQS | Upload logs to Splunk |
| 📝 TODO | | |

### Load Balancers

📝 TODO: Document ALB/NLB configuration

| Service | LB Type | DNS / URL | Health Check |
|---------|---------|-----------|--------------|
| dpe_api | ALB     | 📝 TODO   | 📝 TODO      |
| 📝 TODO |         |           |              |

### Networking

📝 TODO: Document VPC, subnets, security groups

- VPC structure
- Private vs public subnets
- Security group conventions
- VPC peering / Transit Gateway

## Terraform (Atlantis)

### Workflow

```text
1. Create/modify .tfvars file in DBE/terraform
2. Open PR
3. Atlantis runs `terraform plan` automatically
4. Review plan output in PR comments
5. Comment `atlantis apply` after approval
6. Atlantis runs `terraform apply`
7. Merge PR
```

### Workspace Directory Mapping

| Directory                       | Resources Managed              |
|---------------------------------|--------------------------------|
| `wdpr-ecs-workspaces/`          | ECS services, task definitions |
| `wdpr-eks-workspaces/`          | EKS clusters                   |
| `wdpr-lambda-workspaces/`       | Lambda functions               |
| `wdpr-alb-workspaces/`          | Application Load Balancers     |
| `wdpr-nlb-workspaces/`          | Network Load Balancers         |
| `wdpr-s3-workspaces/`           | S3 buckets                     |
| `wdpr-sqs-workspaces/`          | SQS queues                     |
| `wdpr-efs-workspaces/`          | EFS file systems               |
| `wdpr-elasticache-workspaces/`  | ElastiCache (Redis)            |
| `wdpr-pet-workspaces-rabbitmq/` | RabbitMQ PET instances         |
| `dbaas_mongodb/`                | MongoDB Atlas clusters         |

### tfvars Naming Convention

```text
{org}-{segment}-{account_id}-{service}-{region}-{env}-{resource}.tfvars
```

Example: `wdpr-ee-B0247209-dpe-api-use1-prod-ecs-1.tfvars`

📝 TODO: Document which tfvars files map to which environments/services

## RabbitMQ

### Cluster Architecture

📝 TODO: Document RabbitMQ cluster setup

| Cluster | Environment | Nodes | Purpose |
|---------|-------------|-------|---------||
| 📝 TODO | | | |

### Configuration Standards

📝 TODO: Document RabbitMQ configuration conventions

- Vhost naming convention
- Exchange naming convention
- Queue naming convention
- User/permission model
- HA policy (mirroring/quorum)
- Message TTL defaults
- Dead letter exchange pattern

### Deployment (Helm)

```bash
# Operator must be installed first
helm install rabbitmq-operator oci://registry-1.docker.io/bitnamicharts/rabbitmq-cluster-operator \
  --create-namespace -n rabbitmq-system

# Deploy cluster
helm install {cluster-name} ./rabbitMQ-cluster -f {custom-values.yaml}
```

📝 TODO: Document values.yaml conventions

- Resource limits (CPU/memory per node)
- Persistence configuration
- Plugin list
- Monitoring (Prometheus/Grafana)

### Shovel Configuration

📝 TODO: Document cross-cluster shovel patterns

- When to use shovels vs federation
- `rmq-shovel-manager` usage
- Naming conventions

## Kafka

📝 TODO: Document Kafka setup

### Cluster Configuration

| Cluster | Environment | Brokers | Purpose |
|---------|-------------|---------|---------||
| 📝 TODO | | | |

### Topic Conventions

📝 TODO: Document topic naming, partitioning, retention

### Deployment

📝 TODO: Document how Kafka is deployed (DXCP? Managed service?)

## MongoDB (Atlas)

### Cluster Management

📝 TODO: Document MongoDB Atlas clusters

| Cluster | Project | Tier | Purpose |
|---------|---------|------|---------||
| 📝 TODO | | | |

### Provisioning via dpe_api

📝 TODO: Document the MongoDB provisioning workflow

- API endpoints for cluster creation
- Configuration options
- Backup policies
- Monitoring (PMM integration)

### Log Aggregation

- **Lambda**: `wdpr-dpe-log-aggregator-lambda` (legacy)
- **ECS**: `wdpr-dpe-log-aggregator-ecs` (current)

📝 TODO: Document log aggregation workflow and Splunk indexing

## Database Operations

### RDS (MySQL/MariaDB/PostgreSQL)

📝 TODO: Document RDS management

- Provisioning process (Terraform + dpe_api)
- Backup/restore procedures
- Parameter groups
- Multi-AZ configuration

### Oracle

📝 TODO: Document Oracle management

- Ansible playbook usage (ansible_oracle)
- Grid Infrastructure setup
- OEM monitoring
- Patching process

### Liquibase Migrations

📝 TODO: Document schema migration workflow

- `dpe_ra_liquibase` usage
- Changelog conventions
- Rollback procedures
- Environment-specific migrations

## Rundeck

📝 TODO: Document Rundeck job management

### Job Categories

| Category             | Jobs    | Schedule |
|----------------------|---------|----------|
| Database maintenance | 📝 TODO |          |
| Backup verification  | 📝 TODO |          |
| Log rotation         | 📝 TODO |          |
| Health checks        | 📝 TODO |          |

### Job Creation Process

📝 TODO: Document how to create/modify Rundeck jobs

- Repo: `DBE/rundeck`
- Job definition format
- Testing jobs locally
- Promoting to production

## Monitoring & Alerting

### PMM (Percona Monitoring)

📝 TODO: Document PMM setup

- Dashboard URLs
- What's monitored
- Alert thresholds
- Escalation paths

### Splunk

📝 TODO: Document Splunk integration

- Index names
- Source types
- Key queries for troubleshooting
- Dashboard URLs

### Grafana

📝 TODO: Document Grafana dashboards

- RabbitMQ dashboards (from `rabbitmq_grafana`)
- Database performance dashboards
- URLs and access

## Confluence References

📝 TODO: Add links to infrastructure Confluence pages

| Topic                     | Confluence URL |
|---------------------------|----------------|
| AWS Account Matrix        |                |
| Terraform Standards       |                |
| RabbitMQ Runbook          |                |
| Kafka Runbook             |                |
| MongoDB Runbook           |                |
| RDS Runbook               |                |
| Disaster Recovery Plan    |                |
| Incident Response         |                |
| Change Management Process |                |
| On-call Rotation          |                |
