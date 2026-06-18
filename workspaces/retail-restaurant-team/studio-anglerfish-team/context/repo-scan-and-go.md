# Scan-and-Go (Merchandise Mobile Checkout) — Architecture Guide

## Module Structure

```
ScanAndGo/
├── Brick/                          # Public entry point
│   └── ScanAndGoBrick.swift
├── Dependencies/                   # DependencyProvider (protocol + implementation)
├── Deeplinking/
│   ├── ScanAndGoNavigationProvider.swift  # Deep link routing
│   └── RootWireframe.swift                # Root navigation assembly
├── Modules/                        # Feature modules
│   ├── Scanner/                    # Barcode/QR scanning
│   │   ├── Router/                 # Navigation routers
│   │   ├── ViewModel/             # Scanner view models
│   │   ├── Views/                 # UIKit views
│   │   └── Models/                # Scanner models
│   ├── ShoppingCart/              # Cart management
│   │   ├── ViewModels/
│   │   ├── Views/
│   │   └── Models/
│   ├── LandingPage/               # Store selection landing
│   │   ├── Services/
│   │   ├── ViewModels/
│   │   ├── Views/
│   │   ├── Models/
│   │   └── Mappers/
│   ├── StoreSelection/            # Store picker
│   ├── Checkout/                  # Payment flow
│   ├── Confirmation/              # Order confirmation
│   ├── PurchaseHistory/           # Past purchases
│   ├── PriceChecker/              # Price checker feature
│   ├── FindMerch/                 # Find merchandise
│   ├── Tutorial/                  # Onboarding tutorial
│   ├── ManualEntry/               # Manual barcode entry
│   ├── TermsAndConditions/        # T&C display
│   ├── Initialization/            # Setup/bootstrapping
│   ├── DebugMenu/                 # Debug tools
│   └── Common/                    # Shared module code
├── Services/
│   ├── Orchestration/             # Orchestration API client
│   └── RemoteConfiguration/       # Remote dynamic values
│       ├── MapStrategy/
│       ├── Copy/
│       ├── Models/
│       └── Settings/
├── Storage/                        # Cart state persistence
├── Location/                       # Geolocation services
├── Mocks/                          # Manual mock implementations
├── Extensions/                     # Swift extensions
├── Utils/                          # Shared utilities
├── Settings/                       # App settings
├── Shared/                         # Shared components
├── Resources/                      # Assets, localization
├── Localization/                   # String catalogs
└── Icons.xcassets/                 # Icon assets

ScanAndGoTests/                     # Unit tests
ScanAndGoDemo/                      # Demo/debug host app
Scripts/                            # Build scripts (swift-format)
```

## Architecture Pattern

Uses **MVVM + Wireframe** pattern — simpler than OPP's VIPER since there's no separate Interactor layer.

### Module Structure

```
Views (UIKit/SwiftUI) → ViewModel → Service → API
                              ↑
                          Wireframe (navigation + assembly)
```

Modules are organized with:
- **Wireframes** — navigation and module assembly (e.g., `ScanToCartWireframe`, `ShoppingCartWireframe`, `LandingPageWireframe`)
- **ViewModels** — business + presentation logic (e.g., `ShoppingCartViewModel`, `ScannerViewModel`)
- **Routers** — sub-navigation within a module (e.g., `ScanToCartScannerRouter`, `PriceCheckerScannerRouter`)
- **Views** — UIKit views and view controllers
- **Models** — domain models and analytics

### Key difference from OPP/Checkin:
No Interactor or Presenter layer. ViewModels talk directly to services.

## Key Entry Points

### Brick

Single entry point: **`ScanAndGoBrick`** at `ScanAndGo/Brick/ScanAndGoBrick.swift`.

Supports multiple features via deep link subfeatures:
- `mobile-checkout` — Scan & Go main flow
- `price-checker` — Price checker
- `find-merchandise` — Find merchandise

### Deep Links

`ScanAndGoNavigationProvider` at `ScanAndGo/Deeplinking/ScanAndGoNavigationProvider.swift` handles all deep link routing.

Subfeatures (deep link paths):

| Subfeature        | Destination      |
|-------------------|------------------|
| `stores`          | Store list       |
| `cart`            | Shopping cart    |
| `pricechecker`    | Price checker    |
| `purchasehistory` | Purchase history |
| `scanner`         | Scanner view     |

