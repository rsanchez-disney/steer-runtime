# wdpr-dine-opp (Mobile Order) — Architecture Guide

## Module Structure

```
WDPRDineOPP/
├── Bricks/                         # Public entry points (*Brick files)
├── Core/
│   ├── Dependencies/               # DependencyProvider + factories
│   ├── Protocols/
│   │   └── Services/               # ServicesProtocol (worker composition)
│   ├── Services/
│   │   ├── Workers/                # Network workers (API calls)
│   │   ├── ArrivalWindows/         # Arrival window service logic
│   │   ├── Menu/                   # Menu service logic
│   │   ├── DinePlans/              # Dine plan service logic
│   │   ├── Authorization/          # Auth services
│   │   ├── Promotions/             # Promotion services
│   │   ├── LocationSettings/       # Location services
│   │   └── Generated/              # Auto-generated from schemas
│   ├── Models/                     # Domain models, DTOs
│   ├── Manager/                    # App-level managers
│   ├── Multiplatform/              # KMP interop
│   ├── Initialization/             # Setup/bootstrapping
│   ├── Publishers/                 # Combine publishers
│   └── Utils/                      # Core utilities
├── Modules/                        # Feature modules (VIPER)
│   ├── Menu/
│   ├── MenuItemDetail/
│   ├── Cart/
│   ├── CartOptimization/
│   ├── Orders/
│   ├── ActiveOrders/
│   ├── OrderDetails/
│   ├── Confirmation/
│   ├── RestaurantList/
│   ├── RestaurantListFilters/
│   ├── RestaurantDetails/
│   ├── ChooseArrivalWindow/
│   ├── ChangeArrivalWindow/
│   ├── InventoryCheck/
│   ├── MenuPrerequisite/
│   ├── MenuInitialization/
│   ├── DineMenu/
│   ├── DinePlan/
│   ├── DInePlanOptions/
│   ├── CurrentPromotions/
│   ├── AllergiesSubMenu/
│   ├── Initialization/
│   ├── Map/
│   ├── Interstitial/
│   ├── SpecialEvent/
│   ├── TermsAndConditions/
│   ├── OfferDetails/
│   ├── DiscountFAQ/
│   ├── MediaStory/
│   ├── Error/
│   ├── DebugMenu/
│   ├── Root/
│   └── Shared/
├── SwiftUI/                        # Shared SwiftUI components
│   ├── Views/                      # Reusable views
│   ├── ViewModifiers/              # Custom modifiers
│   ├── Styles/                     # Button/progress styles
│   ├── Extensions/                 # SwiftUI extensions
│   ├── UIViewRepresentable/        # UIKit bridges
│   └── Misc/                       # Helpers
├── Utils/
│   └── DeepLink/                   # NavigationProvider
├── LiveActivity/                   # Live Activity extension logic
├── Campaigns/                      # Campaign handling
├── Resources/                      # Assets, localization
└── Info.plist

WDPRDineOPPTests/                   # Unit tests
├── Modules/                        # Tests per module
├── Core/                           # Core logic tests
├── Models/                         # Model tests
├── Bricks/                         # Brick tests
├── Mocks/                          # SwiftierMocky generated mocks
├── Utils/                          # Test utilities
└── MockingBirdCollection.swift     # Mock data collection

Example/                            # Demo/debug host app
MOWidgetExtension/                  # iOS widget extension
mobile-order-service-call-schemas/  # API schema definitions + code generator
Mockfile                            # SwiftierMocky configuration
```

## Architecture Pattern

The repo uses a **modified VIPER** for UIKit screens and **MVVM** for SwiftUI screens.

### VIPER (UIKit — majority of codebase)

```
UserInterface (View) → Presenter → Interactor → Worker → API
                            ↑
                        Wireframe (navigation + assembly)
```

Each module in `Modules/` follows this folder structure:

```
Modules/<Feature>/
├── Interactor/
├── Presenter/
├── Wireframe/
└── UserInterface/
```

