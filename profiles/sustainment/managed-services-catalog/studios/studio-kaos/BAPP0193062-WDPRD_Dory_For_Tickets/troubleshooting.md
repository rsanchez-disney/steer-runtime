# Troubleshooting — WDPRD Dory For Tickets

## Query Templates

### Base logs (Production)
```spl
index=wdpr_dory_for_tickets earliest=-1h
```

### Base logs (Lower environments)
```spl
index=wdpr_dory_for_tickets source=*stage* earliest=-1h
```

### Errors only
```spl
index=wdpr_dory_for_tickets ("*error*" OR "*exception*") earliest=-1h
```

### RTA requests
```spl
index=wdpr_dory_for_tickets "RTA" earliest=-24h | stats count by status
```

### RTF requests
```spl
index=wdpr_dory_for_tickets "RTF" earliest=-24h | stats count by status
```

---

## Common Issues

### Issue: RTA/RTF request timeout to downstream system

**Symptoms:** Incognito Service reports failure; Dory logs show timeout connecting to TMS, Booking Service, or CME.

**Root Cause:** Downstream system is unhealthy or experiencing high latency.

**Resolution:**
1. Check health of downstream system (TMS, Booking Service, CME)
2. Verify network connectivity from Dory ECS tasks to downstream endpoints
3. If downstream is healthy, check Dory task resource utilization (CPU/memory)
4. Restart Dory service if tasks appear stuck

---

### Issue: Healthcheck returning non-200

**Symptoms:** ALB marks tasks unhealthy; ECS drains and replaces tasks continuously.

**Root Cause:** Application failed to start properly or lost connectivity to a required dependency.

**Resolution:**
1. Check Splunk for startup errors: `index=wdpr_dory_for_tickets "startup" OR "initialization" earliest=-30m`
2. Verify Vault credentials are accessible
3. Force new deployment if tasks are in a crash loop

---

### Issue: Incognito Service not receiving responses

**Symptoms:** Incognito reports Dory as unresponsive; no errors in Dory logs.

**Root Cause:** Network/DNS issue between Incognito and Dory internal load balancer.

**Resolution:**
1. Verify healthcheck is passing: https://doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck
2. Check ECS task count — ensure desired count > 0
3. Verify internal load balancer DNS resolves correctly

---

## Escalation Decision Tree

- If Dory healthcheck failing → restart service, check Splunk for startup errors
- If downstream system (TMS/Booking/CME) unreachable → escalate to owning team
- If Incognito Service integration issue → escalate to Incognito team
- If infrastructure/ECS issue → check AWS console, escalate to infra if needed

## Known Quirks

- Dory does NOT store personal data — it is a pass-through orchestrator
- Swagger/API docs only available on localhost (not deployed to any environment)
- Unit test coverage is below 80% threshold (known gap)
- The service is internal-only (not internet-facing, no Akamai)
