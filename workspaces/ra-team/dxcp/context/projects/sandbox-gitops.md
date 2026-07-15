# Sandbox GitOps (wdpr-cp-rafay-sandbox-gitops)

## Project Brief

Sandbox GitOps validation repo — all addon/blueprint changes are tested here before promotion to platform-gitops.

### Key Features
- Pre-production validation of Rafay resources
- Safe testing environment for addon changes
- Blueprint validation before fleet deployment
- Fast feedback loop for platform changes

### Target Users
- DXCP platform engineers developing new addons/overrides
- Engineers validating changes before fleet promotion

### Repository Structure
```
projects/
  dxcp-infra-sandbox/
    addons/*.yaml
    addonoverrides/<name>/<name>.yaml
    blueprints/*.yaml
  <bapp-project>/
    clusters/*.yaml
```

### Workflow
1. Create/modify addon or override in sandbox-gitops
2. PR → review → merge
3. Rafay syncs and applies to sandbox clusters
4. Validate behavior
5. Promote to platform-gitops-latest

## Technology Stack

### Core Technologies
- Rafay GitOps (sandbox cluster sync)
- Kubernetes API resources (YAML)
- Helm values (addon configuration)

### Deployment
- Rafay agent syncs from main branch to sandbox clusters
- Changes visible within minutes of merge

### Repository & CI/CD
- Host: github.disney.com
- Org: wdpr-cloud-paas-rafay
- PR review required
- Conventional Commits

### Key Constraints
- Same structural rules as platform-gitops
- Sandbox-specific projects (dxcp-infra-sandbox)
- Used for validation only — not production traffic

## System Patterns

### Directory Organization

```
projects/
  dxcp-infra-sandbox/
    addons/
      <addon-name>.yaml
    addonoverrides/
      <override-name>/
        <override-name>.yaml
        values.yaml
    blueprints/
      <blueprint-name>.yaml
  <bapp-project>/
    clusters/
      <cluster-name>.yaml
```

### Architectural Patterns

#### Validation Environment
- Fast feedback loop (sync within minutes)
- Non-production traffic only
- Safe to iterate and experiment
- Source of truth before promotion

#### Same-Structure-as-Production
- Directory layout mirrors platform-gitops
- Override naming follows same conventions
- Validates that resources work before fleet deployment

#### Workflow
1. Create/modify resource in sandbox-gitops
2. PR → review → merge
3. Rafay syncs to sandbox clusters
4. Validate behavior (logs, metrics, pod health)
5. Promote to platform-gitops-latest

#### Testing Patterns
- Use `kubectl` against sandbox cluster to verify
- Check Rafay CloudEvents for sync status
- Monitor pod logs for startup errors
- Validate RBAC with targeted permission checks
