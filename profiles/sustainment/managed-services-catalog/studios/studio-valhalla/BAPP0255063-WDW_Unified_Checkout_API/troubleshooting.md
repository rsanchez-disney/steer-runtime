# WDW Unified Checkout API — Troubleshooting

## Overview
Backend API layer for WDW consumer checkout. Handles BFF logic between UC SPA and Order VAS.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=wdw_s0001479 source="*uc-api*" ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## Common Issues

### High latency on API responses
- Check downstream Order VAS WDW health
- Check Redis connectivity
- Review ECS task count vs baseline

### 5xx errors spike
- Check ECS service events for task failures
- Review recent deployments
- Check dependency health (Order VAS, PEOS)

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
