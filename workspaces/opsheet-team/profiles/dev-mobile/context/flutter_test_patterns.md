# Flutter Test Patterns — OpSheet Plus

Reference document with the testing patterns used in this project, based on existing test files in `test/src/features/`.

---

## 1. Mocking: `mocktail`

We use **mocktail** (not `mockito`, not `@GenerateNiceMocks`). The pattern is always:

```dart
import 'package:mocktail/mocktail.dart';

// Mocks: class that extends Mock and implements the interface
class MockOpsApiClient extends Mock implements OpsApiClient {}
class MockHomeScreenRepository extends Mock implements HomeScreenRepository {}

// Fakes: for registerFallbackValue when using matchers like any()
class ApiRequestFake extends Fake implements ApiRequest {}
```

### Rules:
- Mocks are declared as **top-level classes** outside of `main()`.
- If `any(named: ...)` is used in a `when()`, register a fallback value in `setUpAll`:

```dart
setUpAll(() {
  registerFallbackValue(ApiRequestFake());
});
```

### Stubbing:

```dart
// Successful response
when(() => mockApiClient.execute(
  apiRequest: any(named: 'apiRequest'),
  currentRoute: any(named: 'currentRoute'),
)).thenAnswer((_) async => ApiResponse(body: responseBody, statusCode: 200, headers: const {}));

// Simulate error
when(() => mockApiClient.execute(
  apiRequest: any(named: 'apiRequest'),
  currentRoute: any(named: 'currentRoute'),
)).thenThrow(Exception('Network error'));
```

---

## 2. Widget test wrapping

### For widget tests: `UncontrolledProviderScope` + `MaterialApp`

```dart
Widget _buildWidget({required ProviderContainer container}) =>
    UncontrolledProviderScope(
      container: container,
      child: const MaterialApp(
        home: Scaffold(body: MyWidget()),
      ),
    );
```

### For provider/controller tests: direct `ProviderContainer`

```dart
final container = ProviderContainer(
  overrides: [
    opsApiClientProvider.overrideWithValue(mockApiClient),
    entitySelectedProvider.overrideWith((ref) => mockEntity),
    translatorProvider.overrideWithValue(Translator(translations: {})),
    myControllerProvider.overrideWith(FakeController.new),
  ],
);
addTearDown(container.dispose);
```

### Override patterns by provider type:
- **Simple providers (value):** `.overrideWithValue(instance)`
- **Providers with ref:** `.overrideWith((ref) => value)`
- **Notifier/Controller providers:** `.overrideWith(FakeController.new)` or `.overrideWith(() => MockNotifier(data))`

---

## 3. Testing async states (AsyncValue)

```dart
final result = await container.read(myControllerProvider.future);
expect(result, isA<MyModel>());
```

### Fake controllers for async notifiers:

```dart
class _FakeWaitTimesGraphController extends WaitTimesGraphController {
  @override
  Future<WaitTimesSummarizedGraph?>? build() async => null;
  @override
  Future<void> refreshAll() async {}
}
```

### With parameterized data:

```dart
class _MockGraphNotifier
    extends AutoDisposeAsyncNotifier<WaitTimesSummarizedGraph?>
    implements WaitTimesGraphController {
  _MockGraphNotifier(this._data);
  final WaitTimesSummarizedGraph? _data;
  @override
  Future<WaitTimesSummarizedGraph?> build() async => _data;
  @override
  Future<void> refreshAll() async { state = const AsyncValue.loading(); ref.invalidateSelf(); await future; }
}
```

### Synchronous fake controllers:

```dart
class _MockTimezoneController extends TimezoneController with Mock {
  _MockTimezoneController(this._data);
  final Timezone? _data;
  @override
  Timezone? build() => _data;
}
```

---

## 4. Typical `setUp()` structure

### Repository tests:

```dart
void main() {
  late MockOpsApiClient apiClient;
  late MyRepository repository;

  setUpAll(() { registerFallbackValue(ApiRequestFake()); });

  setUp(() {
    apiClient = MockOpsApiClient();
    repository = MyRepository(apiClient: apiClient, currentRouteGetter: () => '/test');
  });
}
```

### Controller/provider tests:

```dart
void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  late MockOpsApiClient mockApiClient;

  setUpAll(() { registerFallbackValue(ApiRequestFake()); });

  setUp(() {
    mockApiClient = MockOpsApiClient();
    // stub common dependencies...
  });

  ProviderContainer makeContainer() => ProviderContainer(overrides: [
    opsApiClientProvider.overrideWithValue(mockApiClient),
  ]);
}
```

### Widget tests:

```dart
void main() {
  setUp(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    InspireTextStyle.apply();
  });
}
```

---

## 5. Pump pattern

Always **two pumps** to resolve async providers:

```dart
await tester.pumpWidget(_buildWidget(container: container));
await tester.pump();
await tester.pump();
```

For animations: `await tester.pump(const Duration(milliseconds: 300));`

---

## 6. Translations mock

```dart
final _translations = <String, Map<String, String>>{
  'ENTITY-DATA-MANAGEMENT': { 'waitTimeSummaryTitle': 'Wait Time Summary' },
};
translatorProvider.overrideWithValue(Translator(translations: _translations)),
```

---

## 7. Test types by layer

| Type | Overrides | Notes |
|------|-----------|-------|
| Model | 0 | `fromJson`/`toJson`, `copyWith` only |
| Helper | 0–1 | Pure functions |
| Repository | 1–2 | Mock the API client |
| Provider | 2–4 | ProviderContainer with overrides |
| Controller | 4–7 | Mock repo + dependency providers |
| Widget/Page | 8–15+ | All providers consumed by the widget tree |

---

## 8. Error handling patterns

```dart
// Repository: returns null on error
test('returns null on error', () async {
  when(() => apiClient.execute(...)).thenThrow(Exception('error'));
  expect(await repository.getData(''), isNull);
});

// Widget: error state renders error view
testWidgets('shows error view', (tester) async {
  final container = _makeContainer(controllerFactory: _FakeControllerError.new);
  // ...pump...
  expect(find.byType(OpsNoContentFoundView), findsOneWidget);
});
```

---

## 9. Naming conventions

- Mocks: `MockXxx`
- Fakes: `ApiRequestFake`, `_FakeTimezoneController`
- Private helpers: `_makeContainer`, `_buildWidget`
- Test data: `_translations`, `_mockEntity`

---

## Quick reference

| Aspect | Pattern |
|--------|---------|
| Mock library | `mocktail` |
| Mock classes | `class X extends Mock implements Y {}` |
| Fake controllers | `class X extends Controller { @override build() => data; }` |
| Fallback values | `registerFallbackValue()` in `setUpAll` |
| Widget wrapper | `UncontrolledProviderScope` + `MaterialApp` |
| Provider testing | `ProviderContainer` with `overrides` |
| Container cleanup | `addTearDown(container.dispose)` |
| Async state | `container.read(provider.future)` |
| Pump pattern | 2x `pump()` |
| Translations | `Translator(translations: {...})` |
| Font init | `InspireTextStyle.apply()` |
| Ticket refs | `// OPS-XXXXX` |
