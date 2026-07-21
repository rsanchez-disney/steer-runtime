# Runbook — WDPR Dinetime Reservation Sync

## Restart Procedures

1. AWS Console → ECS → Cluster: wdpr-revmgmt-S0001416-use1-prd
2. Service: dinetime-res-sync-svc-prod-live
3. "Update service" → "Force new deployment"
4. Rundeck: https://rundeck.wdprapps.disney.com/project/dinetime-reservation-sync_aws/jobs

**Validation:**
- Health check: `https://dinetime-res-sync.wdprapps.disney.com/healthcheck`
- Monitor Splunk index=wdpr_fnb_lumiere for errors
- Check RabbitMQ queue depth: https://sales-rmq.wdprapps.disney.com/#/queues/dine-rmqvh/DINE.EVENTDINING.FNBSUB
- CloudWatch: https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Lumiere_Dinetime-Reservation-Sync

---

## Scaling

- **Scale up:** Increase ECS desired count if queue depth growing.
- **Scale down:** Single task usually sufficient.

## Failover

- If RabbitMQ DLQ growing: check for message format issues, reprocess from DLQ

## Rollback

- Rundeck: deploy previous task definition revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DineTime/QSRA | support@qsrautomations.com | Downstream sync failures |
| RabbitMQ | prd-global-fnb | Queue/connection issues |
| DREAMS | Dining reservations team | Upstream message format changes |
