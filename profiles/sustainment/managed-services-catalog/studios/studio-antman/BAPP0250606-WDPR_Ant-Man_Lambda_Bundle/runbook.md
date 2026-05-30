# Runbook — WDPR Ant-Man Lambda Bundle

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-bundle-lambda
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-ant-man-bundle-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-ant-man-bundle-lambda |
| prod-stage | 716715798470 | wdpr-content-S01431-usw2-prd-stg-ant-man-bundle-lambda |
| prod-load | 716715798470 | wdpr-content-S01431-usw2-prd-lod-ant-man-bundle-lambda |
| prod-latest | 539934483486 | wdpr-content-S01431-usw2-prd-lst-ant-man-bundle-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-ant-man-bundle-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-ant-man-bundle-lambda |

## Manual Trigger via GCx Tools API

- Documentation: https://confluence.disney.com/display/ECM/GCX+Tools+API+Gateway

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| S3 | Platform Engineering | S3 access/write failures |
| GCx Tools API Gateway | Ant-Man Sustainment | Manual trigger issues |
| Combine Lambda (BAPP0249949) | Ant-Man Sustainment | Related architecture issues |
