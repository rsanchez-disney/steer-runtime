# 🚨 Alert Runbooks — Beast Team

> **Per-app investigation steps, Splunk queries, and known issues now live in the App Knowledge Bank.** Load the relevant app file with `#<repo-name>` for detailed runbook steps. Use `#app-knowledge-index` (global/user-level steering file) to find the right file.

## Alert → App Mapping

Use this table to identify which app knowledge bank file to load when an alert fires. For Splunk indexes and query templates, see `#splunk-reference`.

| Alert Name | App Knowledge File | Priority |
|---|---|---|
| EPS-TRIDION-HIGH-ERROR-RATE | `#wdpr-dlp-ecommerce-cme-elig` / `#wdpr-dlp-ecommerce-cme-res` | P4 |
| Virtual Queue errors | `#wdpr-dlp-is-operations-virtual-queue-provider` | P3-P4 |
| DPAU/DPAO 500 errors | `#wdpr-dlp-is-operations-pea-attraction-provider` | P3 |
| TMS JVM high CPU | `#wdpr-dlp-is-guest-tms-ticket-management-service-provider` | P3 |
| Ticket Linking errors | `#wdpr-dlp-is-guest-tms-tickets-linking-provider` | P3-P4 |
| OLCI Police Form errors | `#wdpr-dlp-is-lodging-pms-registration-form-provider` | P3 |
| Digital Key errors | `#wdpr-dlp-is-sales-srv-digital-key-provider` | P3 |
| Opera I/O errors | `#wdpr-dlp-is-lodging-pms-registration-form-provider` / `#wdpr-dlp-is-sales-srv-digital-key-provider` | P3-P4 |
| Magic Mobile QRC errors | `#wdpr-dlp-is-lodging-bma-magic-mobile-provider` | P3 |
| MySQL RDS CPU trending | N/A (infrastructure — see `#global-infra` (global/user-level steering file)) | P4 |
| DPE Notification delays | `#wdpr-dlp-is-common-email-notification-service` | P4 |
| BIO Wait Times down | `#wdpr-dlp-is-operations-bio-wait-times-provider` | P3 |
| Mobile App Crash | N/A (AppDynamics — see below) | P2-P3 |
| Mobile App Network/HTTP | N/A (AppDynamics — see below) | P3-P4 |

## Cross-Cutting Runbooks

These runbooks apply across multiple apps and don't belong to a single knowledge bank file.

### EPS-TRIDION-HIGH-ERROR-RATE

This alert name is misleading — "Tridion" doesn't mean Tridion is the problem. Content API exposes content + data from batches (Surqual). Multiple root causes possible:

- **Wrong market language from mobile app** — Check `Accept-Language` header in the request
- **Surqual batch issues** — Ask Kim Bertrand in #dlp-surqual-batch-issue Slack channel
- **Tridion content sync** — Escalate to `app-frdlp-web`

Quick investigation:
1. Click "View results in Splunk" from the alert
2. Use the conversation ID to trace the full request
3. Check if the error is 500 (server) or 4xx (client/data)

Related: INC25385809, APP-34337, APP-34693

### Mobile App Alerts — Crash (AppDynamics)

1. Click "View Event" → see alert conditions (crash rate exceeded)
2. Click "View dashboard during health rule violation"
3. Check crash rate indicator → see crash locations (functions/libraries)
4. Note which app version is causing crashes (recent release?)
5. Check "crash rate by app version" for version-specific impact
6. Click eye icon on specific error → see total crashes + impacted users
7. Click "View Session" → see user timeline leading to crash

### Mobile App Alerts — Network/HTTP Errors (AppDynamics)

Initial focus: device code (AD-AAB-ABJ-AFD=Android, AD-AAB-ABJ-AFE=iOS), Network Request, error name.

1. ACK the alert with "checking" comment
2. Open alert link (preserves time window)
3. Check Network Requests dashboard: errors in blue (network) or red (HTTP)
4. Network errors may correlate with traffic load
5. HTTP errors may correlate with business transactions
6. Use "View Related Snapshots" or "View Analyze" to drill down
7. Navigate to Sessions to trace events before error
8. Look for bundled errors (persistent) vs isolated (intermittent)

### Redis/ElastiCache Incident Runbook

Investigation steps in order:
1. Is traffic reaching the cache? → Check NetworkBytesIn/Out, CurrConnections
2. Is cache accepting connections? → Check CurrConnections, NewConnections
3. Is cache serving data effectively? → Check CacheHitRate, CacheHits, CacheMisses
4. Is cache node saturated? → Check CPUUtilization, EngineCPUUtilization
5. Which subsystem is bottleneck? → Memory (DatabaseMemoryUsage, SwapUsage), CPU, Connections, Network
6. Replication issues? → ReplicationLag, IsMaster, MasterLinkHealthStatus
7. Regression or cold-start? → Compare against baseline after deployment/restart

Key thresholds:
- CPU > 80-90% sustained → investigate
- EngineCPU > 50-60% → approaching single-thread saturation
- SwapUsage > 0 → immediate investigation
- MemoryFragmentationRatio > 1.5 → significant fragmentation
- CacheHitRate < 90% → investigate

## Assignment Groups Reference

> For **external system** AGs (Galaxy, Opera, TravelBox, Lineberty, etc.), contacts, and escalation paths, use `#external-systems-index` (global/user-level steering file).

### DLP Internal Service → Assignment Group Mapping

| Service | AG | Notes |
|---|---|---|
| Claims SPA, CME, Avail Calendar, PACS, Notification Service | app-frdlp-ARS | Our AG |
| CloudOps / SE DLP | ops-frdlp-CloudOps | bio-wait-times-provider down → reach ITOC + CloudOps |
| Mobile App, Shows RVA/SYS | app-frdlp-BaseAPP, app-frdlp-attraction-dge | |
| OLCI, Digital Key, Magic Mobile | app-frdlp-BookDine, app-frdlp-food-dge, app-frdlp-resort-dge | Special comms: contact app-frdlp-hotel-system |
| TMS, EPS, Keyring, Ticket Linking, Wallet | app-frdlp-GuestProfile | |
| Book Dine | app-frdlp-food-dge | P3→ engage Mobile Oncall |
| RMA (Surqual/PYM) | prd-global-dlp-RMA | Products config, BIO data |
| Magic Mobile Manager | app-frdlp-spid | Team: BMAX |

## Command Center Checklist (High-Visibility Events)

### Alert Thresholds
| Severity | Criteria | Action |
|---|---|---|
| 🟢 Healthy | < 5% error rate | Continue normal monitoring |
| 🟠 Degraded | 5xx > 5% OR p95 latency > 2× baseline for 5 min | Investigate, note in report |
| 🔴 Critical | Service down OR 5xx > 25% OR complete order failure | Immediate escalation, bridge call |

### Monitoring Categories
- Entering the Park: Wallet, Ticket Linking, TMS, Park Entry
- Account Management: Keyring, Guest Membership, Guest Extended Profile, CRM, Activity Block
- Resort: OLCI, Digital Key
- Attractions & Shows: DPAU, DPAO, Virtual Queue, ORION, EPS, Meet & Greet
- Food: Book Dine, Mobile Order
- Maps: MAPS Services
- Mobile App: Crashes, API error rates, load times

### Key Rule
⚠️ For different report cadences (30min vs 2hr), create SEPARATE Splunk alerts. Do NOT modify cron schedule mid-event — Splunk cache doesn't always reflect changes in real time.
