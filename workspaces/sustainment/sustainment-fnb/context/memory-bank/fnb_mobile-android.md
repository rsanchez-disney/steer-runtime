# FnB Mobile Android — Memory Bank

> Last updated: 2026-05-12

---

## 1. Repo Map & Domain Ownership

| Repo | Artifact ID | Namespace | Domain |
|------|-------------|-----------|--------|
| `android-fnb-commons-lib` | `android-fnb-commons` | `com.disney.wdpro.fnb.commons` | Shared FnB UI components, analytics, location validation, hybrid support |
| `facility-ui-lib` | `facility-ui` | `com.disney.wdpro.facility` | Facility detail UI, maps, park hours, dining menu display |
| `dine-check-in-android` | `dinecheckin` | `com.disney.wdpro.dinecheckin` | Dine check-in flow (walk-up list, questionnaire, confirmation) |
| `geofence-android-lib` | `geofence-lib` | `com.disney.wdpro.geofence` | Google Play Services geofence wrapper with cascade/multi-feature support |
| `opp-dine-ui-lib` | `opp-dine-ui` | `com.disney.wdpro.opp.dine` | Mobile Order (OPP) full flow: restaurant list, menu, cart, checkout, order status |
| `profile-ui-lib` | `profile-ui` | `com.disney.wdpro.profile` | Profile/auth UI: registration, login, forgot password, payment methods |
| `tarzan-lib` | `tarzan-lib` | `com.disney.wdpro.tarzan` | Campaign Manager: geofence-triggered campaigns, rules engine, notifications |
| `park-apps-monorepo-android` | (monorepo) | varies | Host apps: WDW, DLR, HKDL + shared packages (park-lib, async-messaging, vista-*) |

### Domain Glossary
- **FnB** = Food & Beverage
- **OPP** = Order Pay Pick Up (now called Mobile Order / MO)
- **Dine Check-In** = Table-service restaurant check-in flow (walk-up + reservation)
- **Tarzan** = Campaign Manager — ties geofence events to campaign rules/actions
- **Vista** = Design system components and theme engine used by park apps
- **Async Messaging** = Push/in-app messaging package (Salesforce SDK facade)
- **Park Lib** = Shared park-app utilities consumed by WDW/DLR/HKDL
- **WDW** = Walt Disney World app; **DLR** = Disneyland Resort app; **HKDL** = Hong Kong Disneyland app

---

## 2. Dependency Graph

```
park-apps-monorepo-android (wdw / dlr / hkdl apps)
  └── opp-dine-ui-lib          (local-lib reference in settings.gradle.kts)
        └── android-fnb-commons-lib
              └── facility-ui-lib
                    └── profile-ui-lib (transitive)

tarzan-lib
  └── geofence-android-lib

dine-check-in-android
  └── android-fnb-commons-lib
        └── facility-ui-lib
```

**Key external SDKs consumed by opp-dine-ui-lib:**
- VenueNext: `vncore`, `vnfmdata`, `vnfmdatafacade`, `vnlocationservice`
- Disney Pay: `wdpro.disney.dpay.ui`
- TrustDefender Mobile (fraud detection)

---

## 3. Build System

### Gradle Versions
| Repo | Gradle | Build Script Style | Annotation Processor |
|------|--------|--------------------|----------------------|
| android-fnb-commons-lib | 8.11.1 | Kotlin DSL (.kts) | KSP |
| dine-check-in-android | 8.11.1 | Kotlin DSL (.kts) | KSP |
| geofence-android-lib | 8.11.1 | Kotlin DSL (.kts) | KSP |
| opp-dine-ui-lib | 8.11.1 | Kotlin DSL (.kts) | KSP |
| tarzan-lib | 8.11.1 | Kotlin DSL (.kts) | annotationProcessor |
| park-apps-monorepo-android | 8.11.1 | Kotlin DSL (.kts) | KSP |
| facility-ui-lib | 4.10.2 | Groovy (.gradle) | kapt |
| profile-ui-lib | (older) | Groovy (.gradle) | kapt |

