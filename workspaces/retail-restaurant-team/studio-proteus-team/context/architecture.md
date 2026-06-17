# Architecture & Project Structure — Studio Proteus

## Architecture Overview

All repos are Android libraries (Kotlin + Java) built on top of the Disney park platform (MDX). They follow MVVM as the primary pattern, with legacy MVP code in opp-dine-ui-lib.

- **Language**: Kotlin (primary), Java (legacy code)
- **DI**: Dagger 2 (subcomponents per feature)
- **Async**: Kotlin Coroutines + Flow
- **UI**: XML layouts (Views) + Jetpack Compose (new screens)
- **Testing**: JUnit 4 + MockK, `runTest`, Turbine for Flow

---

## opp-dine-ui-lib (Mobile Order UI)

**Package**: `com.disney.wdpro.opp.dine`
**Architecture**: MVVM (new features) + MVP (legacy entry points)

### Package Structure

```
opp.dine/
├── activity/          # MVP — OppDineActivity (main entry) + OppDineActivityPresenter/View
├── mvvm/              # MVVM features (new code lives here)
│   ├── core/          # Base classes: MobileOrderBaseFragment, theme, Compose components
│   ├── home/          # Restaurant list + map (presentation/domain/data/reporting)
│   ├── menu/          # Menu screen (presentation/domain/monitoring/adapter)
│   ├── product/       # Product/item detail (presentation/domain/model/adapter)
│   ├── cart/          # Cart (presentation/domain)
│   ├── cart_shared/   # Shared cart domain (use_case/data/repository)
│   ├── order_summary/ # Checkout summary (presentation/domain/monitoring)
│   ├── launcher/      # Buy flow launcher (presentation/domain/data/handler)
│   ├── restaurant/    # Finder details activity (presentation/domain)
│   ├── my_orders/     # My orders list (presentation/domain)
│   ├── dine_plan_cart/# Dine plan cart (presentation/domain/monitoring/reporting)
│   ├── dine_plan_options/ # Dine plan options (presentation/domain/model/di)
│   └── [other screens]# change_arrival_window, offers, promo, balance, etc.
├── common/            # MVP base classes, OppSession, OppConfiguration, shared data
│   ├── data/          # copy/, config/, gallery/ — content providers
│   ├── buy_flow/      # MVP BuyFlowPresenter
│   └── kaleidoscope/  # Feature config (Kaleidoscope)
├── service/           # Service managers (MobileOrderManager, VnManager, ArrivalWindowManager)
│   └── manager/       # Impl classes + RecyclerModelMapper
├── data/              # Data layer
│   ├── services/      # API clients (order/, arrival/)
│   └── db/            # Room database (MobileOrderDatabase)
├── ui/                # Shared UI models and adapters (not feature-specific)
│   ├── model/         # RecyclerView models (95+ classes)
│   ├── adapter/       # Shared delegate adapters
│   └── widget/        # Custom views
├── cart_loader/       # MVP — CartLoaderFragment + Presenter/View
├── restaurant_closed/ # MVP — RestaurantClosedErrorFragment + Presenter/View
├── order/details/     # MVP — OrderDetailFragment + OrderDetailPresenter/View
├── menu_list/         # Legacy menu list (services/model/adapters)
├── analytics/         # Screen analytics managers
├── monitoring/        # New Relic event recorders per screen
├── di/                # Dagger component + modules (OppDineComponent, OppDineModule)
└── settings/          # Secret config, debug settings
```

### MVVM Feature Pattern

Each MVVM feature under `mvvm/` follows:

```
feature/
├── presentation/      # Fragment + ViewModel + screen state sealed class
│   ├── components/    # Jetpack Compose composables
│   └── adapter/       # Feature-specific RecyclerView adapters
├── domain/
│   ├── use_case/      # Use case classes (one responsibility each)
│   ├── repository/    # Repository interfaces
│   └── entity/        # Domain models
├── data/              # (if needed) API impl, data sources
└── di/                # Dagger subcomponent + module
```

### MVP Areas (legacy — do not add new MVP code)

| Package | Entry Point | Pattern |
|---------|------------|---------|
| `activity/` | `OppDineActivity` | Activity as View + `OppDineActivityPresenter` |
| `cart_loader/` | `CartLoaderFragment` | Fragment as View + `CartLoaderPresenter` |
| `order/details/` | `OrderDetailFragment` | Fragment as View + `OrderDetailPresenter` |
| `restaurant_closed/` | `RestaurantClosedErrorFragment` | Fragment as View + Presenter |
| `common/buy_flow/` | `BuyFlowBaseFragment` | Fragment + `BuyFlowPresenterImp` |
| `ui/arrival_window/error_state/` | `ArrivalWindowErrorStateFragment` | MVP |

---

## scan-and-go-lib (Mobile Merchandise Checkout)

**Package**: `com.disney.wdpro.sag`
**Architecture**: MVVM throughout

### Package Structure

