# Terraform Guidelines

## Environment Strategy

| Environment | Backend | Workspace | Apply |
|-------------|---------|-----------|-------|
| dev | S3/GCS shared | `dev` | Auto on merge to `develop` |
| staging | S3/GCS shared | `staging` | Auto on merge to `main` |
| production | S3/GCS isolated | `prod` | Manual approval required |

## Naming Conventions

- Resources: `<project>-<env>-<resource>` (e.g., `myapp-prod-api-gateway`)
- Variables: `snake_case` with descriptive names
- Modules: `terraform-<provider>-<name>` (e.g., `terraform-aws-ecs-service`)
- Outputs: match the attribute name they expose

## State Management

- Always use remote state with locking (DynamoDB for AWS, GCS for GCP)
- Never commit `.tfstate` files
- Use `terraform state mv` for refactoring — never edit state manually
- Import existing resources with `terraform import` before managing them

## Cost Awareness

- Use `infracost` to estimate cost impact of changes
- Prefer reserved/committed use for predictable workloads
- Right-size instances — start small, scale based on metrics
- Use auto-scaling where supported
- Tag resources for cost allocation

## Common Patterns

### Remote Backend (AWS)
```hcl
terraform {
  backend "s3" {
    bucket         = "myorg-terraform-state"
    key            = "myapp/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Required Providers
```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```
