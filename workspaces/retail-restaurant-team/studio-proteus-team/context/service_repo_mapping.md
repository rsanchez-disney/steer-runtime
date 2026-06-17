# Service → Repository Mapping — Studio Proteus

## Android Libraries

| Library | Repo | Local Path | Module | Version | Purpose |
|---------|------|------------|--------|---------|---------|
| Mobile Order UI | opp-dine-ui-lib | ~/dev/opp-dine-ui-lib | `:opp-dine-ui` | 9.0.0-SNAPSHOT | UI logic for Mobile Order feature (restaurant selection, menu, order flow) |
| Scan & Go (MMC) | scan-and-go-lib | ~/dev/scan-and-go-lib | `:scan-and-go-lib` | 9.0.0-SNAPSHOT | Mobile Merchandise Checkout |
| Dine Check-In | dine-check-in-android | ~/dev/dine-check-in-android | `:dinecheckin` | 8.23.0-SNAPSHOT | Dine Check-In and Walk-Up List |
| FnB Commons | android-fnb-commons-lib | ~/dev/android-fnb-commons-lib | `:android-fnb-commons` | 9.0.0-SNAPSHOT | Shared FnB UI, utilities, analytics, location validation |

## Consuming Applications

Libraries are consumed by the park apps monorepo:

| App | Path | Gradle Task |
|-----|------|-------------|
| WDW Park App | `$PARK_APPS_REPO/android/apps/wdw` | `:apps:wdw:assembleDebug` |
| DLR Park App | `$PARK_APPS_REPO/android/apps/dlr` | `:apps:dlr:assembleDebug` |

## Dependency Coordinates

| Library | Maven Coordinate |
|---------|-----------------|
| Mobile Order UI | `com.disney.wdpro:opp-dine-ui:x.x.x` |
| Scan & Go | `com.disney.wdpro:scan-and-go-lib:x.x.x` |
| Dine Check-In | `com.disney.wdpro:dinecheckin:x.x.x` |
| FnB Commons | `com.disney.wdpro:android-fnb-commons:x.x.x` |

## Build Commands

```bash
# Build & test a library
./gradlew clean build

# Run unit tests
./gradlew testDebugUnitTest

# Publish to local Maven for park app integration testing
./gradlew :<module>:publishToMavenLocal
```
