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
2. If the workspace is still missing, copy it manually from the path were you have cloned this repo:
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
| `data_agent` | `profiles/dev-core/` | Manages DPE data via DataService GraphQL. Creates products, rates, commissions, bundles from Jira tickets. Enforces traceability mapping (products → ACs → tests), duplicate prevention, and date integrity rules. Reads credentials from `~/.env.dpe`. |
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

## Environment Setup (Data Agent)

### Prerequisites

- `jq` — macOS: `brew install jq` / WSL: `sudo apt install jq`
- `curl` — pre-installed on both platforms

### 1. Install Helper Scripts

```bash
mkdir -p ~/.local/bin
cp dpe-token dpe-query dpe-preflight ~/.local/bin/
chmod +x ~/.local/bin/dpe-*
```

Add to PATH (if not already):
- **macOS** (`~/.zshrc`): `export PATH="$HOME/.local/bin:$PATH"`
- **WSL** (`~/.bashrc`): `export PATH="$HOME/.local/bin:$PATH"`

### 2. Configure Credentials

```bash
touch ~/.env.dpe && chmod 600 ~/.env.dpe
```

Required variables in `~/.env.dpe`:

```bash
# OAuth2 credentials (request from DPE team)
DPE_CLIENT_ID="<your-client-id>"
DPE_CLIENT_SECRET="<your-client-secret>"

# Token endpoint (ask team lead for environment-specific URL)
DPE_TOKEN_URL="<auth-server-token-endpoint>"

# Target Data Service GraphQL endpoint (active — switch with export)
# Define per site/env: DPE_DATASVC_URL_{SITE}_{ENV}
DPE_DATASVC_URL="${DPE_DATASVC_URL_SANDBOX_LATEST}"
DPE_DATASVC_URL_SANDBOX_LATEST="<sandbox-latest-url>"
#DPE_DATASVC_URL_WDW_LATEST="<wdw-latest-url>"
#DPE_DATASVC_URL_WDW_STAGE="<wdw-stage-url>"

# OAuth2 scopes (space-separated)
DPE_SCOPE="<space-separated-scopes>"

# Active bearer token (set by `eval $(dpe-token)`)
DPE_TOKEN=""
```

### 3. Verify Setup

```bash
eval $(dpe-token)
dpe-preflight
```

### How to Invoke

```bash
kiro-cli chat --agent data_agent
```

Then: `"Create test products for PPODPE-XXXX"`

### Available Scripts

| Script | Usage | Purpose |
|---|---|---|
| `dpe-token` | `eval $(dpe-token [query\|mutation])` | Get OAuth token (~1hr expiry) |
| `dpe-query` | `dpe-query <PRODUCT_CODE>` | Extract full product tree from sandbox |
| `dpe-preflight` | `dpe-preflight` | Validate env, credentials, and token |

### Troubleshooting

| Problem | Fix |
|---|---|
| `ERROR: Set DPE_CLIENT_ID...` | Fill `~/.env.dpe` with credentials |
| `ERROR: Token request failed` | Check client_id/secret, verify client is active |
| Auth 401 on query | Token expired — `eval $(dpe-token)` |
| Auth 403 on mutation | Client missing mutation scope |
| `\r` errors in WSL | `dos2unix ~/.local/bin/dpe-*` |
| Permission denied | `chmod +x ~/.local/bin/dpe-*` |

### Platform Notes

| Concern | macOS | Windows (WSL) |
|---|---|---|
| Shell | zsh | bash |
| PATH config | `~/.zshrc` | `~/.bashrc` |
| Package manager | `brew` | `apt` |
| File permissions | Native chmod | Works in `~/`, not in `/mnt/c/` |

> **WSL:** Keep `~/.env.dpe` and scripts inside the WSL filesystem (`~/`), not on the Windows mount.
