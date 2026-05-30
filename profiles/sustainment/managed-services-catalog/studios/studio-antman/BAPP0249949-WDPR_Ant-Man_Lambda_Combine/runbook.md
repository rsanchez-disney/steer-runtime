# Runbook — WDPR Ant-Man Lambda Combine

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-combine-lambda
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-ant-man-combine-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-ant-man-combine-lambda |
| prod-stage | 716715798470 | wdpr-content-S01431-usw2-prd-stg-ant-man-combine-lambda |
| prod-load | 716715798470 | wdpr-content-S01431-usw2-prd-lod-ant-man-combine-lambda |
| prod-latest | 539934483486 | wdpr-content-S01431-usw2-prd-lst-ant-man-combine-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-ant-man-combine-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-ant-man-combine-lambda |

## Manual Trigger via GCx Tools API

```bash
POST https://gcx-tools-api.wdprapps.disney.com/process/combine
Content-Type: application/json

{
  "conversationId": "Test",
  "create": ["legacy/preview/en-US/legacy/LgcyServices/412328705.json"],
  "delete": []
}
```

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| S3 | Platform Engineering | S3 access/write failures |
| GCx Tools API Gateway | Ant-Man Sustainment | Manual trigger issues |
| Filter Lambda | Ant-Man Sustainment | Trigger chain issues |
