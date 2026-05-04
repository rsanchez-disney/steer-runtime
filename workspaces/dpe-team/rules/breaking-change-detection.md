# DPE Breaking Change Detection

When implementing, reviewing, or approving any code change, check for breaking changes across all dimensions below. A breaking change is any modification that causes existing consumers, services, or deployments to fail without a coordinated update.

**Severity: All breaking change findings are ⚠️ WARNING, not blockers.** They flag risk and require the author to confirm awareness and document a migration plan — they do not block the PR.

## When This Rule Activates

- Any code review (PR or pre-commit)
- Any implementation that modifies APIs, schemas, calculators, configs, or inter-service contracts
- Any refactoring that changes public interfaces

## Cross-Service Dependency Map

Changes in one service can break others. Use this matrix to identify who is affected:

```
Admin UI ──Feign──► DataService ──GraphQL──► MySQL (dpe schema)
Admin UI ──Feign──► Calculator Service ──GraphQL──► MySQL + Redis + DynamoDB
DataService ──REST──► Cache Service ──REST──► Redis
DataService ──REST──► Impact Analysis Lambda ──S3──► PreCalculation Lambda
                                                  ──S3──► CacheEviction Lambda
                                                  ──S3──► SendNotifications Lambda
Impact Analysis ──HTTP──► Calculator Service (PreCalculation)
Impact Analysis ──HTTP──► Cache Service (CacheEviction)
Impact Analysis ──HTTP──► Event Manager (SendNotifications)
Price Factor Change Broker ──HTTP──► Calculator Service (cache actuator)
Price Factor Change Broker ──DB──► impact_job_history
```

### Service Impact Matrix

When you change **this service**, check impact on **these consumers**:

| Changed Service | Consumers That May Break |
|----------------|--------------------------|
| **Calculator Service** (GraphQL response, scopes, cache keys) | Admin UI (Feign clients), Impact Analysis (PreCalculation Lambda), Cache Service (key patterns) |
| **DataService** (GraphQL response, mutations, triggers) | Admin UI (Feign clients), Calculator Service (data queries), Impact Analysis (trigger), Cache Service (invalidation) |
| **Cache Service** (REST API, cache key format) | DataService (invalidation calls), Impact Analysis (CacheEviction Lambda), Calculator Service (cache reads) |
| **Impact Analysis** (S3 file format, Step Function, Lambda contracts) | PreCalculation Lambda, CacheEviction Lambda, SendNotifications Lambda, Event Manager subscribers |
| **Admin UI** (Feign client DTOs, auth config) | No downstream — but must match DataService + Calculator Service response shapes |
| **Database schema** (columns, tables, constraints) | DataService, Calculator Service (both validate schema version on startup) |

### Validation: What to Check Per Service

#### Calculator Service changes → validate against:
- [ ] Admin UI Feign client DTOs still match the GraphQL response
- [ ] Impact Analysis PreCalculation Lambda can still parse pricing responses
- [ ] Cache key format is still compatible with Cache Service and existing Redis entries
- [ ] `required-schema-version` in `application.yml` matches what DataService expects

#### DataService changes → validate against:
- [ ] Admin UI Feign client DTOs still match the GraphQL response
- [ ] Calculator Service queries still resolve (if DataService schema changed)
- [ ] Impact Analysis trigger endpoint contract unchanged
- [ ] Cache invalidation REST calls still accepted by Cache Service
- [ ] `required-schema-version` in `application.yml` — if bumped, Calculator must also support it

#### Cache Service changes → validate against:
- [ ] DataService invalidation calls still work (REST contract)
- [ ] Impact Analysis CacheEviction Lambda still works (REST contract)
- [ ] Calculator Service cache reads still work (key format, Redis data structure)

#### Impact Analysis changes → validate against:
- [ ] S3 file format readable by PreCalculation, CacheEviction, SendNotifications Lambdas
- [ ] Step Function ASL still valid (state names, input/output paths)
- [ ] Event Manager notification payload still parseable by downstream subscribers

#### Admin UI changes → validate against:
- [ ] Feign client DTOs match current DataService GraphQL response
- [ ] Feign client DTOs match current Calculator Service GraphQL response
- [ ] OAuth2 scopes match what services expect

## Deployed Version Review

