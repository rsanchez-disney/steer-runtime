# Arrival Windows UI — Runbook

## Overview

The Arrival Windows UI (AWUI) is an internal admin tool for managing restaurant time-slot scheduling for Mobile Ordering at Disney Parks (WDW and DLR). It uses a serverless architecture: Flutter SPA → Node.js Lambda BFF → Backend Batch Service, with infrastructure managed by Terraform.

**Business Applications:**
- DLR Mobile Ordering Arrival Windows — BAPP0090180
- WDW Mobile Ordering Arrival Windows — BAPP0199664

**Team:** Studio Lumière (app-global-fnb) | Support: Studio Kronk

---

## System Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│   arrwui-spa     │     │  API Gateway     │     │   arrwui-lambda          │
│   (Flutter Web)  │────▶│  /api/*          │────▶│   (Node.js 20 Lambda)    │
│   Hosted on S3   │     │  Custom Domain   │     │   4 functions            │
└──────────────────┘     └──────────────────┘     └───────────┬──────────────┘
                                                              │
                         ┌────────────────────────────────────┼───────────────┐
                         ▼                    ▼                ▼               ▼
              ┌────────────────┐   ┌──────────────┐   ┌─────────────┐  ┌──────────┐
              │ Batch Service  │   │ AWS Secrets   │   │ AWS S3      │  │ MyID/    │
              │ (upstream API) │   │ Manager       │   │ (Reports)   │  │ AuthZ    │
              └────────────────┘   └──────────────┘   └─────────────┘  └──────────┘

Infrastructure managed by: arrwui-lambda-terraform (Terraform + WDW-SRE modules)
```

---

## Project Structure

### 1. arrwui-spa (Flutter/Dart SPA)

**Repo:** https://gitlab.disney.com/cgs-wdw/arrwui/arrwui-spa

```
arrwui-spa/
├── spa/
│   ├── lib/
│   │   ├── core/           # Router, providers, auth, theme, services
│   │   ├── data/           # API interfaces + data source implementations
│   │   ├── domain/         # Models, repositories, domain providers
│   │   ├── presentation/   # Screens, widgets (Atomic Design)
│   │   └── utils/          # Constants, extensions, enums
│   ├── test/               # Unit + widget tests (mocktail)
│   ├── web/                # index.html, manifest.json
│   └── pubspec.yaml        # Dependencies
├── ci/validate_flutter.yml # CI validation (format, analyze, test)
└── .gitlab-ci.yml          # WDW-SRE shared SPA pipeline v3
```

**Stack:** Dart SDK >=3.2.0, Flutter Web, Riverpod, go_router, reactive_forms, MyID auth (Solo+ACME)

### 2. arrwui-lambda (Node.js Lambda BFF)

**Repo:** https://gitlab.disney.com/cgs-wdw/arrwui/arrwui-lambda

```
arrwui-lambda/
├── lambdas/
│   ├── lib/                # Shared library (copied into each lambda at build)
│   │   ├── configs.ts, auth-token-helper.ts, myid-token-validator.ts
│   │   ├── handler-wrapper.ts, request-executor.ts, secrets-manager.ts
│   │   ├── config-manager-helper.ts, logger.ts, utils.ts
│   ├── healthcheck/        # GET /api/healthcheck (no auth)
│   ├── config/             # GET /api/config (no auth, returns SPA config)
│   ├── batch/              # /api/batch/{entity}/{id}/{action} (auth required)
│   ├── reports/            # POST /api/reports (auth, CSV → S3 → presigned URL)
│   ├── server.js           # Express local dev server (port 3003)
│   ├── build-local.sh / run-local.sh / clean-local.sh
│   └── package.json
├── environment/
│   ├── us-east-1/          # WDW configs (dev, latest, load, stage, prod)
│   └── us-west-2/          # DLR configs (latest, load, stage, prod)
└── .gitlab-ci.yml          # WDW-SRE shared lambda-v3.5.x pipeline
```

**Stack:** TypeScript 5.x, Node.js 20, AWS SDK v3, Axios, jwt-decode

### 3. arrwui-lambda-terraform (Infrastructure)

**Repo:** GitLab (same arrwui group)

```
arrwui-lambda-terraform/
├── terraform.tf            # Backend (Azure Blob), providers, variable declarations
├── lambda.tf               # Lambda functions (via SRE module)
├── api-gateway.tf          # API Gateway + Lambda permissions
├── apig-custom-domain.tf   # Custom domains + Route53 DNS
├── iam.tf                  # IAM roles for lambda/kinesis
├── lambda-triggers.tf      # Event source mappings
├── secrets.tf              # Secrets Manager provisioning
├── splunk-integration.tf   # Kinesis log streams → Splunk
├── protected-content/      # Git submodule (SRE shared code)
└── .gitlab-ci.yml          # WDW-SRE terraform lambda-v4.0.x pipeline
```

**Pattern:** All modules remote from `wdw-sre/terraform-modules/aws/`. No local `.tfvars` — all variables pipeline-injected.

---

## How SPA → Lambda → Terraform Work Together

### Request Flow

```
1. User opens https://{env}.{park}arrw-ui.wdprapps.disney.com
2. Browser loads Flutter SPA from S3 bucket
3. SPA calls GET /api/config → Config Lambda → returns auth URLs, API base URL, destination
4. User authenticates via MyID (Solo or ACME flow)
5. SPA makes API calls to /api/batch/{entity} with JWT token
6. API Gateway routes to Batch Lambda
7. withMyIdAuth() validates JWT (ACME introspection or SOLO expiry check)
8. Batch Lambda proxies request to upstream Batch Service (with OAuth2 service token)
9. Response flows back to SPA
```

### Deployment Artifact Flow

```
arrwui-lambda repo        arrwui-lambda-terraform repo
      │                              │
      ▼                              ▼
GitLab CI builds          GitLab CI runs terraform apply
TypeScript → ZIP               │
      │                        │
      ▼                        ▼
Uploads to S3:            References S3 artifact:
{lambda_s3_path}/         lambda_s3_path + release_version
{release_version}/        → Updates Lambda function code
*.zip
```

### Infrastructure Dependencies

| Terraform Resource | Used By |
|-------------------|---------|
| Lambda functions | arrwui-lambda code (healthcheck, config, batch, reports) |
| API Gateway | Routes /api/* to Lambda functions |
| Custom Domain + Route53 | Public URLs (*.wdprapps.disney.com) |
| S3 (SPA bucket) | Hosts arrwui-spa built Flutter app |
| S3 (Lambda bucket) | Stores Lambda deployment ZIPs |
| S3 (Reports bucket) | CSV report storage with presigned URLs |
| Secrets Manager | Client secrets, JWT secrets for Lambda |
| IAM Roles | Lambda execution + S3/Secrets access |
| Kinesis + Splunk | Log shipping for observability |

---

## Deployment

### Environments & Regions

| Park | Region | Latest | Stage | Load | Prod |
|------|--------|--------|-------|------|------|
| WDW | us-east-1 | ✓ | ✓ | ✓ | ✓ |
| DLR | us-west-2 | ✓ | ✓ | ✓ | ✓ |

### SPA URLs

| Park | Env | URL |
|------|-----|-----|
| WDW | Latest | https://latest.wdwarrw-ui.wdprapps.disney.com |
| WDW | Stage | https://stage.wdwarrw-ui.wdprapps.disney.com |
| WDW | Prod | https://wdwarrw-ui.wdprapps.disney.com |
| DLR | Latest | https://latest.dlrarrw-ui.wdprapps.disney.com |
| DLR | Stage | https://stage.dlrarrw-ui.wdprapps.disney.com |
| DLR | Prod | https://dlrarrw-ui.wdprapps.disney.com |

### S3 Buckets

| Type | Pattern | Example |
|------|---------|---------|
| SPA | `cgssre-wdpr-revmgmt-{env}-{region}-spa` (prefix: `arrwui/`) | cgssre-wdpr-revmgmt-dev-use1-spa |
| Lambda | `cgssre-wdpr-revmgmt-{env}-{region}-lambda` (prefix: `arrwui/`) | cgssre-wdpr-revmgmt-prod-use1-lambda |

### API Gateway Names

Pattern: `arrwui-{region_short}-{env_short}-arrwui-api`

| Park | Env | API Name | AWS Role |
|------|-----|----------|----------|
| WDW | Latest | arrwui-use1-lst-arrwui-api | wdpr-revmgmt-dev |
| WDW | Stage | arrwui-use1-stg-arrwui-api | wdpr-revmgmt-test |
| WDW | Prod | arrwui-use1-prd-arrwui-api | wdpr-revmgmt-prod |
| DLR | Latest | arrwui-usw2-lst-arrwui-api | wdpr-revmgmt-dev |
| DLR | Stage | arrwui-usw2-stg-arrwui-api | wdpr-revmgmt-test |
| DLR | Prod | arrwui-usw2-prd-arrwui-api | wdpr-revmgm-prod |

### CI/CD Pipelines

| Project | Pipeline Template | Branch |
|---------|------------------|--------|
| arrwui-spa | WDW-SRE `spa/base/.gitlab-ci.yml` | multiple-tech-support |
| arrwui-lambda | WDW-SRE `lambda/base/.gitlab-ci.yml` | lambda-v3.5.x |
| arrwui-lambda-terraform | WDW-SRE `lambda/base/multicode/.gitlab-ci.yml` | lambda-v4.0.x |

### Deployment Process

1. **SPA**: Push to main → CI builds Flutter web → uploads to S3 SPA bucket
2. **Lambda**: Push to main → CI builds TypeScript → zips each function → uploads to S3 Lambda bucket
3. **Terraform**: Triggered after Lambda deploy → runs `terraform apply` with pipeline-injected vars → updates Lambda function code references + infrastructure

---

## Debugging & Troubleshooting

### Local Development Setup

**Prerequisites:**
- Flutter 3.32.0+
- Node.js 18.7.0+
- Nodemon 2.0.21+
- VPN or DGN (required for gitlab.disney.com, github.disney.com, and backend services)
- Valid Dispub token (for Flutter packages)

**Run Lambda locally:**
```bash
cd lambdas
npm install
./build-local.sh
./run-local.sh --env dev --region us-east-1
# Runs on http://localhost:3003/api/
```

**Run SPA locally:**
```bash
cd spa
flutter pub get
flutter run -d chrome --web-port=5050 --dart-define localEnvironment=true
```

> Lambda MUST be running locally (port 3003) for the SPA to function in dev mode.

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| SPA blank page after deploy | S3 upload missed index.html or routing issue | Verify S3 bucket contents have `arrwui/` prefix, check CloudFront cache |
| 401 Unauthorized on API calls | JWT expired or invalid | Check MyID token expiry, verify ACME endpoint is reachable |
| `flutter pub get` fails | Invalid/expired Dispub token | Regenerate token at dispub.latest.disney.io |
| Lambda timeout | Upstream batch service slow/down | Check batch service health, increase Lambda timeout if needed |
| CORS errors in browser | API Gateway CORS config mismatch | Verify CORS headers in API Gateway and Lambda response |
| Config endpoint returns wrong URLs | Wrong environment file loaded | Verify `VARIABLE1` env var matches expected environment |
| Reports download fails | S3 presigned URL expired (60s) | Retry download, check S3 bucket permissions |
| Auth loop (Solo) | Token in URL fragment not parsed | Ensure PathUrlStrategy vs HashUrlStrategy matches auth mode |

### Health Check

```bash
# Verify Lambda is running
curl https://{env}.{park}arrw-ui.wdprapps.disney.com/api/healthcheck
# Expected: {"status":"UP","version":"--"}

# Verify config endpoint
curl https://{env}.{park}arrw-ui.wdprapps.disney.com/api/config
# Returns: lambdaApiUrl, destination, auth endpoints
```

### Authentication Debugging

1. **ACME flow** (current): Validates JWT via MyID introspection endpoint (`AUTH_MYID_TOKEN_VALIDATION_ENDPOINT`)
2. **SOLO flow** (deprecated): Only checks token presence + expiry (no server-side validation)
3. Toggle controlled by `AUTH_MYID_ACME_ENABLED` env var

**Token headers expected:**
- `jwt-access-token` — Access token
- `jwt-id-token` — ID token (forwarded to upstream as `Jwt-Access-Token`)

**On 401 response:** Check `WWW-Authenticate: Bearer realm="JWT", error="...", error_description="..."` for specific failure reason.

### Logging & Observability

- **Format:** Structured JSON with `Conversation-Id`, `Level`, `Message`, `Data`
- **Shipping:** CloudWatch → Kinesis → Splunk (configured via `splunk-integration.tf`)
- **Correlation:** `x-disney-internal-commerce-conversation-id` header traces requests end-to-end
- **Sensitive data:** Automatically masked in logs by `request-executor.ts`

### AWS Access

| Environment | AWS Role |
|-------------|----------|
| Dev/Latest | wdpr-revmgmt-dev |
| Stage/Load | wdpr-revmgmt-test |
| Production | wdpr-revmgmt-prod |

### Key Environment Variables (Lambda)

| Variable | Purpose |
|----------|---------|
| `API_URL` | Backend batch service endpoint |
| `AUTH_URL` | AuthZ service for OAuth2 client_credentials |
| `AUTH_MYID_ACME_ENABLED` | Toggle ACME vs SOLO validation |
| `AWS_SECRETS_MANAGER_KEY` | Path to secrets in AWS SM |
| `DESTINATION` | Park identifier (WDW/DLR) |
| `LSO_ENABLED` | Local Secrets Override (set TRUE for local dev) |

---

## RBAC (Keystone)

| Role | Location Settings | Adjustments | Schedules | Reports | Global Settings | Windows Visibility | Global Adjustments |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Admin | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| DOCC Admin | ALL | READ | — | — | ALL | — | — |
| Operator | ALL | — | — | — | — | — | — |
| DOCC | — | ALL | — | — | — | — | — |

---

## References

- **Runbook (Confluence Cloud):** https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/1108509096/Arrival+Windows+UI+-+Runbook
- **Quick Guide:** https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/1109852533
- **Design (Figma):** https://www.figma.com/design/Pb7r21uhBUsSUrEqhEUeoT/AWUI--Latest
- **SPA Repo:** https://gitlab.disney.com/cgs-wdw/arrwui/arrwui-spa
- **Lambda Repo:** https://gitlab.disney.com/cgs-wdw/arrwui/arrwui-lambda
- **SRE Lambda Docs:** https://confluence.disney.com/display/WDWSRE/Version+3
- **SRE User Guide:** https://confluence.disney.com/display/WDWSRE/User+Guide
- **Change Control:** https://confluence.disney.com/display/WDWSRE/Change+Control+Process
