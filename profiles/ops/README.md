# Ops Profile

**Operations agents for AI metrics, infrastructure, deployments, and code quality**

---

## Agents (7)

### ops_orchestrator_agent
Coordinates ops workflows and delegates to specialized agents.

**Use when:** Complex ops tasks requiring multiple agents

### ai_metrics_agent
Tracks AI-assisted development metrics and updates Jira.

**Use when:**
- AI productivity reports
- Updating Jira AI custom fields
- Measuring AI adoption metrics

### infra_check_agent
Checks AWS infrastructure status.

**Use when:**
- ECS task counts
- Cluster health checks
- Infrastructure status reports

### deployment_agent
Manages CI/CD pipelines via Harness.

**Use when:**
- Pipeline status checks
- Recent deployment history
- Deployment log analysis

### code_quality_agent
Retrieves code quality metrics from SonarQube.

**Use when:**
- Quality gate status
- Coverage reports
- Bug and vulnerability counts

### release_manager_agent
Manages releases — compares tags, generates release notes, creates GitHub releases.

**Use when:**
- Release notes generation
- Tag comparison
- Readiness checks
- Creating GitHub releases

### release_documenter_agent
Documents releases in Confluence with changes, rollback plan, and dependencies.

**Use when:**
- Confluence release pages
- Change documentation
- Rollback procedures

---

## Capabilities

Agents have access to:
- ✅ **Jira** - Read/write issues, AI metrics fields
- ✅ **Confluence** - Read/write release documentation
- ✅ **GitHub** - Tags, releases, release notes
- ✅ **Harness** - CI/CD pipeline status and logs
- ✅ **SonarQube** - Code quality metrics
- ✅ **File Operations** - Read/write local files

---

## Quick Start

```bash
# Install ops profile
./setup.sh install ops

# Use an agent
kiro-cli chat --agent ops_orchestrator_agent
```

---

## Example Usage

### AI Metrics Report
```bash
kiro-cli chat --agent ai_metrics_agent
> "Generate AI productivity report for sprint 23 and update Jira fields"
```

### Infrastructure Check
```bash
kiro-cli chat --agent infra_check_agent
> "Check ECS cluster health and task counts for production"
```

### Deployment Status
```bash
kiro-cli chat --agent deployment_agent
> "Show recent deployments and pipeline status for config-services"
```

### Code Quality
```bash
kiro-cli chat --agent code_quality_agent
> "Get SonarQube quality gate status and coverage for payment-controls-api"
```

### Release Notes
```bash
kiro-cli chat --agent release_manager_agent
> "Compare v3.5.0 to v3.7.0 and generate release notes for GitHub"
```

### Release Documentation
```bash
kiro-cli chat --agent release_documenter_agent
> "Create Confluence release page for v3.7.0 with changes and rollback plan"
```

---

## Structure

```
.kiro-ops/
├── agents/              # 7 agent configurations
│   ├── ops_orchestrator_agent.json
│   ├── ai_metrics_agent.json
│   ├── infra_check_agent.json
│   ├── deployment_agent.json
│   ├── code_quality_agent.json
│   ├── release_manager_agent.json
│   └── release_documenter_agent.json
├── prompts/             # Agent prompts
├── context/             # Ops guidelines
│   └── ops_guidelines.md
└── README.md            # This file
```

---

## Documentation

📖 **OPS_PROMPT_GUIDE.md** - Workflow examples with prompts
📖 **OPS_WORKFLOWS.md** - End-to-end ops workflows
📖 **OPS_QUICK_REFERENCE.md** - Quick reference card

---

## See Also

- Main README: `../README.md`
- Setup guide: `../setup.sh`
- Full documentation: `../docs/`

---

**Profile Version:** 1.0  
**Agents:** 7  
**Last Updated:** April 2, 2026
