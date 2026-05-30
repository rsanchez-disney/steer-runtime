# Runbook — WDPR Shuri Lambda Quicksilver Aulani

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **Note:** No CloudWatch log group available. No Splunk available.

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-quicksilver-aulani-lambda |
| load | 716715798470 | wdpr-content-S01431-usw2-lod-quicksilver-aulani-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-quicksilver-aulani-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-quicksilver-aulani-lambda |

## Deployment

- **Jenkins Pipeline:** https://gam.cicd.wdprapps.disney.com/job/quicksilver-aulani-lambda/
- **Deploy Job:** https://gam.cicd.wdprapps.disney.com/job/quicksilver-aulani-lambda/view/Deploy/job/quicksilver-aulani-lambda-aws-lambda-live/

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| QuickSilver API Gateway | Ant-Man Sustainment | Gateway errors |
| S3 | Platform Engineering | S3 access issues |