### Java / Kotlin Target
- **Newer repos** (fnb-commons, dine-check-in, geofence, opp-dine, tarzan, park-apps): `JavaVersion.VERSION_17`, `jvmTarget = "17"`
- **Older repos** (facility-ui, profile-ui): `JavaVersion.VERSION_1_8`

### Version Catalogs
- park-apps-monorepo uses `catalog-disney` and `catalog-libs` at version `8.22.0-SNAPSHOT`
- Standalone libs use `libs.versions.*` TOML catalogs + a `wdpro.*` catalog for Disney internal deps
- Key catalog aliases: `libs.plugins.devtool.ksp`, `libs.plugins.kotlin.compose`, `libs.plugins.researchgate.release`, `libs.plugins.maven.publish`

### Publishing
All libraries publish via:
```kotlin
alias(libs.plugins.maven.publish)
alias(libs.plugins.researchgate.release)
release.git.requireBranch = ""   // allows release from any branch
tasks.named("afterReleaseBuild") { dependsOn(":MODULE:publish") }
```
Group: `com.disney.wdpro`

---

## 4. Module Structure (per repo)

```
android-fnb-commons-lib/
  android-fnb-commons/   ← library AAR
  fnb-sample-app-commons/ ← helper module for sample apps
  app/                   ← sample app

facility-ui-lib/
  facility-ui/           ← library AAR
  facility-ui-sample-configs/
  app/

dine-check-in-android/
  dinecheckin/           ← library AAR
  app/

geofence-android-lib/
  geofence-lib/          ← library AAR
  app/

opp-dine-ui-lib/
  opp-dine-ui/           ← library AAR (has Room DB schemas at opp-dine-ui/schemas/)
  app/
  automationTesting/     ← standalone Gradle project for UI automation

profile-ui-lib/
  profile-ui/            ← library AAR
  app/

tarzan-lib/
  tarzan-lib/            ← library AAR
  app/

park-apps-monorepo-android/
  android/
    apps/
      wdw/               ← Walt Disney World app
      dlr/               ← Disneyland Resort app
      hkdl/              ← Hong Kong Disneyland app
    packages/
      park-lib/
      async-messaging/
      vista-components/
      vista-components-legacy/
      vista-theme-engine/
      vista-theme-engine-legacy/
    examples/
      vista-previewer/
      vistapreviewer-legacy/
      async-messaging-sample/
    local-libs/
      opp-din-ui-lib/    ← symlink/path to opp-dine-ui-lib/opp-dine-ui
```

---

## 5. Architecture & Patterns

### Dependency Injection
- **Dagger 2** across all repos (not Hilt)
- Newer repos: `ksp(libs.google.dagger.compiler)` + `ksp(libs.google.dagger.android.processor)`
- Older repos (facility-ui, profile-ui): `kapt`
- Pattern: `@Module` / `@Component` / `@Inject` / `@Provides` / `@IntoMap` for multibinding (used heavily in tarzan and facility-ui)

### UI Layer
- **android-fnb-commons-lib**: Mixed — XML Views + Jetpack Compose (`buildFeatures { compose = true }`)
- **opp-dine-ui-lib**: Mixed — XML Views + Jetpack Compose
- **dine-check-in-android**: XML Views only (`viewBinding = true`)
- **facility-ui-lib**: XML Views (older, no Compose)
- **profile-ui-lib**: XML Views (older)
- **geofence-android-lib**: No UI (service library)
- **tarzan-lib**: No UI (logic library)

### Navigation
- **dine-check-in-android**: Jetpack Navigation Component (`androidx.navigation.safeargs`, nav graphs in `res/navigation/`)
- **opp-dine-ui-lib**: Mix of Activity-based + Compose Navigation
- **android-fnb-commons-lib**: Compose Navigation (`libs.androidx.navigation.compose`)
- **facility-ui-lib**: Activity/Fragment manual navigation

### Data Layer (opp-dine-ui-lib)
- **Room DB**: `MobileOrderDatabase` — schema exported to `opp-dine-ui/schemas/com.disney.wdpro.opp.dine.data.db.MobileOrderDatabase/`
- `ksp.arg("room.schemaLocation", "$projectDir/schemas")`

