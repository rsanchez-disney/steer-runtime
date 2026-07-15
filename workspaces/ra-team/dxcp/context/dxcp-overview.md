# DXCP — DX Cloud PaaS Overview

## Team Mission

DXCP manages Kubernetes platform infrastructure for Disney Parks & Experiences via Rafay-managed EKS clusters across 15 AWS accounts spanning 3 domains and 4 environments.

## Technology Stack

| Technology | Role |
|-----------|------|
| Kubernetes (EKS) | Target compute platform |
| Rafay | GitOps-based K8s cluster management, addons, blueprints |
| Helm 3 | Chart packaging for K8s addons |
| AWS (15 accounts) | EKS, IAM/IRSA, S3 cross-account |
| Terraform | Infrastructure provisioning |
| Rundeck | Job orchestration (DB provisioning, vault automation) |
| GitHub Enterprise | Source control (github.disney.com) |
| Jira (IOET) | Ticket tracking (Cloud + Enterprise instances) |
| Confluence | Documentation |
| ServiceNow | RITM/REQ/INC/CHG requests |

## Repository Map

| Repo | Org | Purpose |
|------|-----|--------|
| wdpr-cp-rafay-addons | wdpr-cloud-paas-rafay | Helm-based K8s addons |
| wdpr-cp-rafay-sandbox-gitops | wdpr-cloud-paas-rafay | Sandbox validation |
| wdpr-cp-rafay-platform-gitops | wdpr-cloud-paas-rafay | Production fleet GitOps |
| manifesto | wd-cp | Platform manifesto |
| wdpr-ra-vpcn | wdpr-cso-terraform | Terraform VPC/networking |

All repos hosted on github.disney.com.

## GitOps Promotion Flow

```
sandbox-gitops (validate) → platform-gitops (fleet deploy)
                              ├── latest
                              ├── stage
                              ├── load
                              └── prod
```

## Conventions

- **Branch naming:** `IOET-XXXX/short-description-in-kebab-case`
- **Commits:** `type(scope): [IOET-XXXX] short description` (Conventional Commits)
- **PR titles:** `[IOET-XXXX] Short description`
- **PR body:** Uses org template from `wdpr-cloud-paas-rafay/.github`
- **Artifacts:** Stored in `DXCP_tickets/[IOET-XXXX] Title/` folders
- **No AI attribution footers** in any artifacts
- **Language:** English for technical content; Spanish for Jira comments when posting to MyJira

## Ticket Artifact Structure

Per-ticket work products live in:
```
DXCP_tickets/[IOET-XXXX] <title>/
├── context-brief.md          # Context gathered from Jira/Confluence/PRs
├── pr-review.md              # PR code review summary
├── helm-chart-review.md      # Helm review checklist
├── helm-review-test-values.yaml
├── validation-summary.md     # Peer review validation
├── jira-approval-comment.md  # Draft Jira comment (NOT auto-posted)
├── story-scorecard.md        # Sprint readiness score
└── metrics-report.md         # Sprint metrics
```
