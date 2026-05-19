# DLR Order Service — Troubleshooting

## Overview
Core order processing for DLR. Sits between Order VAS and PEOS in the UC path.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=wdpr_core_api source="*west-*:order-service*" ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## Common Issues

### Timeout errors to downstream
- Check PEOS DLR health
- Check Payment Reference service
- Check Config Manager connectivity
- Review: `index=wdpr_core_api source=*us-west*order-service* "Read timed out" "CLIENT_RESP_IN"`

### FAULT_OUT errors
- Check: `index=wdpr_core_api source=*us-west*order-service* FAULT_OUT | spath input=Msg | stats count by error.type`

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
