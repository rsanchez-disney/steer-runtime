# Studio Shield — Team Context

## Team Overview

Studio Shield is the core team for the 3 main park mobile apps (DLR, WDW and HKDL), in Android and iOS. This team is responsible for the maintenance of the core functionality, as well as implementation of new feature in the core area that give support to other LOBs for Maps, core data (Couchbase), Finder, Navigation.
this team is also responsible for feature integrations, 3rd party version control and alignment, security and release.

**Jira Prefix**: AEXP-, IEXP-, COREEXP-
**ServiceNow Assignment Group**: app-global-finderm

## Applications supported

| Application  | short name | BAppId |
|--------------|------------|--------|
| **Disney World** | MDX/WDW | BAPP0012593 |
| **Disneyland** | DLR | BAPP0015425 |
| **Disneyland Hong Kong** | HKDL | BAPP0106525 |

## Repositories

| Repo | Tech | Purpose |
|------|------|---------|
| https://github.disney.com/dx-park-apps/park-apps-monorepo-android | Android | Application level monorepo for Android applications  |
| https://github.disney.com/dx-park-apps/park-apps-monorepo-ios | iOS | Application level monorepo for iOS applications  |

## Tech Stack

- **iOS applications**: swift, Flutter
- **Android applications**: Java, kotlin, Flutter
- **CI/CD**: Jenkins 
- **Source Control**: GitHub Enterprise (github.disney.com)
- **Artifact Repository**: Nexus3
- **Crash reporter**: NewRelic

## Monitoring & Observability
- **KPI dashboard**: https://liveops.wdprapps.disney.com/d/liveops/liveops-parks-overview?orgId=1


## Code Quality

| Service | SonarQube |
|---------|-----------|
| Android | [SonarQube](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Patrick-Binkley_Android) |
| iOS | [SonarQube](https://sonar.cicd.wdprapps.disney.com/portfolio?id=Patrick-Binkley_iOS) |
