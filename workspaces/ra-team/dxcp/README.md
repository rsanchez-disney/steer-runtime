# DXCP Workspace

DX Cloud PaaS workspace for Kubernetes platform engineering, tooling development, and cluster lifecycle management.

## Team
DXCP Cloud PaaS (ipe-daredevil) — Jira project IOET on disneyexperiences.atlassian.net

## Profiles (Sub-workspaces)

Choose the profile that matches your role:

| Profile | Command | Default Agent | Focus |
|---------|---------|--------------|-------|
| **k8s-platform** | `koda workspace apply dxcp-k8s-platform` | cloudops_orchestrator_agent | Helm addons, Rafay GitOps, AddonOverrides, OPA, Istio, observability, troubleshooting |
| **dev-tools** | `koda workspace apply dxcp-dev-tools` | orchestrator | cluster_configurator, eve, SPOG API/UI, Harness CI/CD |
| **cluster-deployer** | `koda workspace apply dxcp-cluster-deployer` | cloudops_orchestrator_agent | Bi-weekly release cycle, blueprint promotion, ServiceNow changes |
| **dxcp (parent)** | `koda workspace apply dxcp` | cloudops_orchestrator_agent | General DXCP work (all context, no specialized skills) |

## Structure

```
dxcp/
├── workspace.json              # Parent config: 15 projects, shared context
├── context/                    # Domain knowledge (ALL profiles inherit this)
│   ├── aws-accounts.md         # 15 AWS accounts, role chains
│   ├── dxcp-overview.md        # Team mission, tech stack, conventions
│   ├── github-workflow.md      # Branch/commit/PR conventions
│   ├── helm-review.md          # Chart review checklist
│   ├── jira-routing.md         # Dual Jira instances, custom fields
│   ├── rafay-gitops.md         # Rafay GitOps standards
│   ├── rundeck-api.md          # Rundeck operations
│   ├── memory-bank/            # Team persistent knowledge
│   └── projects/               # Per-project knowledge
├── rules/                      # Shared guardrails (all profiles)
├── mcp/defaults.env            # Team MCP defaults
│
├── k8s-platform/               # Profile 1: K8s Platform Engineer
│   ├── workspace.json
│   └── profiles/cloudops/
│       ├── steering/           # Role definition, Rafay domain terms
│       └── skills/             # Helm addon creation, override lifecycle, troubleshooting
│
├── dev-tools/                  # Profile 2: Developer
│   ├── workspace.json
│   └── profiles/dev-core/
│       ├── steering/           # Developer role definition
│       └── skills/             # Cluster configurator dev, Harness pipelines
│
└── cluster-deployer/           # Profile 3: Cluster Deployer
    ├── workspace.json
    └── profiles/cloudops/
        ├── steering/           # Deployer role, release schedule
        └── skills/             # Release cycle, environment promotion
```

## Inheritance

```
ra-team (dev-core, dev-python, ops, dev-web + 10 rules)
  └── dxcp (+cloudops, +dev-infra, +ops, 15 projects, shared context/rules)
      ├── dxcp-k8s-platform (+dev-infra, platform skills override cloudops)
      ├── dxcp-dev-tools (+dev-python, +dev-web, developer skills)
      └── dxcp-cluster-deployer (deployer skills override cloudops)
```

## How exclusive_overrides Works

The parent workspace declares:
```json
"exclusive_overrides": {
  "cloudops": ["skills", "steering"]
}
```

This means when a child workspace (k8s-platform or cluster-deployer) provides `profiles/cloudops/skills/` and `profiles/cloudops/steering/`, those **completely replace** the base cloudops profile's skills and steering. The child's specialized content takes over.

## Repositories (15)

| Org | Repo | Purpose |
|-----|------|---------|
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-addons | Helm addons |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-sandbox-gitops | Sandbox validation |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-platform-gitops | Blueprints + sharing |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-latest-gitops | Latest env |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-stage-gitops | Stage env |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-load-gitops | Load env |
| wdpr-cloud-paas-rafay | wdpr-cp-rafay-prod-gitops | Production env |
| wdpr-cloud-paas-rafay | dxcp-rafay-scripts | Utility scripts |
| wd-cp | manifesto | Platform manifesto |
| wd-cp | cluster_configurator | Init addons, vanity DNS |
| wd-cp | k8s-platform | Platform definitions |
| wd-cp | eve | Event automation |
| wd-cp | dxcp_spog_api | SPOG backend |
| wd-cp | dxcp_spog_ui | SPOG frontend |
| wdpr-cso-terraform | wdpr-ra-vpcn | Terraform VPC/networking |

## Quick Start

```bash
koda sync                                  # Pull latest
koda workspace apply dxcp-k8s-platform     # Platform engineer
# OR
koda workspace apply dxcp-dev-tools        # Developer
# OR
koda workspace apply dxcp-cluster-deployer # Cluster deployer
koda doctor                                # Verify
```
