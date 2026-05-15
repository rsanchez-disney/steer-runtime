# CloudOps Prompt Guide

**Effective prompts for cloud infrastructure planning, configuration management, and incident RCA**

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Infrastructure planning | `infra_planner_agent` | "Plan environments for the new payment microservice" |
| Config management | `config_management_agent` | "Define config versioning strategy for our ECS services" |
| Write RCA document | `rca_writer_agent` | "Write RCA for the 2026-05-10 cart-service outage" |
| Full ops workflow | `cloudops_orchestrator_agent` | "Plan infra + config for the new loyalty-api service" |

---

## Daily Workflows

### 1. Planning a New Environment

```
Plan environments for a new service called loyalty-api.
Requirements:
- 3 environments: dev, stage, prod
- ECS Fargate on us-east-1
- RDS PostgreSQL with read replicas in prod
- ALB with WAF in stage and prod
```

**What happens:**
1. Agent produces environment topology per stage
2. Recommends instance sizing, scaling policies, and networking
3. Outputs Terraform module structure

---

### 2. Defining Configuration Strategy

```
Define a configuration management strategy for our ECS services.
We have 12 services across 3 environments.
Currently using SSM Parameter Store but it's getting messy.
```

**What happens:**
1. Analyzes current state and pain points
2. Recommends naming conventions, hierarchy, and access patterns
3. Produces migration plan from current to target state

---

### 3. Writing an RCA Document

```
Write RCA for the cart-service outage on 2026-05-10.
Timeline:
- 14:32 alerts fired for 5xx spike
- 14:45 identified RDS connection pool exhaustion
- 15:10 scaled pool from 20 to 50, recovered
Root cause: connection leak in retry logic after v2.3.1 deploy.
```

**What happens:**
1. Structures incident into standard RCA format
2. Adds impact assessment, contributing factors, and timeline
3. Generates action items with owners and due dates
4. Produces publishable document ready for stakeholders

---

### 4. Orchestrated Workflow

```
We're launching a new notification-service next sprint.
Help me with:
1. Environment plan (dev/stage/prod on ECS)
2. Config strategy (secrets + feature flags)
3. Runbook template for on-call
```

**What happens:**
1. Delegates environment planning to `infra_planner_agent`
2. Delegates config strategy to `config_management_agent`
3. Consolidates into a single delivery package

---

## Tips

- Provide existing service names when asking about config — the agent can reference patterns already in use
- For RCA, include the timeline and root cause; the agent structures and expands it
- The orchestrator works best when you describe the full scope upfront
