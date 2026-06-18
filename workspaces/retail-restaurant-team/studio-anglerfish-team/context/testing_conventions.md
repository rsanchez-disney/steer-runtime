# Testing Conventions — Studio Anglerfish (iOS)

## Stack

- **Swift Testing** — default for all new tests
- **XCTest** — legacy tests only (do not add new XCTest-based tests)
- Protocol-based mocking (no external mock library)
- async/await for asynchronous tests

> ⚠️ All new test files MUST use Swift Testing (`import Testing`). Do not use XCTest for new code.

## Unit Test Template (Swift Testing)

```swift
import Testing
@testable import MobileOrder

@Suite("OrderService")
struct OrderServiceTests {

    let mockRepository = MockOrderRepository()
    let mockPaymentClient = MockPaymentClient()
    var sut: OrderService

    init() {
        sut = OrderService(repository: mockRepository, paymentClient: mockPaymentClient)
    }

    @Test("submit order with valid request returns success")
    func submitOrder_withValidRequest_returnsSuccess() async throws {
        mockPaymentClient.authorizeResult = .success(.authorized)

        let result = try await sut.submitOrder(guestId: "guest-123", items: [.mock])

        #expect(result.status == .created)
        #expect(mockRepository.savedOrders.count == 1)
    }

    @Test("submit order when payment declined throws error")
    func submitOrder_whenPaymentDeclined_throwsError() async {
        mockPaymentClient.authorizeResult = .success(.declined)

        await #expect(throws: PaymentDeclinedError.self) {
            try await sut.submitOrder(guestId: "guest-123", items: [.mock])
        }
    }
}
```

## ViewModel Test Template (Swift Testing)

```swift
import Testing
@testable import MobileOrder

@Suite("OrderViewModel")
struct OrderViewModelTests {

    let mockService = MockOrderService()
    var sut: OrderViewModel

    init() {
        sut = OrderViewModel(orderService: mockService)
    }

    @Test("loadOrders sets orders on success")
    func loadOrders_setsOrdersOnSuccess() async {
        mockService.ordersResult = [Order.mock(id: "1"), Order.mock(id: "2")]

        await sut.loadOrders()

        #expect(sut.orders.count == 2)
        #expect(!sut.isLoading)
        #expect(sut.errorMessage == nil)
    }

    @Test("loadOrders sets error on failure")
    func loadOrders_setsErrorOnFailure() async {
        mockService.shouldThrow = true

        await sut.loadOrders()

        #expect(sut.orders.isEmpty)
        #expect(!sut.isLoading)
        #expect(sut.errorMessage != nil)
    }
}
```

## Parameterized Tests

```swift
@Test("order status display text", arguments: [
    (OrderStatus.created, "Preparing"),
    (OrderStatus.ready, "Ready for Pickup"),
    (OrderStatus.completed, "Completed"),
])
func orderStatusDisplay(status: OrderStatus, expected: String) {
    #expect(status.displayText == expected)
}
```

## Mock Pattern

```swift
protocol OrderRepositoryProtocol {
    func save(_ order: Order) async throws
    func findById(_ id: String) async throws -> Order?
}

final class MockOrderRepository: OrderRepositoryProtocol {
    var savedOrders: [Order] = []
    var findByIdResult: Order?
    var shouldThrow = false

    func save(_ order: Order) async throws {
        if shouldThrow { throw MockError.saveFailed }
        savedOrders.append(order)
    }

    func findById(_ id: String) async throws -> Order? {
        if shouldThrow { throw MockError.fetchFailed }
        return findByIdResult
    }
}
```

## Naming Conventions

| Pattern                                  | Example                                                    |
|------------------------------------------|------------------------------------------------------------|
| `func <method>_<condition>_<expected>()` | `func submitOrder_whenPaymentDeclined_throwsError()`       |
| `@Test("human-readable description")`    | `@Test("submit order when payment declined throws error")` |

## Rules

