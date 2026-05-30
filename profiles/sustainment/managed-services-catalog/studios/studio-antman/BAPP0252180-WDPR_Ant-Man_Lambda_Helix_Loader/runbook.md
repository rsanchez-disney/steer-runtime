# Runbook — WDPR Ant-Man Lambda Helix Loader

## Monitoring

- **Grafana Lambda Dashboard:** https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas?orgId=1
- **CloudWatch Logs (prod):** /aws/lambda/wdpr-content-S01431-usw2-prd-d-scribe-to-helix-lambda
- **Splunk (prod):** `index=wdpr_d-scribe source="*usw2-prd-d-scribe-to-helix-lambda*"`

## Lambda Functions

| Environment | Account | Function Name |
|-------------|---------|---------------|
| prod | 211570175858 | wdpr-content-S01431-usw2-prd-d-scribe-to-helix-lambda |
| load | 716715798470 | wdpr-content-S01431-usw2-lod-d-scribe-to-helix-lambda |
| stage | 716715798470 | wdpr-content-S01431-usw2-stg-d-scribe-to-helix-lambda |
| latest | 539934483486 | wdpr-content-S01431-usw2-lst-d-scribe-to-helix-lambda |

## Manual Populate via GCx Tools API

```
GET https://gcx-tools-api.wdprapps.disney.com/helixloader/populate?HelixLoaderLambda={ARN}&HelixLambda={ARN}&ContentType={CT}&EnterpriseId={EID}
```

## Deployment

- **Jenkins Pipeline:** https://gam.cicd.wdprapps.disney.com/job/ant-man-lambda-helix-loader/view/all/
- **Deploy Job:** https://gam.cicd.wdprapps.disney.com/job/ant-man-lambda-helix-loader/view/Deploy/job/ant-man-lambda-helix-loader-aws-lambda-live/

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Filter Lambda | Ant-Man Sustainment | Trigger not firing |
| GCx Tools API Gateway | Ant-Man Sustainment | Manual populate issues |
| Helix (downstream) | Ant-Man Sustainment | Content not appearing in Helix |
| S3 | Platform Engineering | S3 access issues |
