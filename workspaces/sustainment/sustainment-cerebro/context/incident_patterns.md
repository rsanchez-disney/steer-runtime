# Incident Patterns — DX Profile

## Top 8 Known Patterns

Use these for rapid triage and pattern matching when an INC arrives.

---

### 1. Login Loops
**Frequency**: Weekly | **Services**: Auth, IdP, Session Management  
**Symptoms**: Redirect loops after login, session cookies not persisting, multiple 302s  
**Splunk**: `index=dx_profile sourcetype=access_combined status=302 uri_path="/login" | stats count by host`  
**Resolution**: Check Redis session store → Verify IdP certificate → Check recent auth deploys  
**Common Root Cause**: Session store failover, cookie domain mismatch, IdP cert rotation

---

### 2. VAS Duplicate Key
**Frequency**: Bi-weekly | **Services**: Value Added Services, Database  
**Symptoms**: DuplicateKeyException, failed add-on transactions, partial orders  
**Splunk**: `index=dx_profile sourcetype=vas_app "DuplicateKeyException" | stats count by service, table_name`  
**Resolution**: Check idempotency keys → Review race conditions → Queue deduplication  
**Common Root Cause**: Concurrent requests without proper idempotency, retry storms

---

### 3. Photo Watermarks
**Frequency**: Bi-weekly | **Services**: Photo Services, CDN, Image Pipeline  
**Symptoms**: Missing watermarks on previews, image queue backup  
**Splunk**: `index=dx_profile sourcetype=photo_svc "watermark" status!=200 | timechart count`  
**Resolution**: Pipeline health check → CDN cache invalidation → Watermark config  
**Common Root Cause**: Pipeline restart needed, CDN purge, template config update

---

### 4. Routing Failures
**Frequency**: Weekly | **Services**: API Gateway, ALB, ECS  
**Symptoms**: 503/504 on specific endpoints, uneven traffic, health check failures  
**Splunk**: `index=dx_profile sourcetype=alb_logs elb_status_code>=500 | stats count by target_group, backend_status_code`  
**Resolution**: ECS task health → ALB target groups → Route config changes  
**Common Root Cause**: ECS task crash, target group de-registration, route table error

---

### 5. DB Connection Pool Exhaustion
**Frequency**: Monthly | **Services**: Config Services (Java), RDS  
**Symptoms**: ConnectionPoolExhaustedException, cascading timeouts, increasing latency  
**Splunk**: `index=dx_profile sourcetype=config_svc "pool" "exhausted" | timechart span=5m count`  
**Resolution**: Check pool usage vs max → Identify long-running queries → Connection leak hunt  
**Common Root Cause**: Pool size insufficient, query optimization needed, unclosed connections

---

### 6. CDN Cache Invalidation
**Frequency**: Monthly | **Services**: CloudFront, Content Publisher  
**Symptoms**: Stale content after publish, invalidation timeouts  
**Splunk**: `index=dx_profile sourcetype=cdn_logs "invalidation" | stats count by status, distribution_id`  
**Resolution**: Manual invalidation → Origin health → Cache TTL adjustment  
**Common Root Cause**: Invalidation quota hit, origin 5xx, TTL misconfiguration

---

### 7. Message Queue Backlog (SQS/SNS)
**Frequency**: Bi-weekly | **Services**: Event Processing, Notifications  
**Symptoms**: Growing queue depth, delayed processing, DLQ accumulation  
**Splunk**: `index=dx_profile sourcetype=sqs_metrics queue_name="*profile*" | timechart avg(approximate_number_of_messages)`  
**Resolution**: Consumer scaling → Poison message removal → Retry policy  
**Common Root Cause**: Consumer crash, poison messages, downstream timeout

---

### 8. TLS/Certificate Expiration
**Frequency**: Quarterly | **Services**: All external-facing  
**Symptoms**: SSL handshake failures, browser warnings, API connection refused  
**Splunk**: `index=dx_profile sourcetype=tls_logs "handshake" "failed" | stats count by server_name`  
**Resolution**: Check cert dates → ACM auto-renewal → Client cert updates  
**Common Root Cause**: ACM renewal failure, pinned cert in mobile app, manual cert expired
