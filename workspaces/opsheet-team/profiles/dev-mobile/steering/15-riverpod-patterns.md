---
inclusion: fileMatch
fileMatchPattern: ["**/*.dart", "pubspec.yaml"]
description: Riverpod state management patterns, provider selection, and lifecycle guidance
---

# Riverpod Patterns & Provider Selection

## Provider Type Decision

### Use `@riverpod` class (NotifierProvider) when:
- Managing mutable state with methods (refresh, update, delete)
- Need a controller with multiple actions
- State changes in response to user interactions

```dart
@riverpod
class WaitTimeController extends _$WaitTimeController {
  @override
  Future<WaitTimeModel?> build(String laneId) async => _fetch(laneId);

  Future<void> post(int minutes) async { ... }
  Future<void> refresh(String laneId) async { ... }
}
```

### Use `@riverpod` function (FutureProvider/Provider) when:
- Read-only computed data
- Simple async fetch with no mutations
- Derived/filtered data from other providers

```dart
@riverpod
Future<List<Entity>> activeEntities(ActiveEntitiesRef ref) async {
  final all = await ref.watch(allEntitiesProvider.future);
  return all.where((e) => e.isActive).toList();
}
```

### Use legacy `Provider` only for:
- Wiring repositories and services (dependency injection)
- Existing code that hasn't been migrated

```dart
final entityRepositoryProvider = Provider<EntityRepository>((ref) {
  return EntityRepository(apiClient: ref.read(opsApiClientProvider));
});
```

## Lifecycle Management

### autoDispose (Default)
Code-generated providers are autoDispose by default — they clean up when no widget listens.

Override with `keepAlive()` for:
- Cached data that should survive navigation
- App-level state (auth, config)

```dart
@riverpod
class AppConfig extends _$AppConfig {
  @override
  Future<Config> build() async {
    ref.keepAlive();
    return _loadConfig();
  }
}
```

### Disposal Pitfalls
- Don't use `ref.watch` on a disposed provider — causes rebuild loops
- Don't store `WidgetRef` in variables — always access fresh
- Cancel async operations in `ref.onDispose`:

```dart
@override
Future<Data> build() async {
  final cancelToken = CancelToken();
  ref.onDispose(cancelToken.cancel);
  return api.fetch(cancelToken: cancelToken);
}
```

## Common Anti-Patterns

### ❌ ref.watch in callbacks
```dart
// WRONG — causes unnecessary rebuilds
onPressed: () {
  final ctrl = ref.watch(myProvider.notifier); // Should be ref.read
  ctrl.doSomething();
}
```

### ❌ ref.read in build
```dart
// WRONG — won't rebuild when data changes
Widget build(BuildContext context, WidgetRef ref) {
  final data = ref.read(myProvider); // Should be ref.watch
  return Text(data.toString());
}
```

### ❌ Business logic in widgets
```dart
// WRONG — logic belongs in controller
Widget build(BuildContext context, WidgetRef ref) {
  final counts = ref.watch(countsProvider);
  final total = counts.fold(0, (sum, c) => sum + c.value); // Move to controller
  return Text('Total: $total');
}
```

### ❌ Provider dependency cycles
```dart
// WRONG — A watches B, B watches A
@riverpod
Future<A> providerA(ProviderARef ref) async {
  final b = await ref.watch(providerBProvider.future); // Cycle!
  return A(b);
}
```

### ❌ Nested async calls without guard
```dart
// WRONG — unhandled errors
Future<void> refresh() async {
  state = const AsyncLoading();
  try {
    state = AsyncData(await _fetch()); // Use AsyncValue.guard instead
  } catch (e) {
    state = AsyncError(e, StackTrace.current);
  }
}
```

## Widget Rebuild Optimization

### Use select for granular rebuilds
```dart
// Only rebuilds when status changes, not the entire model
final status = ref.watch(
  entityProvider(id).select((async) => async.valueOrNull?.status),
);
```

### Use Consumer for scoped rebuilds
```dart
Column(
  children: [
    const HeaderWidget(), // Won't rebuild
    Consumer(
      builder: (context, ref, child) {
        final data = ref.watch(myProvider);
        return DataWidget(data: data);
      },
    ),
  ],
)
```
