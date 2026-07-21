# Troubleshooting — WDPR Dinetime Reservation Sync

## Common Issues

### Issue: Messages accumulating in RabbitMQ queue

**Symptoms:** Queue depth growing, sync lag increasing

**Root Cause:** Service not consuming messages or downstream DineTime rejecting

**Resolution:**
1. Check health: `https://dinetime-res-sync.wdprapps.disney.com/healthcheck`
2. Check RabbitMQ queue: https://sales-rmq.wdprapps.disney.com/#/queues/dine-rmqvh/DINE.EVENTDINING.FNBSUB
3. Check DLQ for failed messages
4. If service unhealthy → restart ECS

---

### Issue: DineTime rejecting reservations

**Symptoms:** DLQ growing, error logs show downstream rejection

**Root Cause:** DineTime system issue or message format mismatch

**Resolution:**
1. Check error messages in Splunk: `index=wdpr_fnb_lumiere level=ERROR`
2. Contact DineTime support: support@qsrautomations.com
3. Check QSRA status: https://status.qsr.cloud/

---

## Escalation Decision Tree

- If service down → restart ECS
- If RabbitMQ → check queue health, consumer connections
- If DineTime → support@qsrautomations.com

## Known Quirks

- DLQ messages need manual reprocessing after root cause resolved
- Service is WDW-only (us-east-1)