When a breaking change is detected, check what versions are currently deployed to determine rollout risk.

The agent **cannot query AWS directly**. Use Splunk queries against `wdpr_dpe` / `wdpr-packaging` to extract deployed versions from CloudWatch logs.

### Splunk Queries for Deployed Versions

**ECS services — extract Docker image tag (build number) from container logs:**

```spl
index=wdpr_dpe OR index=wdpr-packaging
  (source="*dpe-svc*" OR source="*datasvc*" OR source="*admin-ui*" OR source="*cache-service*" OR source="*calcsvc*" OR source="*currsvc*" OR source="*promotion*")
  ("Started" OR "JVM running" OR "Tomcat initialized")
| rex field=source "(?<site>wdw|dlr|dlp|wdpr)-"
| rex field=source "-(?<env>latest2?|stage2?|load|prod)-"
| rex field=source ":(?<service>[^/]+)/"
| head 1
| table _time, site, env, service, source
| sort site, env
```

**ECS services — version from container image in ECS task metadata (if logged):**

```spl
index=wdpr_dpe OR index=wdpr-packaging
  source="*dpe-svc*" OR source="*datasvc*" OR source="*admin-ui*" OR source="*cache-service*"
| rex field=source ":(?<service_name>[^/]+)/(?<container>[^/]+)/"
| dedup service_name, source
| table _time, service_name, source
| sort -_time
```

**Lambda functions — version from environment variable in startup logs:**

```spl
index=wdpr_dpe
  source="*dpeimpals*" OR source="*dpe_adpt*" OR source="*product-adapter*"
  ("REQUEST:" OR "INIT_START" OR "Version")
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| head 1
| table _time, site, env, source
```

> **Tip:** The `source` field in Splunk contains the CloudWatch log group name, which encodes the site, environment, and service name. See `splunk_queries.md` for the full source→environment mapping table.

### Alternative: dpe-admin-tools Scripts

If you have AWS credentials active, the `dpe-admin-tools` scripts query ECS/Lambda directly:

```bash
cd dpe-admin-tools

# ECS service version (Docker image tag = Harness build number)
python3 aws/get_version.py --app calculation-service --env latest --site wdw --region us-east-1

# Lambda version (VERSION_KEY env var)
python3 aws/get_lambda_version.py --app impact-analysis --env latest --site wdw --region us-east-1

# All services at once (HTML report)
python3 aws/get_version_all_html.py
```

> **Prerequisites:** `awsmyid` for the target account profile (`wdpr-packaging-dev`, `wdpr-packaging-test`, `wdpr-packaging-prod`).

### What the Version Tells You

- **ECS**: Docker image tag = Harness build number (e.g., `153.0.0.0`)
- **Lambda**: `VERSION_KEY` environment variable = deployment version
- Compare the build number in the PR branch against what's deployed to determine if consumers are ahead or behind

### Version Compatibility Questions

For every breaking change, the developer should answer:

- What version of the **producer** introduces the change?
- What is the **minimum version** of each consumer that supports the new contract?
- Are all consumers already at or above that minimum version in **all environments** (latest, stage, prod × WDW, DLR, DLP)?
- If not, what is the **deployment order** to avoid downtime?

## Breaking Change Dimensions

### 1. GraphQL Schema

| Change | Breaking? | Rule |
|--------|-----------|------|
| Remove a field from a type | ⚠️ Yes | Consumers querying that field will get errors |
| Rename a field | ⚠️ Yes | Same as removal for existing queries |
| Change a field's type | ⚠️ Yes | Consumers expecting the old type will break |
| Make a nullable field non-null | ⚠️ Yes | Consumers not providing the field will fail |
| Remove a query or mutation | ⚠️ Yes | Consumers calling it will get errors |
| Add a required argument to an existing query/mutation | ⚠️ Yes | Existing calls without the argument will fail |
| Add a new optional field | ✅ No | Existing queries ignore unknown fields |
| Add a new query/mutation | ✅ No | No existing consumer calls it |
| Add an optional argument with a default | ✅ No | Existing calls still work |
| Deprecate a field (keep it working) | ✅ No | Consumers still work, just warned |

**How to check:** Diff `src/main/resources/graphql/*.graphqls` — any removed or renamed field/type/argument is breaking.

