# Troubleshooting — DLP Keyring

## Common Issues

### Issue: Keyring Main — MariaDB connection pool exhaustion

**Symptoms:** HTTP 500 errors on profile/portfolio endpoints, health check `/healthcheck/deep` failing, logs showing `HikariPool - Connection is not available`

**Root Cause:** High traffic or slow queries exhausting the HikariCP connection pool. Pool config is controlled via Vault/Consul: `tech/app/db.max.active`, `tech/app/db.min.idle`.

**Resolution:**
1. Check Splunk for slow query patterns: `index=wdpr_dlp_digital source="eu-west-1:dlp-apps-*-euw1-prd-applogs:oid01a-prod/oid-keyring-main-provider/*" "org.mariadb.jdbc"`
2. Verify MariaDB health via RDS console (eu-west-1)
3. If pool is exhausted, scale ECS tasks or increase pool size via Consul (`tech/app/db.max.active`)

---

### Issue: Keyring Main — RabbitMQ consumer disconnection

**Symptoms:** Guest profile events not being processed, portfolio reconciliation events stuck, no new messages consumed from `dlp.rabbitmq.guest-profile.queue`

**Root Cause:** RabbitMQ connection lost due to network issues or broker restart. Spring AMQP should auto-reconnect but may fail silently.

**Resolution:**
1. Check RabbitMQ management console for consumer count on the queue
2. Check Splunk for connection errors: `index=wdpr_dlp_digital source="eu-west-1:dlp-apps-*-euw1-prd-applogs:oid01a-prod/oid-keyring-main-provider/*" "RabbitMQ" OR "AmqpConnectException"`
3. Restart the ECS task if consumer is not recovering

---

### Issue: CNS PRC Listener — GCP Pub/Sub subscription lag

**Symptoms:** OneID account events (CREATE, UPDATE, DELETE) not reflected in Keyring profiles, growing backlog in Pub/Sub subscription

**Root Cause:** Listener unable to keep up with event volume, or GCP credentials expired/rotated.

**Resolution:**
1. Check Splunk: `index=wdpr_dlp_digital source="eu-west-1:dlp-apps-S0001481-euw1-prd-applogs:oid02l-prod/oid-keyring-cns-prc-listener/*" Level=ERROR`
2. Verify GCP Pub/Sub subscription metrics in GCP Console (check `oldest_unacked_message_age`)
3. If credential issue, check Vault path: `secret/apps/is/eu-west-1/prod/guest/oid-keyring-cns-prc-listener/1.0.0/secret` for GCP private key
4. Scale ECS tasks if processing lag is due to volume

---

### Issue: Ticket Provider — Ticket linking failures

**Symptoms:** Tickets not appearing in guest portfolios after purchase, RabbitMQ dead-letter queue growing

**Root Cause:** Keyring Main API returning errors during ticket-guest association, or ticket data from Core API (package-reservation-service) is incomplete.

**Resolution:**
1. Check dead-letter queue for failed messages
2. Check Splunk: `index=wdpr_dlp_digital source="eu-west-1:dlp-apps-S0001481-euw1-prd-applogs:oid07a-prod/oid-ticket-provider/*" Level=ERROR`
3. Verify Keyring Main health: `curl https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-guest-oid-keyring-main-provider/healthcheck/deep`
4. Check if Core API (package-reservation-service) is responding

---

### Issue: Package Digital Provider — Timeout on package retrieval

**Symptoms:** Slow or timeout responses on `/v1/guest/{swid}/packages` endpoint

**Root Cause:** Downstream service latency or large portfolio size for the guest.

**Resolution:**
1. Check Splunk latency: `index=wdpr_dlpis source="eu-west-1:dlp-apps-S090262-euw1-prd-applogs:oid06a-prod/package-digital-provider/*" Logger=com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter | stats avg(responseTime) p95(responseTime)`
2. Check downstream service health (Keyring Main, BMacs)
3. Review HTTP connection pool settings in Consul: `tech/app/restclient.connection.pool.max`

---

### Issue: Lambda BMACS Reconciliation — Invocation failures

**Symptoms:** Portfolio reconciliation not running, CloudWatch showing Lambda invocation errors

**Root Cause:** Lambda timeout (large batch), Keyring Main API unavailable, or IAM permission issues.

**Resolution:**
1. Check CloudWatch Logs: `/aws/lambda/dlp-apps-bapp0177699-guest-portfolio-bmacs-reconciliation`
2. Verify the Lambda is being triggered by the scheduled CloudWatch Event rule
3. Check Keyring Main health (the Lambda calls Keyring Main's `/v1/guest/reconcile/packages` endpoint)

---

### Issue: Lambda Ticket Provider — Unlinked tickets not being processed

**Symptoms:** Tickets remain unlinked after the scheduled Lambda run

**Root Cause:** Lambda timeout, Keyring Main `/v1/guest/link/tickets` endpoint errors, or no unlinked tickets found.

**Resolution:**
1. Check CloudWatch Logs: `/aws/lambda/dlp-apps-bapp0177699-guest-ticket-provider`
2. Verify Keyring Main is healthy and responding to linking requests
3. Check if the Lambda execution completed within timeout

---

## Splunk Quick Reference

| Component | Index | Prod Source |
|-----------|-------|-------------|
| Keyring Main | `wdpr_dlp_digital` | `eu-west-1:dlp-apps-*-euw1-prd-applogs:oid01a-prod/oid-keyring-main-provider/*` |
| CNS PRC Listener | `wdpr_dlp_digital` | `eu-west-1:dlp-apps-S0001481-euw1-prd-applogs:oid02l-prod/oid-keyring-cns-prc-listener/*` |
| Ticket Provider | `wdpr_dlp_digital` | `eu-west-1:dlp-apps-S0001481-euw1-prd-applogs:oid07a-prod/oid-ticket-provider/*` |
| Package Digital | `wdpr_dlpis` | `eu-west-1:dlp-apps-S090262-euw1-prd-applogs:oid06a-prod/package-digital-provider/*` |

---

## Escalation Decision Tree

- If MariaDB is down or degraded → escalate to DBA team / RDS support
- If GCP Pub/Sub subscription issues → check GCP project credentials in Vault, escalate to OneID team if subscription is deleted
- If RabbitMQ broker issues → escalate to DLP infrastructure team
- If all Keyring services are down → check ECS cluster health, escalate to AWS platform team
- If BMacs integration failures → escalate to BMacs team (booking system)
- If OneID Admin Controller unreachable → escalate to OneID/Identity team

## Known Quirks

- Components use specific splunk indexes `wdpr_dlp_digital` while other components use specific indexes
- The CNS PRC Listener processes both GCP Pub/Sub events (OneID) and legacy CNS events
- Package Digital Provider runs on a different AWS account (S090262) than the other ECS services (S0001481)
- Lambda functions use the `wdpr-dlp-is-foundation-lambda-invoker` framework (v1.0.0-13) which wraps the actual handler
- All ECS services use Tomcat 10 + JRE 21 base image and envconsul for Vault secret injection
- Health check endpoints: `/healthcheck` (light, for LB) and `/healthcheck/deep` (includes dependency checks)
- Timezone is set to `Europe/Paris` in all Docker containers
