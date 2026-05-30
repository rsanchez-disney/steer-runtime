# Runbook — WDPR Shuri Lambda DLR Guest Entry

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-dlr-guest-entry-svc
- **API Gateway Console:** https://us-west-2.console.aws.amazon.com/apigateway/main/apis/basyohxxv4/resources?api=basyohxxv4&region=us-west-2

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-dlr-guest-entry-svc |
| load | 716715798470 | wdpr-content-S01431-usw2-lod-dlr-guest-entry-svc |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-dlr-guest-entry-svc |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-dlr-guest-entry-svc |

## Deployment

- **Jenkins Pipeline:** https://gam.cicd.wdprapps.disney.com/job/guest-entry-lambda/
- **Deploy Job:** https://gam.cicd.wdprapps.disney.com/job/guest-entry-lambda/view/Deploy/job/guest-entry-lambda-aws-lambda-live/

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| API Gateway | Platform Engineering | Gateway errors, routing issues |
| S3 | Platform Engineering | S3 access issues |
| DLR Guest Entry consumers | Ant-Man Sustainment | Downstream issues |
