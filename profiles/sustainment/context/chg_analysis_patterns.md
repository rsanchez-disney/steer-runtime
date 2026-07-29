# CHG Analysis Patterns

Reference guide for analyzing ServiceNow Change Requests across any sustainment team.

## ServiceNow CHG Structure

| Field              | Description                                              |
|--------------------|----------------------------------------------------------|
| CHG Number         | Unique identifier (e.g., CHG0012345)                     |
| Short Description  | Brief summary of the change                              |
| Description        | Full change details                                      |
| State              | New, Assess, Authorize, Scheduled, Implement, Review, Closed |
| Type               | Standard, Normal, Emergency                              |
| Risk               | High, Moderate, Low                                      |
| Impact             | High, Medium, Low                                        |
| Assignment Group   | Team responsible for the change                          |
| CTASKs             | Child tasks linked to the CHG                            |

## CTASK Analysis

CTASKs (Change Tasks) are deployment units within a CHG:

| CTASK Field        | What to Extract                                          |
|--------------------|----------------------------------------------------------|
| Short Description  | Service name and version                                 |
| Work Notes         | Deployment details, validation steps                     |
| State              | Open, Work In Progress, Closed Complete, Closed Incomplete |
| Assignment Group   | Team executing the task                                  |

### Version Extraction Patterns

Common version patterns in CTASK descriptions:

| Pattern                          | Example                              |
|----------------------------------|--------------------------------------|
| `{service} v{version}`           | `payment-service v2.3.1`             |
| `{service} {version}`            | `payment-service 2.3.1`              |
| `Release {service} {version}`    | `Release payment-service 2.3.1`      |
| `Deploy {service} to {env}`      | `Deploy payment-service to prod`     |

## Cloud Deployment Verification

The agent supports multiple cloud providers. Use the appropriate CLI based on the service's cloud configuration.

### AWS ECS

```bash
# List services in a cluster
aws ecs list-services --cluster {cluster_name} --profile {profile} --region {region}

# Describe a specific service (get task definition, running count)
aws ecs describe-services --cluster {cluster_name} --services {service_name} --profile {profile} --region {region}

# Get task definition details (extract image tag = version)
aws ecs describe-task-definition --task-definition {task_def_arn} --profile {profile} --region {region}
```

**Version extraction from ECS:**
- Task definition ARN contains version: `arn:aws:ecs:region:account:task-definition/service:123`
- Container image tag: `ecr.aws/repo/service:v2.3.1`

### Google Cloud Run / GKE

```bash
# List Cloud Run services
gcloud run services list --project {project} --region {region}

# Describe a service (get image, traffic split)
gcloud run services describe {service_name} --project {project} --region {region} --format=json

# GKE: Get deployment image
kubectl get deployment {deployment_name} -n {namespace} -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Azure Container Apps / AKS

```bash
# List container apps
az containerapp list --resource-group {rg} --subscription {sub}

# Get container app details
az containerapp show --name {app_name} --resource-group {rg} --subscription {sub}

# AKS: Get deployment image
kubectl get deployment {deployment_name} -n {namespace} -o jsonpath='{.spec.template.spec.containers[0].image}'
```

## GitHub Version Comparison

When comparing versions between CHG and deployed:

1. **Get commits between tags:**
   ```
   GET /repos/{owner}/{repo}/compare/{base}...{head}
   ```

2. **Extract PR numbers from commits:**
   - Look for `(#123)` pattern in commit messages
   - Use PR API to get full details

3. **Cross-reference with JIRA:**
   - Extract ticket IDs from PR titles/bodies (e.g., `PROJ-1234`)
   - Verify fix versions match release

## JIRA Fix Version Validation

1. **Query issues by fix version:**
   ```
   fixVersion = "{version}" AND project = "{project}"
   ```

2. **Validate all issues are Done:**
   - Status should be `Done`, `Closed`, or equivalent
   - No open blockers

3. **Check for missing issues:**
   - Compare JIRA issues vs PRs merged
   - Flag PRs without corresponding JIRA tickets

## Risk Assessment Criteria

| Risk Level | Criteria                                                 |
|------------|----------------------------------------------------------|
| High       | >100 commits, database migrations, breaking changes      |
| Medium     | 20-100 commits, API changes, dependency updates          |
| Low        | <20 commits, bug fixes, documentation                    |

### Red Flags

- Version mismatch between CTASK and deployed
- PRs merged without JIRA tickets
- JIRA issues not in Done status
- Missing rollback plan in CHG
- Emergency change without approval chain

## Report Structure

CHG analysis reports should include:

1. **CHG Summary** — Number, description, type, risk, state
2. **CTASK Breakdown** — List of deployment tasks with versions
3. **Deployment Verification** — Cloud CLI output confirming versions
4. **Code Analysis** — Commits, PRs, authors between versions
5. **JIRA Validation** — Fix version issues, status check
6. **Risk Assessment** — Based on change scope and flags
7. **Recommendations** — Go/no-go, concerns, follow-ups

## Service Catalog Integration

All service-specific information comes from the managed services catalog:

| app.yaml Field              | Used For                                       |
|-----------------------------|------------------------------------------------|
| `bapp_id`                   | ServiceNow CI correlation                      |
| `repositories`              | GitHub compare links                           |
| `cloud.provider`            | AWS, GCP, or Azure                             |
| `cloud.cluster_id`          | ECS cluster, GKE cluster, or AKS cluster       |
| `cloud.service_name`        | Service name in the cloud provider             |
| `cloud.region`              | Deployment region                              |
| `cloud.profile`             | AWS profile, GCP project, or Azure subscription |
| `servicenow.ci`             | Configuration item for CHG correlation         |
| `servicenow.assignment_group` | Team assignment                              |
