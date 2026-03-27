# Terraform / IaC Standards

## Project Structure

```
terraform/
├── main.tf           # Primary resources
├── variables.tf      # Input variables
├── outputs.tf        # Output values
├── providers.tf      # Provider configuration
├── versions.tf       # Required providers and versions
├── locals.tf         # Local values
├── data.tf           # Data sources
└── modules/          # Reusable modules
```

## Naming Conventions

- Resources: `snake_case` (e.g., `aws_ecs_service.api_service`)
- Variables: `snake_case` with descriptive names
- Modules: `kebab-case` directory names
- Tags: include `Name`, `Environment`, `Team`, `ManagedBy: terraform`

## State Management

- Use remote state (S3 + DynamoDB lock, Terraform Cloud, etc.)
- Never commit `.tfstate` files
- Use workspaces or separate state files per environment
- Enable state encryption at rest

## Variables

- Always set `description` and `type` on variables
- Use `validation` blocks for input constraints
- Set `default` only for truly optional values
- Use `sensitive = true` for secrets

## Modules

- Keep modules focused — one logical resource group per module
- Pin module versions: `source = "./modules/vpc?ref=v1.0.0"`
- Document inputs and outputs in module README
- Use `for_each` over `count` for named resources

## Security

- Never hardcode credentials — use IAM roles, environment variables, or secret managers
- Enable encryption for all storage resources
- Use `tfsec` or `checkov` for static analysis
- Review `terraform plan` before every `apply`

## Workflow

```bash
terraform init        # Initialize providers
terraform fmt         # Format code
terraform validate    # Validate syntax
terraform plan        # Preview changes
terraform apply       # Apply (after review)
```
