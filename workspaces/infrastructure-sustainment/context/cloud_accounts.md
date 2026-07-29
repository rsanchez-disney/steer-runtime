# Cloud accounts reference

## AWS

| Account | Profile | Region | Purpose |
|---------|---------|--------|---------|
| DEEP&T NonProd | `deep-nonprod` | us-east-1 | Staging, QA environments |
| DEEP&T Prod | `deep-prod` | us-east-1 | Production workloads |
| DX Shared Services | `dx-shared` | us-east-1 | Shared infrastructure |

## GCP

| Project | Environment | Region |
|---------|-------------|--------|
| `wdpr-deep-nonprod` | Non-production | us-east4 |
| `wdpr-deep-prod` | Production | us-east4 |

## Azure

| Subscription | Resource Group | Purpose |
|--------------|---------------|---------|
| DEEP&T NonProd | `rg-deep-nonprod` | Non-production |
| DEEP&T Prod | `rg-deep-prod` | Production |

## Akamai

| Property | Environment | CP Code |
|----------|-------------|---------|
| <!-- Add properties here --> | | |

## Authentication

- AWS: Use named profiles (`aws --profile <name>`)
- GCP: Use `gcloud config configurations activate <config>`
- Azure: Use `az account set --subscription <name>`
- Akamai: Uses `~/.edgerc` file with `[default]` section

## Safety rules

- Never modify production without an approved CHG
- Always verify the target environment before executing commands
- Use `--dry-run` or read-only operations first
- Log all changes made during incident response
