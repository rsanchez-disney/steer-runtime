# Troubleshooting — DLR Dine Admin Tool

## Common Issues

### Issue: Admin UI not loading

**Symptoms:** Cannot access dineadmintool-dlr.wdprapps.disney.com

**Root Cause:** ECS task unhealthy

**Resolution:**
1. Check health endpoints for svc, api, ui components
2. Restart unhealthy services via ECS

---

## Escalation Decision Tree

- If UI issue → restart ECS services
- If config propagation → check DLR DiSCO service

## Known Quirks

- Same as WDW admin tool but deployed to us-west-2
