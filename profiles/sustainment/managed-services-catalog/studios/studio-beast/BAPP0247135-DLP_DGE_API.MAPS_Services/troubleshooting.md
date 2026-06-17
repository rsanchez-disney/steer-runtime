# Troubleshooting — DLP DGE API.MAPS Services

## Common Issues

### Issue: Directions not loading — GCP API failure

**Symptoms:** Guests tap "Get Directions" but no route displayed. API returning 5xx or timeout. AppDynamics `prod_dlp-is_maps` showing elevated errors.

**Root Cause:** GCP Directions API unreachable, API key expired/quota exceeded, or network connectivity between ECS and GCP.

**Resolution:**
1. Check Google APIs Status: https://status.cloud.google.com/
2. Check AppDynamics: `PROD_DLP_BAPP0247135_wdpr-dlp-is-common-api-maps-service`
3. Verify deep health check: `curl https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-common-api-maps-service/healthcheck/deep`
4. If GCP is down → wait for Google to resolve; no local failover available
5. If API key issue → escalate to DLP Cloud Ops (DLP.DL-IS.CLOUD.OPS@disney.com)

---

### Issue: Health check failing

**Symptoms:** Healthcheck Manager showing service unhealthy. ECS tasks potentially restarting.

**Root Cause:** ECS task resource exhaustion, dependency health check failure (GCP unreachable from deep check), or deployment issue.

**Resolution:**
1. Check ECS cluster `dlp-apps-S0001481-euw1-prd` → service `api-maps-service-prod-live`
2. Check Splunk dashboard "wdpr-dlp-is-common-api-maps-service" for error logs
3. If deep health check fails but light health check passes → GCP connectivity issue
4. If both fail → force new ECS deployment or rollback via Harness

---

### Issue: Wait times / categories not displaying correctly

**Symptoms:** Map shows stale or missing wait times, categories not rendering, Single Rider tags missing.

**Root Cause:** Tridion CMS configuration not set up for required data (wait times, Single Rider, categories). Known limitation — some features depend on Tridion config not yet available.

**Resolution:**
1. This is a known limitation — certain features require Tridion configuration that has not been set up
2. Known pending Tridion configs: wait time display, Single Rider wait times, category reduction
3. Escalate to Content/Tridion team if new configurations are needed
4. Maps service itself is healthy — issue is upstream content configuration

---

### Issue: API Gateway returning 403/429

**Symptoms:** Direction requests rejected at gateway level. Mobile app showing "service unavailable" for directions.

**Root Cause:** API Gateway throttling (rate limiting), authentication issue, or gateway misconfiguration.

**Resolution:**
1. Check API Gateway console: https://eu-west-1.console.aws.amazon.com/apigateway/main/apis/vrddtebvrl/
2. Verify API Gateway execution logs for error patterns
3. If 429 (throttling) → increase rate limits in API Gateway configuration
4. If 403 → check API key/authorization configuration
5. Escalate to DLP Cloud Ops if infrastructure change needed

---

## Escalation Decision Tree

- If GCP Directions API down → check Google status page; escalate to DLP Cloud Ops if key/quota issue
- If ECS service unhealthy → restart, then escalate to Beast studio
- If Tridion content missing → escalate to Content/Tridion integration team
- If API Gateway issues → escalate to DLP Cloud Ops (ops-frdlp-DigitalData)

## Known Quirks

- Service is purely a proxy — no business logic; if GCP is down, there is no local fallback
- Wayfinding testing requires Fake GPS application (Android only, e.g., "Simulador GPS")
- Some test cases are not executable due to pending Tridion configurations (wait times, Single Rider, categories)
- Postman collection available in DGE Workspace: `wdpr-dlp-is-common-api-maps-service`
