# Skill: Terraform plan/apply workflow

Use when making infrastructure changes.

## Checklist
1. Run `terraform init` to ensure providers and modules are up to date
2. Run `terraform fmt -check` to verify formatting
3. Run `terraform validate` to check configuration
4. Run `terraform plan -out=tfplan` and review the output
5. Confirm with user before applying — never auto-apply
6. Run `terraform apply tfplan` only after explicit approval
7. Verify resources in the cloud console or via `terraform show`
8. Commit the code changes (not the plan file or state)
