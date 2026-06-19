# wdpr-dine-checkin (Dine Mobile Check-in) — Architecture Guide

## Module Structure

```
WDPRDineCheckin/
├── Bricks/                         # Public entry points (*Brick files)
├── Configuration/
│   └── Dependencies/               # DependencyManager + @Dependency wrapper
├── Core/
│   ├── Services/
│   │   ├── Workers/
│   │   │   ├── Checkin/            # Check-in workers
│   │   │   └── Walkup/            # Walk-up workers
│   │   ├── Generated/             # Auto-generated from schemas
│   │   └── WorkerProtocol+Extension.swift
│   ├── Models/                     # Domain models, DTOs
│   ├── Protocols/                  # Core protocols
│   └── Multiplatform/             # KMP interop
├── Modules/                        # Feature modules
│   ├── Checkin/                    # Check-in flow
│   ├── Walkup/                    # Walk-up lists
│   │   ├── Home/
│   │   ├── List/
│   │   ├── Initialization/
│   │   ├── Availability/
│   │   ├── Conflict/
│   │   └── Restaurant Details/
│   ├── Questionnaire/             # Check-in questionnaire
│   ├── Podium/                    # Podium flow
│   ├── Deeplink/                  # DineCheckinDeeplinkHandler
│   ├── Error/                     # Error views
│   └── DebugMenu/                 # Debug tools
├── Utils/
│   ├── Logging/                   # Local + remote logging
│   ├── RemoteConfiguration/       # Remote dynamic values
│   ├── DeepLinking/               # Deep link utilities
│   ├── Location/                  # Location services
│   ├── Analytics/                 # Analytics helpers
│   ├── Protocols/                 # Shared protocols
│   ├── Adapters/                  # Adapter pattern implementations
│   └── Extensions/                # Utility extensions
├── Extensions/                     # Top-level extensions
├── Reusable/                       # Reusable UI components
├── Resources/                      # Assets, localization
└── Info.plist

WDPRDineCheckinTests/               # Unit tests
├── Modules/
├── Core/
├── Workers/
├── Mocks/                          # SwiftierMocky generated mocks
└── TestCode/

Example/                            # Demo/debug host app
dine-checkin-service-call-schemas/  # API schema definitions + code generator
dine-checkin-mocking-bird-data/     # MockingBird API mock data
Mockfile                            # SwiftierMocky configuration
```

## Architecture Pattern

Uses a **flexible VIPER-inspired** pattern. Unlike wdpr-dine-opp's strict VIPER folder structure, modules here vary in organization depending on complexity.

### Common patterns in modules:

- **Wireframes** handle navigation and assembly (e.g., `WalkupInitializationWireframe`, `WalkupConflictWireframe`)
- **Interactors** handle business logic (e.g., `WalkupInitializationInteractor`, `PreCheckinInteractor`)
- **Controllers** serve as presenter-like coordinators (e.g., `WalkupHomeController`, `WalkupConflictController`)
- **ViewControllers** handle UI (e.g., `WalkupHomeViewController`, `WalkupConflictViewController`)
- **Builders** assemble complex module configurations (e.g., `CheckInWireframeBuilder`, `WalkupListBuilder`)

Modules are organized by **feature subdomain** rather than strict VIPER layers:

```
Modules/Walkup/
├── Home/           # Home screen (Wireframe + Controller + Interactor + VC)
├── List/           # Restaurant list (Builder + UI)
├── Initialization/ # Setup flow (Wireframe + Interactor + Controller + VC)
├── Availability/   # Availability checks
├── Conflict/       # Conflict resolution (Wireframe + Controller + Interactor + VC + ViewModel)
└── Restaurant Details/
```

### MVVM (SwiftUI — new screens)

New SwiftUI features use MVVM with ViewModels injected via `@Dependency`.

## Key Entry Points

### Bricks

Files in `WDPRDineCheckin/Bricks/` are the **public entry points**:

| Brick                        | Purpose                |
|------------------------------|------------------------|
| `WDPRDiningWalkUpBrick`      | Walk-up check-in entry |
| `WDPRDiningWalkUpListsBrick` | Walk-up lists entry    |

### Deep Links

Deep links are **not handled directly** by this module. The flow is:

1. `wdpr-dine-reservations` receives the deep link via its `NavigationProvider`
2. `NavigationProvider` calls `DineCheckinDeeplinkHandler` (at `Modules/Deeplink/DineCheckinDeeplinkHandler.swift`)
3. `DineCheckinDeeplinkHandler` routes to the appropriate view/wireframe

This means dine-checkin does not own deep link parsing — it only exposes `DineCheckinDeeplinkHandler` as the entry point for external navigation.

