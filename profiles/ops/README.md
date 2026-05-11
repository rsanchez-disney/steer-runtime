# Ops Profile

**Operations agents for infrastructure, deployments, log analysis, code quality, and release management**

---

## Agents (9)

| Agent | Description |
|-------|-------------|
| `ops_orchestrator_agent` | Coordinates ops workflows and delegates to specialized agents |
| `ai_metrics_agent` | Tracks AI-assisted development metrics and updates Jira |
| `infra_check_agent` | Checks AWS infrastructure status: ECS tasks, clusters, services |
| `deployment_agent` | Manages CI/CD pipelines and deployment status via Harness |
| `code_quality_agent` | Retrieves code quality metrics from SonarQube |
| `log_analyzer_agent` | Analyzes logs across Splunk, ServiceNow, and other systems via Compass |
| `release_manager_agent` | Compares tags, generates release notes, creates GitHub releases |
| `release_documenter_agent` | Documents releases in Confluence with changes and rollback plan |
| `email_agent` | Sends emails via Compass MCP |

---

## Capabilities

| Capability | Tool / MCP |
|------------|-----------|
| Log search & analysis | Compass MCP (Splunk, ServiceNow, etc.) |
| Jira read/write | Jira MCP |
| Confluence documentation | Confluence MCP |
| GitHub tags & releases | GitHub MCP |
| CI/CD pipelines | Harness |
| Code quality metrics | SonarQube |
| Infrastructure status | AWS CLI |

---

## Quick Start

```bash
# Install ops profile
koda install ops

# Or via workspace
koda workspace apply my-team   # if workspace includes ops profile

# Start the orchestrator (routes to the right agent)
kiro-cli chat --agent ops_orchestrator_agent
```

---

## Prompt Examples

### Log Analysis

```
kiro-cli chat --agent log_analyzer_agent
```

**Trace an error by correlation ID:**
> Search for all events with correlation ID `abc-123-def-456` in the last 4 hours. Reconstruct the timeline and identify what failed.

**Investigate a service outage:**
> The payment-service has been returning 500 errors since 2pm. Search the logs, identify the error pattern, and tell me what changed.

**Analyze error frequency:**
> How many 5xx errors has the config-api produced in the last 24 hours? Break it down by hour and error type.

**Trace a distributed request:**
> Trace request ID `req-789` across all services. Show me the full path from API gateway to database and where it broke.

**Compare error rates:**
> Compare error rates for order-service between yesterday and today. Has anything gotten worse?

---

### Infrastructure

```
kiro-cli chat --agent infra_check_agent
```

> Check ECS cluster health and task counts for production.

> How many running tasks does the payment-service have? Are any in PENDING or STOPPED state?

> Show me all ECS services with desired count != running count.

---

### Deployments

```
kiro-cli chat --agent deployment_agent
```

> Show recent deployments and pipeline status for config-services.

> What was the last deployment to production? Did it succeed?

> List all failed pipelines in the last 48 hours.

---

### Code Quality

```
kiro-cli chat --agent code_quality_agent
```

> Get SonarQube quality gate status and coverage for payment-controls-api.

> Show me all critical and blocker issues introduced in the last sprint.

> Compare code coverage between main and the feature branch.

---

### AI Metrics

```
kiro-cli chat --agent ai_metrics_agent
```

> Generate AI productivity report for sprint 424 and update Jira fields.

> What percentage of PRs this sprint used AI-assisted code review?

> Track AI adoption metrics across all teams for the last 3 sprints.

---

### Release Management

```
kiro-cli chat --agent release_manager_agent
```

> Compare v3.5.0 to v3.7.0 and generate release notes for GitHub.

> Check release readiness: are all DPAY tickets in Done? Is CI green?

> Create a GitHub release for v3.8.0 with auto-generated notes.

---

### Release Documentation

```
kiro-cli chat --agent release_documenter_agent
```

> Create a Confluence release page for v3.7.0 with changes and rollback plan.

> Document the hotfix release with affected services and verification steps.

---

### Orchestrator (multi-agent)

```
kiro-cli chat --agent ops_orchestrator_agent
```

> The checkout-service is down. Check infrastructure status, search the logs for errors in the last hour, and check if there was a recent deployment.

> Prepare for release v3.8.0: check code quality, verify all tickets are done, generate release notes, and create the Confluence page.

> We had a production incident at 3am. Pull the logs, check what was deployed yesterday, and generate an incident summary.

---

## Structure

```
profiles/ops/
├── agents/                          # 9 agent configurations
│   ├── ops_orchestrator_agent.json
│   ├── ai_metrics_agent.json
│   ├── infra_check_agent.json
│   ├── deployment_agent.json
│   ├── code_quality_agent.json
│   ├── log_analyzer_agent.json      # NEW — Compass MCP
│   ├── release_manager_agent.json
│   └── release_documenter_agent.json
├── prompts/                         # Agent prompts
├── context/
│   └── ops_guidelines.md            # Shared ops context
└── README.md                        # This file
```

---

**Profile Version:** 1.1
**Agents:** 9
**Last Updated:** May 2026
