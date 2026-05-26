# DLR Order View Assembler Service — Troubleshooting

## Overview
UC order orchestration for DLR consumer purchases. Sits between UC API and Order Service.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=wdpr_dlr_ordervas ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## Common Issues

### Timeout errors to downstream services
- Check Order Service DLR health
- Check TMS DLR health
- Check Config Manager connectivity
- Review `index=wdpr_dlr_ordervas "Read timed out" "CLIENT_RESP_IN"`

### Freeze capacity errors
- Check Entitlement Capacity Service
- Review: `index=wdpr_dlr_ordervas "Unable to freeze capacity event due to inventory no longer available"`

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
