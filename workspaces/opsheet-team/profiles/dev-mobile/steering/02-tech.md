---
inclusion: always
---

# Tech Stack

## Framework & Language
- Flutter 3.38.0 (managed via FVM)
- Dart SDK >=3.0.0 <4.0.0
- Targets iOS and Android

## State Management
- Riverpod (`flutter_riverpod` ^2.4.9)
- Riverpod code generation (`riverpod_annotation`, `riverpod_generator`)

## Code Generation
- `json_serializable` / `json_annotation` for JSON model serialization (produces `.g.dart` files)
- `build_runner` for code generation

## Key Libraries
- `hyperion_components` — internal UI component library
- `chassis_*` — internal platform libraries (networking, theming, icons, config, caching, environment, device info, formatting)
- `app_foundation_*` — internal foundation libraries (logging, auth/MyID)
- `latch` — internal library
- `fl_chart` — charting
- `flutter_svg` — SVG rendering
- `table_calendar` — calendar widget
- `flutter_slidable` — swipeable list items
- `lottie` — animations
- `firebase_core` / `firebase_messaging` — push notifications
- `newrelic_mobile` — monitoring and error tracking
- `mocktail` — mocking in tests

## Build & Environment Configuration
- FVM for Flutter version management — always prefix Flutter/Dart commands with `fvm`
- Environment-specific configs in `defines/` directory (JSON files: `latest.json`, `stage.json`, `prod.json`, `automation.json`)
- Dart defines passed at build time via `--dart-define-from-file`
- Automation entry point: `lib/main_automation.dart` (uses mock interceptors)

## Common Commands

All commands should be run with `fvm` prefix:

```bash
# Install dependencies
fvm flutter packages get

# Code generation (required after model changes)
fvm dart run build_runner build --delete-conflicting-outputs

# Format code
fvm dart format lib test

# Static analysis
fvm flutter analyze

# Run tests
fvm flutter test --reporter=compact

# Full PR readiness check
sh check.sh

# PR check with code generation
sh check.sh --codegen

# Build iOS
fvm flutter build ios --profile --no-codesign

# Build Android
fvm flutter build apk --profile --dart-define=APP_DISPLAY_NAME="OpSheet Plus"
```

## Linting
- Uses `flutter_lints` as base
- Extensive custom lint rules in `analysis_options.yaml`
- Key rules: `prefer_single_quotes`, `prefer_relative_imports`, `sort_constructors_first`, `sort_child_properties_last`, `avoid_print`
- Generated files (`*.g.dart`, `*.freezed.dart`) are excluded from analysis
