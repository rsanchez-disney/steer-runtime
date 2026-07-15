# Terraform VPCN (wdpr-ra-vpcn)

## Project Brief

Terraform modules for VPC and networking infrastructure supporting DXCP EKS clusters across 15 AWS accounts.

### Key Features
- VPC provisioning for EKS workloads
- Subnet layout for multi-AZ clusters
- Security group definitions
- Transit gateway and peering configurations
- Cross-account networking

### Target Users
- DXCP infrastructure engineers
- Network architects managing AWS connectivity

### Key Patterns
- Module-based composition
- Environment-specific tfvars
- Remote state in S3 with DynamoDB locking
- IAM boundary enforcement

## Technology Stack

### Core Technologies
- Terraform (IaC)
- AWS VPC, Subnets, Security Groups
- AWS Transit Gateway
- AWS EKS networking requirements

### Build & Validation
- `terraform init`
- `terraform plan`
- `terraform validate`
- `tflint` for linting

### Deployment
- Terraform apply via CI/CD or controlled manual runs
- State stored in S3 with DynamoDB lock table
- Cross-account assume-role for multi-account provisioning

### Repository & CI/CD
- Host: github.disney.com
- Org: wdpr-cso-terraform
- PR required for all changes
- Plan output in PR comments

### Key Constraints
- Never hardcode credentials
- Use variables for all environment-specific values
- Module versioning for shared modules
- 15 AWS accounts across 3 domains × 4 environments + 3 sandboxes

## System Patterns

### Directory Organization

```
modules/
  vpc/
  subnets/
  security-groups/
  transit-gateway/
environments/
  d01/
    latest/
    stage/
    load/
    prod/
  d04/
    ...
  d07/
    ...
  sandbox/
```

### Architectural Patterns

#### Module Composition
- Reusable modules for common infrastructure patterns
- Environment-specific tfvars for per-account configuration
- Module versioning for shared components

#### State Management
- Remote state in S3 with DynamoDB locking
- One state file per environment/account
- State bucket in the target account

#### Multi-Account Strategy
- 15 AWS accounts (3 domains × 4 environments + 3 sandboxes)
- Cross-account assume-role for provisioning
- Provider aliases per target account
- Shared modules, per-env variables

#### Security Patterns
- No hardcoded credentials anywhere
- Variables for all environment-specific values
- IAM boundaries enforced by module outputs
- Least-privilege security groups

#### Deployment
- `terraform plan` in PR (output as comment)
- `terraform apply` via CI/CD after approval
- Manual apply only for emergency hotfixes (with audit trail)
