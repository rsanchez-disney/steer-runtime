---
inclusion: auto
description: Deployment pipeline conventions for adaptive payments services
---

# Deployment conventions

## Environments

| Environment | Trigger                    | Approval         | URL pattern                                    |
|-------------|----------------------------|------------------|------------------------------------------------|
| Dev/Latest  | Auto on merge to `develop` | None             | `latest.{service}.wdprapps.disney.com`         |
| Stage       | Manual via Harness         | 1 dev approval   | `stage.{service}.wdprapps.disney.com`          |
| Prod        | Manual via Harness         | 2 approvals + QA | `{service}.wdprapps.disney.com`                |

## Harness pipeline structure

1. Build artifact (Docker image tagged with commit SHA)
2. Deploy to target environment
3. Smoke test (automated health check)
4. Canary verification (prod only — 10% traffic for 10 min)
5. Full rollout

## Post-deployment verification

After every production deployment, verify:

1. Health endpoint returns 200: `GET /{service}/healthcheck`
2. Splunk error rate < 1% for 15 minutes post-deploy
3. No new P1/P2 incidents opened in ServiceNow

## Rollback criteria

Immediate rollback if any:

- Error rate > 5% within 10 minutes of deploy
- P1 incident opened with timeline matching deployment
- Health endpoint returns non-200
- Connection pool alerts triggered

## Change management

- All production deployments require a CHG ticket
- CHG must reference the Jira tickets included
- Post-deploy validation must be documented in CHG work notes
- Failed deployments: update CHG status to "Failed" with root cause

## Known risks

- Payment Service (BAPP0012692) deployments have caused 14+ incidents when connection pool config is overwritten
- Always verify connection pool settings match baseline after deploy
- Payment-controls-api (port 8625) is a SPOF — connection pool exhaustion cascades to all consumers
