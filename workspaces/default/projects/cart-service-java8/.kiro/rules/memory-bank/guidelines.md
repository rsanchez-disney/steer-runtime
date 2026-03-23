# Cart Service - Development Guidelines

## Code Quality Standards

### File Headers
Every source file includes a standard Disney copyright header with metadata:
```java
/***********************************************************************************************************************
 * FileName - ClassName.java
 *
 * (c) Disney. All rights reserved.
 *
 * $Author: username $
 * $Revision: #number $
 * $Change: changelist $
 * $Date: date $
 **********************************************************************************************************************/
```

### Package Organization
- Package names follow reverse domain notation: `com.disney.wdpro.service.cart.*`
- Logical grouping by layer: `dao`, `service`, `webservice`, `model`, `util`, `conversion`
- Sub-packages for specific domains: `dao.impl.jpa`, `model.room`, `model.dining`, `webservice.resource.mapper`

### Naming Conventions

#### Classes
- **DAO Implementations**: Prefix with `Default` (e.g., `DefaultAvailabilityDAO`, `DefaultMarketingOfferDAO`)
- **JPA Entities**: Suffix with `JPA` (e.g., `CartJPA`, `CartItemJPA`)
- **Resources (DTOs)**: Suffix with `Resource` (e.g., `DiningItemResource`, `PackageOfferResource`)
- **Mappers**: Suffix with `Mapper` (e.g., `CartDataMapper`, `TicketQueueResourceMapper`)
- **Tests**: Suffix with `Test` (e.g., `SavedShopsDAOTest`, `RESTIntegrationTest`)
- **Abstract Classes**: Prefix with `Abstract` (e.g., `AbstractJpaController`)

#### Methods
- Use descriptive verb-noun combinations: `getPackageOfferAvailability`, `validateResortPackageAvailability`
- Boolean methods start with `is`, `has`, or `can`: `isAvailabilityValid`, `hasTicketsComponent`, `canUseCachedDependency`
- Builder pattern methods: `buildJpaCartFromCart`, `buildCartFromJpaCart`
- Validation methods: `validateNotNull`, `validateAdultChildTicketQuantities`, `validateTravelAgentCommission`

#### Variables
- Use camelCase for local variables and parameters
- Descriptive names over abbreviations: `availabilityId` not `availId`, `compositeItem` not `ci`
- Constants in UPPER_SNAKE_CASE: `MAX_CARTS_BY_USER`, `STD_GST`, `FIELD_VALIDATION_ERROR`

### Code Formatting
- **Indentation**: 4 spaces (no tabs)
- **Line Length**: Generally kept under 120-140 characters
- **Braces**: Opening brace on same line, closing brace on new line
- **Blank Lines**: Single blank line between methods, logical sections within methods

## Architectural Patterns

### Dependency Injection
Spring Framework is used extensively for dependency injection:

```java
@Resource(name = "restService")
private RestCartServiceImpl restCartServiceImpl;

@Autowired
private VendomaticUtility vendomaticUtility;

@Autowired
@Qualifier("configManager")
private ConfigManagerDAO configManagerDAO;
```

**Pattern**: Use `@Resource` for named beans, `@Autowired` for type-based injection, `@Qualifier` for disambiguation.

### DAO Pattern
Data Access Objects abstract persistence logic:

```java
public interface AvailabilityDAO {
    PackageOffer getPackageOfferAvailability(CompositeItem existingCompositeItem, Cart cart);
    FlightOffer getFlightOffer(CompositeItem compositeItem);
    RentalComponent getRentalCarOffer(CompositeItem compositeItem, Cart cart);
}

public class DefaultAvailabilityDAO extends RESTFulConnectorDAO implements AvailabilityDAO {
    // Implementation using REST calls to external services
}
```

**Pattern**: Interface defines contract, implementation handles external service communication.

### Mapper Pattern
Separate mappers handle data transformation between layers:

```java
public class TicketQueueResourceMapper {
    public List<TicketQueueResource> mapToTicketQueueResource(
        CompositeItemComponents compositeItemComponents, 
        boolean isVacationOffer, 
        int quantity) {
        // Transformation logic
    }
}
```

**Pattern**: Dedicated mapper classes for each domain, methods named `mapTo*` or `buildFrom*`.

### Template Method Pattern
Abstract base classes define algorithm structure:

