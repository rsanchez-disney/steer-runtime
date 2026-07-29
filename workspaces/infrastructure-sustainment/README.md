# Infrastructure sustainment workspace

Cloud infrastructure support for sustainment application teams — AWS, GCP, Azure, Akamai, and architecture (BlueDolphin).

## Quick start

```bash
koda workspace apply infrastructure-sustainment
koda mcp-install
koda doctor
koda chat
```

## Agents

| Agent | Purpose |
|-------|---------|
| `infra_orchestrator_agent` | Routes requests to the right specialist |
| `cloud_ops_agent` | AWS/GCP/Azure diagnostics and health checks |
| `chg_analyzer_agent` | CHG verification and deployment validation |
| `network_diagnostics_agent` | DNS, certs, connectivity, Akamai |
| `incident_triage_agent` | Incident investigation |
| `rca_agent` | Root cause analysis |
| `stability_validator_agent` | Pre/post change validation |

## What you can ask

```text
"Check the health of the payment-service on AWS"
"Verify deployment for CHG0054321"
"Look up the architecture for BAPP0006350 in BlueDolphin"
"What's the status of BEAN-1234?"
"Purge Akamai cache for *.example.com/assets/*"
"Check DNS resolution for api.disneyworld.com"
"Run pre-change validation for the auth service"
```

## Profiles inherited

| Profile | What it provides |
|---------|-----------------|
| sustainment | All sustainment agents + managed services catalog (28 studios) |
| dev-core | Code review, planning, story analysis, technical writing |

## MCP tools available

| MCP | Capabilities |
|-----|-------------|
| `@compass/*` | ServiceNow, Splunk, Network/DNS, Akamai |
| `@bluedolphin/*` | Architecture diagrams, BAPP relationships |
| `@atlassian/*` | Jira Cloud (BEAN), Confluence |
| `@jira-cloud/*` | Jira Cloud fallback |
| `@confluence-cloud/*` | Confluence documentation |

## Customization

Edit `context/cloud_accounts.md` to add your team's specific AWS profiles, GCP projects, and Azure subscriptions.
