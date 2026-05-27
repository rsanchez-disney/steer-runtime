# Runbook — FNF New Connection Methods SPA

## Restart Procedures

1. Use Rundeck: fnf-new-connection-methods-spa-ha_aws
2. Or redeploy via Harness FnF pipeline
3. Or use Nimbus: nimbus_deploy/fnf-new-connection-methods-spa-ha

**Validation:** Hit healthcheck endpoints:
- East: https://origin.use1.fnf-new-connection-methods.gam-prod.wdprapps.disney.com/healthcheck
- West: https://origin.usw2.fnf-new-connection-methods.gam-prod.wdprapps.disney.com/healthcheck

---

## Scaling

- **Scale up:** ECS Fargate auto-scaling. Alert thresholds: CPU > 30%, Memory > 50%.
- **Scale down:** ECS Fargate auto-scaling handles scale-down.

## Failover

- Active-active across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Route 53 geo-routing handles failover between regions
- If one region is unhealthy, traffic routes to the other region automatically

## Rollback

- Redeploy previous version via Harness FnF pipeline
- Rundeck: fnf-new-connection-methods-spa-ha_aws
- Nimbus: nimbus_deploy/fnf-new-connection-methods-spa-ha
- If analytics 404: check if file is loaded on S3, if not rebuild and deploy the SPA

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Profile WebAPI WAM | Andrew Southwick | When backend service calls fail |
| Profile VAS | Martin Uribe | When connected guests data unavailable |
| AuthenticatorJS | Cesar Munoz | When login/auth fails |
| Akamai CDN | ops-global-parks-se-guestexp | When CDN/WAF issues (502, BOTMAN rules) |
| GAM | GAM team | When friend list data source issues |