```java
public abstract class AbstractJpaController<T extends CartJPA> 
    implements JpaCartControllerTemplate<T> {
    
    public Cart saveCart(Cart cart) {
        validateNotNull(cart);
        setCartType(cart);
        // Template algorithm with hooks
    }
    
    protected abstract T buildJpaCartFromCart(Cart cart);
}
```

**Pattern**: Abstract methods for customization points, final methods for invariant behavior.

## Exception Handling

### Custom Exception Builder
Consistent exception creation using builder pattern:

```java
throw ApplicationExceptionStepBuilder
    .newBuilder(HttpErrorType.INTERNAL_SERVER_ERROR)
    .createError(CartErrorTypeCode.AVAILABILITY_SERVICE_ERROR, 
                 CartErrorCode.AVAILABILITY_SERVICE_ERROR)
    .setMessage("Error occurred while validating resort package")
    .buildError()
    .setCause(ex)
    .setLogCode(Integer.valueOf("14"))
    .build();
```

**Pattern**: 
- Always use `ApplicationExceptionStepBuilder` for exceptions
- Include appropriate `HttpErrorType`, `CartErrorTypeCode`, and `CartErrorCode`
- Provide descriptive messages with context (cartId, itemId, etc.)
- Set cause when wrapping exceptions
- Include unique log codes for tracking

### Exception Handling Strategy
```java
try {
    // Operation
} catch (SocketException | NoHttpResponseException ex) {
    logger.error("IOException while calling availability service", ex);
    // Retry logic or throw custom exception
} catch (Exception ex) {
    throw ApplicationExceptionStepBuilder
        .newBuilder(HttpErrorType.SERVICE_UNAVAILABLE)
        .createError(CartErrorTypeCode.SYSTEM_UNAVAILABLE, 
                     CartErrorCode.AVAILABILITY_SERVICE_ERROR)
        .setMessage(ERROR_SEND_REQUEST_TO + uri)
        .buildError()
        .setCause(ex)
        .setLogCode(Integer.valueOf("17"))
        .build();
}
```

**Pattern**: Catch specific exceptions first, generic Exception last. Always log and wrap in custom exceptions.

## Logging Practices

### Logger Initialization
```java
private static Log logger = LogFactory.getLog(DefaultAvailabilityDAO.class);
```

**Pattern**: Static logger per class using Apache Commons Logging.

### Logging Levels
```java
// DEBUG: Detailed diagnostic information
if (logger.isDebugEnabled()) {
    logger.debug("Requesting resort availability with URI: " + link);
}

// INFO: Informational messages about normal operations
logger.info("Attempted to create a cart which already exists");

// WARN: Potentially harmful situations
logger.warn("resort package offer's availability is not valid");

// ERROR: Error events that might still allow the application to continue
logger.error("Exception handled while finding cart with cartId: " + cartId, e);
```

**Pattern**: 
- Use `isDebugEnabled()` guard for expensive debug logging
- Include context (IDs, parameters) in log messages
- Log exceptions with stack traces at ERROR level

## Testing Patterns

### Test Class Structure
```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = { "classpath:RestServiceContext.xml" })
public class RESTIntegrationTest {
    
    @Resource(name = "restService")
    private RestCartServiceImpl restCartServiceImpl;
    
    @BeforeClass
    public static void setUpClass() throws Exception {
        BaseIntegrationTestSetup.setupClass();
    }
    
    @Before
    public void setUp() throws Exception {
        // Test setup
    }
    
    @After
    public void tearDown() {
        // Cleanup
    }
    
    @Test
    public void testMethodName() {
        // Test implementation
    }
}
```

**Pattern**: 
- Use JUnit 4 with Spring test runner for integration tests
- `@BeforeClass` for one-time setup, `@Before` for per-test setup
- Descriptive test method names starting with `test`

### Mocking with EasyMock
```java
@Before
public void setUp() throws Exception {
    restfulConnector = EasyMock.createNiceMock(RESTFulConnector.class);
    jmsTemplate = createMock(JmsTemplate.class);
}

@Test
public void testSavedShopsMessageCall() throws Exception {
    jmsTemplate.convertAndSend((String) EasyMock.anyObject());
    EasyMock.expectLastCall().anyTimes();
    EasyMock.replay(jmsTemplate);
    
    // Test execution
    
    EasyMock.verify(jmsTemplate);
}
```

**Pattern**: Create mocks in setUp, set expectations, replay, execute, verify.

