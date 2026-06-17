# Troubleshooting — DLP Mobile BFF CORE

## Common Issues

### Issue: Non-nullable fields error (P4 Known Issue)

**Symptoms:** Some guests cannot fetch their magic mobile data. Error returns HTTP 200 (not 4xx/5xx), making it hard to detect via standard alerting. Does not trigger alerts.

**Root Cause:** Required fields flagged as non-nullable at the BFF model layer are not sent by the mobile app in the request. GraphQL returns a partial response with null errors embedded in the 200 response.

**Resolution:**
1. Validate in AWS CloudWatch Logs Insights:
   - Go to AWS Console → CloudWatch → Log Insights
   - In selection criteria, type `z0luy5a6wc` (API Gateway resource ID) and select, then type `245900` and select all suggested log groups
   - Run query:
     ```
     fields @timestamp, @message, @logStream, @log
     | filter @message like "non-nullable"
     | sort @timestamp desc
     | limit 1000
     ```
2. If occurrences are increasing, escalate to Alexandre Bessa (dev SME)
3. Fix requires BFF deployment with updated model layer (nullable field adjustments)

---

### Issue: GraphQL endpoint returning 5xx errors

**Symptoms:** Mobile app unable to load wallet/package data. Elevated error rate in AppDynamics (`prod_dlp_mobile-bff-core-service`).

**Root Cause:** ECS task unhealthy, downstream VAS service failure propagating, or Redis cache connection issue.

**Resolution:**
1. Check AppDynamics dashboard: `prod_dlp_mobile-bff-core-service`
2. Check Splunk: "wdpr-dlp-is-mobile-bff-core-service" dashboard for error patterns
3. Check CloudWatch log group: `dlp-apps-B0245900-euw1-bff-core-bff-core-mobile-prd`
4. Verify ECS cluster health: `dlp-apps-B0245900-euw1-prd`
5. If Redis is down, BFF should degrade gracefully — verify Redis connectivity
6. If a specific downstream VAS is failing, check that service independently

---

### Issue: API Gateway errors (5xx at gateway level)

**Symptoms:** All BFF requests failing before reaching ECS. API Gateway logs showing errors.

**Root Cause:** API Gateway configuration issue, ECS target group unhealthy, or network connectivity.

**Resolution:**
1. Check API Gateway execution logs: `API-Gateway-Execution-Logs_z0luy5a6wc/default`
2. Run CloudWatch Logs Insights query for 5xx:
   ```
   fields @timestamp, @message
   | filter @message like /Method completed with status: 5/
   | sort @timestamp desc
   | limit 100
   ```
3. Verify ECS tasks are registered and healthy in the target group
4. If gateway misconfiguration, escalate to infrastructure team

---

### Issue: Downstream VAS service timeout

**Symptoms:** Specific features (e.g., wallet, packages, digital key) returning errors or slow responses while other features work normally.

**Root Cause:** One of the 12+ downstream VAS microservices is experiencing issues. BFF aggregates multiple calls so one slow service can affect the entire response.

**Resolution:**
1. Identify which VAS service is failing from Splunk logs (check x-app-feature header)
2. CloudWatch query to count status codes by feature:
   ```
   fields @timestamp, @message
   | parse @message /x-app-feature=(?<feature>[^,}\s]+)/
   | parse @message /Method completed with status: (?<status>\d+)/
   | stats count(*) as requestCount by feature, status
   | sort requestCount desc
   ```
3. Check the specific VAS service runbook and health
4. If the VAS service cannot be recovered quickly, check if BFF has circuit-breaker/fallback for that service

---

### Issue: Redis cache unavailable

**Symptoms:** Increased response times across all BFF queries. Downstream services seeing elevated traffic.

**Root Cause:** Redis ElastiCache node failure, connection pool exhaustion, or network issue.

**Resolution:**
1. Check AWS ElastiCache console for Redis cluster health (eu-west-1)
2. Check Splunk for Redis connection errors in BFF logs
3. BFF should continue operating without cache (direct downstream calls) but with degraded performance
4. If Redis node failed, AWS should auto-recover (Multi-AZ). Monitor for automatic failover.

---

## Escalation Decision Tree

- If non-nullable field errors increasing → escalate to Alexandre Bessa (dev SME)
- If all BFF requests failing → check ECS + API Gateway, then escalate to Beast studio
- If single VAS feature failing → check that specific VAS service runbook
- If Redis down → monitor AWS auto-recovery, escalate to infra if not recovering
- If API Gateway errors → escalate to DLP infrastructure team

## Known Quirks

- Non-nullable fields issue returns HTTP 200, so standard error-rate alerting won't catch it — must use CloudWatch Logs Insights with "non-nullable" filter
- BFF currently only serves wallet and package requests; other services are called directly by the mobile app
- Stage and Latest share the same AppDynamics app (`stage_dlp_mobile-bff-core-service`)
- Postman collection available in DGE Workspace: `wdpr-dlp-is-mobile-bff-core-service`
