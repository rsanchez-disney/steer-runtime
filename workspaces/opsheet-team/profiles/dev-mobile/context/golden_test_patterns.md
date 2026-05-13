# Golden Test Reference Patterns

## Critical Knowledge — Common Pitfalls

### 1. Provider Chain Dependencies

Riverpod widgets often have async chains where one provider's listener triggers the next fetch. In tests, these chains frequently break because:

- **Missing region/entity selection**: Controllers often guard with `if (region == null) return`. Always pre-set selection providers (e.g., `currentRegionProvider`) before pumping the widget.
- **Mocked notifiers with `Mock`**: When using `class MockController extends SomeController with Mock`, all methods become no-ops returning null. If the real method updates `state` (triggering listeners), you MUST override it:

```dart
class _MockOperatingHours extends OperatingHoursController with Mock {
  @override
  OperatingHours? build() => OperatingHours.fromJson(mockData);

  @override
  Future<OperatingHours?> getOperatingHours({
    String? entityId,
    DateTime? date,
  }) async {
    final result = OperatingHours.fromJson(mockData);
    state = result; // THIS is what triggers downstream listeners
    return result;
  }
}
```

### 2. Never Use `pumpAndSettle` with Timers or Animations

Pages with `Timer.periodic` (auto-refresh) or Lottie/animation widgets will cause `pumpAndSettle` to time out. Instead:

```dart
// Pump multiple discrete frames
for (var i = 0; i < 10; i++) {
  await tester.pump(const Duration(milliseconds: 100));
}
```

### 3. LaneConfig / Style Matching

Chart widgets (fl_chart) crash with `Bad state: No element` when `lineChartBarDataList` is empty. This happens when:
- `LaneConfig.id` doesn't match the `laneTypeId` in the data response
- The chart calls `.first` on an empty filtered list

Always ensure mock `LaneConfig` IDs match the `laneTypeId` values in your mock counts/data responses.

### 4. Widget initState Reads Provider State

Some widgets read provider state in `initState` (e.g., `OpsSummaryView` calls `getChartCountSpots()` in `initState`). If the data isn't loaded yet at that point, the widget initializes with empty data and won't update. Solutions:
- Ensure the async chain completes BEFORE the widget's first build
- Or pre-seed the provider state before `pumpWidget`

### 5. Error State Testing

Throwing exceptions from mocked repositories often causes unhandled errors in the test framework because controllers may not have try-catch. Prefer:
- Testing error states only if the controller uses `AsyncValue.guard`
- Or accepting that error golden tests may not be feasible for all screens

### 6. RemoteConfig and Feature Toggles

`OpsBottomNavigationBar` and other widgets watch `remoteConfigControllerProvider`. Always override it:

```dart
remoteConfigControllerProvider.overrideWith(
  (ref) async => RemoteConfig(
    appStoreUrl: '',
    featureToggles: {'countsComparison': false, 'ticketTypes': false},
    minOSSupportedVersion: '1.0.0',
    minSupportedVersion: '1.0.0',
    myId: MyIDConfig(baseUrl: '', clientId: '', logoutUri: '', redirectUri: '', scope: ''),
    newRelicId: '',
    platform: 'ios',
    secondsUntilSessionTimeoutWarning: 300,
    servicesUrl: '',
  ),
),
```

### 7. Environment Style Provider

`OpsAppBar` reads `environmentStyleProvider`. Always override:

```dart
environmentStyleProvider.overrideWith(
  (ref) => EnvironmentStyleController(Colors.white),
),
```

### 8. Surface Size — Mobile Device Dimensions

The default test surface is 800×600 (tablet/web). Always set a phone size inside each `testWidgets`:

```dart
// iPhone 16 dimensions (logical pixels)
const phoneSize = Size(393, 852);

testWidgets('my test', (tester) async {
  await tester.binding.setSurfaceSize(phoneSize);
  addTearDown(() => tester.binding.setSurfaceSize(null));
  // ... rest of test
});
```

**Important**: `setSurfaceSize` must be called inside `testWidgets`, not in a group-level `setUp`.

### 9. CDUIParser Requires `type` Key in Mock Screen Data

The `CDUIParser.fromJson(data)` method first calls `widgetsMap(data)` which looks for `data['type']`. If the top-level JSON doesn't have a `type` key, the parser creates a `CDUINull` widget which renders `SizedBox.shrink()` — resulting in an **empty golden**.

For pages that use CDUI (like `HomePage`), the mock screen data **MUST** include `'type': 'home-screen'` at the top level:

```dart
// WRONG — renders empty (CDUINull)
const _mockedScreenData = {
  'widgets': [
    {'type': 'appBar'},
    {'type': 'regionTile', 'data': {...}},
  ],
};

// CORRECT — renders CDUIHomeScaffold with children
const _mockedScreenData = {
  'type': 'home-screen',
  'widgets': [
    {'type': 'appBar'},
    {'type': 'regionTile', 'data': {...}},
  ],
};
```

