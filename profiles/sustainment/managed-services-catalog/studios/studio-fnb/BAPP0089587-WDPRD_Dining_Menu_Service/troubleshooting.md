# Troubleshooting — WDPRD Dining Menu Service

## Common Issues

### Issue: Stale menu data displayed

**Symptoms:** Restaurant shows old prices, removed items, or wrong meal periods

**Root Cause:** Menu sync from VenueNext delayed or failed

**Resolution:**
1. Check Splunk: `index=wdpr_diningmenu_service` for sync errors
2. Verify VenueNext menu data is updated (contact VN if needed)
3. Service restart may force cache refresh

---

### Issue: 5xx errors on menu endpoint

**Symptoms:** AppDynamics alerts, mobile app shows "unable to load menus"

**Root Cause:** ECS task unhealthy, memory pressure, or downstream issue

**Resolution:**
1. Check health: `https://dining-menu.wdw.wdprapps.disney.com/diningMenuSvc/healthcheck`
2. Check ECS task status in AWS Console
3. Force new deployment if tasks unhealthy
4. Check CloudWatch logs: commerce2-menu-prod

---

## Escalation Decision Tree

- If menu data incorrect → contact VenueNext for source data
- If service unhealthy → restart ECS, check CloudWatch
- If P1/P2 → DTOC bridge

## Known Quirks

- Legacy (wdpr-apps) cluster being decommissioned — always use revmgmt clusters
- WDW and DLR have separate ECS deployments — check the correct region