### Event Bus / Messaging
- **android-fnb-commons-lib**: `FnbCommonsBaseFragment` registers/unregisters from event bus (sticky events)
- **async-messaging**: Salesforce SDK facade for push/in-app messaging

### Analytics
- `FnbCommonsAnalyticsHelper`, `FnbCommonsAnalyticsModel` in android-fnb-commons
- `EventRecorder` / `EventRecorderSecretConfigWrapper` for secure event recording
- NewRelic agent plugin in geofence-android-lib and opp-dine-ui-lib app

---

## 6. Code Conventions

### Naming
- **Package prefix**: `com.disney.wdpro.<feature>` (e.g., `com.disney.wdpro.fnb.commons`, `com.disney.wdpro.opp.dine`)
- **Resource prefix by feature**:
  - `dine_check_in_` — dine-check-in-android
  - `opp_dine_` — opp-dine-ui-lib
  - `mobile_order_` — opp-dine-ui-lib (newer screens)
  - `fnb_` — android-fnb-commons-lib
- **Layout files**: snake_case with feature prefix (e.g., `dine_check_in_questionnaire_fragment.xml`)
- **Drawable files**: snake_case with feature prefix
- **String files**: split by screen/feature (e.g., `opp_dine_strings.xml`, `opp_dine_menu_strings.xml`, `opp_dine_accessibility_strings.xml`)

### Code Style
- Google Java/Kotlin style: `config/codestyles/intellij-java-kotlin-google-style.xml` (present in android-fnb-commons-lib)
- Kotlin compiler flags: `-Xjvm-default=all` (all repos), `-Xopt-in=kotlin.RequiresOptIn` (opp-dine-ui)
- `freeCompilerArgs = listOf("-Xjvm-default=all")`

### Static Analysis
- **detekt**: facility-ui-lib, geofence-android-lib, park-apps (all apps + packages), async-messaging
  - Config: `detekt-config.yml` per module
  - Applied via `detekt.gradle` script
- **SonarQube**: all repos → `https://sonar.cicd.wdprapps.disney.com/`
  - Config in `sonar.gradle` per module
