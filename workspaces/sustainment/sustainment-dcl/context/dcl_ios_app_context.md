# DCL Navigator iOS — App Context

## Project Overview

- **App:** DCL Navigator iOS (dcl-navigator-ios)
- **Team:** DCL Sustainment Team
- **Jira prefix:** DCLMSUST-
- **Language:** Swift
- **UI framework:** UIKit
- **Architecture:** MVVM-C (Model-View-ViewModel-Coordinator)
- **Package manager:** Swift Package Manager (SPM)
- **CI/CD:** Fastlane / Xcode Cloud

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
dcl-navigator-ios/
├── DCLNavigator/              # Main app target
│   ├── App/                   # AppDelegate, SceneDelegate, AppCoordinator
│   ├── Features/              # Feature modules (MVVM-C per feature)
│   │   ├── Itinerary/
│   │   ├── Booking/
│   │   ├── Dining/
│   │   ├── Excursions/
│   │   └── Account/
│   ├── Core/                  # Shared utilities, extensions, base classes
│   │   ├── Networking/        # API client, request/response models
│   │   ├── Persistence/       # Core Data stack, Keychain wrapper
│   │   └── Extensions/        # UIKit and Foundation extensions
│   └── Resources/             # Assets, Localizable.strings, Info.plist
├── DCLNavigatorTests/         # Unit tests
├── DCLNavigatorUITests/       # UI tests
└── Package.swift              # SPM dependencies (if workspace-level)
```

## Key Dependencies

- Networking: URLSession + Combine / async-await
- Image loading: project-specific or third-party (check Package.swift)
- Analytics: Adobe/Firebase (check project configuration)
- Crash reporting: check project configuration

## Environments

- **Development:** Dev API endpoints, debug logging enabled
- **Staging:** Staging API endpoints, mirrors production config
- **Production:** Production API endpoints, optimized builds

## Team Conventions

- All PRs require at least 1 reviewer
- PRs must pass CI (build + unit tests) before merge
- Base branch: `develop` for features, `main` for hotfixes
- Release branches: `release/<version>`
