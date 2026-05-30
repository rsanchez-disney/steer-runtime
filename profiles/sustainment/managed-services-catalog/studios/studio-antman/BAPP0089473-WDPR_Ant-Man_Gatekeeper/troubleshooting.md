# Troubleshooting — WDPR Ant-Man Gatekeeper

## Common Issues

### Issue: Gatekeeper Not Working / Publications Stalled

**Symptoms:** Content not flowing through the pipeline, publications not refreshing, SDL Connect test failing.

**Root Cause:** MongoDB connectivity issues, service crash, or SDL Connect integration failure.

**Resolution:**
1. Check the version/connect test page: `https://prod-stage.d-scribe-gatekeeper.wdprapps.disney.com/sdl/connect/test`
2. Validate with SE the status of MongoDB instances
3. If there are issues and need to restart publications, execute for affected environments:
   - Refresh: `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/gatekeeper/publications/refresh`
   - List: `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/gatekeeper/publications/list`
4. Check Splunk: `index=wdpr_d-scribe source="*gatekeeper-prod/*" ERROR earliest=-1h | stats count by error_code, message | sort -count`

---

### Issue: Product Mapper Issues

**Symptoms:** Content-to-product mapping failures, incorrect product associations.

**Root Cause:** Product Mapper configuration issues or data inconsistencies.

**Resolution:**
1. Reference the Product Mapper troubleshooting guide: https://confluence.disney.com/display/ECM/Product+Mapper:+Troubleshooting
2. Check Splunk for Product Mapper errors: `index=wdpr_d-scribe source="*gatekeeper-prod/*" "ProductMapper" ERROR`
3. Escalate to Ant-Man Dev team if configuration changes needed

---

### Issue: High Latency / Slow Publications

**Symptoms:** Publication operations taking longer than expected, content freshness degraded.

**Root Cause:** MongoDB performance issues, high publication volume, or resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*gatekeeper-prod/*" | stats avg(response_time) p95(response_time) by endpoint | sort -p95`
2. Check MongoDB performance metrics
3. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
4. Scale up ECS tasks if resource-constrained

---

### Issue: SDL Connect Integration Failure

**Symptoms:** Translation workflows not processing, SDL Connect test endpoint returning errors.

**Root Cause:** SDL Connect service unavailable, authentication issues, or network connectivity.

**Resolution:**
1. Test SDL Connect: `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/sdl/connect/test`
2. Check Splunk for SDL-related errors: `index=wdpr_d-scribe source="*gatekeeper-prod/*" "sdl" OR "SDL" ERROR`
3. Escalate to Ant-Man Dev team for SDL integration issues

---

## Escalation Decision Tree

- If MongoDB connectivity → validate with SE, escalate to DBA team
- If SDL Connect issues → escalate to Ant-Man Dev team
- If Product Mapper issues → reference troubleshooting guide, escalate to Dev if needed
- If publication refresh needed → use refresh endpoint, then investigate root cause
- If infrastructure/ECS issues → escalate to Cloud Platform team

## Known Quirks

- Gatekeeper depends on MongoDB for publication state — Mongo issues directly impact publications
- SDL Connect integration handles content translation/localization workflows
- Product Mapper has its own troubleshooting guide: https://confluence.disney.com/display/ECM/Product+Mapper:+Troubleshooting
- Publications can be manually refreshed via the `/gatekeeper/publications/refresh` endpoint
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*gatekeeper-prod/*"` for production
- URL pattern uses both `ant-man-gatekeeper.wdprapps.disney.com` and `d-scribe-gatekeeper.wdprapps.disney.com`
