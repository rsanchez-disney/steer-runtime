# Release Follow-Up Report Reference

## New Relic Dashboard
- **URL:** https://onenr.io/0nQxmpOXpwV
- **Account ID:** 786801

## Required Input Parameters

| Parameter | iOS | Android | Example |
|-----------|-----|---------|---------|
| `appVersion` | ✅ | ✅ | `5.44.0` |
| `appBuild` | — | ✅ | `134000` |
| `buildNumber` | — | ✅ | `11` |
| `buildVariant` | Always `AppStore` | Always `release` | — |
| `SINCE` (release datetime) | ✅ | ✅ | `2026-04-28 12:00:00-0400` |
| `UNTIL` (report end datetime) | ✅ | ✅ | `2026-04-29 12:00:00-0400` |

**Note:** SINCE and UNTIL must include timezone offset (e.g., `-0400` for EST).

---

## Exact NRQL Queries

All queries use `SINCE` and `UNTIL` as time window parameters. Replace the placeholder values with user input.

### iOS Queries

#### iOS Crash Rate Total
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS Total Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS At Home Crash Rate
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' WHERE `state` = 'Pre-Voyage' and buildVariant = 'AppStore' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS At Home Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' WHERE `state` = 'Pre-Voyage' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS Onboard Crash Rate
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' WHERE `state` = 'In-Voyage' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS Onboard Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' WHERE `state` = 'In-Voyage' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS Adoption Rate (Total)
```nrql
SELECT uniqueCount(deviceUuid) FROM Mobile WHERE appName = 'DCL.iOS' and buildVariant = 'AppStore' or buildVariant = 'Release' FACET appVersion SINCE '{since}' UNTIL '{until}'
```

#### iOS Adoption Rate (Onboard)
```nrql
SELECT uniqueCount(deviceUuid) FROM Mobile WHERE appName = 'DCL.iOS' and buildVariant = 'AppStore' or buildVariant = 'Release' and state = 'In-Voyage' FACET appVersion SINCE '{since}' UNTIL '{until}'
```

#### iOS Avg Response Time
```nrql
SELECT average(responseTime) as `Average response time`, percentile(responseTime, 99) as `99th percentile` FROM MobileRequest WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### iOS HTTP Error Rate
```nrql
SELECT percentage(count(*), where errorType = 'HTTPError') AS 'Http Errors Rate %' FROM MobileRequestError, MobileRequest WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' SINCE '{since}' UNTIL '{until}'
```

#### iOS Network Failure Rate
```nrql
SELECT percentage(count(*), where errorType = 'NetworkFailure') AS 'Network Failures Rate %' FROM MobileRequestError, MobileRequest WHERE appVersion = '{appVersion}' and buildVariant = 'AppStore' SINCE '{since}' UNTIL '{until}'
```

---

### Android Queries

#### Android Crash Rate Total
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android Total Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android At Home Crash Rate
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' WHERE `state` = 'Pre-Voyage' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android At Home Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' WHERE `state` = 'Pre-Voyage' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android Onboard Crash Rate
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category = 'Crash') as `Crash rate` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' WHERE `state` = 'In-Voyage' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android Onboard Guest Experience Crash
```nrql
SELECT percentage(uniqueCount(uuid), WHERE category='Crash') as `Users Experiencing a Crash` FROM MobileSession, MobileCrash WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' WHERE `state` = 'In-Voyage' and buildVariant = 'release' WHERE crashFingerprint NOT IN () SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android Adoption Rate (Total)
```nrql
SELECT uniqueCount(deviceUuid) FROM Mobile WHERE appName = 'DCL.Android-RELEASE' and buildVariant = 'release' FACET appVersion SINCE '{since}' UNTIL '{until}'
```

#### Android Adoption Rate (Onboard)
```nrql
SELECT uniqueCount(deviceUuid) FROM Mobile WHERE appName = 'DCL.Android-RELEASE' and buildVariant = 'release' and state = 'In-Voyage' FACET appVersion SINCE '{since}' UNTIL '{until}'
```

#### Android Avg Response Time
```nrql
SELECT average(responseTime) as `Average response time`, percentile(responseTime, 99) as `99th percentile` FROM MobileRequest WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' and buildVariant = 'release' SINCE '{since}' LIMIT 1000 UNTIL '{until}'
```

