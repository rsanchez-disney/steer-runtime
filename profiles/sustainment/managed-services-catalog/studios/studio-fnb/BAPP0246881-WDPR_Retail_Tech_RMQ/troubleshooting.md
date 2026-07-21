# Troubleshooting — WDPR Retail Tech RMQ

## Common Issues

### Issue: Queue depth growing unboundedly

**Symptoms:** Consumer lag, messages piling up

**Root Cause:** Consumer service down or overloaded

**Resolution:**
1. Check consumer service health (Dinetime Reservation Sync)
2. Verify consumer connections in RMQ management UI
3. Restart consumer service if needed

---

### Issue: RabbitMQ management UI unreachable

**Symptoms:** Cannot access https://sales-rmq.wdprapps.disney.com/

**Root Cause:** Node down or network issue

**Resolution:**
1. Check EC2 instance health
2. Contact cloud/infrastructure team

---

## Escalation Decision Tree

- If consumer issue → check consumer service
- If RMQ infra → cloud team

## Known Quirks

- DLQ queues exist for failed messages — monitor these
