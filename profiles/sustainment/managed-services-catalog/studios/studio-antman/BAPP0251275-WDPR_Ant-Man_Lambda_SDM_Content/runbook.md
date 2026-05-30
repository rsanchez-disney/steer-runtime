# Runbook — WDPR Ant-Man Lambda SDM Content

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-sdm-content-lambda
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-ant-man-sdm-content-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-ant-man-sdm-content-lambda |
| prod-stage | 716715798470 | wdpr-content-S01431-usw2-prd-stg-ant-man-sdm-content-lambda |
| prod-latest | 539934483486 | wdpr-content-S01431-usw2-prd-lst-ant-man-sdm-content-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-ant-man-sdm-content-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-ant-man-sdm-content-lambda |

## Manual Trigger via GCx Tools API

- ScheduleUpdate and PublishNotification can be manually triggered
- Documentation: https://confluence.disney.com/display/ECM/GCX+Tools+API+Gateway

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Filter Lambda | Ant-Man Sustainment | Trigger not firing |
| GCx Tools API Gateway | Ant-Man Sustainment | Manual trigger issues |
| S3 | Platform Engineering | S3 write failures |
