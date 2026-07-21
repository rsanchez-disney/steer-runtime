# Runbook — WDPR Retail Tech RMQ

## Restart Procedures

1. RabbitMQ management UI: https://sales-rmq.wdprapps.disney.com/
2. Check cluster status, node health, queue depths
3. If node down: restart via EC2 instance restart or contact cloud team

**Validation:**
- Management UI accessible at https://sales-rmq.wdprapps.disney.com/
- Queue depth not growing unboundedly
- Consumer connections active

---

## Scaling

- Infrastructure managed — contact cloud team for capacity increases

## Failover

- RabbitMQ clustering handles node failures

## Rollback

- N/A for infrastructure — message reprocessing via DLQ

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Cloud team | Infrastructure team | Node/cluster issues |
| Dinetime Sync | prd-global-fnb | Consumer issues |
