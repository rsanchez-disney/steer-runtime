# Golden Test — Text Style & Layout Patterns

## Text Style & Color Testing

Beyond golden image comparison, verify text properties programmatically using widget assertions. This catches regressions in font size, color, and weight that might be subtle in golden diffs.

### Pattern: Assert Text Style Properties

```dart
testWidgets('label has correct style', (tester) async {
  await tester.binding.setSurfaceSize(phoneSize);
  addTearDown(() => tester.binding.setSurfaceSize(null));

  // ... setup and pump ...

  // Use translator to get the actual rendered text (not hardcoded English)
  final translator = container.read(translatorProvider);
  final labelText = translator.translate(SomeTranslationEntry.myLabel);

  final finder = find.textContaining(labelText);
  expect(finder, findsOneWidget);

  final textWidget = tester.widget<Text>(finder);
  expect(textWidget.style?.color, HyperionColor.grey700);
  expect(textWidget.style?.fontSize, HyperionTextStyle.t10.fontSize);
  expect(textWidget.style?.fontWeight, FontWeight.w600);
});
```

### Key Rules

1. **Always use translator for text lookup** — never hardcode English strings. The translator returns the key when no translation is loaded, so use `translator.translate(...)` to get the actual rendered text.

2. **Assert against design system constants** — compare to `HyperionTextStyle.t10.fontSize` rather than magic numbers like `12.0`. This way tests break only when the widget deviates from the design system, not when the design system itself evolves.

3. **Available assertions**:
   - `textWidget.style?.fontSize` — font size in logical pixels
   - `textWidget.style?.color` — text color (compare to `HyperionColor.*`)
   - `textWidget.style?.fontWeight` — weight (e.g., `FontWeight.w700`)
   - `textWidget.style?.fontFamily` — font family name

4. **Finding text widgets**:
   - `find.text('exact text')` — exact match
   - `find.textContaining('partial')` — partial match (useful for dynamic text like "Unaudited (userId)")
   - `tester.widget<Text>(finder)` — get the widget to inspect its style

5. **RichText / TextSpan** — for `RichText` widgets, access spans:
   ```dart
   final richText = tester.widget<RichText>(finder);
   final textSpan = richText.text as TextSpan;
   final firstSpan = textSpan.children![0] as TextSpan;
   expect(firstSpan.style?.fontSize, 14.0);
   ```

## Layout Testing — Paddings, Alignments, and Sizes

Golden tests catch visual regressions, but programmatic layout assertions provide precise, self-documenting checks for spacing, alignment, and dimensions.

### Pattern: Assert Padding

```dart
testWidgets('widget has correct padding', (tester) async {
  // ... setup and pump ...

  // Find a specific Padding widget (use ancestor/descendant for precision)
  final paddingFinder = find.descendant(
    of: find.byType(MyWidget),
    matching: find.byType(Padding),
  );
  final paddingWidget = tester.widget<Padding>(paddingFinder.first);
  final edgeInsets = paddingWidget.padding as EdgeInsets;

  expect(edgeInsets.left, HyperionPadding.medium);
  expect(edgeInsets.right, HyperionPadding.medium);
  expect(edgeInsets.top, HyperionPadding.small);
  expect(edgeInsets.bottom, equals(0.0));
});
```

### Pattern: Assert Widget Size (SizedBox, Container)

```dart
testWidgets('widget has correct dimensions', (tester) async {
  // ... setup and pump ...

  // Option 1: Check SizedBox properties directly
  final sizedBoxFinder = find.descendant(
    of: find.byKey(const ValueKey('my_widget')),
    matching: find.byType(SizedBox),
  );
  final sizedBox = tester.widget<SizedBox>(sizedBoxFinder.first);
  expect(sizedBox.height, 200.0);
  expect(sizedBox.width, double.infinity);

  // Option 2: Check rendered size via RenderBox
  final widgetFinder = find.byKey(const ValueKey('my_widget'));
  final renderBox = tester.renderObject<RenderBox>(widgetFinder);
  expect(renderBox.size.width, closeTo(390.0, 1.0));
  expect(renderBox.size.height, greaterThan(100.0));
});
```

### Pattern: Assert Alignment

```dart
testWidgets('row has correct alignment', (tester) async {
  // ... setup and pump ...

  // Check Row/Column alignment
  final rowFinder = find.descendant(
    of: find.byType(MyWidget),
    matching: find.byType(Row),
  );
  final row = tester.widget<Row>(rowFinder.first);
  expect(row.mainAxisAlignment, MainAxisAlignment.end);
  expect(row.crossAxisAlignment, CrossAxisAlignment.center);

  // Check Align widget
  final alignFinder = find.byType(Align);
  final align = tester.widget<Align>(alignFinder);
  expect(align.alignment, Alignment.centerLeft);
});
```

### Pattern: Assert Position (Relative Layout)

```dart
testWidgets('widget is positioned correctly', (tester) async {
  // ... setup and pump ...

  // Get the rendered position and size
  final finder = find.byType(MyWidget);
  final topLeft = tester.getTopLeft(finder);
  final size = tester.getSize(finder);
  final center = tester.getCenter(finder);

  // Assert position
  expect(topLeft.dx, greaterThanOrEqualTo(0.0));
  expect(topLeft.dy, greaterThan(kToolbarHeight));

  // Assert size
  expect(size.width, closeTo(390.0, 1.0)); // full phone width
  expect(size.height, greaterThan(50.0));
});
```