```
sag/
├── ScanAndGoActivity.kt        # Main host activity
├── ScanAndGoCheckoutActivity.kt
├── ScanAndGoSession.kt         # Shared session state
├── scanner/                    # Barcode scanning
│   ├── view/                   # ScannerFragment + ScannerViewModel
│   ├── decoder/                # ZXing decode pipeline
│   └── camera/                 # CameraManager (Camera1 API)
├── bag/                        # Shopping bag (MyBagFragment + MyBagViewModel)
│   ├── adapter/                # RecyclerView delegate adapters
│   └── components/             # Custom views (swipeable bag item)
├── checkout/                   # Checkout flow (CheckoutFragment + CheckoutViewModel)
├── confirmation/               # Order confirmation
├── stores/                     # Store list (ScanAndGoStoreListFragment + ViewModel)
├── store_list_uplift/          # Refreshed store list with Compose
│   ├── presentation/           # Fragment + ViewModel + Compose components
│   ├── domain/                 # Use cases + repository
│   └── data/                   # API client + models
├── find_merchandise/           # Find product by location
│   ├── presentation/           # Fragment + ViewModel
│   └── hybrid/                 # Hybrid web plugin
├── price_checker/              # Price check via scan
├── product_price/              # Product price bottom sheet
├── manual_enter_barcode/       # Manual barcode entry (ManualEnterCodeFragment + ViewModel)
├── tutorial/                   # Onboarding tutorial
├── purchases/                  # Past purchases list
├── data/                       # Data layer
│   ├── service/                # ScanAndGoApiClient + models/mappers
│   ├── repository/             # bag/, checkout/, facilities/
│   ├── datasource/database/    # Room database (ScanAndGoDatabase, DAOs)
│   ├── copy/                   # CopyProvider (localized strings from CB)
│   └── configuration/          # Feature toggles, API config
├── common/                     # Shared utilities
│   ├── domain/usecase/         # Cross-feature use cases
│   ├── components/             # Compose: FullScreenError, CartBubbleButton
│   ├── viewmodel/              # GetItemBySkuParentViewModel (shared)
│   └── ext/                    # Extension functions
├── analytics/                  # ScanAndGoAnalyticsHelper
├── monitoring/                 # New Relic event recorders per screen
├── authentication/             # ScanAndGoAuthListener
├── di/                         # Dagger: ScanAndGoComponent + modules
└── deeplink/                   # Deep link constants
```

### Feature Pattern

Newer features (e.g., `store_list_uplift`) follow clean MVVM with Compose:
```
presentation/ → Fragment (thin) + ViewModel (state holder) + Compose components
domain/       → use cases → repository interface
data/         → API client impl + models
```

Older features use Fragment + ViewModel with XML views and delegate adapters.

---

## dine-check-in-android (DineCheckIn)

**Package**: `com.disney.wdpro.dinecheckin`
**Architecture**: MVVM throughout

### Package Structure

```
dinecheckin/
├── CheckInConstants.kt
├── DineCheckInConfiguration.kt   # Library entry point config
├── precheckin/                   # Pre-check-in flow
│   ├── common/                   # DinePreCheckInActivity + ViewModel + navigator
│   ├── loading/                  # Loading screen (Fragment + ViewModel)
│   ├── locationservices/         # Location permissions screen
│   └── error/                   # Error screen
├── checkin/                      # Main check-in flow
│   ├── CheckInActivity.kt        # Host activity
│   ├── DineCheckInActivityViewModel.kt
│   ├── interactor/               # DineReservationCheckInInteractor (business logic)
│   ├── view/                     # Custom views (steppers, collapsible section header)
│   └── adapter/                  # RecyclerView binders
├── partymix/                     # Party mix / questionnaire
│   ├── QuestionnaireFragment.kt
│   ├── QuestionnaireViewModel.kt
│   └── sections/                 # Section view components (stepper, dropdown, multi-select)
├── confirmation/                 # Check-in confirmation
│   ├── CheckInConfirmationFragment.kt
│   └── CheckInConfirmationViewModel.kt
├── walkup/                       # Walk-up list feature
│   ├── WalkUpListActivity.kt
│   ├── list/                     # WalkUpListFragment + ViewModel
│   ├── wait/                     # Wait time (Fragment + ViewModel + adapter)
│   ├── search/                   # Search restaurants (Fragment + ViewModel)
│   │   └── detail/              # Restaurant detail
│   └── cancel/                  # Cancel walk-up
├── model/                        # Shared models (CheckInSession — large session state object)
├── services/                     # HTTP layer
│   ├── checkin/                  # CheckInApiClient + models (38 model classes)
│   └── walkup/                   # WalkUpApiClient + models
├── service/manager/              # Service managers (CheckInApiManager, DiningReservationManager)
├── monitoring/                   # New Relic event recorders per screen
├── analytics/                    # CheckInAnalyticsHelper, WalkUpAnalyticsHelper
├── common/                       # Shared fragments, copy provider, config
│   ├── copy/                     # DineCheckInCopyProvider (CB strings)
│   └── use_cases/               # GetWalkUpWaitTimeTextUseCase
├── review/                       # Notification ViewModel
├── resources/                    # DateTimeResourceWrapper
├── dine/                         # Legacy: adapters, views, TimeFormatUtility
├── ext/                          # 20+ extension functions
├── di/                           # DineCheckInModule + DineCheckInComponent
├── devtools/                     # Debug settings screen (CheckInAndWulSettingsActivity)
└── error/                        # CheckInErrorFragment
```

