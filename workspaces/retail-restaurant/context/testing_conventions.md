# Testing Conventions

## Java / Spring Boot (Studio Lumiere services)

### Stack
- JUnit 5 + Mockito + Spring Boot Test
- AssertJ for fluent assertions
- WireMock for HTTP stubbing
- Testcontainers for integration tests (if DB needed)

### Unit Test Template

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private OrderService subject;

    @Test
    void shouldCreateOrder_whenValidRequest() {
        // Arrange
        var request = new CreateOrderRequest("guest-123", List.of(item));
        when(paymentClient.authorize(any())).thenReturn(new AuthResponse(true));

        // Act
        var result = subject.createOrder(request);

        // Assert
        assertThat(result.getStatus()).isEqualTo(OrderStatus.CREATED);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void shouldThrowException_whenPaymentDeclined() {
        when(paymentClient.authorize(any())).thenReturn(new AuthResponse(false));

        assertThatThrownBy(() -> subject.createOrder(request))
            .isInstanceOf(PaymentDeclinedException.class)
            .hasMessageContaining("declined");
    }
}
```

### Controller Test Template

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    void shouldReturn200_whenOrderFound() throws Exception {
        when(orderService.getOrder("order-1")).thenReturn(new OrderDto("order-1", "CREATED"));

        mockMvc.perform(get("/api/v1/orders/order-1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.orderId").value("order-1"));
    }

    @Test
    void shouldReturn404_whenOrderNotFound() throws Exception {
        when(orderService.getOrder("bad-id")).thenThrow(new OrderNotFoundException("bad-id"));

        mockMvc.perform(get("/api/v1/orders/bad-id"))
            .andExpect(status().isNotFound());
    }
}
```

### Rules
- Test naming: `should<Expected>_when<Condition>`
- One assertion concept per test
- Mock external dependencies, never real HTTP calls in unit tests
- Use `@SpringBootTest` only for integration tests
- Gradle: `./gradlew test`
- Maven: `mvn test`

---

## Android / Kotlin (Studio Proteus)

### Stack
- JUnit 4 + MockK
- Kotlin Coroutines Test (`runTest`, `TestDispatcher`)
- Turbine for Flow testing

### Unit Test Template

```kotlin
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.Assert.assertEquals

private const val GUEST_ID = "guest-123"
private const val ORDER_ID = "order-456"

class OrderViewModelTest {

    @MockK
    private lateinit var orderRepository: OrderRepository

    @RelaxedMockK
    private lateinit var analytics: AnalyticsTracker

    private lateinit var subject: OrderViewModel

    @Before
    fun setup() {
        MockKAnnotations.init(this)
        subject = OrderViewModel(orderRepository, analytics)
    }

    @After
    fun tearDown() {
        clearAllMocks()
        unmockkAll()
    }

    @Test
    fun `given valid order when submit then emits success state`() = runTest {
        // Arrange
        coEvery { orderRepository.submitOrder(any()) } returns Result.success(ORDER_ID)

        // Act
        subject.submitOrder(GUEST_ID)

        // Assert
        assertEquals(OrderState.Success(ORDER_ID), subject.state.value)
        coVerify { analytics.track("order_submitted", any()) }
    }

    @Test
    fun `given network error when submit then emits error state`() = runTest {
        coEvery { orderRepository.submitOrder(any()) } returns Result.failure(IOException())

        subject.submitOrder(GUEST_ID)

        assertEquals(OrderState.Error("Network error"), subject.state.value)
    }
}
```

### Rules
- Test naming: `` `given <pre> when <action> then <result>` ``
- Use `coEvery`/`coVerify` for suspend functions
- Use `MockKAnnotations.init(this)` in setup, `clearAllMocks()` + `unmockkAll()` in tearDown
- No `@InjectMockKs` — instantiate subject manually
- Constants at top of file
- `mockkStatic` for `@JvmStatic`, `mockkObject` for Kotlin `object`
- Gradle: `./gradlew testDebugUnitTest`

