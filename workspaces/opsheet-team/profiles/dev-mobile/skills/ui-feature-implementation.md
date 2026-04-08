# Skill: UI Feature Implementation (Flutter / OpSheet Plus)

Use this skill when implementing or refactoring UI features in the OpSheet Plus Flutter app.

## Project Context

- Flutter 3.38.0 (always use `fvm` prefix for commands)
- State management: Riverpod with code generation (`@riverpod` annotation)
- Models: `json_serializable` with `@JsonSerializable(explicitToJson: true)`
- Internal UI library: `hyperion_components`
- Internal platform libraries: `chassis_*`, `app_foundation_*`
- Backend: VAS (Venue Availability Services) APIs

## Feature Module Structure

Each feature lives in `lib/src/features/{feature_name}/` with these layers:

```
feature_name/
  data/                          # Repositories (API calls via OpsApiClient)
  domain/                        # Enums, constants, business rules
  model/                         # Data models (.dart + .g.dart)
  presentation/
    controllers/                 # Riverpod controllers (.dart + .g.dart)
    pages/                       # Full-screen page widgets
    widgets/                     # Feature-scoped UI components
    {feature}_providers.dart     # StateProviders, repository providers
    {feature}_events.dart        # Analytics/tracking events
  utils/                         # Feature-specific helpers
  widgets/                       # Some features use root-level widgets/
  {feature}_providers.dart       # Some features put providers at root
```

Not every feature needs all layers. Match complexity to the feature.

## Workflow

1. Identify the feature surface: which layers (data/model/presentation) are needed.
2. Create models with `json_serializable` — run `fvm dart run build_runner build --delete-conflicting-outputs` after.
3. Create repository in `data/` mixing in `BaseRepository`, using `OpsApiClient`.
4. Create Riverpod controller with `@riverpod` annotation — run build_runner after.
5. Wire providers in `{feature}_providers.dart`.
6. Build page and widget tree, using `hyperion_components` where possible.
7. Handle all UX states: loading, empty, error, success.
8. Mirror test structure in `test/src/features/{feature_name}/`.

## Key Patterns

### Model (json_serializable)
```dart
@JsonSerializable(explicitToJson: true)
class MyModel {
  MyModel({required this.id, required this.name});

  factory MyModel.fromJson(Map<String, dynamic> json) => _$MyModelFromJson(json);
  Map<String, dynamic> toJson() => _$MyModelToJson(this);

  final String id;
  final String name;
}
```

### Repository (BaseRepository + OpsApiClient)
```dart
class MyRepository with BaseRepository {
  MyRepository({required OpsApiClient apiClient, required ValueGetter<String> currentRouteGetter})
      : _apiClient = apiClient, _currentRouteGetter = currentRouteGetter;

  final OpsApiClient _apiClient;
  final ValueGetter<String> _currentRouteGetter;

  @override
  String get currentRoute => _currentRouteGetter();

  Future<MyModel> getData() async {
    MyModel result;
    try {
      final response = await _apiClient.execute(apiRequest: ..., currentRoute: currentRoute);
      result = MyModel.fromJson(response.body['data']);
    } catch (error, stack) {
      onError(currentPath: '$runtimeType.getData', error: error, stack: stack);
      rethrow;
    }
    return result;
  }
}
```

### Controller (Riverpod codegen)
```dart
@riverpod
class MyController extends _$MyController {
  @override
  Future<MyModel> build() async => _fetch();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }
}
```

### Providers file
```dart
final myRepositoryProvider = Provider<MyRepository>((ref) {
  return MyRepository(
    apiClient: ref.read(opsApiClientProvider),
    currentRouteGetter: () => ...,
  );
});
```

## Code Style Rules

- Follow class member ordering: constructors → static vars → instance vars → getters/setters → static methods → public methods → private methods → build methods → `build()`
- Arguments alphabetical, `child`/`children` always last
- Single `return` per method (no early returns)
- Prefer named parameters for constructors and methods with 3+ params
- Trailing commas everywhere (except single-param non-wrapping calls)
- Import order: `dart:` → `package:` → relative imports
- Prefer relative imports within the project
- Prefer single quotes
- Run `sh check.sh` before committing

## Checklist

- [ ] Models use `json_serializable` with generated `.g.dart` files
- [ ] Repository mixes in `BaseRepository`, uses structured error handling with `onError`
- [ ] Controller uses `@riverpod` annotation with `AsyncValue` for state
- [ ] All UX states handled: loading / empty / error / success
- [ ] Tests mirror source structure in `test/src/features/`
- [ ] Tests use `mocktail` for mocking
- [ ] Code generation run after model/controller changes
- [ ] `sh check.sh` passes (format, analyze, test)