### CheckInSession

`CheckInSession.kt` is a large (31KB) shared state model passed between screens. Treat it carefully — changes ripple through the entire flow.

---

## android-fnb-commons-lib (FnB Commons)

**Package**: `com.disney.wdpro.fnb.commons`
**Architecture**: Utility library — no single flow, collection of reusable components

### Package Structure

```
fnb.commons/
├── FnbCommonsBaseFragment.kt     # Base fragment with EventBus support
├── ViewModelFactory.kt
├── Activities/
│   └── FnBFinderDetailsActivity  # Facility detail screen
├── geolocation/                  # Location validation flow
│   ├── LocationValidatorFragment + ViewModel + Activity
│   ├── breadcrumbs/              # New Relic breadcrumb recording
│   └── model/                   # LocationValidatorParams, Coordinates
├── analytics/
│   ├── mobileorder/              # MO analytics keys/values/screen helpers
│   │   └── screens/             # Per-screen analytics (Cart, Confirmation, ItemDetail, etc.)
│   ├── dinecheckin/             # DineCheckIn analytics helpers
│   ├── foundation/              # BaseAnalyticsHelper, ParkContextService
│   └── breacrumbs/              # BreadcrumbManager + recorder
├── reporting/
│   ├── EventRecorder.kt          # New Relic event recording abstraction
│   └── constants/               # Event keys/types per product
│       ├── mobile_order/        # MOEventKeys + 13 event categories
│       ├── mobile_checkout/     # MMCEventKeys + 11 event categories
│       └── dine_checkin/        # DCEventKeys + 9 event categories
├── compose/ui/
│   ├── theme/                   # Color, TextStyle, Type
│   └── components/              # Reusable Compose: button, error, dialog, filters,
│       │                        # location, tabs, accordion, stepper, loader, text, swipe
│       └── location/            # Location-aware Compose components
├── hybrid/                      # Hybrid (web) support
│   ├── presentation/            # FnBHybridFragment + ViewModel + Activity
│   └── plugins/                 # FnbHybridConfiguration, lifecycle plugin
├── views/                       # Custom views (DisneyVisaDiscountDisclaimerView, ViewExt)
├── adapter/                     # BaseDividerDA, ToggleRecyclerViewType
├── util/                        # 20+ extension functions (String, Context, Bitmap, etc.)
├── config/mobile_order/         # Mobile order feature config models
├── coroutines/                  # DispatcherProvider
├── shared/                      # BaseTypeConverter
└── di/                          # FnBCommonsComponent + subcomponents
```

### Key Shared Utilities

| Class | Purpose |
|-------|---------|
| `EventRecorder` | Wraps New Relic event recording — used by all 3 other libs |
| `LocationValidatorFragment` | Reusable location permission + geofence validation flow |
| `FnbCommonsBaseFragment` | Base fragment (EventBus sticky events) |
| `FnBHybridFragment` | Base for hybrid web views |
| `BaseDividerDA` | RecyclerView divider delegate adapter |
| `SharedPreferenceUtility` | SharedPreferences helper |
| `DispatcherProvider` | Coroutine dispatcher abstraction for testing |
| Compose components | Shared UI: buttons, dialogs, error screens, location, filters |

---

## Cross-Repo Patterns

### Dependency Injection (Dagger 2)

All repos use Dagger 2 with the same pattern:
- Root `XxxComponent` (library-level, created by host app)
- Feature `XxxSubComponent` + `XxxModule` per screen
- `XxxComponentProvider` interface implemented by the host app

### UI Layer

| Pattern | Used In |
|---------|---------|
| Fragment + ViewModel (MVVM) | All new screens |
| Jetpack Compose | Newer screens in all 4 repos |
| XML + Delegate Adapters | Legacy/intermediate screens |
| MVP (Fragment = View + Presenter) | Legacy in opp-dine-ui only |

### Monitoring / Analytics

- `EventRecorder` (from `android-fnb-commons`) → wraps New Relic
- Each screen has a dedicated `*EventRecorder` interface + impl
- Analytics helpers (`*AnalyticsHelper`) handle Adobe Analytics

### Copy / Localized Strings

All repos use a CB (Couchbase/Content Bridge) `CopyProvider` pattern:
- `XxxCopyProvider` interface defines all string keys
- `XxxCopyProviderImpl` fetches from CB database
- `CBXxxCopyDAO` is the Room DAO for the CB content

### Build / Local Testing

```bash
# Run unit tests
./gradlew testDebugUnitTest

# Publish to local Maven for park app testing
./gradlew :<module>:publishToMavenLocal

# Park app must reference local version in build.gradle.kts with resolutionStrategy
```
