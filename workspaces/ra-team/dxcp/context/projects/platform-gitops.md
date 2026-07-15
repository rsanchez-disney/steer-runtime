# Platform GitOps (wdpr-cp-rafay-platform-gitops)

## Project Brief

Production GitOps repository for fleet-wide addon and blueprint deployment across DXCP EKS clusters. Exists as 4 environment-specific repos (latest, stage, load, prod).

### Key Features
- Fleet-wide K8s addon management via Rafay
- Environment isolation (one repo per environment)
- AddonOverride promotion from sandbox-gitops
- Blueprint definitions for cluster configurations

### Target Users
- DXCP platform engineers promoting validated addons
- Cluster operators managing fleet configuration

### Repository Structure
```
projects/
  <rafay-project>/
    addons/*.yaml
    addonoverrides/<name>/<name>.yaml
    addonoverrides/<name>/values.yaml
    blueprints/*.yaml
    clusters/*.yaml
```

### Promotion Flow
1. Validate in sandbox-gitops
2. Create PR to platform-gitops-latest
3. Promote through: latest → stage → load → prod
4. Each environment has its own repo and approval gates

### Key Patterns
- Override sharing controls which clusters receive an addon
- Blueprint references control cluster addon composition
- Safe retirement follows add → deprecate → delete lifecycle

## Technology Stack

### Core Technologies
- Rafay GitOps (addon/blueprint sync)
- Kubernetes API resources (YAML definitions)
- Helm values (addon configuration)

### Deployment
- Rafay agent syncs from GitHub main branch
- Changes to main trigger automatic cluster reconciliation
- No manual kubectl required

### Repository & CI/CD
- Host: github.disney.com
- Org: wdpr-cloud-paas-rafay
- 4 repos: platform-gitops-{latest,stage,load,prod}
- PR required for all changes
- Conventional Commits

### Key Constraints
- One dependency layer per PR (addon OR blueprint, not both)
- Override naming must match filename
- versionRegex must match addon semver family
- sharing.projects uses name-only references

## System Patterns

### Directory Organization

```
projects/
  <rafay-project>/
    addons/
      <addon-name>.yaml
    addonoverrides/
      <override-name>/
        <override-name>.yaml
        values.yaml
    blueprints/
      <blueprint-name>.yaml
    clusters/
      <cluster-name>.yaml
```

### Architectural Patterns

#### GitOps Sync Model
- Rafay agent continuously syncs main branch state
- Cluster state converges to repo state within minutes
- Drift is auto-corrected on next sync cycle
- No manual intervention required for steady-state

#### Environment Isolation
- Separate repo per environment (latest, stage, load, prod)
- Identical directory structure across all environments
- Promotion = PR from one env repo's state to the next
- Each environment has its own approval gates

#### Promotion Flow
1. Validate in sandbox-gitops (fast feedback)
2. PR to platform-gitops-latest (fleet validation)
3. PR to platform-gitops-stage (pre-prod)
4. PR to platform-gitops-load (performance)
5. PR to platform-gitops-prod (production)

#### Dependency Atomicity
- One resource type per PR
- Addon PR ≠ Blueprint PR ≠ Cluster PR
- Override changes are self-contained
- Blueprint references validated against existing addons

#### Override Lifecycle
```
add new override (vX.Y) → merge
set sharing:{} on old override (vX.Z) → merge
delete old override files → merge
```

Three separate PRs. Never combine steps.

## Development Guidelines

### Naming Conventions
- Override names: two-segment `*-vX.X` (not three-segment)
- Filenames match metadata.name exactly
- Projects use kebab-case
- Clusters follow: `rafay-aws-{domain}-{env}-{region}-c{n}`

### PR Guidelines
- Title: `[IOET-XXXX] Short description`
- One dependency layer per PR
- Use org PR template from `.github/`
- No AI attribution footers
- Include validation evidence in PR body

### Safety Rules
- Never delete an override in the same PR that adds its replacement
- Always verify sandbox-gitops promotion source matches
- Check sharing.projects references resolve to real projects
- Validate versionRegex against actual addon versions

### Review Checklist
- [ ] metadata.name matches filename
- [ ] versionRegex is correct Go regex
- [ ] valuesPath file:// matches directory/file layout
- [ ] sharing.projects uses name-only (no IDs)
- [ ] No unrelated changes in PR (scope check)
- [ ] Conventional Commit message
- [ ] Jira ticket linked