### 2. Database Schema

| Change | Breaking? | Rule |
|--------|-----------|------|
| Remove a column | ⚠️ Yes | Queries referencing it will fail |
| Rename a column | ⚠️ Yes | Same as removal |
| Change a column type | ⚠️ Yes | Existing data may not fit, queries may fail |
| Add a NOT NULL column without a default | ⚠️ Yes | Existing INSERTs without the column will fail |
| Drop a table | ⚠️ Yes | All queries against it fail |
| Bump required schema version | ⚠️ Coordinated | All services validating that version must be deployed together |
| Add a nullable column | ✅ No | Existing queries ignore it |
| Add an index | ✅ No | Only affects performance, not correctness |
| Add a table | ✅ No | No existing query references it |

**How to check:** Look for SQL migration scripts, changes to `required-schema-version` in `application.yml`, and any DDL in the diff. Calculator requires schema v3.6+, DataService requires v2.5+.

### 3. Calculator System

| Change | Breaking? | Rule |
|--------|-----------|------|
| Change a calculator's DataContract | ⚠️ Yes | Batch data loading will fetch wrong data, producing incorrect prices |
| Change adjustment timing (before/after averaging or replication) | ⚠️ Yes | Prices will change for all products using that calculator |
| Remove or rename a calculator class | ⚠️ Yes | Products assigned to it will fail at runtime |
| Change depth-first processing order | ⚠️ Yes | Bundle prices will be wrong if children aren't calculated first |
| Add state to a calculator (instance fields) | ⚠️ Yes | Race conditions under concurrent requests |
| Change RateResolutionConfig behavior | ⚠️ Coordinated | All products using that config will get different rates |
| Add a new calculator | ✅ No | No existing product uses it |
| Add a new DataContract type | ✅ No | No existing calculator references it |

**How to check:** Any change in `calculator/impl/`, `calculator/BaseCalculator.java`, `DataContract` classes, or `ProductAssemblyServiceImpl`.

### 4. Inter-Service Contracts

| Change | Breaking? | Rule |
|--------|-----------|------|
| Change Calculator Service GraphQL response shape | ⚠️ Yes | Admin UI, Cache Service, Impact Analysis all parse it |
| Change DataService GraphQL response shape | ⚠️ Yes | Calculator Service and Admin UI parse it |
| Change Cache Service REST API contract | ⚠️ Yes | DataService and Impact Analysis call it |
| Change Impact Analysis S3 file format | ⚠️ Yes | PreCalculation, CacheEviction, SendNotifications all read it |
| Change Event Manager notification payload | ⚠️ Yes | Downstream subscribers parse it |
| Change OAuth2 scope names | ⚠️ Yes | All services validating that scope will reject requests |

**How to check:** Any change to response DTOs, GraphQL resolvers, REST controllers, S3 writers/readers, or `application.yml` scope definitions.

### 5. Configuration

| Change | Breaking? | Rule |
|--------|-----------|------|
| Rename a config property | ⚠️ Yes | Existing `application.yml` in all environments will use the old name |
| Remove a config property | ⚠️ Yes | Services referencing it will fail or use unexpected defaults |
| Change a default value | ⚠️ Coordinated | Behavior changes silently in all environments |
| Change a feature toggle name | ⚠️ Yes | Existing environment configs reference the old name |
| Add a new optional property with a safe default | ✅ No | Existing configs don't set it, default applies |

**How to check:** Any change to `application*.yml`, `application*.properties`, or classes reading `@Value`/`@ConfigurationProperties`. Follow the kind-first naming convention (`flag.`, `config.`, `external.`, etc.).

### 6. Deployment & Infrastructure

| Change | Breaking? | Rule |
|--------|-----------|------|
| Change ECS service name | ⚠️ Yes | Harness pipelines, Splunk queries, and monitoring reference it |
| Change health check endpoint path | ⚠️ Yes | ALB health checks will fail, service marked unhealthy |
| Change Docker base image or UID/GID | ⚠️ Coordinated | ECS task definitions may need updating |
| Change Harness pipeline structure | ⚠️ Coordinated | Deployment automation may break |
| Add a new environment variable requirement | ⚠️ Coordinated | Must be set in all environments before deploy |

