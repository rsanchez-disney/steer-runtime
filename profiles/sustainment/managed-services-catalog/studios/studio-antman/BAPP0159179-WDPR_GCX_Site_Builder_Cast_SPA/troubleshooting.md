# Troubleshooting — GCX Site Builder Cast SPA

## Common Issues

### Issue: Application Not Loading / Blank Page

**Symptoms:** Cast Members see a white screen or loading spinner that never resolves.

**Root Cause:** JavaScript bundle failed to load, SSR rendering failure, or WebAPI backend unreachable.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*cast-spa-prod*" level=ERROR earliest=-30m`
2. Verify health check: `https://cast-portals.wdprapps.disney.com/information`
3. Check WebAPI (BAPP0159199) health — SPA depends on it for data
4. Check for recent deployments that may have introduced breaking changes

---

### Issue: Slow Page Load / Performance Degradation

**Symptoms:** Pages taking long to render, Cast Members reporting sluggish experience.

**Root Cause:** WebAPI latency (backend), large payload sizes, or ECS resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*cast-spa-prod*" | stats avg(response_time) p95(response_time) by page`
2. Check if issue is frontend or backend: verify WebAPI response times
3. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
4. Scale up ECS tasks if resource-constrained

---

### Issue: 5xx Errors / Service Unavailable

**Symptoms:** HTTP 500/503 responses, Cast Members seeing error pages.

**Root Cause:** ECS task failures, OOM, or deployment issues.

**Resolution:**
1. `index=wdpr_d-scribe source="*cast-spa-prod*" level=ERROR earliest=-30m | stats count by error_code`
2. Check ECS task health and recent deployments
3. Bounce tasks if OOM; rollback if deployment-related

---

## Escalation Decision Tree

- If WebAPI is down → check BAPP0159199 first
- If content stale → check D-Scribe pipeline (Assembler/Transformer)
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If UI bugs → escalate to Ant-Man Dev team

## Known Quirks

- SPA is the user-facing layer for Cast Portals — Cast Members interact directly with this
- Depends on WebAPI (BAPP0159199) for backend data
- Uses Node 20.11.1 with Spring Boot
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*cast-spa-prod*"` for production
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
