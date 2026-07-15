# Cluster Configurator

## Project Brief

Cluster configuration management and provisioning tooling for DXCP EKS clusters managed via Rafay.

### Key Features
- Cluster provisioning workflows
- Configuration templating for new clusters
- Standardized cluster setup across environments
- Integration with Rafay for cluster lifecycle management

### Target Users
- DXCP platform engineers provisioning new clusters
- Operators managing cluster configurations

### Key Patterns
- Declarative cluster configuration
- Template-driven provisioning
- Multi-environment support (3 domains × 4 environments)
- Integration with Rafay cluster management APIs

## Technology Stack

### Repository & CI/CD
- Host: github.disney.com
- Org: wd-cp
- Branch strategy: feature branches → main via PR
- Conventional Commits required

### Integration Points
- Rafay cluster management APIs
- AWS EKS provisioning
- Platform GitOps repos (output feeds into gitops)
- DXCP AWS accounts (15 accounts across 3 domains)

### Key Constraints
- Configurations must be environment-agnostic where possible
- Secrets externalized (never in config files)
- Changes validated in sandbox before production
