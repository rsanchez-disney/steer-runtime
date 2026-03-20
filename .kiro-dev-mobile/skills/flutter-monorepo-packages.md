# Flutter Monorepo Package Management

## Monorepo Structure

```
my-app/
├── packages/
│   ├── core/              # Shared models, utils
│   ├── ui_components/     # Shared widgets
│   ├── api_client/        # API layer
│   └── features/          # Feature modules
├── apps/
│   ├── mobile/            # Main app
│   └── admin/             # Admin app
└── pubspec.yaml           # Root workspace
```

## Creating a Package

```bash
cd packages
flutter create --template=package my_package
```

## Package pubspec.yaml

```yaml
name: my_package
description: Package description
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

## Using Local Packages

In app's pubspec.yaml:
```yaml
dependencies:
  my_package:
    path: ../../packages/my_package
```

## Package Dependencies

### Core Package (No Dependencies)
```yaml
name: core
dependencies:
  flutter:
    sdk: flutter
```

### Feature Package (Depends on Core)
```yaml
name: features
dependencies:
  flutter:
    sdk: flutter
  core:
    path: ../core
```

### App (Depends on All)
```yaml
name: mobile
dependencies:
  flutter:
    sdk: flutter
  core:
    path: ../../packages/core
  features:
    path: ../../packages/features
  ui_components:
    path: ../../packages/ui_components
```

## Dependency Rules

1. **No circular dependencies**
   - core → (nothing)
   - ui_components → core
   - features → core, ui_components
   - apps → all packages

2. **Clear boundaries**
   - core: Models, utils, constants
   - ui_components: Reusable widgets
   - api_client: Network layer
   - features: Business logic

3. **Version consistency**
   - Same Flutter SDK version across packages
   - Same dependency versions when shared

## Exporting from Packages

### Package lib structure
```
lib/
├── src/
│   ├── models/
│   ├── services/
│   └── widgets/
└── my_package.dart  # Public API
```

### Public API (my_package.dart)
```dart
library my_package;

export 'src/models/user.dart';
export 'src/services/auth_service.dart';
export 'src/widgets/custom_button.dart';
```

### Using in App
```dart
import 'package:my_package/my_package.dart';

// Now have access to exported classes
final user = User();
```

## Testing Packages

```bash
cd packages/my_package
flutter test
```

## Running Analyzer

```bash
# Single package
cd packages/my_package
flutter analyze

# All packages
for dir in packages/*; do
  (cd "$dir" && flutter analyze)
done
```

## Updating Dependencies

```bash
# Single package
cd packages/my_package
flutter pub get

# All packages
for dir in packages/*; do
  (cd "$dir" && flutter pub get)
done

# App
cd apps/mobile
flutter pub get
```

## Common Patterns

### Shared Models (core package)
```dart
// packages/core/lib/src/models/user.dart
class User {
  final String id;
  final String name;
  
  User({required this.id, required this.name});
}

// packages/core/lib/core.dart
export 'src/models/user.dart';
```

### Shared Widgets (ui_components package)
```dart
// packages/ui_components/lib/src/buttons/primary_button.dart
class PrimaryButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String label;
  
  const PrimaryButton({
    required this.onPressed,
    required this.label,
  });
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }
}

// packages/ui_components/lib/ui_components.dart
export 'src/buttons/primary_button.dart';
```

### Feature Module (features package)
```dart
// packages/features/lib/src/auth/auth_provider.dart
import 'package:core/core.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  User? get user => _user;
  
  Future<void> login(String email, String password) async {
    // Implementation
    notifyListeners();
  }
}

// packages/features/lib/features.dart
export 'src/auth/auth_provider.dart';
```

## Best Practices

1. **Keep packages focused**
   - Single responsibility
   - Clear purpose
   - Minimal dependencies

2. **Document package APIs**
   - README.md in each package
   - Dartdoc comments on public APIs
   - Example usage

3. **Version packages**
   - Semantic versioning
   - CHANGELOG.md
   - Breaking changes documented

4. **Test packages independently**
   - Unit tests in package
   - Don't depend on app for testing
   - Mock external dependencies

5. **Avoid deep nesting**
   - Max 2-3 levels of dependencies
   - Flatten when possible
   - Refactor if too complex

## Troubleshooting

### Dependency not found
```bash
flutter pub get
flutter clean
flutter pub get
```

### Circular dependency
- Review dependency graph
- Extract shared code to lower-level package
- Refactor to break cycle

### Version conflicts
- Align versions across packages
- Use dependency_overrides sparingly
- Update all packages together