| Component         | Responsibility                                                  |
|-------------------|-----------------------------------------------------------------|
| **UserInterface** | UI rendering, delegates user actions to Presenter               |
| **Presenter**     | Presentation logic, formats data for the View, calls Interactor |
| **Interactor**    | Business logic, orchestrates Workers                            |
| **Wireframe**     | Navigation, module assembly, dependency injection               |

### MVVM (SwiftUI — new screens)

```
SwiftUI View → ViewModel → Worker → API
```

New features use MVVM. The ViewModel handles presentation and business logic, injected with dependencies via the constructor.

### Coexistence

- VIPER modules are the majority (legacy + established features)
- New screens are built in SwiftUI with MVVM
- Wireframes can present both UIKit VIPER modules and SwiftUI views (via `UIHostingController`)

## Key Entry Points

### Bricks

Files in `WDPRDineOPP/Bricks/` are the **public entry points** for all functionality:

| Brick               | Purpose                        |
|---------------------|--------------------------------|
| `RestaurantsBrick`  | Restaurant list entry          |
| `MenuBrick`         | Menu browsing entry            |
| `OrderCardBrick`    | Order card display (dashboard) |
| `ViewDineMenuBrick` | Dine menu viewing              |
| `OrderDetailsBrick` | Order details entry            |
| `OrdersBrick`       | Orders list entry              |

### Deep Links

`NavigationProvider` at `WDPRDineOPP/Utils/DeepLink/NavigationProvider.swift` handles all OPP deep link routing, dispatching to the correct Wireframe.

## Dependency Injection

**Strategy:** Constructor injection via a layered protocol chain.

### Protocol Chain

```
Individual WorkerProtocol (e.g., GetAvailabilityWorkerProtocol)
       ↓
ServicesProtocol (composes all worker protocols)
       ↓
DependencyProviderProtocol (exposes services + all other deps)
       ↓
Wireframe (holds DependencyProviderProtocol, injects into modules)
```

### ServicesProtocol

Located at `Core/Protocols/Services/ServicesProtocol.swift`. Composes individual worker protocols:

```swift
protocol ServicesProtocol: AutoMockable,
    GetAvailabilityWorkerProtocol,
    FreezeArrivalWindowsWorkerProtocol,
    MenuWorkerProtocol,
    LocationSettingsWorkerProtocol,
    InventoryCheckWorkerProtocol
{ ... }
```

### DependencyProviderProtocol

Located at `Core/Dependencies/DependencyProvider.swift`. Exposes:

```swift
protocol DependencyProviderProtocol: AutoMockable {
    var services: ServicesProtocol { get }
    var settings: SettingsProtocol { get }
    var errorFactory: ErrorViewModelFactoryProtocol { get }
    var eventReporter: EventReporterProtocol { get }
    var dataStorage: DataStorageProtocol { get }
    var facilityDataSource: FacilityDataSourceProtocol { get }
    var remoteContent: RemoteContentProtocol { get }
    var multiplatformAnalytics: MultiplatformAnalytics { get }
    var clock: Clock { get }
    var manager: ManagerProtocol { get }
    var liveActivityFactory: LiveActivityFactoryProtocol { get }
    var paymentSheetViewModelFactory: PaymentSheetViewModelFactoryProtocol { get }
    // ... additional factories and trackers
}
```

### Injection Flow

Wireframes hold `DependencyProviderProtocol` and inject only the relevant protocol into each consumer. Consumers see only the API they need:

```swift
final class CartWireframe {
    private let dependencyProvider: DependencyProviderProtocol

    func presentCart(from parent: UIViewController) {
        let interactor = CartInteractor(
            services: dependencyProvider.services,
            dataStorage: dependencyProvider.dataStorage
        )
        let presenter = CartPresenter(interactor: interactor)
        let view = CartViewController(presenter: presenter)
        parent.navigationController?.pushViewController(view, animated: true)
    }
}
```

