# Runbook — WDPR Shuri Incognito SNS Messenger

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **Note:** No AWS CloudWatch log stream exists for this Lambda
- **API Gateway Console:** https://us-west-2.console.aws.amazon.com/apigateway/main/apis/jbrwuadrpj/resources?api=jbrwuadrpj&region=us-west-2

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-shuri-incognito-lambda |
| load | 716715798470 | wdpr-content-S01431-usw2-lod-shuri-incognito-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-shuri-incognito-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-shuri-incognito-lambda |

## Deployment

- **Harness Pipeline:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDW_Shuri_Aulani_SNS_Messenger/pipelines

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| API Gateway | Platform Engineering | Gateway errors, auth issues |
| SNS Topics | Platform Engineering | SNS publish failures, permissions |
| Downstream SQS/Lambda | Ant-Man Sustainment | Subscriber not processing messages |
