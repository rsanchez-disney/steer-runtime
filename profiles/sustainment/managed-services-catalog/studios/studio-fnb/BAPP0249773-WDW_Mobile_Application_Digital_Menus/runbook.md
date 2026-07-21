# Runbook — WDW Mobile Application Digital Menus

## Restart Procedures

1. Mobile apps do not have server-side restart — issues are typically backend-related
2. If app crash loop: check New Relic for crash reports
3. If backend issue: escalate to appropriate backend service team

**Validation:**
- New Relic crash-free rate > 99.5%
- Backend health checks passing

---

## Scaling

- **Scale up:** N/A — mobile app scales with user installs
- **Scale down:** N/A

## Failover

- App falls back to cached data when backend unavailable
- Feature flags via Canopy can disable broken features

## Rollback

- Emergency: disable feature via Canopy feature flag
- App update: coordinate with Shield team for emergency app release

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Shield (App Shell) | Shield team | App-level crashes, deployment issues |
| Backend (MOO/ROO) | prd-global-fnb | Backend service failures |
| Canopy | Feature flag team | Emergency feature disable |
