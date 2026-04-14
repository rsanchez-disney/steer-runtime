# Dev Infra Profile

**Terraform/IaC specialist for infrastructure provisioning, modules, and state management**

Requires `dev-core` as a base.

## Agents (1)

### terraform
Infrastructure as Code specialist for Terraform, cloud provisioning, and module design.

**Use when:**
- Writing or reviewing Terraform code
- Creating reusable modules
- Planning and applying infrastructure changes
- State management and migration
- Security scanning with tfsec/checkov

---

## Capabilities

- ✅ **Context7** — Up-to-date provider documentation
- ✅ **Code Tools** — Read/write HCL code
- ✅ **Execution** — Run terraform, tflint, tfsec, infracost
- ✅ **File Operations** — Manage module files

---

## Quick Start

```bash
koda install dev-core dev-infra

kiro-cli chat --agent terraform
> "Create a Terraform module for an ECS Fargate service with ALB and auto-scaling"
```

---

## Structure

```
.kiro-dev-infra/
├── agents/       # 1 agent JSON config
│   └── terraform.json
├── prompts/      # Agent prompt
│   └── terraform.md
├── context/      # Terraform guidelines
│   └── terraform_guidelines.md
└── skills/       # 2 skills
    ├── terraform-module-creation.md
    └── terraform-plan-apply.md
```

---

## Install

```bash
koda install dev-core dev-infra        # Infra developer
koda install dev                       # All dev (if alias updated)
```

---

**Profile Version:** 1.0
**Agents:** 1
**Last Updated:** April 3, 2026