#### Android HTTP Error Rate
```nrql
SELECT percentage(count(*), where errorType = 'HTTPError') AS 'Http Errors Rate %' FROM MobileRequestError, MobileRequest WHERE appVersion = '{appVersion}' and appBuild = '{appBuild}' and buildNumber = '{buildNumber}' and buildVariant = 'release' SINCE '{since}' UNTIL '{until}'
```

#### Android Network Failure Rate
```nrql
SELECT percentage(count(*), where errorType = 'NetworkFailure') AS 'Network Failures Rate %' FROM MobileRequestError, MobileRequest WHERE appVersion = '{appVersion}' and buildNumber = '{buildNumber}' and appBuild = '{appBuild}' and buildVariant = 'release' SINCE '{since}' UNTIL '{until}'
```


### Top Crashes Queries (ordered by most affected sessions)

Uses `uniqueCount(sessionId)` with `entityGuid` for accurate session-based crash counts.

#### Entity GUIDs

| Platform | entityGuid |
|----------|-----------|
| iOS | `Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1Nzk3NTk3` |
| Android | `Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1OTA4MTEw` |

#### iOS Top 3 Crashes — Total
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1Nzk3NTk3') AND (buildVariant = 'AppStore') AND (appVersion = '{appVersion}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

#### iOS Top 3 Crashes — At Home
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1Nzk3NTk3') AND ((buildVariant = 'AppStore') AND (state = 'Pre-Voyage' OR state = 'Roll-Over' OR state = 'Post-Voyage')) AND (appVersion = '{appVersion}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

#### iOS Top 3 Crashes — Onboard
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1Nzk3NTk3') AND ((buildVariant = 'AppStore') AND (state = 'In-Voyage')) AND (appVersion = '{appVersion}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

#### Android Top 3 Crashes — Total
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1OTA4MTEw') AND (buildVariant = 'release') AND (appVersion = '{appVersion}') AND (appBuild = '{appBuild}') AND (buildNumber = '{buildNumber}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

#### Android Top 3 Crashes — At Home
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1OTA4MTEw') AND ((buildVariant = 'release') AND (state = 'Pre-Voyage' OR state = 'Roll-Over' OR state = 'Post-Voyage')) AND (appVersion = '{appVersion}') AND (appBuild = '{appBuild}') AND (buildNumber = '{buildNumber}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

#### Android Top 3 Crashes — Onboard
```nrql
SELECT uniqueCount(sessionId) FROM MobileSession, MobileCrash WHERE (entityGuid = 'Nzg2ODAxfE1PQklMRXxBUFBMSUNBVElPTnw1OTA4MTEw') AND ((buildVariant = 'release') AND (state = 'In-Voyage')) AND (appVersion = '{appVersion}') AND (appBuild = '{appBuild}') AND (buildNumber = '{buildNumber}') FACET `crashLocation` SINCE '{since}' UNTIL '{until}' LIMIT 3
```

**Note:** Results ordered by `uniqueCount(sessionId)` descending — most affected sessions first.

---

## State Mapping

| Report Segment | NRQL Filter |
|----------------|-------------|
| Total | No state filter |
| At Home | `state = 'Pre-Voyage' OR state = 'Roll-Over' OR state = 'Post-Voyage'` |
| Onboard | `state = 'In-Voyage'` |

## App Names

| Platform | appName |
|----------|---------|
| iOS | `DCL.iOS` |
| Android | `DCL.Android-RELEASE` |

## Report Structure

Each release follow-up report covers **both platforms** (iOS and Android) with identical structure per platform.

### Per Platform Sections
1. **Overview** — all metrics in a summary table
2. **General Crashes** — top 3 crashes (Total) with Jira cross-reference
3. **Crashes At Home** — top 3 crashes (Pre-Voyage) with Jira cross-reference
4. **Crashes Onboard** — top 3 crashes (In-Voyage) with Jira cross-reference
5. **Adoption Rate** — table with top versions by device count (Total + Onboard)

### Crash Analysis Format
Each crash entry:
```
N. [Known/New] [crash/bug], [Jira link] — [crash description]. [Status]. [version range]
```

## Jira Cross-Reference
- Project: **DCLMSUST**
- For each top crash, search Jira for the crash signature or exception name
- If ticket exists: include link + version range + status
- If no ticket: mark as **"New crash — ticket to be created"**

## Mermaid Pie Chart Colors

Use this theme config for all pie charts:
```
%%{init: {'theme': 'base', 'themeVariables': {'pie1': '#ff75ff', 'pie2': '#3dffec', 'pie3': '#ffce5c', 'pie4': '#ff5c8d', 'pie5': '#aa2c8d'}}}%%
```
