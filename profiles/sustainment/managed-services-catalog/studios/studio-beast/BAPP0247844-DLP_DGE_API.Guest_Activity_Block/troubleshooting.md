# Troubleshooting — DLP DGE API.Guest Activity Block

## Common Issues

### Issue: Guests not being blocked despite suspicious behavior

**Symptoms:** Guests exceeding failure thresholds but still able to link tickets/packages. No blocking events in DocumentDB.

**Root Cause:** RabbitMQ consumer disconnected, client library not publishing events, or DocumentDB write failure.

**Resolution:**
1. Check RabbitMQ management console for consumer count on exchange `GPE.GUESTEVENT.DIS.GAB`
2. Check Splunk "wdpr-dlp-is-guest-activity-block-provider" for consumer errors
3. Verify DocumentDB is accessible: check AWS console `guest-activity-block-docdb-prod-global`
4. Restart ECS service if RabbitMQ consumer is not recovering
5. Check if client library is deployed in the ticket-linking/package-digital providers

---

### Issue: Legitimate guests being blocked (false positives)

**Symptoms:** Guests reporting inability to link valid tickets/packages. Lock status shows SHORT_BLOCK or LONG_BLOCK.

**Root Cause:** Guest hit failure threshold due to typos or system errors (not actual fraud). Stale block records.

**Resolution:**
1. Check guest lock status via API: use Postman collection `wdpr-dlp-is-guest-activity-block-provider` with guest SWID
2. Verify in DocumentDB the failure count and timestamps
3. For SHORT_BLOCK (prod): wait 1 hour for auto-expiry
4. For LONG_BLOCK (prod): 3-month block — manual intervention required in DocumentDB if legitimate guest
5. Escalate to Nicolas Miel if manual unblock needed

---

### Issue: DocumentDB connection failure

**Symptoms:** Health check deep failing. Lock status checks returning errors. New activity not being recorded.

**Root Cause:** DocumentDB cluster unhealthy, connection pool exhaustion, or credentials issue.

**Resolution:**
1. Check AWS DocumentDB console: `guest-activity-block-docdb-prod-global` (eu-west-1)
2. Check Splunk for connection errors
3. If connection pool exhaustion → restart ECS service
4. If DocumentDB cluster issue → escalate to ops-global-Flex SRE

---

### Issue: RabbitMQ queue growing (messages not consumed)

**Symptoms:** Activity events accumulating in queue. Blocking decisions delayed. RabbitMQ showing unacknowledged messages.

**Root Cause:** ECS task unhealthy, consumer crashed, or DocumentDB slow writes causing backpressure.

**Resolution:**
1. Check ECS service health for `activity-block-provider-prod-live`
2. Check RabbitMQ management for queue depth and consumer status
3. If consumer is down → restart ECS service
4. If DocumentDB is slow → check DocumentDB metrics (CPU, connections, write latency)
5. Escalate to ops-frdlp-CloudOps if RabbitMQ broker issues

---

### Issue: Client library not intercepting requests

**Symptoms:** No activity events published for ticket-linking or package-digital endpoints. RabbitMQ queue shows no new messages.

**Root Cause:** Client library not properly included in the consuming service, filter configuration wrong, or consuming service deployed without library update.

**Resolution:**
1. Verify client library version in consuming service's `pom.xml`:
   - `wdpr-dlp-is-guest-tms-tickets-linking-provider`
   - `wdpr-dlp-is-guest-package-digital-provider`
2. Check if `OncePerRequestFilter` is registered in Spring context
3. Verify endpoint configuration matches the endpoints being called
4. If library version mismatch → coordinate redeployment of consuming services

---

## Escalation Decision Tree

- If DocumentDB down → escalate to ops-global-Flex SRE
- If RabbitMQ issues → escalate to ops-frdlp-CloudOps
- If blocking logic wrong → escalate to Nicolas Miel (dev SME)
- If false positive block on legitimate guest → escalate to Nicolas Miel for manual unblock
- If client library integration issue → coordinate with consuming service teams

## Known Quirks

- Production blocking thresholds are much stricter than lowers (1h short block vs 15min, 3-month long block vs 20min)
- Client library is a dependency in other services' pom.xml — updating requires redeploying those services
- No automated tests exist — test coverage ~70%, testing done via Postman or frontend (web)
- To test blocking: link ticket/package 12 times with wrong data (front-end) or use Postman to hit endpoints repeatedly (back-end)
- Frontend test URLs:
  - Tickets: `https://stage.register.disneylandparis.com/links/tickets-passes/#/`
  - Packages: `https://stage.book.disneylandparis.com/en-gb/booking-portfolio?channel=DIRECT`