### Assertions
```java
// JUnit assertions
Assert.assertNotNull(inventoryDetails);
Assert.assertEquals("56789", inventoryDetails.getFreezeDetails().getFreezeId());
Assert.assertTrue("Primary's been updated", condition);
Assert.assertFalse(updatedParticipant.getPrimary());

// Static imports for readability
import static org.junit.Assert.*;
assertNotNull(response);
assertEquals(HttpURLConnection.HTTP_SEE_OTHER, response.getStatus());
```

**Pattern**: Use descriptive assertion messages, especially for complex conditions.

## Data Validation

### Null Checks
```java
protected void validateNotNull(Cart cart) {
    if (cart == null) {
        throw ApplicationExceptionStepBuilder
            .newBuilder(HttpErrorType.INTERNAL_SERVER_ERROR)
            .createError(CartErrorTypeCode.CART_NOT_FOUND, 
                         CartErrorCode.SAVING_NULL_CART)
            .setMessage("Attempted to save a null cart")
            .buildError()
            .setLogCode(Integer.valueOf("2"))
            .build();
    }
}
```

**Pattern**: Validate inputs early, throw descriptive exceptions.

### Collection Checks
```java
if (CollectionUtils.isEmpty(tickets)) {
    return null;
}

if (CollectionUtils.isNotEmpty(checkoutDetailsResource.getPerNightPrices())) {
    // Process collection
}
```

**Pattern**: Use Apache Commons `CollectionUtils` for null-safe collection checks.

### String Validation
```java
if (StringUtils.isBlank(cartId)) {
    // Handle empty/null string
}

if (StringUtils.isNotBlank(room.getDiscountGroup())) {
    params.put("discountGroup", room.getDiscountGroup());
}

if (StringUtils.equals(errorTypeId, NOT_ALLOWED)) {
    // Handle specific error
}
```

**Pattern**: Use Apache Commons `StringUtils` for null-safe string operations.

## REST Service Integration

### HTTP Client Pattern
```java
private RESTResponse post(URI uri, Map<String, String> headers, 
                          Map<String, Object> queryParams, String body, 
                          String message, CartComponentTypeEnum componentType) {
    RESTResponse restResponse = null;
    try {
        restResponse = getRestfulConnector().post(uri.toString(), 
                                                   headers, queryParams, body);
    } catch (Exception ex) {
        throw ApplicationExceptionStepBuilder
            .newBuilder(HttpErrorType.SERVICE_UNAVAILABLE)
            .createError(CartErrorTypeCode.SYSTEM_UNAVAILABLE, 
                         CartErrorCode.AVAILABILITY_SERVICE_ERROR)
            .setMessage(ERROR_SEND_REQUEST_TO + uri)
            .buildError()
            .setCause(ex)
            .setLogCode(Integer.valueOf("17"))
            .build();
    }
    
    checkAvailabilityResponse(restResponse, message, RequestMethod.POST, 
                              uri, headers, queryParams, body);
    return restResponse;
}
```

**Pattern**: 
- Wrap HTTP calls in try-catch
- Validate responses with dedicated methods
- Include full context in error messages

### Response Parsing
```java
PackageOfferResource packageOfferResource;
try {
    packageOfferResource = getObjectMapper().readValue(
        response.getResponseBody(), PackageOfferResource.class);
} catch (Exception ex) {
    throw ApplicationExceptionStepBuilder
        .newBuilder(HttpErrorType.INTERNAL_SERVER_ERROR)
        .createError(CartErrorTypeCode.AVAILABILITY_SERVICE_ERROR, 
                     CartErrorCode.AVAILABILITY_SERVICE_ERROR)
        .setMessage("Error parsing response: " + response.getResponseBody())
        .buildError()
        .setCause(ex)
        .setLogCode(Integer.valueOf("14"))
        .build();
}
```

**Pattern**: Use Jackson ObjectMapper for JSON parsing, wrap in try-catch with descriptive errors.

## JPA and Persistence

### Entity Manager Usage
```java
@PersistenceContext(unitName = "CartPU")
private EntityManager entityManager;

protected EntityManager getEntityManager() {
    return entityManager;
}
```

**Pattern**: Inject EntityManager with `@PersistenceContext`, access via protected getter.

### CRUD Operations
```java
private T findAndCreateCart(T newCart) 
    throws PreExistingEntityException, RollbackFailureException {
    EntityManager em = getEntityManager();
    
    T persistentCart = (T) em.find(getEntity().getClass(), newCart.getCartId());
    
    if (persistentCart != null) {
        throw new PreExistingEntityException("Cart already exists");
    }
    
    newCart.setVersion(System.currentTimeMillis());
    em.persist(newCart);
    
    return newCart;
}
```