## Mocking (Tests)

Uses [SwiftierMocky](https://github.disney.com/studio-anglerfish/SwiftierMocky) (same API as [SwiftyMocky](https://github.com/MakeAWishFoundation/SwiftyMocky)).

- Configuration in `Mockfile` at repo root
- Generated mocks in `WDPRDineOPPTests/Mocks/`
- All protocols marked `AutoMockable` get auto-generated mocks

```swift
let mockServices = ServicesProtocolMock()

Given(mockServices, .fetchOrder(.any, willReturn: .success(.mock)))

let interactor = CartInteractor(services: mockServices, dataStorage: mockDataStorage)

Verify(mockServices, .once, .fetchOrder(.value("order-123")))
```

## Navigation

Navigation is handled by **Wireframes**:

- Each module in `Modules/` has a `Wireframe/` folder
- Wireframes hold `DependencyProviderProtocol` and inject dependencies into new modules
- Deep links resolved by `NavigationProvider` → dispatched to correct Wireframe
- Wireframes present both UIKit view controllers and SwiftUI views (via `UIHostingController`)

## Networking

All network classes live in **`WDPRDineOPP/Core/Services/`**.

### Workers

Located in `Core/Services/Workers/`. Each worker handles a specific API domain:

| Worker                   | Purpose                      |
|--------------------------|------------------------------|
| `OrderWorker`            | Order CRUD operations        |
| `SubmitOrderWorker`      | Order submission             |
| `GetOrderTotalWorker`    | Order total calculation      |
| `GetAvailabilityWorker`  | Availability checks          |
| `InventoryCheckWorker`   | Inventory validation         |
| `RecommendationWorker`   | Menu recommendations         |
| `LocationSettingsWorker` | Location-based settings      |
| `GetOrdersWorker`        | Fetch guest orders           |
| `RejectOrderWorker`      | Order rejection/cancellation |

Workers conform to `WorkerProtocol` (extended in `WorkerProtocol+Extension.swift`). Workers are the only objects that make network calls.

### Code Generation

Codable model files in `Core/Services/Generated/` are auto-generated from JSON schema definitions. **Use this whenever a Worker needs a new Codable request or response model.**

**Schema location:** `mobile-order-service-call-schemas/schemas/`

#### When to use

When adding or modifying a Codable object used by a Worker (request parameters, response models), define it as a schema JSON rather than writing Swift manually.

#### Schema format

Each JSON file defines one or more `Codable` types under the `Services.*` namespace:

```json
{
    "version": "3.0",
    "dataTypes": [
        {
            "fullyQualifiedName": "Services.<Domain>.<TypeName>",
            "properties": [
                {
                    "name": "propertyName",
                    "fullyQualifiedDataType": "String",
                    "description": "What this property represents"
                }
            ]
        }
    ]
}
```

- File name must match the namespace: `Services.Orders.Submit.json` → types under `Services.Orders.Submit`
- Supported types: `String`, `Int`, `Double`, `Bool`, `Date`, optionals (`String?`), arrays (`[Type]`), nested types (`Services.Domain.NestedType`)

#### Workflow

1. **Update `Services.swift`** — if adding a new domain or sub-namespace, add the corresponding `enum` to `WDPRDineOPP/Core/Services/Services.swift`:
   ```swift
   internal enum Services {
       internal enum MyNewDomain {
           internal enum Response {}
       }
   }
   ```

2. **Create or edit the schema JSON** in `mobile-order-service-call-schemas/schemas/` (e.g., `Services.MyNewDomain.json`)

3. **Run the generator** (from project root):
   ```bash
   ./mobile-order-service-call-schemas/scripts/generate-classes.swift ios swift ./mobile-order-service-call-schemas ./WDPRDineOPP/Core/Services/Generated
   ```

4. **Add new generated files** to the `.xcodeproj` if they don't already exist

## State Management

Two approaches coexist during the VN SDK replacement migration.

### Legacy (master) — `MobileOrderSession`

The `MobileOrderSession` holds all state for the ordering flow. It wraps the session created by the VenueNext SDK.

- **Contains:** Guest profile, menu, settings, restaurant context
- **Lifecycle:** Can be initialized at multiple points in the flow
- **Mutability:** Restaurant-specific data is injected/removed as the guest navigates between restaurants
- **Scope:** Shared across the entire ordering flow

### New (feature/VNSDKReplacement) — `FacilitySession`

Replaces `MobileOrderSession` with a cleaner lifecycle model.

- **`FacilitySession`** — Contains all information for a single purchase flow at a specific restaurant
- **`FacilitySessionBuilder`** — Creates the session when a guest selects a restaurant
- **`MobileOrderContext`** — Holds information not tied to a restaurant (guest profile, global settings)
- **Lifecycle:** Created on restaurant selection, destroyed on purchase completion or restaurant change

**Migration status:** `feature/VNSDKReplacement` will replace the legacy approach. New code should target the `FacilitySession` pattern.

## Dependency Management

- **SPM packages** managed via Xcode (stored in `.xcodeproj`)
- **Sharon** (legacy, deprecated — will be removed soon): `Sharon.toml` at repo root
- Key dependencies: `FNBShared`, `WDPRFinderUI`, `WDPRItinerary`, `VNCoreDisney`

## Logging

### Remote Logging (New Relic)

Remote loggers live in `WDPRDineOPP/Utils/Logging/RemoteLogger/`. Each logger is registered in `RemoteLoggerFactory`, which is exposed via `DependencyProviderProtocol`. Classes request the specific logger they need from the factory.

### Local Logging

Uses `LoggableProtocol`. Usage:

```swift
Logger.loggerForModule(.manager).debug("VNWebsocket status: new")
```

## Remote Configuration

Dynamic values are fetched from a remote database. Code lives in `WDPRDineOPP/Utils/RemoteConfiguration/`.

### Structure

```
Utils/RemoteConfiguration/
├── MapStrategy/            # Parsing logic per feature
│   └── RemoteCopyMapStrategy.swift
├── Copy/
│   └── Copy.swift          # Struct holding parsed copy values
└── ...
```

### Map Strategy Pattern

Each `MapStrategy` parses remote JSON into a typed struct, replacing `nil` values with defaults:

```swift
static func makeAvailableNowCopy(
    from serviceResponse: RemoteScreensCopy? = nil
) -> Copy.RestaurantList.ASAPFilters.Filter {
    // Maps remote values, falls back to defaults for any nil
}
```

> **Important:** The `serviceResponse` parameter must always be optional. This ensures default values are applied even when remote values are missing or the remote document fails to load.

## Pre-Build Steps

Before building the project, always run these steps on changed files:

1. **Regenerate models** — if any JSON schema in `mobile-order-service-call-schemas/schemas/` was added or modified, run the generate command (see Code Generation section). Add any new files to the `.xcodeproj`.
2. **Regenerate mocks** — if any new or modified protocol has `AutoMockable` conformance, run `swiftiermocky generate` to update the generated mock files.
3. **Format changed files** — run `xcrun swift-format format --in-place` on all modified files.

## Notable Conventions

- **Bricks** = public API entry points (files named `*Brick`)
- **NavigationProvider** = all deep link routing
- VIPER modules live in `Modules/<Feature>/` with subfolders: `Interactor/`, `Presenter/`, `Wireframe/`, `UserInterface/`
- All protocols marked `AutoMockable` get SwiftierMocky-generated mocks
- SwiftUI ViewModels use `@Observable` (new code) or `ObservableObject` (existing)
- Wireframes are the only objects allowed to create other modules
- Workers are the only objects allowed to make network calls
- Generated service code lives in `Core/Services/Generated/` (from schema definitions)