- **Android Lint**: `abortOnError = false` in all repos (warnings don't fail build)

### Testing
- **Unit test framework**:
  - dine-check-in-android: **JUnit 5** (`useJUnitPlatform()`) + MockK + Mockito-Kotlin
  - Others: JUnit 4 + MockK or Mockito
- **Common test deps**: `io.mockk`, `mockito-kotlin`, `kotlinx-coroutines-test`, `androidx.arch.core:core-testing`
- **Robolectric**: used in opp-dine-ui-lib for Compose tests
- **Compose UI tests**: `androidx.compose.ui.test.junit4` (opp-dine-ui, android-fnb-commons)
- **Mock web server**: `square.okhttp3.mockwebserver` (dine-check-in, opp-dine-ui)
- Test coverage: JaCoCo (`jacoco.gradle` scripts), reported to SonarQube

### Comments
- Prefer the comma and dot over the em dash to separate sentences in comments

### Commit messages
- Use the ticket number in square brackets as a prefix for commit messages, like [FNB-XXXX] where XXXX is the actual ticket number

---

## 7. Build Flavors & Source Sets

### App Build Flavors (park-apps-monorepo-android apps: wdw, dlr, hkdl)
| Flavor | Purpose |
|--------|---------|
| `debug` | Development debug build |
| `release` | Production release |
| `dev` | Dev environment (different endpoints) |
| `automation` | Automation testing flavor |
| `debugAutomation` | Debug + automation combined |
| `gqe` | GQE (Quality Engineering) testing |

### WDW App — Multiple Resource Source Sets
The WDW app has feature-specific res directories:
- `src/main/res` — main resources
- `src/main/resDine` — dine-specific overrides
- `src/main/resOpp` — OPP/Mobile Order overrides
- `src/main/resProfile` — profile overrides
- `src/main/resFriend` — friends/social overrides
- `src/main/res-fp` — FastPass overrides
- `src/main/res-park-lib` — park-lib overrides
- `src/main/res-accessibility` — accessibility overrides

---

## 8. CI/CD

### Jenkins (older libs)
- `componentBuild.jenkinsfile` in android-fnb-commons-lib, dine-check-in-android, geofence-android-lib, opp-dine-ui-lib, tarzan-lib
- `pipeline-conf.yaml` for pipeline configuration

### Harness (park-apps-monorepo-android)
- `.harness/` directory with YAML pipelines:
  - `parksappandroidmonorepowdwpipeline.yaml`
  - `parksappandroidmonorepodlrpipeline.yaml`
  - `parksappandroidmonorepohkdlpipeline.yaml`
  - `parksappandroidmonorepopackagepipeline.yaml`
  - `parksappandroidmonorepopublishpackagepipeline.yaml`
  - `androidcopybarapipeline.yaml` (Copybara sync)
- Input sets per pipeline for PR and branch triggers

### Copybara
- `scripts/copybara/` — sync scripts for android, flutter, iOS, android-migration

---

## 9. Key Classes & Concepts

### android-fnb-commons-lib
- `FnBFinderDetailsActivity` — facility detail activity with custom header/nav
- `FnbCommonsBaseFragment` — base fragment with event bus support
- `ViewModelFactory` — DI-friendly ViewModel factory
- `FnbCommonsAnalyticsHelper` / `FnbCommonsAnalyticsModel` — analytics
- `EventRecorder` / `EventRecorderSecretConfigWrapper` — event recording
- `DisneyVisaDiscountDisclaimerView` — custom view
- `BaseDividerDA` — RecyclerView divider delegate adapter
- `BaseTypeConverter` — Room/data type converter base
- Location validation: Activities, Fragments, ViewModels in `location/` package

### dine-check-in-android
- Namespace: `com.disney.wdpro.dinecheckin`
- Flows: pre-check-in, check-in questionnaire, walk-up list, confirmation
- Nav graphs: `pre_check_in_navigation.xml`, `check_in_navigation.xml`, `walk_up_list_navigation.xml`
- Lottie animation: `check_in_confirmation_animation.json`

### opp-dine-ui-lib
- Namespace: `com.disney.wdpro.opp.dine`
- Room DB: `MobileOrderDatabase`
- Key screens: restaurant list/map, menu (categories/products), cart, review & purchase, order detail, arrival windows, plan balance
- Lottie animations: order states (active, being_prepared, ready, inactive), cart interstitial, tutorial
- Custom fonts: `inspiretwdc_roman.ttf`, `inspiretwdc_heavy.ttf` (Disney brand font)
- Terms & Conditions HTML assets per park (WDW, DLR)
- VenueNext SDK integration for ordering backend

### geofence-android-lib
- `GeofenceIntentService` — add/remove geofences
- `GeofenceComponentProvider` — app-level interface to provide DI component
- `GeofenceHandler` — receives ENTER/EXIT events (injected via `@IntoMap @StringKey`)
- `GeofenceModule` — Dagger module to include in app component
- Cascade geofences: creates child geofences on enter, removes on exit

### tarzan-lib
- `Campaign` — defines action + rules
- `Rule` — validation logic (e.g., `DateTimeRangeRule`, `OrRule`)
- `CampaignManager` / `CampaignManagerImpl` — orchestrates validation + execution per feature ID
- `CampaignProvider` — client-defined, injected via `@IntoMap @StringKey("groupId")`
- `CampaignGeofenceHandler` — ties geofence events to CampaignManager
- `NotificationCampaign` — sample campaign implementation

### facility-ui-lib
- `FinderDetailsActivity` — facility detail screen
- `FinderDetailConfiguration` / `DefaultFinderDetailConfiguration` — configures sections per facility type
- `FacilitySection` — section type constants
- `DelegateAdapter` — adapter for each section type
- `ParkHoursActivity` — park hours with TODAY/PARK_HOURS tabs
- `MapProvider` / `GoogleMapProvider` — map abstraction (Google/Baidu)
- `FacilityConfig` — interface for host app configuration

---

## 10. Inter-Repo Contracts & Integration Points

### Library Publishing (for remote consumption)
- All libs publish to Disney's internal Maven (Nexus/Artifactory)
- Consumed via `wdpro.*` version catalog entries (e.g., `wdpro.disney.android.fnb.commons`, `wdpro.disney.facility.ui`)
- Version catalog: `com.disney.wdpro:catalog-disney:8.22.0-SNAPSHOT`

### Disney Internal Dependencies (wdpro catalog)
Common internal deps referenced across repos:
- `wdpro.disney.analytics` — analytics SDK
- `wdpro.disney.log` — logging SDK
- `wdpro.disney.android.ref.commons` — reference commons
- `wdpro.disney.support.lib` — support utilities
- `wdpro.disney.facility.ui` — facility-ui-lib
- `wdpro.disney.profile.ui` — profile-ui-lib
- `wdpro.disney.android.fnb.commons` — android-fnb-commons-lib
- `wdpro.disney.geofence.lib` — geofence-android-lib
- `wdpro.disney.booking.services` — booking/reservation services
- `wdpro.disney.itinerary.cache` — itinerary caching
- `wdpro.disney.dpay.ui` — Disney Pay UI
- `wdpro.disney.oauth.http.client` — OAuth HTTP client
- `wdpro.disney.support.hansel` — Hansel (A/B testing / feature flags)
- `wdpro.disney.ref.unify.messaging` — unified messaging

---

## 11. Proguard / Consumer Rules
- All libs have `proguard-rules.pro` and `consumer-rules.pro`
- `consumer-rules.pro` is typically empty (consumers handle their own rules)
- `isMinifyEnabled = false` in all library release builds

---

## 12. Notable Files & Patterns

### `.github/copilot-instructions.md`
- Present in `opp-dine-ui-lib/.github/copilot-instructions.md` — contains AI coding instructions specific to that repo

### `dependencies.gradle.kts`
- Present in `dine-check-in-android/` and `opp-dine-ui-lib/` — centralizes version variables for VenueNext SDK and other deps
- Applied via `apply(from = "../dependencies.gradle.kts")`

### `sonar.gradle` / `sonar_submodule.gradle`
- Per-module SonarQube configuration
- Excludes: `**/model/**`, `**/FacilityUIModule.*`, res files
- Coverage binaries path configured for both Java and Kotlin classes

### `jacoco.gradle` / `jacoco-common.gradle`
- JaCoCo coverage configuration
- `enableUnitTestCoverage = false` in debug builds (must be enabled manually for coverage runs)

### `pipeline-conf.yaml`
- Lightweight CI pipeline config (Jenkins trigger config)

### `CODEOWNERS`
- Present in android-fnb-commons-lib, dine-check-in-android, geofence-android-lib, opp-dine-ui-lib, tarzan-lib
- `.github/CODEOWNERS` in park-apps-monorepo-android

### `pull_request_template.md`
- Present in all repos under `.github/`

---

## 13. Quick Reference: Common Tasks

### Add a new dependency to a newer lib (KSP era)
```kotlin
// In build.gradle.kts
dependencies {
    api(wdpro.disney.some.lib)           // Disney internal
    implementation(libs.some.third.party) // from libs catalog
    ksp(libs.google.dagger.compiler)      // annotation processing
}
```

### Add a new dependency to facility-ui-lib (kapt era)
```groovy
// In build.gradle
dependencies {
    api "com.disney.wdpro:some-lib:$version"
    kapt "com.google.dagger:dagger-compiler:$disney_di_google_dagger_version"
}
```

### Run tests
```bash
./gradlew test                    # unit tests
./gradlew connectedAndroidTest    # instrumented tests
./gradlew :MODULE:test            # specific module
```

### Release a library
```bash
./gradlew release   # triggers researchgate release plugin → publishes AAR
```

### Build the monorepo WDW app
```bash
cd park-apps-monorepo-android/android
./gradlew :apps:wdw:assembleDebug
```
