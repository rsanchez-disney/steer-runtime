# Troubleshooting — WDPR Ant-Man RMQ for Collector

## Common Issues

### Issue: Queue Depth Growing / Messages Not Being Consumed

**Symptoms:** RabbitMQ Management Console shows growing queue depth; Collector not processing messages.

**Root Cause:** Collector (BAPP0159223) is down, slow, or unable to connect to RMQ.

**Resolution:**
1. Check RMQ Management Console: https://collector-rmq.wdprapps.disney.com/
2. Verify Collector health: `https://d-scribe-collector.wdprapps.disney.com/information`
3. Check Splunk for RMQ connection errors: `index=wdpr_d-scribe source="*sdm-prd*" sendRabbitMQ OR RabbitMQ level=ERROR`
4. If Collector is down, restart Collector ECS tasks (see BAPP0159223 runbook)

---

### Issue: Messages Not Being Published to RMQ

**Symptoms:** Queue is empty; Collector not receiving new messages; content not updating.

**Root Cause:** SDM Courier not sending messages to RMQ, or producer connectivity issues.

**Resolution:**
1. Check Splunk for publish activity: `index=wdpr_d-scribe source="*sdm-prd*" sendRabbitMQ`
2. If no publish activity, problem is upstream (SDM Courier) → contact SE
3. Verify RMQ broker is accessible from producer

---

### Issue: TLS Certificate Expiry / Connection Failures

**Symptoms:** Consumers and producers unable to connect; TLS handshake failures.

**Root Cause:** TLS certificate expired or approaching expiry.

**Resolution:**
1. Check Grafana Certificate Expiry dashboard: https://grafana.wdprapps.disney.com/d/cdwb3kwo1fg1sc/gcx-ssl-tls-certificate-expiry?orgId=1&refresh=30m
2. If certificate is expired or near expiry, escalate to Platform Engineering for renewal
3. After renewal, verify connections resume

---

### Issue: RabbitMQ Broker Unreachable

**Symptoms:** Management console not loading; all consumers disconnected.

**Root Cause:** AWS Amazon MQ service issue or network connectivity.

**Resolution:**
1. Check AWS Amazon MQ service health in AWS Console
2. Verify network connectivity to broker endpoints
3. Escalate to Platform Engineering if infrastructure issue

---

## Escalation Decision Tree

- If Collector not consuming → check BAPP0159223 (Collector) health first
- If SDM Courier not publishing → contact SE (Site Engineering)
- If TLS certificate issues → escalate to Platform Engineering
- If broker infrastructure → escalate to Platform Engineering

## Known Quirks

- RabbitMQ is a managed service (Amazon MQ) — no application code to deploy
- Messages persist in queue until consumed — no data loss on consumer restart
- TLS certificates must be monitored proactively via Grafana
- Routing diagram: https://confluence.disney.com/spaces/ECM/pages/845852050/Diagram+Collector+RMQ+Routing+to+Downstream
- Splunk queries use `source="*sdm-prd*"` pattern (not `*rmq*`)
- Management console URLs serve as health check endpoints
