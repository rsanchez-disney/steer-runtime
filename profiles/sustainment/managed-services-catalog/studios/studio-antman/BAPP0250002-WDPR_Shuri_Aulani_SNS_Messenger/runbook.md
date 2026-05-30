# Runbook — WDPR Shuri Aulani SNS Messenger

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** prd-shuri-aulani-lambda-logs

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | prd-shuri-aulani-lambda |
| load | 716715798470 | lod-shuri-aulani-lambda |
| stage | 716715798470 | stg-shuri-aulani-lambda |
| latest | 539934483486 | lst-shuri-aulani-lambda |

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Hulkling API Gateway | Ant-Man Sustainment | Gateway trigger issues |
| SNS Topics | Platform Engineering | SNS publish failures, permissions |
| Downstream SQS/Lambda | Ant-Man Sustainment | Subscriber not processing messages |
