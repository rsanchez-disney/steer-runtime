# Rafay Addons (wdpr-cp-rafay-addons)

## Project Brief

Helm-based Kubernetes addons for Rafay-managed EKS clusters across the DXCP fleet.

### Key Features
- Helm 3 chart packaging for K8s platform addons
- AddonOverride resources with two-segment versioning (*-vX.X)
- GitOps-driven deployment via Rafay
- Multi-environment fleet support (latest, stage, load, prod)

### Target Users
- DXCP platform engineers
- Cluster operators needing standardized addon configurations

### Repository Structure
- Helm charts in chart directories
- AddonOverride YAML definitions
- Value files for environment-specific configuration
- Blueprint references

### Key Patterns
- One addon per chart
- Override naming: `<addon>-<purpose>-override-vX.X`
- Safe retirement: add new → sharing:{} on legacy → delete
- Rafay dependency atomicity: one layer per PR

## Technology Stack

### Core Technologies
- Helm 3 (chart packaging)
- Kubernetes 1.28+ (target platform)
- Rafay (GitOps cluster management)
- YAML (resource definitions)

### Build & Validation
- `helm lint` for chart validation
- `helm template` for rendering verification
- `kubeconform` for K8s API compliance
- No CI pipeline in this repo (GitOps sync validates)

### Deployment
- Rafay GitOps sync from GitHub → cluster
- Promotion: sandbox-gitops → platform-gitops
- Environment-specific value overrides

### Repository & CI/CD
- Host: github.disney.com
- Org: wdpr-cloud-paas-rafay
- Branch strategy: feature branches → main via PR
- Conventional Commits required

### Key Constraints
- Rafay `{{{ .global.Rafay... }}}` template syntax is NOT Helm
- Value files with Rafay syntax cannot be used with `helm -f`
- Use synthetic test values for local validation

## System Patterns

### Directory Organization

```
charts/
  <addon-name>/
    Chart.yaml
    values.yaml
    templates/
      deployment.yaml
      service.yaml
      _helpers.tpl
    tests/
overrides/
  <project>/
    addonoverrides/
      <override-name>/
        <override-name>.yaml    # AddonOverride resource
        values.yaml             # Override values
```

### Architectural Patterns

#### Chart Structure
- One addon per chart directory
- Helm 3 apiVersion v2
- Values file defines all configurable parameters with sensible defaults
- Templates use stable Kubernetes APIs

#### AddonOverride Pattern
- Two-segment version naming: `<addon>-<purpose>-override-vX.X`
- metadata.name matches filename exactly
- versionRegex matches addon semver family
- valuesPath uses file:// URI pointing to sibling values file

#### Deployment Pattern
- GitOps sync: GitHub main branch → Rafay agent → cluster reconciliation
- No manual kubectl for addon deployment
- Rafay handles rollback on sync failure

#### Security Patterns
- SecurityContext with runAsNonRoot, readOnlyRootFilesystem
- RBAC follows least-privilege per addon
- No secrets in values files (use ExternalSecrets or IRSA)
- Pod Identity for AWS access (not access keys)

## Development Guidelines

### Code Quality Standards

#### Naming Conventions
- Chart names: lowercase kebab-case (`kube-prometheus-stack`)
- Override names: `<addon>-<purpose>-override-vX.X`
- Value keys: camelCase for Helm values, kebab-case for K8s labels
- Directories match resource names exactly

#### YAML Formatting
- 2-space indentation
- No trailing whitespace
- Comments for non-obvious values
- Consistent quoting (strings that look like numbers must be quoted)

### Structural Conventions

#### Override Design
- One override per addon version family
- Override only what differs from addon defaults
- Use `sharing.projects` to control cluster targeting
- Never mix addon definition and override in same PR

#### Value Management
- Default values in chart's values.yaml
- Environment overrides via AddonOverride values.yaml
- Rafay `{{{ }}}` syntax for cluster-specific values (not Helm)
- Synthetic test values for local validation

### Testing Patterns
- `helm lint` before committing
- `helm template` with test values to verify rendering
- `kubeconform` for K8s API compatibility
- Synthetic values to replace Rafay template variables

### Best Practices

#### Security
- No secrets or credentials in any YAML file
- RBAC scoped to minimum required permissions
- Security contexts on all workloads
- Image references use digest or immutable tags

#### Maintainability
- Helper templates in _helpers.tpl for reuse
- Document all non-obvious values with comments
- Keep PRs atomic (one addon change per PR)
- Safe retirement: add new → sharing:{} → delete