The `CDUIWidgetRegistry` maps these top-level types:
- `'home-screen'` → `CDUIHomeScaffold` (renders `OpsheetScaffold` with children)
- `'gateCountsTile'` → `CDUIGateCountsTile`
- `'regionTile'` → `CDUIRegionTile`
- `'occupancyCarousel'` → `CDUIOccupancySection`
- `'fpoTile'` → `CDUIFpoTile`
- `'lobTile'` → `CDUILOBTile`
- `'lobPerformanceSummary'` → `CDUIPerformanceSummary`
- Unknown types → `CDUINull` (renders `SizedBox.shrink()`, ignores children)

### 10. Overflow Errors from Untranslated Keys

When `translatorProvider` has no translations loaded, `Translator.translate()` returns `'$module.$key'` (e.g., `'GATE-COUNTS.gateCountsTitle'`). These long strings can cause `RenderFlex overflow` errors in tight layouts (like `Row` with `mainAxisAlignment: spaceBetween`).

To suppress overflow errors in golden tests where the overflow is caused by untranslated keys (not a real bug):

```dart
testWidgets('data loaded state', (tester) async {
  // Suppress overflow errors caused by untranslated keys being too long
  final originalOnError = FlutterError.onError;
  FlutterError.onError = (details) {
    final isOverflow = details.toString().contains('overflowed');
    if (!isOverflow) {
      originalOnError?.call(details);
    }
  };
  addTearDown(() => FlutterError.onError = originalOnError);

  // ... rest of test
});
```

**Important**: Also apply this to loading state tests if the delayed repository response eventually resolves and renders data with long translation keys after the golden is captured.

### 11. HomePage-Specific Provider Overrides

The `HomePage` calls many controllers in `initState` via `addPostFrameCallback`. Each of these must be mocked to prevent the real API/Firebase dependency chain from throwing `UnimplementedError`:

- `languagesControllerProvider` — mock with empty list
- `standardOperationNameControllerProvider` — mock with no-op `getStandardOperationName()`
- `appInfoControllerProvider` — mock with no-op `getAppInfo()`
- `appVersionControllerProvider` — mock with no-op `validateAppVersion()`
- `notificationsControllerProvider` — mock with no-op `validateFCMTokenRegistration()`
- `notificationPreferencesControllerProvider` — mock `shouldShowAlert()` to return `false`
- `regionsInfoProvider` — override (watched by `RegionTile`)
- `opsPersistentMessagesBannerControllerProvider` — override (watched by `OpsheetScaffold`)

## Provider Override Checklist

For a typical page golden test, override:

- [ ] Repository providers (data layer mocks)
- [ ] `sharedPreferencesProvider`
- [ ] `environmentStyleProvider`
- [ ] `remoteConfigControllerProvider`
- [ ] `operatingHoursControllerProvider` (with real `getOperatingHours` override)
- [ ] `translatorProvider`
- [ ] Selection providers (`currentRegionProvider`, etc.) — set AFTER container creation
- [ ] Controller providers that need fresh state (`countsControllerProvider`, etc.)
- [ ] `userInfoControllerProvider`

## Post-Generation Validation (MANDATORY)

After generating golden files with `--update-goldens`, you MUST validate that the screenshots contain actual rendered content and are not blank/white screens.

### Step 1: Check file sizes

Run `ls -la` on the goldens directory and inspect file sizes:

```bash
ls -la test/src/features/{feature}/presentation/pages/goldens/
```

**Rules:**
- A loading state golden with a Lottie animation should be **> 5 KB**
- A data-loaded state golden should be **> 10 KB**
- An error state golden should be **> 3 KB**
- Any golden file **< 2 KB** is almost certainly a blank white screen

### Step 2: Compare sizes across states

Different states MUST produce different file sizes. If all goldens are the same size (especially small), they are likely all rendering the same blank state.

### Step 3: If blank screenshots are detected

If any golden file is suspiciously small (< 2 KB) or all files have similar small sizes:

1. **Diagnose the root cause** — the most common causes of blank goldens are:
   - `userInfoControllerProvider` not set (OpsheetScaffold renders `body: null` when `userInfo == null`)
   - `selectedEntityProvider` returning null (screen returns `SizedBox.shrink()`)
   - `currentRegionProvider` not set (controllers guard with `if (region == null) return`)
   - Permissions controller in wrong state (screen shows loading/empty instead of data)
   - CDUI parser receiving data without `'type'` key (renders `CDUINull` → `SizedBox.shrink()`)

2. **Fix the provider overrides** — add the missing provider override or state initialization

3. **Re-run `--update-goldens`** and validate file sizes again

4. **Repeat until all goldens have appropriate file sizes** for their respective states

### Step 4: Ask developer to validate

After confirming file sizes look correct, ALWAYS end your session by asking the developer to manually inspect the generated golden images:

> **Please manually review the generated golden screenshots** in `test/src/features/{feature}/presentation/pages/goldens/` to confirm they render the expected UI for each state. Golden file sizes look correct, but visual inspection is needed to verify the content matches your expectations. If any screenshot looks wrong, let me know and I'll investigate.
