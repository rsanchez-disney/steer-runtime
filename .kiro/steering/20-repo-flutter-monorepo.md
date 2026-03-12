# Flutter Monorepo Structure

## Repository Layout

```
project-root/
├── packages/           # Shared packages
│   ├── core/          # Models, utils, constants
│   ├── ui_components/ # Reusable widgets
│   ├── api_client/    # Network layer
│   └── features/      # Business logic modules
├── apps/              # Applications
│   ├── mobile/        # Main mobile app
│   └── admin/         # Admin app (optional)
├── android/           # Native Android code
├── ios/               # Native iOS code
└── test/              # Integration tests
```

## Package Organization

- **core**: Foundation layer, no business logic
- **ui_components**: Reusable UI widgets
- **api_client**: API communication
- **features**: Business logic and feature modules

## Dependency Flow

```
apps → features → ui_components → core
apps → api_client → core
```

## File Naming

- Snake case: `user_profile.dart`
- Test files: `user_profile_test.dart`
- Widget files: `user_profile_widget.dart`

## Import Order

1. Dart SDK imports
2. Flutter imports
3. Package imports
4. Relative imports

## Code Organization

- Keep files under 300 lines
- One widget per file (for complex widgets)
- Group related files in directories
- Use barrel files for exports
