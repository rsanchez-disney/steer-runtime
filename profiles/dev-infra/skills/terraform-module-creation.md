# Skill: Terraform module creation

Use when creating a new reusable Terraform module.

## Checklist
1. Create module directory with main.tf, variables.tf, outputs.tf, versions.tf
2. Define all input variables with type, description, and sensible defaults
3. Add validation blocks for variables where appropriate
4. Use `for_each` over `count` for named resources
5. Tag all resources with standard tags (project, env, managed_by)
6. Expose only necessary outputs with descriptions
7. Add README.md with usage example and input/output tables
8. Run `terraform fmt` and `terraform validate`