**Pattern**: 
- Check existence before create
- Set version/timestamp before persist
- Throw specific exceptions for error conditions

### Optimistic Locking
```java
T persistentCart = readFreshestCart(em, cartId);
if (persistentCart != null) {
    T updatedPersistentCart = this.mergeCarts(persistentCart, updatedCart);
    updatedPersistentCart.setVersion(System.currentTimeMillis());
    retCart = em.merge(updatedPersistentCart);
}
```

**Pattern**: Use version field for optimistic locking, update version on every merge.

## Feature Toggles

### VendomaticUtility Pattern
```java
@Autowired
private VendomaticUtility vendomaticUtility;

if (vendomaticUtility.isSkuRabbitEnabled()) {
    ticketQueueResource.setSku(ticket.getSku());
}

if (vendomaticUtility.isGeniePlusEnabled()) {
    ticketQueueResource.setGeniePlus(ticket.getGeniePlus());
}
```

**Pattern**: Use `VendomaticUtility` for feature flags, check before executing feature-specific code.

## Common Idioms

### Builder Pattern for Complex Objects
```java
CheckoutDetailsRequestResource resource = 
    new CheckoutDetailsRequestResource(compositeItem, cart);
String bodyRequest = getObjectMapper().writeValueAsString(resource);
```

**Pattern**: Use constructors or builders for complex object initialization.

### Early Return for Guard Clauses
```java
if (CollectionUtils.isEmpty(tickets)) {
    return null;
}

if (ticket == null) {
    return null;
}

// Main logic continues
```

**Pattern**: Return early for invalid conditions to reduce nesting.

### Null-Safe Chaining
```java
if (cart.getResortReservationDetails() != null 
    && !cart.getResortReservationDetails().isRoomOnly()
    && cart.getResortReservationDetails().getPreviouslyPaidAmount()
           .getValue().compareTo(BigDecimal.ZERO) == 1) {
    // Process
}
```

**Pattern**: Check each level of object graph for null before accessing nested properties.

### Ternary for Simple Conditionals
```java
QuoteInfo quoteInfo = (checkoutDetailsResource.getQuoteInfo() != null ?
    checkoutDetailsResource.getQuoteInfo().toModel(packageOffer.getPricing().getTotal()) 
    : null);

if (quoteInfo == null) {
    quoteInfo = new QuoteInfo(packageOffer.getPricing().getTotal(), null);
}
```

**Pattern**: Use ternary operator for simple null checks, follow with null handling if needed.

## PMD Suppressions

### Suppression Annotations
```java
@SuppressWarnings({
    "PMD.AvoidDuplicateLiterals", 
    "PMD.PreserveStackTrace", 
    "PMD.ExcessiveClassLength"
})
public class DefaultAvailabilityDAO extends RESTFulConnectorDAO {
    // Implementation
}
```

**Pattern**: Suppress PMD warnings at class level when justified, document reason in comments if non-obvious.

## Documentation Standards

### JavaDoc for Public APIs
```java
/**
 * Retrieves the cart with its dependencies.
 * 
 * @param jpaCart the jpaCart
 * @param eTag the eTag
 * @param itemGroup the itemGroup
 * @param resolveDeps whether to resolve dependencies
 * @param canUseCachedDependency whether cached dependencies can be used
 * @return the cart with resolved dependencies
 */
private Cart retrieveCartInternal(T jpaCart, String eTag, ItemGroup itemGroup, 
                                  boolean resolveDeps, boolean canUseCachedDependency) {
    // Implementation
}
```

**Pattern**: Document parameters, return values, and exceptions for public/protected methods.

### Inline Comments for Complex Logic
```java
// we are trading data staleness for response time, under the assumption that 
// most dependencies do not change often, thus skipping resolving dependencies 
// when eTag match
if (StringUtils.equals(eTag, storedEtag)) {
    cart = buildCartFromJpaCart(jpaCart, itemGroup, false, canUseCachedDependency);
}
```

**Pattern**: Explain non-obvious business logic and trade-offs.

### TODO Comments
```java
// TODO OMNI Project: Remove this constant when Availability Service 
// starts sending the package code: PRO-254583
private static final String DEFAULT_RENTAL_CAR_PACKAGE_CODE = "CARHNLACR";
```

**Pattern**: Include JIRA ticket references in TODO comments for tracking.
