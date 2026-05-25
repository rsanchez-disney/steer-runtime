# DLR Unified Checkout SPA — Troubleshooting

## Overview
Guest-facing frontend for DLR consumer purchases, mods, Genie+/LL, AP upgrades.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=dlr_s0001477 msg=*UC::SPA* source="*uc-*prod*" ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## Common Issues

### SPA not loading / blank page
- Check ECS task health
- Verify CDN/Akamai is not blocking
- Check recent deployments

### Payment session errors
- Check Payment Sheet service health
- Verify conversation ID flow

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
