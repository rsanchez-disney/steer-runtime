# DPS Team Workspace

Disney Package Service — package offer search, quote, freeze, and pricing engine for DLR and DLP resort packages. Part of the Yield Management Platform (YMP).

## Apply

```bash
koda workspace apply dps-team
```

## What's Included

### Projects (6 repos)

| Repo | Purpose | Sites | Pipelines |
|------|---------|-------|-----------|
| `dps-core-offer` | Core offer search and assembly (ROH + DOS) | DLR, DLP | DLR, DLP |
| `dps-core-resflowmgmt` | Reservation flow: freeze, validate, confirm, cancel | DLR, DLP | DLR, DLP |
| `dps-core-quote` | Package quote generation | DLR, DLP | DLR, DLP |
| `dps-core-scoreschemeconfig` | Score scheme configuration service | DLR, DLP | DLR, DLP |
| `package-calendar-service-sync` | DLP calendar sync (Kafka consumer from RAS) | DLP | DLP |
| `package-calendar-service` | Package calendar service | DLP | DLP |


### Context Files

| File | Content |
|------|---------|
| `context/team_context.md` | Architecture, repos, tech stack, deployment, team structure |
| `context/domain_context.md` | Package domain, business flows, API contracts, clients, downstream services |
| `context/splunk_queries.md` | Splunk queries for DPS services |

### Rules

| Rule | Source | Purpose |
|------|--------|---------|
| `dps-conventions.md` | Workspace | JAX-RS API, caching, SOAP integration, Pact testing, Docker conventions |
| `conventional_commit` | Common | Conventional commit format |
| `general-java-development` | Common | Java/SOLID/OWASP best practices |
| `general-aws` | Common | AWS best practices |
| `general-api-design` | Common | REST API design patterns |
| `general-performance-optimization` | Common | Performance patterns |
| `general-testing-strategies` | Common | Testing strategies |
| `general-docker` | Common | Docker best practices |
| `jira-commit-format` | Common | Jira ticket reference in commits |
| `jira-safety` | Common | Jira field safety guardrails |

## Jira & Wiki

- **Jira**: `ISOPP-`
- **Wiki**: Confluence Cloud space `DisneyPackageService` — use `@confluence-cloud/*` tools
- **GitHub**: `WDPR-Resort-Sales` on github.disney.com

