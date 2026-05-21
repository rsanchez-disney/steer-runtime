# ActivateX (DSP Go & Check-Sync) — Architecture Guide

## Project Overview

ActivateX is a Disney POS (Point of Sale) Android application supporting three business models:
- **Merchandise**: Retail point of sale
- **Quick Service Restaurant (QSR)**: Food ordering with Kitchen Display System (KDS) integration
- **Table Service**: Check-based dining with synchronization between terminals, server transfers, and split checks

Additional integrations: Emma (dining plans), Disney CAS, Disney PMS, FiPay, hardware peripherals (printers, scanners, swipers, cash drawers).

## Applications

- **AppetizeActivateApp** (`gc/AppetizeActivateApp`): Main DSP Go POS application
- **serverApp** (`gc/serverApp`): Check-Sync server for check synchronization between terminals

## Module Structure

### Core App Modules (`gc/`)
| Module | Purpose |
|---|---|
| `AppetizeActivate` | Main app library — features, presenters, views, business logic |
| `AppetizeActivateApp` | Application entry point, Espresso UI tests |
| `domain` | Domain layer — interfaces, models, interactors |
| `dataModel` | Data models and entities |
| `dataAccess` | Data access layer — local DB operations |
| `repository` | Repository pattern implementations |
| `repository_room` | Room database implementations |
| `api_activate` | REST API client for Activate backend |
| `api_grpc` | gRPC API client |
| `apiclientmanager` | API client management and configuration |
| `common-lib` | Shared utilities and extensions |

### Feature Modules (`gc/`)
| Module | Purpose |
|---|---|
| `check-sync` | Check synchronization logic |
| `emma` | Emma dining plan integration |
| `disney-cas` | Disney CAS integration |
| `disney-pms` | Disney PMS integration |
| `fipay` | FiPay payment integration |
| `receipts` | Receipt generation and printing |
| `kds` / `kdsapiclient` / `kdsmodel` | Kitchen Display System |
| `audit` | Audit trail and reporting |
| `edc` | Electronic Data Capture |
| `transactionmodule` | Transaction processing |

### Hardware Modules (`gc/`)
| Module | Purpose |
|---|---|
| `swipers` | Payment swiper/terminal management |
| `cashdrawer` | Cash drawer control |
| `scannerUsbManager` | USB barcode scanner |
| `cfd` | Customer Facing Display |
| `usbhid` | USB HID device communication |
| `socketlib` | Socket communication for peripherals |
| `msr` | Magnetic Stripe Reader |

### SDK/Framework Modules (`modules/`)
| Module | Purpose |
|---|---|
| `aa-core/aa-android` | Core Android framework |
| `aa-framework-payment/aa-payment` | Payment framework |
| `aa-framework-payment/aa-swipers` | Swiper abstraction layer |
| `aa-framework-payment/aa-transactions` | Transaction framework |
| `aa-framework-payment/aa_giftcards` | Gift card processing |
| `sdk-swiper-ingenico-direct` | Ingenico swiper SDK |
| `tenders` | Tender type descriptors |

## Architecture Patterns

### Presentation Layer
- **MVP (Model-View-Presenter)**: Primary pattern for most features
- **MVVM**: Used in newer features with `ViewModel` + Jetpack Compose
- **Composables**: Jetpack Compose being adopted for new UI components

### Domain Layer
- **Interactors/Use Cases**: Business logic in single-responsibility classes
- **Repository Pattern**: Data access abstracted through interfaces in `domain`, implemented in `repository`/`repository_room`

### Dependency Injection
- **Hilt/Dagger**: `@AndroidEntryPoint`, `@Inject`, `@Module`
- DI modules organized in `di/` subdirectories per feature

### Reactive Programming
- **RxJava**: Used extensively for async operations and event streams
- **Coroutines**: Used in newer code alongside RxJava

### Feature Package Structure
```
feature/
├── di/              # Hilt/Dagger modules
├── interactor/      # Use cases
├── model/           # Feature-specific models
├── mvp/             # View interfaces
├── presenter/       # Presenters
├── adapter/         # RecyclerView adapters
├── view/            # Custom views
├── viewmodel/       # ViewModels (newer features)
├── composable/      # Compose UI (newer features)
└── delegates/       # Delegate pattern implementations
```

## Tech Stack
- **Language**: Kotlin (primary), Java (legacy)
- **Build**: Gradle with version catalog (`libs.versions`)
- **UI**: Android Views + Jetpack Compose (migration in progress)
- **DI**: Hilt/Dagger
- **Async**: RxJava + Kotlin Coroutines
- **Database**: Room
- **Network**: Retrofit + gRPC
- **Testing**: JUnit + MockK + Espresso
- **CI**: Detekt, Spotless, JaCoCo, SonarQube

## Module Dependency Rules
- **Domain** must NOT depend on Android framework
- **AppetizeActivate (Presentation)** depends on `domain`, `dataModel`, `common-lib`, feature modules
- **Feature modules** depend on `domain` and `dataModel`, not on `AppetizeActivate`

## Conventions
- Branch naming: `{jiraTicketType}/{jiraTicketId}/description` (e.g., `task/POS-5897/add-printer-handling`)
- Commit messages: `{type} description - Amazon Q [ticket]` or `{type} description [ticket]`
- Commit types: task→`chore`, story→`feature`, bug→`fix`, spike→`chore`, epic→`feature`
- Tests in `src/test/java` using Kotlin classes
- Base package: `com.appetizeactivate.android`
- Domain package: `com.appetizeapp.domain`
- Gradle test command: `./gradlew :AppetizeActivate:testDisneyDebugUnitTest`
- Available flavors: `disney`, `disneyHongKong`, `qa`

## Golden Rules
1. **Backward Compatibility** — All API changes must be additive
2. **Test Coverage ≥90%** — Unit, integration, and E2E tests
3. **No Secrets in Code** — Use env vars or secret management
4. **Structured Logging** — Context-rich structured logs
5. **Minimal Diff** — One story = one PR, no unrelated changes
6. **Input Validation** — Validate all user inputs
7. **Error Handling** — Structured error responses
8. **Accessibility (WCAG 2.1 AA)** — ARIA, keyboard nav, contrast
9. **Performance** — No regressions, pagination, caching
10. **Documentation** — Public APIs documented, READMEs updated
