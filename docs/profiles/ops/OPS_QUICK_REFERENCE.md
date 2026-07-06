# Ops Quick Reference Card

**Print this for your desk!**

---

## Agent Selection

| I need to...          | Use this agent           |
|-----------------------|--------------------------|
| Track AI productivity | `ai_metrics_agent`       |
| Check ECS/AWS status  | `infra_check_agent`      |
| Check pipeline status | `deployment_agent`       |
| Check code quality    | `code_quality_agent`     |
| Complex ops workflow  | `ops_orchestrator_agent` |

---

## Common Commands

### Start a conversation
```bash
kiro-cli chat --agent <agent_name>
```

### Configure MCP tokens
```bash
koda configure
```

---

## 5-Minute Tasks

### AI metrics after PR
```
Generate AI metrics report for DPAY-14337
```

### Quick infra check
```
How many tasks are running in payment-service-prod?
```

### Pipeline status
```
Show last deployment for payment-service
```

### Quality gate
```
Show quality gate status for wdpr-config-services
```

---

## AI Usage Levels

| Level      | Description                                                           |
|------------|-----------------------------------------------------------------------|
| **Low**    | Primarily human effort, AI for specific tasks (research, boilerplate) |
| **Medium** | Balanced collaboration between human and AI                           |
| **High**   | AI-driven approach with human oversight                               |

---

## Jira Custom Fields

| Field              | ID                |
|--------------------|-------------------|
| Story Points       | customfield_10003 |
| AI Assisted Effort | customfield_27200 |
| AI Usage Level     | customfield_27201 |
| AI Tools Used      | customfield_27202 |

---

## Common Clusters

| Environment | Pattern    |
|-------------|------------|
| Latest/Dev  | `*-latest` |
| Stage       | `*-stage`  |
| Prod        | `*-prod`   |
| Load Test   | `*-load`   |

---

## MCP Servers Required

| Agent              | MCP Server                       |
|--------------------|----------------------------------|
| ai_metrics_agent   | jira, confluence, cloud-wiki, github |
| deployment_agent   | harness (Docker)                 |
| code_quality_agent | sonarqube (Docker)               |
| infra_check_agent  | AWS CLI (local)                  |