- **New tests → Swift Testing** (`import Testing`, `@Suite`, `@Test`, `#expect`)
- **Existing XCTest** → leave as-is unless refactoring the file
- Protocol-based dependency injection for testability
- Mocks implement protocols, track calls via arrays/flags
- Use `async/await` for async tests
- One assertion concept per test
- No real network calls — all HTTP mocked via protocol injection
- Use `.mock` static factory methods for test data
- Group tests by struct: `{TypeName}Tests.swift`

## Test Data Factories

```swift
extension Order {
    static func mock(
        id: String = "order-123",
        status: OrderStatus = .created,
        items: [OrderItem] = [.mock]
    ) -> Order {
        Order(id: id, status: status, items: items)
    }
}

extension OrderItem {
    static var mock: OrderItem {
        OrderItem(name: "Burger", price: 12.99, quantity: 1)
    }
}
```

## Coverage

- Target: ≥80% line coverage for business logic
- Exclude: Generated code, UI-only views, third-party wrappers
- Report: Use Xcode's built-in coverage or `xcresult` parsing

## Async & Concurrency Testing

### 1. Async tests — no wrappers

Make the test function `async` directly. Do not wrap in `Task {}` or use expectations/semaphores.

```swift
@Test func userLoads() async throws {
    let user = try await UserService().load(id: "123")
    #expect(user.name == "Alice")
}
```

### 2. Testing actor state

Access actor properties via `await`. Do not add `nonisolated` accessors just for testing.

```swift
@Test func cachingWorks() async throws {
    let cache = ImageCache()
    let image = try await cache.image(for: testURL)
    let cached = try await cache.image(for: testURL)
    #expect(image == cached)
}
```

### 3. Use `confirmation()` instead of `XCTestExpectation`

For async events (callbacks, notifications, streams), use `confirmation()`:

```swift
@Test func notificationFires() async {
    await confirmation { confirmed in
        let task = Task {
            for await _ in NotificationCenter.default.notifications(named: .dataDidChange) {
                confirmed()
                break
            }
        }
        await Task.yield()
        NotificationCenter.default.post(name: .dataDidChange, object: nil)
        await task.value
    }
}
```

All async work must complete before the `confirmation()` closure returns.

### 4. `@MainActor` isolation in tests

Mark tests with `@MainActor` when testing code that requires main-actor isolation:

```swift
@MainActor
@Test func viewModelUpdatesOnMainActor() async {
    let vm = ViewModel()
    await vm.refresh()
    #expect(vm.items.isEmpty == false)
}
```

### 5. Avoid timing-based tests

Never use `Task.sleep` or fixed delays. Await the actual operation:

```swift
// ❌ Flaky — relies on timing
@Test func dataLoads() async throws {
    viewModel.load()
    try await Task.sleep(for: .seconds(1))
    #expect(viewModel.items.isEmpty == false)
}

// ✅ Correct — awaits the real work
@Test func dataLoads() async throws {
    await viewModel.load()
    #expect(viewModel.items.isEmpty == false)
}
```

### 6. Testing cancellation

Verify that *production code* checks cancellation. Cancel the task while it's suspended and verify `CancellationError`:

```swift
@Test func processorRespectsCancel() async throws {
    let processor = Processor(items: Array(repeating: .stub, count: 1_000))
    let task = Task { try await processor.run() }

    try await Task.sleep(for: .zero)
    task.cancel()

    await #expect(throws: CancellationError.self) {
        try await task.value
    }
}
```

### 7. `.serialized` trait

`.serialized` only affects **parameterized** test cases. It does nothing on non-parameterized tests.

```swift
// Runs each argument case sequentially (not in parallel)
@Test(.serialized, arguments: ["alice", "bob", "charlie"])
func accountCreation(username: String) async throws {
    let account = try await AccountService().create(username: username)
    #expect(account.isActive)
}
```

### 8. Thread Sanitizer (TSan)

Enable TSan in test schemes to catch data races the compiler misses (especially with `@unchecked Sendable`):

- Xcode: Product → Scheme → Edit Scheme → Diagnostics → Thread Sanitizer
- Adds overhead — consider enabling for CI only, not every local run