`RootWireframe` serves as the root navigation assembler.

## Dependency Injection

**Strategy:** Constructor injection via `DependencyProviderProtocol` (same pattern as wdpr-dine-opp).

```swift
protocol DependencyProviderProtocol {
    var orchestrationService: OrchestrationServiceProtocol { get }
    var facilityDataSource: FacilityDataSourceProtocol { get }
    var geolocationModule: GeolocationModuleProtocol { get }
    var authenticationHelper: AuthenticationHelperProtocol { get }
    var settings: SettingsProtocol { get }
    var remoteContent: RemoteContentProtocol { get }
    var storage: StorageAPI { get }
    var logger: SNGEventLoggerProtocol { get }
    var remoteLoggerFactory: RemoteLoggerFactoryProtocol { get }
    var paymentSheetFactory: PaymentSheetViewModelCreator { get }
    var tutorialFactory: TutorialViewModelFactory { get }
    // ... additional deps
}
```

- `ScanAndGoBrick` holds the `DependencyProvider` and passes it to `RootWireframe`
- Wireframes receive `DependencyProviderProtocol` and inject into ViewModels via constructor

## Navigation

Handled by **Routers** (preferred) and **Wireframes** (legacy):

- **Routers** are the preferred naming convention for navigation classes in this repo
- Some modules still use Wireframes (recently added, e.g., `LandingPageWireframe`, `ShoppingCartWireframe`) — these follow the same pattern but use the older naming
- Scanner module uses Routers for context-specific navigation (`ScanToCartScannerRouter`, `PriceCheckerScannerRouter`, `ShoppingCartScannerRouter`)
- `RootWireframe` is the initial navigation coordinator

> **Convention:** New navigation classes should be named `*Router`, not `*Wireframe`.

## Networking

### Orchestration Service

Primary API client at `ScanAndGo/Services/Orchestration/`:

| File                                 | Purpose                |
|--------------------------------------|------------------------|
| `OrchestrationServiceProtocol.swift` | API contract           |
| `OrchestrationService.swift`         | Implementation         |
| `OrchestrationService+Combine.swift` | Combine extensions     |
| `OrchestrationService+Async.swift`   | async/await extensions |
| `OrchestrationRequest.swift`         | Request building       |

All API calls go through `OrchestrationServiceProtocol`. No separate worker pattern — the orchestration service handles all endpoints.

## State Management

### Cart Persistence

Located in `ScanAndGo/Storage/`:

| File                         | Purpose                          |
|------------------------------|----------------------------------|
| `StorageAPI.swift`           | Storage protocol                 |
| `UserDefaultsStorage.swift`  | UserDefaults implementation      |
| `CartStateRestoration.swift` | Cart recovery after app relaunch |

## Remote Configuration

Same pattern as OPP — `Services/RemoteConfiguration/` with `MapStrategy/`, `Copy/`, `Models/`, `Settings/`.

## Mocking (Tests)

**Manual mocks** in `ScanAndGo/Mocks/` — this repo uses hand-written mock implementations (e.g., `+Mocks.swift` extensions, `Dummy*` classes) rather than SwiftierMocky auto-generation.

No `Mockfile` present — mocks are created manually.

## Dependency Management

- **SPM packages** managed via Xcode (stored in `.xcodeproj`)
- **Sharon** (legacy, deprecated): `Sharon.toml` at repo root
- Key dependencies: `FNBShared`, `WDPRFinderUI`

## Pre-Build Steps

Before building the project, always run these steps on changed files:

1. **Format changed files** — run `xcrun swift-format format --in-place` on all modified files.

## Notable Conventions

- **`ScanAndGoBrick`** = single public entry point for all features
- **`ScanAndGoNavigationProvider`** = deep link routing
- **MVVM + Wireframe** — no Interactor/Presenter layer, ViewModels talk directly to services
- **Routers** in Scanner module handle context-specific navigation (scan-to-cart vs price-checker vs shopping-cart)
- **`OrchestrationService`** = single API client for all network calls (no workers)
- **Manual mocks** — hand-written `+Mocks.swift` extensions, not auto-generated
- Cart state persisted via `StorageAPI` / `UserDefaultsStorage`
