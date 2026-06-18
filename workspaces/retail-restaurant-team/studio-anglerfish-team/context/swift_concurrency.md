# Swift Concurrency Conventions — Studio Anglerfish

## General Rules

1. **Prefer `async/await` over GCD** for new code. GCD is acceptable only in low-level framework interop or performance-critical synchronous work.
2. **Prefer structured concurrency** (`withTaskGroup`, `async let`) over unstructured `Task {}`. Never use `Task {}` in a loop — use a task group instead.
3. **Never use `@unchecked Sendable` to fix compiler errors.** Use actors, value types, or `sending` parameters instead. The only legitimate use is types with verified internal locking.
4. **Never create `Task {}` to bridge sync → async** if the calling function can itself be `async`. If `Task {}` is needed (e.g., button action), always handle errors inside the closure.

## Actors

5. **Actor reentrancy** — never assume state is unchanged after `await`. Capture results into locals before writing back:

```swift
// ✅ Correct
actor Cache {
    var items: [String: Data] = [:]

    func load(_ key: String) async throws -> Data {
        if let cached = items[key] { return cached }
        let data = try await download(key)
        items[key] = data
        return data
    }
}
```

6. **Deduplicate concurrent work** — store in-flight `Task` handles to prevent multiple callers from duplicating expensive operations.
7. **Serial `DispatchQueue` → `actor`** for new code that protects mutable state.

## Error Handling & Cancellation

8. **Always handle `CancellationError` separately** — don't show it as a user-facing error:

```swift
do {
    try await loadData()
} catch is CancellationError {
    // Normal lifecycle event — do nothing
} catch {
    self.errorMessage = error.localizedDescription
}
```

9. **Cancel stored tasks** before starting new ones, and cancel on teardown:

```swift
func load() {
    loadTask?.cancel()
    loadTask = Task { await fetchData() }
}
```

10. **Don't swallow errors in `Task {}` closures** — handle or surface them. A throwing task with no error handling silently loses failures.

## Bridging & Streams

11. **Use `withCheckedContinuation`** (not `withUnsafeContinuation`) for wrapping callback-based APIs. The continuation must be resumed exactly once on every code path.
12. **Prefer `AsyncStream.makeStream(of:)` factory** over the closure-based initializer:

```swift
let (stream, continuation) = AsyncStream.makeStream(of: Event.self)
```

13. **Specify buffering policy** for high-throughput streams — don't use unbounded:

```swift
let (stream, continuation) = AsyncStream.makeStream(
    of: SensorReading.self,
    bufferingPolicy: .bufferingNewest(100)
)
```

## Swift 6.2

14. **Use `@concurrent`** for CPU-heavy work that should leave the caller's actor (parsing, image processing, compression). Don't use it for ordinary async I/O which suspends naturally.
