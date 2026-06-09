# DCL Navigator Android — App Context

## Project Overview

- **App:** DCL Navigator Android (dcl-navigator-android)
- **Team:** DCL Sustainment Team
- **Jira prefix:** DCLMSUST-
- **Language:** Kotlin
- **UI framework:** Jetpack Compose + XML Views (legacy screens)
- **Architecture:** MVVM (Model-View-ViewModel) with Navigation Component
- **Build system:** Gradle (Kotlin DSL)
- **DI framework:** Hilt (Dagger)
- **CI/CD:** GitHub Actions / Fastlane

## Domain

Disney Cruise Line (DCL) guest-facing mobile app. Features include:
- Cruise itinerary and schedule
- Onboard activity booking
- Dining reservations
- Port excursion booking
- Ship deck maps and wayfinding
- Guest account and folio management
- Push notifications for onboard events

## Repository Structure

```
dcl-navigator-android/
├── app/                               # Main application module
│   ├── src/main/
│   │   ├── java/com/dcl/navigator/    # Source root
│   │   │   ├── app/                   # Application, AppModule (Hilt)
│   │   │   ├── features/             # Feature packages (MVVM per feature)
│   │   │   │   ├── itinerary/
│   │   │   │   ├── booking/
│   │   │   │   ├── dining/
│   │   │   │   ├── excursions/
│   │   │   │   └── account/
│   │   │   ├── core/                  # Shared utilities, extensions, base classes
│   │   │   │   ├── network/           # Retrofit client, interceptors, API models
│   │   │   │   ├── data/             # Room database, DataStore, SharedPreferences
│   │   │   │   └── extensions/        # Kotlin extensions
│   │   │   └── navigation/            # Navigation graph, NavHost setup
│   │   └── res/                       # Resources (layouts, strings, drawables)
│   ├── src/test/                      # Unit tests
│   └── src/androidTest/               # Instrumented / UI tests
├── buildSrc/                          # Shared build logic, dependency versions
├── gradle/                            # Gradle wrapper, version catalog
├── build.gradle.kts                   # Root build file
└── settings.gradle.kts                # Module declarations
```

## Key Dependencies

- Networking: Retrofit + OkHttp + Kotlin Coroutines / Flow
- Image loading: Coil or Glide (check project configuration)
- DI: Hilt (Dagger)
- Persistence: Room + DataStore
- Navigation: Jetpack Navigation Component
- Analytics: Adobe/Firebase (check project configuration)
- Crash reporting: check project configuration

## Environments

- **Development:** Dev API endpoints, debug logging enabled, debug build type
- **Staging:** Staging API endpoints, mirrors production config
- **Production:** Production API endpoints, ProGuard/R8 optimized, release signing

## Team Conventions

- All PRs require at least 1 reviewer
- PRs must pass CI (build + unit tests + lint) before merge
- Base branch: `develop` for features, `main` for hotfixes
- Release branches: `release/<version>`