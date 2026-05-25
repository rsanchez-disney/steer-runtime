# Troubleshooting — EVAS WDW

## Common Issues

### VIDs not showing in guest view
- Check EVAS-WDW health endpoint
- If TMS-WDW is healthy but EVAS returns no VIDs → EVAS assembly issue
- Check Splunk for assembly errors:
  ```spl
  index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1*" ecs_task_definition="evas-svc-wdw*" ("*error*" OR "*exception*") earliest=-1h
  ```

### Slow response times
- EVAS aggregates data from TMS — check TMS-WDW latency first
- Check EVAS p95 latency in AppDynamics
- Look for downstream timeout patterns

### Partial entitlement data
- EVAS assembles from multiple TMS calls
- One failing TMS call can result in partial data
- Check individual TMS endpoints for errors

## Escalation

- Assignment Group: `web-global-salestickets`
- CI: WDPRD Entitlement-View-Assembly-Service


---

## External Dependencies — Quick Reference

### TMS WDW (upstream data source)
| Field | Value |
|-------|-------|
| AG | `web-global-salestickets` |
| CI | WDPRD Ticket Management Service |
| Index | `wdpr-ecommerce` (cluster wdw-ecommerce-S0001479*) |

If EVAS does NOT return VIDs but TMS is healthy → EVAS assembly issue.
If TMS also missing VIDs → problem is upstream (GAM sync delay).

---

## Routing

**Assignment Group:** `web-global-salestickets`  
**sys_id:** cce9aa2e37970ec09194341643990e5e  
**CI:** WDPRD Entitlement-View-Assembly-Service  
**Description:** Standalone Tickets. Ticket config pages, Lexvas, Claiming DLR. Checkout/Renewal → web-global-salescart  
**L2/L3:** DLR: Studio Kaos. WDW: Studio Control

### Key Escalation Groups

| Team | AG | When to escalate |
|------|-----|-----------------|
| GAM | app-global-gam | Profile/account. If failing → impacts TMS WDW |
| MIRS | prd-global-tktsrvcs | TMS MIRS link/unlink |
