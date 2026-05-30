# Runbook — WDPR Ant-Man Lambda Collector

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-collector-lambda
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-ant-man-collector-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-ant-man-collector-lambda |
| prod-stage | 716715798470 | wdpr-content-S01431-usw2-prd-stg-ant-man-collector-lambda |
| prod-load | 716715798470 | wdpr-content-S01431-usw2-prd-lod-ant-man-collector-lambda |
| prod-latest | 539934483486 | wdpr-content-S01431-usw2-prd-lst-ant-man-collector-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-ant-man-collector-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-ant-man-collector-lambda |

## Manual Trigger via GCx Tools API

```bash
POST https://gcx-tools-api.wdprapps.disney.com/process/collector
Content-Type: application/json

{
  "conversationId": "412157875FoodBeverageFacilityCombine",
  "create": ["combine/preview2/en-US/legacy/FoodBeverageFacility/412157875.json"],
  "delete": []
}
```

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Filter Lambda | Ant-Man Sustainment | Trigger not firing |
| GCx Tools API Gateway | Ant-Man Sustainment | Manual trigger issues |
| S3 | Platform Engineering | S3 write failures |
