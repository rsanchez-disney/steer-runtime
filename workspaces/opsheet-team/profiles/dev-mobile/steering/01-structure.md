---
inclusion: always
---

# Project Structure

## Top-Level Layout
```
lib/
  main.dart                    # Production entry point
  main_automation.dart         # Automation/testing entry point
  initialize_opsheet_app.dart  # Production bootstrapper (DI, Firebase, NewRelic)
  initialize_automation.dart   # Automation bootstrapper (mock interceptors)
  firebase_options.dart        # Firebase config
  src/
    constants/                 # App-wide constants (routes, endpoints, strings, enums, styling)
    features/                  # Feature modules
test/
  src/
    features/                  # Tests mirror the feature structure
defines/                       # Environment JSON configs (latest, stage, prod, automation)
assets/                        # Images, Lottie animations, mock API responses
```

## Feature Module Architecture

Each feature lives in `lib/src/features/{feature_name}/` and follows a layered structure:

```
feature_name/
  data/           # Repositories — API calls, data persistence
  domain/         # Business logic, constants, enums
  model/          # Data models with JSON serialization (.dart + .g.dart)
  application/    # Service layer (used by some features)
  presentation/
    controllers/  # Riverpod providers/controllers (.dart + .g.dart)
    pages/        # Full-screen page widgets
    widgets/      # Reusable UI components for this feature
  utils/          # Feature-specific utilities
  widgets/        # Some features put widgets at feature root level
```

Not every feature uses all layers. Common patterns:
- Simple features: `data/`, `model/`, `presentation/`
- Complex features: all layers plus sub-features (e.g., `entity_data_management/` has `daily_performance/`, `dispatch_interval_summary/`, etc.)

## Key Feature Modules
- `core/` — Shared infrastructure: base repository, API clients, caching, error handling, utilities
- `authentication/` — Login, session management, user info
- `authorization/` — Access control and permissions
- `navigator/` — App routing and navigation (custom Router/RouterDelegate)
- `configuration/` — Remote config and feature toggles
- `shared/` — Reusable UI components (tables, graphs, performance cards)
- `entity_data_management/` — Central feature for managing entity status, wait times, schedules
- `notifications/` — Firebase push notifications and local notifications

## Conventions
- Providers files at feature root: `{feature_name}_providers.dart`
- Generated code alongside source: `file.dart` → `file.g.dart`
- Tests mirror source structure: `test/src/features/{feature_name}/{layer}/`
- Models use `json_serializable` with generated `fromJson`/`toJson`
- Controllers use Riverpod code generation (`@riverpod` annotation)
- Bootstrapping uses `ProviderContainer` with overrides for DI
