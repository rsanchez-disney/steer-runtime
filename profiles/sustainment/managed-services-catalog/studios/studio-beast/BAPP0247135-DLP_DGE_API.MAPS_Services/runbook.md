# Runbook — DLP DGE API.MAPS Services

## Restart Procedures

### ECS Service

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-S0001481-euw1-prd`
2. Select service `api-maps-service-prod-live` → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Health check: `curl -s https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-common-api-maps-service/healthcheck`
- Deep health check: `curl -s https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-common-api-maps-service/healthcheck/deep`
- Verify in Splunk dashboard "wdpr-dlp-is-common-api-maps-service" that new logs appear
- Check Google APIs Status: https://status.cloud.google.com/

---

## Scaling

- **Scale up:** Update desired count in ECS service definition. Service is stateless and can scale horizontally.
- **Scale down:** Reduce desired count. Ensure at least 2 tasks remain for availability.

## Failover

- ECS service runs across multiple AZs in eu-west-1 — automatic failover on task failure
- API Gateway (vrddtebvrl) routes traffic to healthy ECS tasks
- If GCP Directions API is down, no failover available — wayfinding will be unavailable

## Rollback

- **Harness:** Use Harness pipeline rollback at https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Disneyland_Paris/projects/DLP_DGE_API_MAPS_Services/overview
- **ECS:** Update task definition to previous revision, force new deployment

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| GCP (Google Directions API) | DLP Squad Cloud Digital (ops-frdlp-DigitalData) | GCP API key issues, quota exceeded |
| DLP Cloud Ops | DLP.DL-IS.CLOUD.OPS@disney.com | Infrastructure/ECS cluster issues |
| Ngaha, Rigobert | Dev SME | Application logic/proxy issues |
