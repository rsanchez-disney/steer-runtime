# NewRelic Mobile Crash Analysis — NRQL Reference

## Event Types

| Event | Purpose |
|---|---|
| `MobileCrash` | Individual crash occurrences with stack trace info |
| `MobileSession` | App sessions (for normalization / crash-free rate) |

## Key Attributes (MobileCrash)

### Crash Identification
| Attribute | Type | Description |
|---|---|---|
| `crashFingerprint` | string | Unique identifier for a crash type (use for grouping/matching across versions) |
| `crashException` | string | Exception class (e.g., `NSInvalidArgumentException`, `java.lang.NullPointerException`) |
| `crashMessage` | string | Exception message text |
| `crashLocation` | string | Full crash location string |
| `crashLocationClass` | string | Class where crash occurred |
| `crashLocationMethod` | string | Method where crash occurred |
| `crashLocationFile` | string | File where crash occurred |
| `crashLocationLineNumber` | numeric | Line number |
| `exceptionMessage` | string | Detailed exception message |

### App Context
| Attribute | Type | Description |
|---|---|---|
| `appName` | string | App identifier (e.g., `WDW-MDX.iOS`, `DLR.Android`) |
| `appVersion` | string | Version string (e.g., `8.22.1`) |
| `appBuild` | string | Build number |
| `AppEnvironment` | string | Environment tag |
| `buildVariant` | string | Build variant (DEBUG/RELEASE) |
| `bundleId` | string | App bundle identifier |

### Device & OS
| Attribute | Type | Description |
|---|---|---|
| `osName` | string | Operating system (iOS/Android) |
| `osVersion` | string | OS version |
| `deviceModel` | string | Device model |
| `deviceManufacturer` | string | Device manufacturer |
| `architecture` | string | CPU architecture |

### Session & Behavior
| Attribute | Type | Description |
|---|---|---|
| `sessionId` | string | Unique session ID |
| `lastInteraction` | string | Last screen/interaction before crash |
| `interactionHistory` | string | Interaction history |
| `sessionDuration` | numeric | Session duration in seconds |
| `timeSinceLastInteraction` | numeric | Time since last interaction |
| `isFirstOccurrence` | boolean | First time this crash was seen |
| `nativeCrash` | boolean | Whether it's a native (non-Flutter) crash |

### Custom Attributes (Disney-specific)
| Attribute | Type | Description |
|---|---|---|
| `Property` | string | Park/property identifier |
| `DartVersion` | string | Dart/Flutter version |
| `LaunchType` | string | App launch type |
| `MajorVersion` | string | Major version grouping |
| `containerVersion` | numeric | Container/module version |

---

## Essential Queries

### 1. Discover Available Versions
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' 
FACET appVersion 
SINCE 14 days ago 
LIMIT 10
```

### 2. Crash-Free Rate
```nrql
SELECT percentage(uniqueCount(sessionId), WHERE category != 'Crash') AS 'crashFreeRate' 
FROM MobileSession 
WHERE appName = '{app}' AND appVersion = '{version}' 
SINCE {time_window}
```

### 3. Total Sessions (for normalization)
```nrql
SELECT uniqueCount(sessionId) AS 'sessions' 
FROM MobileSession 
WHERE appName = '{app}' AND appVersion = '{version}' 
SINCE {time_window}
```

### 4. Crashes Grouped by Fingerprint
```nrql
SELECT count(*), latest(crashException), latest(crashMessage), latest(crashLocationClass), latest(crashLocationMethod), latest(lastInteraction) 
FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
FACET crashFingerprint 
SINCE {time_window} 
LIMIT 100
```

### 5. Crash Detail (for a specific fingerprint)
```nrql
SELECT count(*), latest(crashException), latest(crashMessage), latest(crashLocation), latest(lastInteraction), latest(osVersion), latest(deviceModel) 
FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' AND crashFingerprint = '{fingerprint}' 
SINCE {time_window}
```

### 6. Crash Trend Over Time
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
TIMESERIES 1 day 
SINCE {time_window}
```

### 7. Top Crashes by Device
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
FACET deviceModel 
SINCE {time_window} 
LIMIT 10
```

### 8. Native vs Flutter Crashes
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
FACET nativeCrash 
SINCE {time_window}
```

