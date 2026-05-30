# Runbook — WDPR Ant-Man Lambda Schedules Korvac

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S0001431-usw2-prd-korvac-scheduler
- **CloudWatch Logs (stage):** /aws/lambda/wdpr-content-S0001431-usw2-stg-korvac-scheduler

## Lambda Functions

| Environment | Function Name |
|-------------|---------------|
| prod | wdpr-content-S0001431-usw2-prd-korvac-scheduler |
| prod-stage | wdpr-content-S0001431-usw2-stg-korvac-scheduler |

## EventBridge Rules (Triggers)

| Environment | Rule Name |
|-------------|-----------|
| prod | wdpr-content-S0001431-usw2-prd-korvac-scheduler-mpg-currentWeek |
| prod-stage | wdpr-content-S0001431-usw2-stg-korvac-scheduler-mpg-currentWeek |

## Manual Invocation

- Use AWS Console → Lambda → Test tab to manually invoke with appropriate payload
- Or use AWS CLI: `aws lambda invoke --function-name wdpr-content-S0001431-usw2-prd-korvac-scheduler --payload '{}' response.json`

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| EventBridge / CloudWatch Events | Platform Engineering | Trigger not firing |
| S3 | Platform Engineering | S3 access issues |
| Downstream HTTP services | Ant-Man Sustainment | HTTP call failures |
