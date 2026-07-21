# Runbook — WDPR MOO Mobile Order Orchestration

## Restart Procedures

1. Navigate to AWS Console → ECS → Cluster (WDW: ddpmw-prod, DLR: moo-prod)
2. Select service (WDW: moo-prod-live, DLR: moo-dlr-service-prod-live)
3. Click "Update service" → Check "Force new deployment" → Update
4. Or use Rundeck job for controlled restart

**Validation:**
- Health check returns 200: WDW `https://moo.wdprapps.disney.com/mobile-ordering-orchestration-service/api/v1/admin/health-check?show-all=true`
- Health check: DLR `https://moo-dlr.wdprapps.disney.com/mobile-ordering-orchestration-service/api/v1/admin/health-check?show-all=true`
- Monitor Splunk for errors post-restart
- Verify Grafana "General Stats - WDW/DLR - MOO" dashboards show healthy metrics

---

## Scaling

- **Scale up:** Update ECS service desired count via AWS Console or Terraform. Current: auto-scaling based on CPU/memory.
- **Scale down:** Reduce desired count. Ensure minimum 2 tasks for HA.

## Failover

- WDW and DLR are independent deployments — one can fail without affecting the other
- Redis failover: Elasticache handles automatic failover within AZ
- DR: Cross-region (RTO 24h, RPO 0h) — requires DR activation by Ryan Purdy

## Rollback

- Use Harness pipeline rollback feature to revert to previous deployment
- Or: Rundeck → select previous task definition revision → deploy

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| VenueNext | help@venuenext.com | Order submission failures, VN API errors |
| Pusher | https://status.pusher.com/ | Real-time order updates not reaching guests |
| DSP/POS (Payments) | app-global-dsp | Payment authorization/capture failures |
| DTOC | DX Monitoring Teams channel | P1/P2 bridge escalation |
