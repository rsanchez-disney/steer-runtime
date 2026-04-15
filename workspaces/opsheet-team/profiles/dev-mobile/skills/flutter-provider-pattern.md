# Flutter Riverpod Pattern Implementation

## When to Use

Use Riverpod for:
- Dependency injection (repositories, API clients)
- State management (controllers, async data)
- Sharing data across widget tree
- Reactive UI updates with compile-time safety

## Provider Types (Code-Generated — Preferred)

### @riverpod Controller (Complex State)
```dart
@riverpod
class EntityStatus extends _$EntityStatus {
  @override
  Future<EntityStatusModel?> build(String entityId) async {
    return _fetch(entityId);
  }

  Future<void> refresh(String entityId) async {
    if (state.isLoading) return;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetch(entityId));
  }

  Future<EntityStatusModel?> _fetch(String entityId) async {
    final repo = ref.read(entityRepositoryProvider);
    return repo.getStatus(entityId);
  }
}
```

### @riverpod Function (Computed/Simple)
```dart
@riverpod
Future<List<Entity>> filteredEntities(
  FilteredEntitiesRef ref, {
  required String parkId,
}) async {
  final repo = ref.read(entityRepositoryProvider);
  return repo.getByPark(parkId);
}
```

### Legacy Provider (Wiring Only — Acceptable in Existing Code)
```dart
final entityRepositoryProvider = Provider<EntityRepository>((ref) {
  return EntityRepository(
    apiClient: ref.read(opsApiClientProvider),
  );
});
```

## Provider Modifiers

### autoDispose (Default with @riverpod)
Code-generated providers are autoDispose by default. Use `keepAlive()` to opt out:

```dart
@riverpod
class MyController extends _$MyController {
  @override
  Future<Data?> build() async {
    ref.keepAlive(); // Prevent disposal when no listeners
    return _fetch();
  }
}
```

### family (Parameters via build args)
```dart
@riverpod
class EntityDetail extends _$EntityDetail {
  @override
  Future<EntityModel?> build(String entityId) async {
    return ref.read(entityRepositoryProvider).getById(entityId);
  }
}

// Usage
ref.watch(entityDetailProvider('entity-123'));
```

## Consuming Providers

### ref.watch (Reactive — Use in build)
```dart
class EntityPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusAsync = ref.watch(entityStatusProvider(entityId));
    return statusAsync.when(
      data: (status) => EntityStatusWidget(status: status),
      loading: () => const LoadingIndicator(),
      error: (err, stack) => ErrorWidget(error: err),
    );
  }
}
```

### ref.read (One-off — Use in callbacks)
```dart
onPressed: () {
  ref.read(entityStatusProvider(entityId).notifier).refresh(entityId);
}
```

### ref.listen (Side Effects)
```dart
ref.listen(entityStatusProvider(entityId), (prev, next) {
  next.whenOrNull(
    error: (err, _) => ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Error: $err')),
    ),
  );
});
```

### ref.invalidate (Force Refresh)
```dart
onRefresh: () {
  ref.invalidate(entityStatusProvider(entityId));
}
```

## AsyncValue Handling

### Pattern Matching (Preferred)
```dart
asyncValue.when(
  data: (data) => DataWidget(data: data),
  loading: () => const LoadingIndicator(),
  error: (err, stack) => ErrorDisplay(error: err),
);
```

### Guard (In Controllers)
```dart
state = await AsyncValue.guard(() => repository.fetchData());
```

### Skip Loading on Refresh
```dart
asyncValue.when(
  data: (data) => DataWidget(data: data),
  loading: () => const LoadingIndicator(),
  error: (err, stack) => ErrorDisplay(error: err),
  skipLoadingOnRefresh: true,
);
```

## Code Generation

After creating or modifying `@riverpod` controllers:

```bash
fvm dart run build_runner build --delete-conflicting-outputs
```

Generated files: `*.g.dart` (part files alongside source)

## Testing with Riverpod

```dart
void main() {
  late ProviderContainer container;
  late MockEntityRepository mockRepo;

  setUp(() {
    mockRepo = MockEntityRepository();
    container = ProviderContainer(
      overrides: [
        entityRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
  });

  tearDown(() => container.dispose());

  test('fetches entity status', () async {
    when(() => mockRepo.getStatus('entity-123'))
        .thenAnswer((_) async => EntityStatusModel(id: 'entity-123'));

    final result = await container.read(
      entityStatusProvider('entity-123').future,
    );

    expect(result?.id, 'entity-123');
  });
}
```

## Best Practices

1. **Use `@riverpod` for all new code** — avoid manual provider declarations
2. **Keep controllers focused** — one controller per feature/screen concern
3. **Use `AsyncValue.guard`** — never raw try-catch in controllers
4. **Prefer `ref.watch` in build** — `ref.read` only in callbacks and initialization
5. **Don't store ref** — always access it fresh from the method parameter
6. **Use `ref.invalidate`** — instead of manual refresh logic when possible
7. **Scope providers correctly** — autoDispose for screen-level, keepAlive for app-level
