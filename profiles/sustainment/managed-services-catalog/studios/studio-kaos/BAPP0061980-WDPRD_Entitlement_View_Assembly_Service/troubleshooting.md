# Troubleshooting — EVAS (Entitlement View Assembly Service)

## Query Templates

### By SWID (DLR)
```spl
search index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2*" ecs_task_definition="evas*" "{SWID}" earliest=-7d | head 20
```

## Key Points

- If EVAS does NOT return the VID(s) → EVAS assembly issue, needs escalation.
- EVAS reads from TMS — if TMS is healthy but EVAS missing VIDs, it's an EVAS problem.
- If TMS returns ZERO → problem is upstream, not EVAS.

## Dependencies

| Direction | Service | Relationship |
|-----------|---------|-------------|
| Data source | tms-dlr | Reads ticket data from TMS |

## Escalation

- Assignment Group: `web-global-salestickets`
- CI: WDPRD Entitlement-View-Assembly-Service


---

## External Dependencies — Quick Reference

### TMS DLR (upstream data source)
| Field | Value |
|-------|-------|
| AG | `web-global-salestickets` |
| CI | WDPRD Ticket Management Service |
| Index | `dlr_tms` (source=*int*) |

If EVAS does NOT return VIDs but TMS is healthy → EVAS assembly issue.
If TMS also missing VIDs → problem is upstream (eGalaxy sync delay).

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
| eGalaxy DLR | app-cadlr-galaxy | If failing: TMS DLR, CME DLR, DTI, Pended Orders |
| MIRS | prd-global-tktsrvcs | TMS MIRS link/unlink |
