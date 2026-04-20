# Ops Prompt Guide

**Effective prompts for DevOps, Operations, and AI Metrics tracking**

This guide shows how to use Ops agents in your daily workflow with real-world examples.

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| AI metrics report | `ai_metrics_agent` | "Generate AI metrics report for DPAY-14337" |
| Update AI fields | `ai_metrics_agent` | "Update AI effort fields for DPAY-14337" |
| Check ECS tasks | `infra_check_agent` | "How many tasks are running in cart-latest?" |
| Pipeline status | `deployment_agent` | "Show recent deployments for payment-service" |
| Code quality | `code_quality_agent` | "Show quality gate status for wdpr-payment-svc" |
| Complex ops workflow | `ops_orchestrator_agent` | "Full status report for DPAY-14337" |

---

## Daily Workflows

### 1. Generating AI Metrics After a PR

**Scenario:** You completed a ticket with AI assistance and need to track the impact.

```bash
kiro-cli chat --agent ai_metrics_agent
```

**Prompt:**
```
Generate AI metrics report for DPAY-14337.
PR: https://github.disney.com/SANCR225/wdpr-config-services/pull/42
```

**What happens:**
1. Agent fetches Jira ticket details (Story Points, existing AI fields)
2. Asks you for AI Assisted Effort (shows Story Points as reference)
3. Asks for AI Usage Level (Low/Medium/High)
4. Generates metrics report with efficiency gain breakdown
5. Posts report as Jira comment

**Output example:**
```
AI Impact Metrics:
  Original Effort: 5 SP
  AI Assisted Effort: 3 SP
  Efficiency Gain: 40%
  AI Usage Level: Medium

Efficiency Gain Breakdown:
  Code: 50% faster
  Unit Testing: 30% faster
  Analysis: 20% faster

Ticket Type: New development
```

---

### 2. Updating Jira AI Fields After PR Creation

**Scenario:** PR is created, need to update Jira with AI tracking data.

```bash
kiro-cli chat --agent ai_metrics_agent
```

**Prompt:**
```
Update AI effort fields for DPAY-14337.
I used Kiro with Medium AI usage level.
Original story was 5 points, with AI it took about 3 points of effort.
```

**What happens:**
1. Updates AI Assisted Effort (customfield_27200) → 3
2. Updates AI Usage Level (customfield_27201) → Medium
3. Updates AI Tools Used (customfield_27202) → "Kiro"
4. Adds "AI-Peer-Reviewed" label

---

### 3. Checking Infrastructure Status

**Scenario:** Need to verify ECS tasks are running after a deployment.

```bash
kiro-cli chat --agent infra_check_agent
```

**Prompt:**
```
Check how many tasks are running in the payment-service-latest cluster.
Also check payment-service-stage.
```

**What happens:**
1. Reads AWS credentials
2. Queries ECS for running task count
3. Reports status per cluster

---

### 4. Checking Pipeline Status

**Scenario:** Want to see if the latest deployment succeeded.

```bash
kiro-cli chat --agent deployment_agent
```

**Prompt:**
```
Show me the last 5 pipeline executions for payment-service.
Include status, trigger, and timestamp.
```

---

### 5. Code Quality Check

**Scenario:** Review SonarQube metrics before a release.

```bash
kiro-cli chat --agent code_quality_agent
```

**Prompt:**
```
Show quality gate status for wdpr-config-services.
Include coverage, bugs, vulnerabilities, and code smells.
```

**Output example:**
```
Quality Gate: ✅ PASSED

Metrics:
  Coverage: 92.3%
  Bugs: 2 (minor)
  Vulnerabilities: 0
  Code Smells: 14
  Duplications: 1.2%
```

---

### 6. Full Status Report (Orchestrator)

**Scenario:** Need a complete picture for a ticket before sprint review.

```bash
kiro-cli chat --agent ops_orchestrator_agent
```

**Prompt:**
```
Give me a full status report for DPAY-14337:
- AI metrics from Jira
- SonarQube quality gate
- Latest deployment status
```

**What happens:**
1. Delegates to `ai_metrics_agent` for Jira AI fields
2. Delegates to `code_quality_agent` for SonarQube
3. Delegates to `deployment_agent` for pipeline status
4. Consolidates into a single report

---

## Tips

- Always provide the Jira ticket number when working with AI metrics
- For infrastructure checks, specify the cluster name or the agent will list all clusters
- The ops orchestrator can parallelize independent checks for faster results
- Use `koda configure` to set up MCP tokens before first use