## Dependency Injection

**Strategy:** `@Dependency` property wrapper + `DependencyManager` singleton, with constructor injection below.

### `@Dependency` Property Wrapper

```swift
@Dependency var settings: SettingsProtocol
```

The `@Dependency` wrapper lazily resolves from `DependencyManager.instance.resolve()` on first access.

### `DependencyManager`

Located at `Configuration/Dependencies/DependencyManager.swift`. A singleton service locator that registers all app dependencies:

```swift
internal final class DependencyManager {
    static let instance = DependencyManager()

    private init() {
        add(Settings.instance as SettingsProtocol)
        add(LocationSettingsWorker() as LocationSettingsWorkerProtocol)
        add(WalkUpListsViewModel())
        add(FacilityDataSource.instance as FacilityDataSourceProtocol)
        // ... all dependencies
    }
}
```

### Convention

> **Resolve from `DependencyManager` (via `@Dependency`) only at the highest level possible** — Wireframes, Builders, or top-level entry points. From there, pass dependencies down via constructor injection. This keeps lower-level objects (Interactors, ViewModels) testable without coupling to the service locator.

## Navigation

Navigation is handled by **Wireframes** and **Builders**:

- Wireframes create and present view controllers
- Builders assemble complex module configurations (e.g., `CheckInWireframeBuilder`)
- Deep links resolved by `DineCheckinDeeplinkHandler` → dispatched to correct Wireframe/Builder

## Networking

### Workers

Located in `WDPRDineCheckin/Core/Services/Workers/`. Workers are organized by feature domain:

**Check-in workers (`Workers/Checkin/`):**

| Worker                           | Purpose                 |
|----------------------------------|-------------------------|
| `CheckinSearchReservationWorker` | Search for reservations |
| `CheckinStatusWorker`            | Get check-in status     |
| `SubmitCheckinWorker`            | Submit check-in         |

**Walk-up workers (`Workers/Walkup/`):**

| Worker                          | Purpose                    |
|---------------------------------|----------------------------|
| `GetWaitTimesWorker`            | Fetch wait times           |
| `GetWalkupReservationsWorker`   | Fetch walk-up reservations |
| `AddWalkupReservationWorker`    | Add to walk-up list        |
| `CancelWalkupReservationWorker` | Cancel walk-up reservation |

**Other:**

| Worker                   | Purpose                 |
|--------------------------|-------------------------|
| `LocationSettingsWorker` | Location-based settings |

### Worker Protocol Chain

Unlike OPP, this repo does have a base protocol chain:

```
WorkerProtocol (base — Core/Services/WorkerProtocol+Extension.swift)
       ↓
QuestionnaireWorkerProtocol (extends WorkerProtocol — shared worker behavior)
       ↓
Individual workers (conform to QuestionnaireWorkerProtocol + own protocol)
```

Each worker also defines its own protocol (e.g., `SubmitCheckinWorkerProtocol: AutoMockable`) used for DI and mocking.

### Code Generation

Codable model files in `Core/Services/Generated/` are auto-generated from JSON schema definitions.

**Schema location:** `dine-checkin-service-call-schemas/schemas/`

**Generate command** (run from project root):

```bash
./dine-checkin-service-call-schemas/scripts/generate-classes.swift ios swift ./dine-checkin-service-call-schemas ./WDPRDineCheckin/Core/Services/Generated
```

**Workflow:**
1. Edit or add a JSON schema in `dine-checkin-service-call-schemas/schemas/`
2. Run the generate command above
3. If new files were generated, add them to the `.xcodeproj`

## Pre-Build Steps

Before building the project, always run these steps on changed files:

1. **Regenerate models** — if any JSON schema in `dine-checkin-service-call-schemas/schemas/` was added or modified, run the generate command (see Code Generation section). Add any new files to the `.xcodeproj`.
2. **Regenerate mocks** — if any new or modified protocol has `AutoMockable` conformance, run `swiftiermocky generate` to update the generated mock files.
3. **Format changed files** — run `xcrun swift-format format --in-place` on all modified files.

## Notable Conventions

- **Bricks** = public API entry points (files named `*Brick`)
- **`DineCheckinDeeplinkHandler`** = deep link entry point (called by wdpr-dine-reservations)
- Modules organized by feature subdomain, not strict VIPER layers
- `@Dependency` resolved only at Wireframe/Builder level — constructor injection below
- All worker protocols marked `AutoMockable` for SwiftierMocky generation
- Workers conform to `QuestionnaireWorkerProtocol: WorkerProtocol`
- Generated service code lives in `Core/Services/Generated/`