---

## iOS / Swift (Studio Anglerfish)

### Stack
- XCTest + Swift Testing (where available)
- Protocol-based mocking (no external mock library)
- Combine testing with `XCTestExpectation` or async/await

### Unit Test Template

```swift
import XCTest
@testable import MobileOrder

final class OrderServiceTests: XCTestCase {

    private var sut: OrderService!
    private var mockRepository: MockOrderRepository!
    private var mockPaymentClient: MockPaymentClient!

    override func setUp() {
        super.setUp()
        mockRepository = MockOrderRepository()
        mockPaymentClient = MockPaymentClient()
        sut = OrderService(repository: mockRepository, paymentClient: mockPaymentClient)
    }

    override func tearDown() {
        sut = nil
        mockRepository = nil
        mockPaymentClient = nil
        super.tearDown()
    }

    func test_submitOrder_withValidRequest_returnsSuccess() async throws {
        // Arrange
        mockPaymentClient.authorizeResult = .success(.authorized)

        // Act
        let result = try await sut.submitOrder(guestId: "guest-123", items: [.mock])

        // Assert
        XCTAssertEqual(result.status, .created)
        XCTAssertEqual(mockRepository.savedOrders.count, 1)
    }

    func test_submitOrder_whenPaymentDeclined_throwsError() async {
        mockPaymentClient.authorizeResult = .success(.declined)

        do {
            _ = try await sut.submitOrder(guestId: "guest-123", items: [.mock])
            XCTFail("Expected error")
        } catch {
            XCTAssertTrue(error is PaymentDeclinedError)
        }
    }
}
```

### Mock Pattern

```swift
final class MockOrderRepository: OrderRepositoryProtocol {
    var savedOrders: [Order] = []

    func save(_ order: Order) async throws {
        savedOrders.append(order)
    }
}
```

### Rules
- Test naming: `test_<method>_<condition>_<expected>`
- Protocol-based dependency injection for testability
- Mocks implement protocols, track calls via arrays/flags
- Use `async/await` for async tests
- `setUp`/`tearDown` for lifecycle
- Run: `xcodebuild test -scheme MobileOrder -destination 'platform=iOS Simulator,name=iPhone 15'`

---

## Node.js (DiSCO Admin API, Dining Menu Web API)

### Stack
- Jest + Supertest
- `jest.mock()` for module mocking

### Unit Test Template

```typescript
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let mockRepo: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    mockRepo = { findById: jest.fn(), save: jest.fn() } as any;
    service = new OrderService(mockRepo);
  });

  it('should return order when found', async () => {
    mockRepo.findById.mockResolvedValue({ id: '123', status: 'CREATED' });

    const result = await service.getOrder('123');

    expect(result.status).toBe('CREATED');
  });

  it('should throw when order not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.getOrder('bad')).rejects.toThrow('Order not found');
  });
});
```

### Rules
- `describe` per class/module, `it` per behavior
- `beforeEach` for fresh setup
- Mock at boundaries (DB, HTTP, external services)
- Run: `npm test` or `npx jest`

---

## Angular (DiSCO Admin UI, Dining Menu UI)

### Stack
- Jasmine + Karma (or Jest if migrated)
- Angular TestBed for component tests

### Component Test Template

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../services/order.service';
import { of } from 'rxjs';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
    mockOrderService.getOrders.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [OrderListComponent],
      providers: [{ provide: OrderService, useValue: mockOrderService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display orders when loaded', () => {
    mockOrderService.getOrders.and.returnValue(of([{ id: '1', name: 'Burger' }]));
    component.ngOnInit();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.order-row');
    expect(rows.length).toBe(1);
  });
});
```

### Rules
- Use `TestBed` for components, plain instantiation for services
- `jasmine.createSpyObj` for mocking
- Run: `ng test`
