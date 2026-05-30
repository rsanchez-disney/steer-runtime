# Troubleshooting — List Service

## Service Overview

List Service is a Java WAR on ECS Fargate (cluster: wdpr-content-prod) that serves content data from Vendomatic (configuration) and DLP Tridion CMS (content). RabbitMQ notifies it of changes. Uses Redis (caching), Couchbase (content storage), and MariaDB (Vendomatic config).

- **Splunk:** `index=wdpr_lists_service`
- **Health:** http://listservice.wdprapps.disney.com/lists-service/admin/status (expects 204)
- **Health Report:** https://listservice.wdprapps.disney.com/lists-service/admin/health-report
- **AppDynamics:** prod_list-svc_aws

---

## Common Issues

### Issue: Redis Connectivity

**Symptoms:** Slow responses, cache misses, errors referencing Redis connection.

**Resolution:**
1. Check Redis endpoint: `prod.lists-svc-redis.wdprapps.disney.com`
2. Verify ElastiCache cluster `listservice-prod` is healthy in AWS Console
3. Splunk: `index=wdpr_lists_service "redis" OR "elasticache" ERROR`
4. If Redis is down, service will still function but with degraded performance (cache miss = DB hit)

---

### Issue: Application Fails to Start

**Symptoms:** ECS tasks failing to reach RUNNING state, health check failing.

**Root Cause:** RabbitMQ unavailable — application gathers mbeans from RabbitMQ on startup and will NOT start without it.

**Resolution:**
1. Check RabbitMQ endpoint: https://mdx-svc-rmq.wdprapps.disney.com/#/
2. Verify RabbitMQ is healthy and accepting connections
3. If RabbitMQ is down, List Service cannot start — wait for RMQ recovery
4. Once RMQ is back, ECS will auto-restart failed tasks

---

### Issue: Configuration Cache Not Updating

**Symptoms:** Changes made in Vendomatic not reflected in List Service responses.

**Resolution:**
1. Verify RabbitMQ is delivering notifications
2. Check Splunk: `index=wdpr_lists_service "vendomatic" OR "notification"`
3. Verify MariaDB endpoint is reachable: `prod.vendomatic-mariadb.wdprapps.disney.com`
4. If RMQ notification was lost, may need to trigger a cache refresh

---

### Issue: Internal ALB Issues

**Symptoms:** Internal traffic routing failures, 502/503 errors.

**CRITICAL:** Do NOT run Terraform on the internal ALB — it has a manually created HTTP listener (bandaid fix for prod issue).

**Resolution:**
1. Check ALB health in AWS Console
2. Verify ECS tasks are registered with target group
3. If ALB needs changes, coordinate with Cloud SE team (manual changes only)

---

## Escalation Decision Tree

- RabbitMQ down → service cannot start; wait for RMQ recovery, escalate to messaging team
- Redis issues → check ElastiCache, escalate to Cloud SE if cluster unhealthy
- ALB issues → escalate to Cloud SE (do NOT run Terraform)
- Content not updating → check RMQ notifications, then Vendomatic (BAPP0054821)
- Application bug → escalate to Ant-Man Dev team

## Known Quirks

- Application will NOT start without RabbitMQ — this is the #1 startup failure cause
- Internal ALB has manual HTTP listener — never run Terraform on it
- Splunk index is `wdpr_lists_service` (NOT `wdpr_d-scribe`)
- Legacy F5 load balancers still exist alongside new ALBs
- Shanghai content syncs from US S3 bucket to NAS
