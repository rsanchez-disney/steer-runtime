# Infrastructure sustainment team

## Mission

Provide cloud infrastructure support for all sustainment application teams. Handle escalations for AWS, GCP, Azure, Akamai, and architecture concerns.

## Jira

- Project: BEAN
- Board: https://disneyexperiences.atlassian.net/jira/software/c/projects/BEAN/boards/4077
- Ticket prefix: BEAN-

## Scope

| Domain | Responsibilities |
|--------|-----------------|
| AWS | ECS clusters, Lambda, RDS, S3, IAM, CloudWatch, VPC, ALB |
| GCP | Cloud Run, GKE, Cloud SQL, Cloud Functions, Pub/Sub |
| Azure | Container Apps, AKS, Azure SQL, Azure Functions |
| Akamai | CDN properties, cache purge, edge DNS, WAF rules, SSL certs |
| Architecture | BlueDolphin AIDs, BAPP lookups, dependency mapping |
| Change management | CHG verification, pre/post deployment validation |

## Escalation flow

```text
App sustainment team (FNB, Cerebro, Beast, etc.)
  → Creates BEAN ticket with details
  → Infra team triages
  → Investigates via cloud CLI / Compass / Akamai
  → Resolves or escalates to cloud vendor
  → Updates BEAN ticket with findings
```

## Key contacts

| Role | Responsibility |
|------|---------------|
| Infra Lead | Triage and assignment |
| Cloud Engineers | AWS/GCP/Azure hands-on |
| Network Engineers | Akamai, DNS, connectivity |
| Architecture | BlueDolphin, TOGAF compliance |

## Service catalog access

This team has access to the full sustainment managed-services-catalog (28 studios). Use the `catalog-index.sh` hook to load service configs for any BAPP.
