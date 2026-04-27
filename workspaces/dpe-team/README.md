# DPE Team Workspace

Dynamic Pricing Engine — microservices platform for Disney Parks pricing calculations across WDW, DLR, and DLP.

## Apply

```bash
koda workspace apply dpe-team
```

## Troubleshooting: `Error: workspace not found: dpe-team`

Koda resolves workspaces from `~/.kiro/steer-runtime/`, not your source checkout (`~/src/steer-runtime/`). If `dpe-team` hasn't been synced there yet:

1. Try syncing first:
   ```bash
   koda sync
   ```
2. If the workspace is still missing, copy it manually:
   ```bash
   cp -r ~/src/steer-runtime/workspaces/dpe-team ~/.kiro/steer-runtime/workspaces/dpe-team
   ```
3. Verify it's available:
   ```bash
   koda
   ```
   Press `[w]` to select the `dpe-team` workspace.

## What's Included

### Projects (14 repos)

Calculator Service, DataService, Cache Service, Admin UI, Impact Analysis, Product Adapter, Currency Service, Price Factor Change Broker, Promotion Service, Promotion UI, pricing-shared, Event Service, wdw-publishing, dpe-monorepo.

All repos resolved from `workspace_path` in `workspace.json`. Set this to your local clone of the WDPR-SPS org.

### Context Files

| File | Content |
|------|---------|
| `context/team_context.md` | Architecture, repos with Spring Boot versions, calculator system (12 calculators + decision tree), calculation pipeline, domain terms, deployment (sites/envs/accounts), config conventions, local dev, performance considerations |
| `context/aws_applications.md` | AWS account IDs, regions, all ECS services and Lambdas with BAPP IDs, site names, and triage quick reference |
| `context/splunk_queries.md` | Production Splunk queries with real index (`wdpr_dpe`), app names, Impact Analysis pipeline traces, Calculator Service GraphQL request/response traces with all 14 source patterns, source→environment mapping table |
| `context/performance_engineering_guide.md` | Language-agnostic performance framework: Concurrency, Async, Scale, High-Performance Coding, Observability, SQL — with enforceable rules, anti-patterns, and code review checklist |

### Rules

| Rule | Source | Purpose |
|------|--------|---------|
| `dpe-conventions.md` | Workspace | GraphQL, calculators, caching, security, testing, Docker, branch naming, PR conventions |
| `performance-guide-implementation.md` | Workspace | Validates code against Performance Engineering Guide during implementation — presents BEFORE/AFTER suggestions |
| `performance-guide-pr-review.md` | Workspace | Structured PR review against all 6 performance dimensions — 🔴 Must Fix / 🟡 Should Fix / 🔵 Consider |
| `performance-guide-pre-commit.md` | Workspace | Pre-commit audit against performance checklist — PASS / NEEDS ATTENTION verdict |
| `pr-description.md` | Workspace | Generates PR description from `.github/PULL_REQUEST_TEMPLATE.md` with Conventional Commits, Jira links, files changed (own code only) |
| `breaking-change-detection.md` | Workspace | Cross-service breaking change detection across 6 dimensions (GraphQL, DB, calculator, inter-service, config, deployment) with service impact matrix and deployed version review — reported as ⚠️ warnings |
| `conventional_commit` | Common | Conventional commit message format |
| `general-java-development` | Common | Java/SOLID/OWASP best practices |
| `general-sql-database` | Common | SQL best practices |
| `general-docker` | Common | Docker best practices |
| `general-aws` | Common | AWS best practices |
| `general-performance-optimization` | Common | General performance patterns |
| `general-testing-strategies` | Common | Testing strategies |

### Agent Overrides

| Agent | Override | What's different |
|-------|---------|-----------------|
| `code_review_agent` | `profiles/dev-core/` | DPE-specific checks (calculator statelessness, DataContract accuracy, cache invalidation, GraphQL backward compat, Impact Analysis bugs, config naming). Loads `performance_engineering_guide.md`. Runs breaking change detection (⚠️ warnings) with cross-service impact matrix. Mandatory BEFORE/AFTER code blocks for every finding. Generates compact GitHub review comment summary. Generates PR description on approve (own code only, skipped for others' PRs). English output. |

### Service Banks

| Service | Path | Content |
|---------|------|---------|
| DPE Calculator | `shared/services/dpe-calculator/` | API contracts (GraphQL, constraints, OAuth2 scopes), architecture (calculator strategy pattern, DataContract mapping, data loading modes, pipeline) |
| DPE DataService | `shared/services/dpe-dataservice/` | API contracts (GraphQL operations, config toggles), architecture (key tables, schema versions, change set lifecycle) |
| DPE Impact Analysis | `shared/services/dpe-impact-analysis/` | Architecture (Step Function flow, 4 Lambda functions, trigger paths, config toggles, known issues with severity) |

## Profiles

| Profile | Agents | Focus |
|---------|--------|-------|
| `dev-core` | 16+ | Code review (DPE-customized), architecture, security, PRs, planning |
| `ba` | 7 | Requirements, scope, stories, estimation, PRDs |
| `qa` | 11 | Test planning, automation, defect analysis, coverage |
| `ops` | 8 | Deployments, infra, log analysis, releases |
| `pm` | 6 | Sprints, standups, retros, delivery reports |

## Jira & Wiki

- **Jira**: `PPODPE-` — https://myjira.disney.com/projects/PPODPE
- **Wiki**: MyWiki space `DPE` — use `@mywiki/*` tools, not `@confluence/*`
- **GitHub**: `WDPR-SPS` on github.disney.com
