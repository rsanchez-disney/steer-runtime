# Runbook — DLP Mobile App

## Health Check URLs

| Environment | URL |
|-------------|-----|
| PROD | Health Check endpoint |
| STAGE | Health Check endpoint |
| LOAD | Health Check endpoint |
| LATEST | Health Check endpoint |

## Monitoring

### AppDynamics Dashboards

| Environment | Platform | Dashboard |
|-------------|----------|-----------|
| PROD | Android | AD-AAB-ABJ-AFD |
| PROD | iOS | AD-AAB-ABJ-AFE |
| STAGE/LOAD | Android | Same link (depends on App Bundle ID) |
| STAGE/LOAD | iOS | Same link (depends on App Bundle ID) |

> **Note:** STAGE and LOAD dashboard links are the same — the environment is determined by the App Bundle ID.

### Alerts

- **AD-AAB-ABJ-AFD** → Mobile App Android
- **AD-AAB-ABJ-AFE** → Mobile App iOS

---

## Restart Procedures

1. Identify affected component (Android app, iOS app, or BFF Core backend)
2. For BFF Core: force new deployment on ECS service
3. For mobile app: app-side issues require new build/release via GitLab

**Validation:** Check health endpoints and AppDynamics dashboards for recovery.

---

## Scaling

- **Scale up:** Increase BFF Core ECS task count for backend capacity
- **Scale down:** Reduce task count (maintain minimum for HA)

## Failover

- Individual features can be disabled if their backend service is down (e.g., OLCI, Digital Key)
- BFF Core handles graceful degradation for unavailable downstream services

## Rollback

- Mobile app: rollback via app store release management (GitLab DLP APP)
- BFF Core: redeploy previous version via CI/CD pipeline
- Follow Merge Request Guidelines for promotion procedures

## Contacts for External Dependencies

| System | BAPP | When to Engage |
|--------|------|----------------|
| OLCI V2 | BAPP0211386 | Check-in failures |
| Digital Key | BAPP0220148 | Room access / Bluetooth issues |
| BFF Core | BAPP0245900 | Backend API failures |
| Notification Service | BAPP0225827 | Push notification delivery issues |
| Keyring | BAPP0177699 | Digital pass / ticket issues |
| Tridion Content API | — | Content display issues |
| AppDynamics | — | Monitoring / alerting issues |

## Local Development

- Local setup procedures are documented in the team wiki
- Refer to the local setup procedures page for environment configuration
