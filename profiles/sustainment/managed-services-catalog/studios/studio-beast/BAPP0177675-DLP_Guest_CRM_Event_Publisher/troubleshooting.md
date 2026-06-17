# Troubleshooting — DLP Guest CRM Event Publisher

## Common Issues

### Issue: Events not delivered to Salesforce (all events)

**Symptoms:** No CRM events reaching Salesforce. Queue building up or empty depending on root cause.

**Root Cause:** RabbitMQ is most likely down.

**Resolution:** Check RabbitMQ cluster health (https://dlp-is-rmq.wdprapps.disney.com/). Verify instance `dlp-is-rmq-prod-asg` is running. Check ECS service `crm-event-v2-publisher-prod-live` health.

---

### Issue: Events not delivered to Salesforce (specific event types)

**Symptoms:** Some event types not processing while others work fine.

**Root Cause:** Missing inputs from upstream services to the queue. Depends on event type:
- Booking events → Travelbox issue
- Account events → Google Cloud / OneID issue
- Ticket/pass events → Keyring service issue
- Profile/consent events → Guest Extended Profile Provider issue

**Resolution:** Identify which event type is failing. Check the corresponding upstream service. Verify messages are being posted to the AMQP CRM Event Queue.

---

### Issue: Missing or wrong-formatted fields related to some Guest

**Symptoms:** Deserialization errors in logs. Specific guest events failing.

**Root Cause:** CRM doesn't produce data — it only consumes. Wrong format usually caused by unexpected clients posting events in incorrect format.

**Resolution:** Check Splunk logs for deserialization errors. Identify the client posting malformed events. Troubleshoot from the client side (upstream producer).

---

### Issue: Duplicate events for the same Guest in short time window

**Symptoms:** Same CRM event published multiple times for one guest within seconds.

**Root Cause:** Generally comes from OneID producing the same event twice or multiple times in the same time window.

**Resolution:** Verify in RabbitMQ management UI if duplicate messages exist in queue. Check OneID event production logs. This is typically an upstream issue.

---

## Escalation Decision Tree

- If RabbitMQ down → check EC2 ASG `dlp-is-rmq-prod-asg`, escalate to infrastructure
- If specific event type missing → troubleshoot upstream service (Keyring, GEP, Travelbox, Google Cloud)
- If deserialization errors → identify malformed client, escalate to that team
- If duplicate events → escalate to OneID team
- If ECS service issue → Cloud OPS
- If application logic → Luigi Squad (app-frdlp-guestprofile)

## Known Quirks

- Not guest-facing — no P2 impact regardless of outage
- CRM does not produce data, only consumes and transforms
- Multiple upstream sources can independently cause partial failures
- RabbitMQ user: f-wdpr-monitor-rw-gp-rmq
