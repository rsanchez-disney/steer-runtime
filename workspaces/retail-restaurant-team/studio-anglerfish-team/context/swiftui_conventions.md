# SwiftUI Conventions — Studio Anglerfish

## Views & Structure

1. **Extract subviews** into separate `View` structs in their own files. Do not use computed properties or methods returning `some View`.
2. **One type per file** — no multiple structs/classes/enums in a single file.
3. **Extract button actions** and logic into methods. No business logic inline in `body`, `task()`, or `onAppear()`.
4. **Use `.task()` over `onAppear()`** for async work — it auto-cancels on disappear.
5. **Keep view initializers trivial** — no heavy computation. Move work to `.task()`.

## Data Flow

6. **Use `@Observable`** with `@State` (ownership), `@Bindable` / `@Environment` (passing). Avoid `ObservableObject`, `@Published`, `@StateObject`, `@ObservedObject` in new code.
7. **`@Observable` classes must be `@MainActor`** unless the module uses default main-actor isolation.
8. **`@State` must be `private`** — owned only by the view that created it.
9. **Avoid `Binding(get:set:)` in body** — use `@State` with `onChange()` instead.

## Modern API (replace deprecated)

| Deprecated                       | Use Instead                               |
|----------------------------------|-------------------------------------------|
| `foregroundColor()`              | `foregroundStyle()`                       |
| `cornerRadius()`                 | `clipShape(.rect(cornerRadius:))`         |
| `NavigationView`                 | `NavigationStack` / `NavigationSplitView` |
| `NavigationLink(destination:)`   | `navigationDestination(for:)`             |
| `.navigationBarLeading/Trailing` | `.topBarLeading` / `.topBarTrailing`      |
| `PreviewProvider`                | `#Preview`                                |

## Performance

10. **Avoid `AnyView`** — use `@ViewBuilder`, `Group`, or generics.
11. **Ternary in modifiers** over if/else view branching to preserve structural identity:

```swift
// ✅ Preserves identity
Text("Hello").opacity(isVisible ? 1 : 0)

// ❌ Creates _ConditionalContent, recreates views
if isVisible { Text("Hello") } else { Text("Hello").hidden() }
```

12. **`LazyVStack`/`LazyHStack`** for large data sets in `ScrollView`. Flag eager stacks with many children.

## Accessibility

13. **Respect Dynamic Type** — never force fixed font sizes. Use `.font(.body)`, `.font(.headline)`, etc. Use `@ScaledMetric` for custom sizes.
14. **All buttons must include text labels**, even if visually icon-only:

```swift
// ✅ Text available for VoiceOver
Button("Add Item", systemImage: "plus", action: addItem)
    .labelStyle(.iconOnly)

// ❌ Invisible to VoiceOver
Button(action: addItem) { Image(systemName: "plus") }
```

15. **Never use `onTapGesture()` when `Button` works.** If unavoidable, add `.accessibilityAddTraits(.isButton)`.
16. **Minimum tap area: 44×44pt** — enforced per Apple HIG.
