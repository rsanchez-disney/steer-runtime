# Runbook — WDPR Ant-Man Hydra Pipeline

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-hydra-pipeline-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-hydra-pipeline-lambda |
| prod-stage | 716715798470 | wdpr-content-S01431-usw2-prd-stg-hydra-pipeline-lambda |
| prod-latest | 539934483486 | wdpr-content-S01431-usw2-prd-lst-hydra-pipeline-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-hydra-pipeline-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-hydra-pipeline-lambda |

## Deployment

**No CI/CD pipeline exists.** This is a one-time deployment (confirmed by Chandra Achanta). Any changes require manual deployment.

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Hydra API Gateway | Platform Engineering | Gateway errors |
| S3 | Platform Engineering | S3 access issues |
| Chandra Achanta | Ant-Man Dev | Deployment/code changes needed |