### 9. Crashes by Last Interaction (screen)
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
FACET lastInteraction 
SINCE {time_window} 
LIMIT 20
```

### 10. New Crashes (first occurrence in time window)
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' AND isFirstOccurrence = true 
FACET crashFingerprint, crashException 
SINCE {time_window} 
LIMIT 50
```

### 11. Crash Trend for Specific Fingerprint
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' AND crashFingerprint = '{fingerprint}' 
TIMESERIES 1 day 
SINCE {time_window}
```

### 12. Crashes Grouped by Package (for ownership)
```nrql
SELECT count(*) FROM MobileCrash 
WHERE appName = '{app}' AND appVersion = '{version}' 
FACET crashLocationClass 
SINCE {time_window} 
LIMIT 50
```

---

## Comparison Strategy

### Matching Crashes Between Versions

Use `crashFingerprint` as the primary key to match crashes:
- Same fingerprint in both versions = same crash, compare rates
- Fingerprint only in pre-release = NEW crash
- Fingerprint only in in-market = RESOLVED crash

### Rate Calculation

```
crash_rate = (crash_count / unique_sessions) * 100
```

### Worsened Threshold

A crash is "worsened" when:
```
pre_release_rate / in_market_rate > 2.0
```

AND the pre-release count is >= 5 (significance threshold).

### Volume Caveat

Pre-release environments typically have 10-100x fewer sessions than production. Account for this by:
1. Using rates (not raw counts) for comparison
2. Noting when pre-release session count is < 1000 (low confidence)
3. Flagging crashes with < 5 occurrences as "insufficient data"

---

## Available Apps

| NewRelic appName | Platform | Park |
|---|---|---|
| WDW-MDX.iOS | iOS | Walt Disney World |
| WDW-MDX.Android | Android | Walt Disney World |
| DLR.iOS | iOS | Disneyland Resort |
| DLR.Android | Android | Disneyland Resort |
| HKDL.iOS | iOS | Hong Kong Disneyland |
| HKDR.Android | Android | Hong Kong Disneyland |
| DCL.iOS | iOS | Disney Cruise Line |
| DCL.Android-RELEASE | Android | Disney Cruise Line |
| Play.iOS | iOS | Play Disney Parks |
| Play.Android | Android | Play Disney Parks |
| SHDR.iOS | iOS | Shanghai Disney Resort |

---

## Ownership Mapping

Map `crashLocationClass` package prefix to responsible team:

| Package prefix | Owner Team |
|---|---|
| `com.disney.wdpro.photopasslib`, `com.disney.wdpro.photopasscommons` | PhotoPass |
| `com.disney.wdpro.paymentsui`, `com.disney.wdpro.commercecheckout`, `com.disney.wdpro.commerce_hybrid_ui` | Payments/Commerce |
| `com.disney.wdpro.ma.orion` | Orion/Flutter Trips |
| `com.disney.wdpro.park.finder`, `com.disney.wdpro.facilityui` | Finder/Maps |
| `com.disney.wdpro.dinecheckin` | Dine/F&B |
| `com.disney.wdpro.profile_ui`, `com.disney.wdpro.family_and_friends_ui` | Profile/Identity |
| `com.disney.dpep_profile` | DPEP Profile |
| `com.disney.wdpro.aligator` | Aligator (Navigation) |
| `com.disney.chassis_permissions` | Chassis/Platform |
| `com.disney.wdpro.park.httpclient` | Platform/Networking |
| `com.disney.wdpro.recommender` | Recommendations |
| `com.disney.wdpro.bookingservices` | Booking Services |
| `com.lyokone.location` | Location plugin (Flutter community — 3rd party) |
| `com.airbnb.lottie` | Lottie (3rd party animation) |
| `com.couchbase.lite` | Couchbase (3rd party DB) |
| `com.venuenext` | VenueNext (3rd party POS) |
| `android.app`, `android.os` | Android Framework / OS-level |

> Note: This mapping should be updated as teams change. If a class doesn't match any prefix, the agent flags it as "Unknown — needs triage".
