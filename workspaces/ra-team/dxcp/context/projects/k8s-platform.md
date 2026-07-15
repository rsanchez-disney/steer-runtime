# K8s Platform

## Project Brief

Kubernetes platform definitions and shared platform components for the DXCP fleet.

### Key Features
- Shared platform component definitions
- Base platform standards and policies
- Kubernetes resource templates
- Platform-wide configuration baselines

### Target Users
- DXCP platform engineers defining platform standards
- Teams consuming platform components
- Architecture governance

### Key Patterns
- Platform-as-code definitions
- Shared component libraries
- Baseline policies and constraints
- Multi-cluster consistency enforcement

## Technology Stack

### Core Technologies
- Kubernetes (platform definitions)
- YAML (resource manifests)
- Helm (shared charts/templates)
- OPA/Gatekeeper (policy enforcement)

### Repository & CI/CD
- Host: github.disney.com
- Org: wd-cp
- Branch strategy: feature branches → main via PR
- Conventional Commits required

### Integration Points
- Rafay blueprints reference platform components
- Addon repos consume platform standards
- Cluster configurator uses platform templates
- GitOps repos deploy platform components

### Key Constraints
- Platform changes affect all clusters fleet-wide
- Backward compatibility required for existing workloads
- Changes must be validated in sandbox first
