# DLR Unified Checkout API — Troubleshooting

## Overview
Backend API layer for DLR consumer checkout. Handles BFF logic between UC SPA and Order VAS.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=dlr_s0001477 source="*uc-api*" ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## AP_TO_AP_UPGRADE Flow (Magic Key Upgrade)

UC stack handles all AP-to-AP upgrades (salesFlow: `AP_TO_AP_UPGRADE`):

```
UC SPA → UC API → Order VAS (POST v1/modification-orders → 200)
                → Order Service (POST v2/orders/initializations → 201)
                → Payment Sheet renders on device
                → Guest submits payment
                → Order Service (PUT v2/orders/park-entitlements → calls DTI GW → eGalaxy)
                → PEOS (fulfillment)
```

Key identifiers in UC API logs:
- `conversationId` — in every diagLog entry, correlates full session
- `correlationId` — per-request trace
- Payment session ID — in `payment sheet initializing` log args (`session` field)
- `initializationKey` — returned by Order Service initialization

### "Duck Out" Error
Generic UC SPA error page when backend returns 500. The real error is in **Order Service** or **DTI Gateway**, not in UC API/SPA.

Investigation path for Duck Out:
1. Find `conversationId` in UC API diagLogs (search by VID)
2. Trace to Order Service with same convoId — look for `FAULT_OUT`
3. If `FAILED_TO_BOOK_ENTITLEMENTS` → error is in DTI/eGalaxy (see Order Service troubleshooting)

## Common Issues

### High latency on API responses
- Check downstream Order VAS DLR health
- Check Redis connectivity
- Review ECS task count vs baseline

### 5xx errors spike
- Check ECS service events for task failures
- Review recent deployments
- Check dependency health (Order VAS, PEOS)

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