### Pattern: Assert Container Decoration

```dart
testWidgets('container has correct decoration', (tester) async {
  // ... setup and pump ...

  final containerFinder = find.descendant(
    of: find.byType(MyWidget),
    matching: find.byType(Container),
  );
  final container = tester.widget<Container>(containerFinder.first);
  final decoration = container.decoration as BoxDecoration;

  expect(decoration.color, Colors.white);
  expect(decoration.borderRadius, BorderRadius.circular(8.0));
});
```

### Pattern: Assert ColoredBox Background

```dart
testWidgets('section has white background', (tester) async {
  // ... setup and pump ...

  final coloredBoxFinder = find.descendant(
    of: find.byType(MyWidget),
    matching: find.byType(ColoredBox),
  );
  final coloredBox = tester.widget<ColoredBox>(coloredBoxFinder.first);
  expect(coloredBox.color, Colors.white);
});
```

### Key Rules for Layout Testing

1. **Use `find.descendant` for precision** — avoid `find.byType(Padding).first` which grabs the first Padding in the entire tree. Scope to a parent widget.

2. **Use `closeTo` for rendered sizes** — pixel rounding can cause tiny differences:
   ```dart
   expect(size.width, closeTo(390.0, 1.0));
   ```

3. **Use design system constants** — compare to `HyperionPadding.medium` not `16.0`:
   ```dart
   expect(edgeInsets.left, HyperionPadding.medium);
   ```

4. **Cast padding to EdgeInsets** — `Padding.padding` is `EdgeInsetsGeometry`, cast to `EdgeInsets` for directional access:
   ```dart
   final edgeInsets = paddingWidget.padding as EdgeInsets;
   ```

5. **Use Keys for targeting** — when multiple widgets of the same type exist, use `ValueKey` or the project's `OpsKeys`:
   ```dart
   find.byKey(OpsKeys.gateCountsHeader)
   ```

6. **Useful tester geometry methods**:
   - `tester.getSize(finder)` — rendered Size of the widget
   - `tester.getTopLeft(finder)` — Offset of top-left corner
   - `tester.getCenter(finder)` — Offset of center point
   - `tester.getRect(finder)` — full Rect (position + size)
   - `tester.renderObject<RenderBox>(finder)` — access the RenderBox directly

7. **AnimatedSize / AnimatedContainer** — pump enough frames before asserting, as the size may be animating:
   ```dart
   await tester.pump(const Duration(milliseconds: 300));
   ```

## Required Test Groups

Every golden test file MUST include these three test groups:

1. **Golden tests** — Visual snapshot tests for each state (loading, data, error, empty)
2. **Text style tests** — Programmatic assertions on `Text` widget styles (fontSize, color, fontWeight) for all visible labels, titles, and links in the data-loaded state
3. **Layout tests** — Programmatic assertions on container decorations (background color, shadows, border radius) for key structural widgets

### Why all three are required

- Golden tests catch visual regressions but are fragile to font rendering differences across machines
- Text style tests provide precise, machine-independent verification that the correct design system tokens are used
- Layout tests verify structural properties (colors, shadows, spacing) that may be subtle in golden diffs

### ENFORCEMENT: Never skip text style and layout tests

A golden test file that ONLY contains golden image comparisons is INCOMPLETE. You MUST always add:

- At minimum 3-5 text style assertions covering: page title, section titles, status labels, action links
- At minimum 2-3 layout assertions covering: background colors, key container decorations
- Assertions MUST use design system constants (e.g., `HyperionTextStyle.t7_black.fontSize`) not magic numbers
- Assertions MUST verify both `fontSize` AND `color` for each text element

If you generate a golden test file without these programmatic assertions, you have NOT completed the task.

## Full Working References

See `test/src/features/counts/presentation/pages/ops_gate_counts_screen_golden_test.dart` for a complete, working golden test example that covers:

- Loading state (no region set → controller stays in AsyncLoading)
- Data loaded state (region pre-set → full async chain completes → chart renders)
- Empty data state (repository returns empty → SizedBox.shrink renders)
- Phone-sized surface (393×852)
- Proper mock setup for OperatingHoursController with state-updating override
- LaneConfig IDs matching laneTypeId in counts response
- Timer-safe pumping (discrete pumps, no pumpAndSettle)
- Text style assertions (fontSize, color) for labels and titles

See `test/src/features/home_screen/presentation/pages/home_page_golden_test.dart` for a CDUI-based page golden test that covers:

- Loading state (delayed repository response → controller stays in AsyncLoading → OpsheetLoader renders)
- Error state (repository throws → controller enters AsyncError → WelcomeSection renders)
- Data loaded state (repository returns screen data with `type: 'home-screen'` → CDUIParser renders widget tree)
- Overflow error suppression for untranslated keys
- Mocking all `initState` controllers (languages, standardOperationName, appInfo, appVersion, notifications, notificationPreferences)
- `regionsInfoProvider` override for RegionTile
- `opsPersistentMessagesBannerControllerProvider` override for OpsheetScaffold