**How to check:** Any change to `Dockerfile`, `.harness/`, `docker-compose*.yml`, or actuator endpoint paths.

### 7. Environment Variables & Configuration Requirements

New environment variables or config properties that must exist before deployment.

#### Detection Patterns

Scan the diff for patterns that introduce **new** external dependencies:

**Java / Spring Boot:**

| Pattern | Breaking? | Rule |
|---------|-----------|------|
| New `@Value("${...}")` without default | ⚠️ Coordinated | App fails to start if property is missing |
| New `@Value("${...:default}")` with default | ✅ No | Falls back to default safely |
| New `System.getenv("...")` | ⚠️ Coordinated | Needs ECS task definition update in all environments |
| New `@ConfigurationProperties` prefix | ⚠️ Coordinated | Needs `application.yml` entries in all environments |
| New required key in `application*.yml` (no default) | ⚠️ Coordinated | Service won't start without it |
| New `@ConditionalOnProperty` | ⚠️ Coordinated | Feature silently disabled if property missing |
| New SSM Parameter Store / Secrets Manager reference | ⚠️ Coordinated | Parameter must exist in all AWS accounts before deploy |

**Node.js / TypeScript:**

| Pattern | Breaking? | Rule |
|---------|-----------|------|
| New `process.env.VAR` without fallback | ⚠️ Coordinated | Undefined at runtime if not set |
| New `process.env.VAR \|\| default` with fallback | ✅ No | Falls back safely |
| New required key in config module | ⚠️ Coordinated | App fails or misbehaves without it |

**Infrastructure / Deployment:**

| Pattern | Breaking? | Rule |
|---------|-----------|------|
| New `ENV` or `ARG` in `Dockerfile` | ⚠️ Coordinated | Build or runtime fails if not provided |
| New `environment:` entry in `docker-compose*.yml` | ⚠️ Coordinated | Local dev breaks without it |
| New variable in `.harness/` pipeline YAML | ⚠️ Coordinated | Deployment fails if variable not configured in Harness |
| New Lambda environment variable | ⚠️ Coordinated | Lambda config must be updated in all accounts (dev/test/prod) |

**How to check:** Diff all `@Value` annotations, `System.getenv()` calls, `process.env` references, `application*.yml` keys, `Dockerfile` ENV/ARG, `.harness/` variables, and Lambda configuration. Cross-reference against existing environment configs to confirm the variable already exists or is new.

#### Environment Scope

New variables must be set across **all** deployment targets:

| Scope | Environments |
|-------|-------------|
| ECS services | latest, latest2, stage, stage2, load, prod × WDW, DLR, DLP |
| Lambda functions | latest, stage, prod × WDW, DLR, DLP |
| Local dev | `docker-compose.yml`, `.env.example` |
| CI/CD | Harness pipeline variables, GitHub Actions secrets |


## Output Format

For every breaking change found, report as **⚠️ WARNING** (not blocker):

```
### ⚠️ Breaking Change Warning

**File:** `path/to/file` line N
**Dimension:** GraphQL Schema / Database / Calculator / Inter-Service / Configuration / Deployment / Environment Variables
**What changed:** <description>
**Affected services:** <list from the Service Impact Matrix>
**Currently deployed versions:** <what's live in latest/stage/prod per site, if known>
**Deployment order:** <which service must deploy first>
**Migration required:** <what must happen before or alongside this deploy>

Before:
```<language>
<current code>
```

After:
```<language>
<proposed code>
```
```

## Deployment Checklist

If breaking changes are found, the PR description should include:

- [ ] All affected services identified (use Service Impact Matrix)
- [ ] Deployed versions checked — consumers are compatible or will be deployed first
- [ ] Deployment order documented (which service deploys first?)
- [ ] Rollback plan documented
- [ ] Schema migration tested in latest/latest2 before stage
- [ ] Feature toggle available to disable the change if needed
- [ ] Downstream consumers notified (if external)
- [ ] New environment variables added to all environment configs (ECS task defs / Lambda config / Harness)
- [ ] New variables have safe defaults OR deploy is coordinated with config update
- [ ] Secret values stored in SSM/Secrets Manager, not in code or plain-text config
- [ ] `.env.example` and service README updated with new variable documentation

## Language

Always write breaking change analysis in English.
