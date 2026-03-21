# Payment Service - Development Guidelines

## Code Quality Standards

### File Headers
Every Java source file includes a standardized header with copyright, author, revision, change, and date information:
```java
/**************************************************
 * FileName - ClassName.java
 *
 * (c) Disney. All rights reserved.
 *
 * $Author: username $
 * $Revision: #version $
 * $Change: changeId $
 * $Date: yyyy/mm/dd $
 **************************************************/
```

### Package Organization
- Follow reverse domain naming: `com.disney.wdpro.service.payment.*`
- Organize by functional layer: `dao`, `service`, `webservice`, `model`, `util`, `conf`
- Sub-packages by integration: `dao.firstdata`, `dao.dvic`, `dao.accertify`

### Naming Conventions
- **Classes**: PascalCase with descriptive names (e.g., `RestPaymentServiceImpl`, `SVTransactionDescriptionTypeAdapter`)
- **Interfaces**: No "I" prefix, implementation classes use "Impl" suffix
- **Methods**: camelCase, verb-based (e.g., `createPaymentReference`, `getDVICAccount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACCOUNT_STATUS_APPROVED`)
- **Variables**: camelCase, descriptive (e.g., `giftCardAccountId`, `paymentRecommendation`)
- **Resource classes**: Suffix with "Resource" (e.g., `PaymentCardStructureResource`)
- **DAO classes**: Suffix with "DAO" or "DAOImpl"
- **Mapper classes**: Suffix with "Mapper" (e.g., `ResourceDomainMapper`)

### Code Formatting
- **Indentation**: Tabs (4 spaces equivalent)
- **Line length**: No strict limit, but keep reasonable (typically under 120 characters)
- **Braces**: Opening brace on same line, closing brace on new line
- **Spacing**: Space after keywords (if, for, while), no space before method parentheses
- **Blank lines**: Single blank line between methods, logical sections within methods

## Structural Conventions

### Class Design
- **Single Responsibility**: Each class has one clear purpose
- **Immutability**: Prefer immutable objects where possible (final fields, no setters)
- **Utility Classes**: Private constructor to prevent instantiation
  ```java
  private SVTransactionDescriptionTypeAdapter() {
  }
  ```
- **Static Initialization**: Use static blocks for complex initialization
  ```java
  private static BidiMap descriptionTypeMapping = new DualHashBidiMap();
  static {
      descriptionTypeMapping.put("0100", SVTransactionDescriptionType.ACTIVATION);
      // ...
  }
  ```

### Dependency Injection
- Use Spring setter injection for all dependencies
- Provide setter methods for all injected dependencies
- Document setters with JavaDoc indicating Spring usage:
  ```java
  /**
   * Sets a new {@link PaymentService} (used by Spring).
   * 
   * @param paymentService the paymentService to set
   */
  public void setPaymentService(PaymentService paymentService) {
      this.paymentService = paymentService;
  }
  ```

### Field Declaration
- Declare fields at the top of the class
- Use `private` visibility by default
- Use `final` for immutable fields
- Initialize collections inline when possible
- Logger declaration pattern:
  ```java
  private final Log logger = LogFactory.getLog(RestPaymentServiceImpl.class);
  ```

## Semantic Patterns

### DAO Pattern
- Separate data access logic from business logic
- DAO interfaces define contracts, implementations handle specifics
- Use mapper classes to convert between domain and external models
- Example structure:
  ```java
  // Interface
  public interface PaymentDAO {
      PaymentRecommendation createPaymentRecommendation(SinglePayment payment);
  }
  
  // Implementation
  public class PaymentDAOImpl implements PaymentDAO {
      // Implementation details
  }
  ```

### Service Layer Pattern
- Business logic resides in service layer
- Services orchestrate DAO calls and apply business rules
- Services validate input and handle exceptions
- Return domain objects, not resources
- Example:
  ```java
  public PaymentReferenceResource createPaymentReference(PaymentCardStructureResource paymentCard) {
      // Validation
      // Business logic
      // DAO calls
      return result;
  }
  ```

### Resource-Domain Mapping
- Use dedicated mapper classes for conversions
- Separate request resources from response resources
- Resource classes wrap domain objects for REST API
- Example:
  ```java
  ResourceDomainMapper<GiftCard, GiftCardPayRequestResource> giftCardMapper;
  GiftCard giftCard = giftCardMapper.toModelObject(giftCardPayRequestResource);
  ```

### Error Handling
- Use `ApplicationExceptionFactory` for creating exceptions
- Specify HTTP error type, error type enum, and error code
- Provide descriptive error messages
- Example:
  ```java
  throw ApplicationExceptionFactory.create(
      HttpErrorType.VALIDATION, 
      ErrorTypeEnum.MISSING_REQUIRED_FIELD,
      PaymentErrorCode.MISSING_CREDIT_CARD,
      "Credit card information is required"
  );
  ```

### Null Safety
- Use `Utility.isNullOrEmpty()` for null/empty checks
- Validate inputs at service boundaries
- Return empty collections instead of null
- Example:
  ```java
  if (Utility.isNullOrEmpty(paymentCard)) {
      throw ApplicationExceptionFactory.create(...);
  }
  ```

### Response Building
- Use JAX-RS Response builder for HTTP responses
- Return 303 (See Other) with location header for resource creation
- Return 200 (OK) for successful operations
- Example:
  ```java
  EntityLink link = PaymentEntityLinkHelper.getGiftCardAccountLink(accountId);
  URI uri = EntityLinkBuilder.getInstance().buildURI(link);
  return Response.seeOther(uri).type(MediaType.APPLICATION_JSON).build();
  ```

## Testing Patterns

### Test Structure
- Use JUnit 4 with Spring test runner
- Organize tests by layer (service, DAO, mapper)
- Test class naming: `{ClassName}Test`
- Use `@BeforeClass` for one-time setup
- Example:
  ```java
  @RunWith(SpringJUnit4ClassRunner.class)
  @ContextConfiguration(locations = {"classpath:RestServiceContext.xml"})
  public class PaymentServiceTest {
      @BeforeClass
      public static void setUp() {
          BaseJUnitSetup.setupClass();
      }
  }
  ```

### Mocking with EasyMock
- Use EasyMock for creating mock objects
- Use PowerMock for static method mocking
- Pattern: create mock, set expectations, replay, verify, reset
- Example:
  ```java
  PaymentDAO mockPaymentDAO = EasyMock.createMock(PaymentDAO.class);
  EasyMock.expect(mockPaymentDAO.createPaymentReference(paymentCard))
      .andReturn(expectedReference);
  EasyMock.replay(mockPaymentDAO);
  
  // Execute test
  
  EasyMock.verify(mockPaymentDAO);
  reset(mockPaymentDAO);
  ```

### Test Method Naming
- Descriptive names indicating what is tested
- Pattern: `test{MethodName}_{Scenario}`
- Examples: `testCreatePaymentReference`, `testInvalidCreatePaymentReference`

### Assertions
- Use static imports for assertion methods
- Prefer specific assertions (assertEquals, assertNotNull) over assertTrue
- Example:
  ```java
  assertNotNull(paymentReference);
  assertEquals(expectedValue, actualValue);
  assertNull(paymentReference.getPaymentCard().getCvv2());
  ```

### Test Data Creation
- Create helper methods for test data setup
- Use realistic but non-production data
- Example:
  ```java
  private static PaymentCardStructureResource createValidPaymentCardStructureResource() {
      PaymentCardStructureResource card = new PaymentCardStructureResource();
      card.setCardNumber("4444855457062688");
      // ... set other fields
      return card;
  }
  ```

## Popular Annotations

### Spring Annotations
- `@Component` - Mark class as Spring-managed bean
- `@Autowired` - Inject dependencies (prefer setter injection)
- `@PostConstruct` - Execute method after dependency injection

### JAX-RS Annotations
- `@Path` - Define REST endpoint path
- `@GET`, `@POST`, `@PUT`, `@DELETE` - HTTP method mapping
- `@Produces`, `@Consumes` - Media type specification
- `@PathParam`, `@QueryParam` - Parameter binding

### JPA Annotations
- `@Entity` - Mark class as JPA entity
- `@Table` - Specify database table
- `@Id` - Primary key field
- `@Column` - Column mapping

### Testing Annotations
- `@RunWith(SpringJUnit4ClassRunner.class)` - Spring test runner
- `@ContextConfiguration` - Specify Spring context files
- `@Test` - Mark test method
- `@BeforeClass`, `@Before`, `@After` - Test lifecycle hooks

### Jackson Annotations
- `@JsonIgnoreProperties(ignoreUnknown = true)` - Ignore unknown JSON properties
- Used for flexible JSON deserialization

### PMD Suppressions
- `@SuppressWarnings({"PMD.ExcessivePublicCount", "PMD.TooManyFields"})` - Suppress specific PMD warnings when justified

## Internal API Usage

### Entity Link Building
```java
EntityLink link = PaymentEntityLinkHelper.getGiftCardAccountLink(accountId);
URI uri = EntityLinkBuilder.getInstance().buildURI(link);
```

### Service Lookup
```java
PaymentService service = serviceLookup.getService(PaymentService.class);
```

### Logging
```java
private final Log logger = LogFactory.getLog(ClassName.class);
logger.info("Processing payment for SWID=" + swid);
logger.error("Error processing payment", exception);
```

### Bidirectional Mapping (Apache Commons)
```java
private static BidiMap mapping = new DualHashBidiMap();
mapping.put("key", value);
Object value = mapping.get("key");
Object key = mapping.inverseBidiMap().get(value);
```

## Code Idioms

### Optional Parameter Handling
```java
if (!Utility.isNullOrEmpty(parameter)) {
    // Process parameter
}
```

### Collection Iteration
```java
if (!Utility.isNullOrEmpty(collection)) {
    for (Item item : collection) {
        // Process item
    }
}
```

### Resource Collection Building
```java
ResourceCollection<LinkResource> resources = new ResourceCollection<LinkResource>();
for (Item item : items) {
    LinkResource resource = new LinkResource();
    resource.setSelf(createLink(item));
    resources.addEntry(resource);
}
resources.setTotal(items.size());
resources.setLimit(items.size());
```

### Exception Handling with Logging
```java
try {
    // Operation
} catch (Exception e) {
    logger.error("Error description", e);
    throw ApplicationExceptionFactory.create(..., e);
}
```

### Performance Timing
```java
long start = System.currentTimeMillis();
// Operation
long elapsedTimeMillis = System.currentTimeMillis() - start;
logger.info("Operation took " + elapsedTimeMillis + "ms");
```

## Best Practices

### Security
- Never log sensitive data (PAN, CVV, passwords)
- Use log masking patterns for sensitive fields
- Validate all inputs at service boundaries
- Use encryption for sensitive data storage
- Leverage Vault for secrets management

### Performance
- Use connection pooling (C3P0) for database connections
- Implement socket pooling for external integrations
- Cache frequently accessed data
- Log performance metrics for critical operations

### Maintainability
- Keep methods focused and concise
- Extract complex logic into helper methods
- Use meaningful variable and method names
- Document complex business logic
- Follow DRY (Don't Repeat Yourself) principle

### Documentation
- JavaDoc for public APIs and complex methods
- Inline comments for non-obvious logic
- README files for module-level documentation
- Keep documentation up-to-date with code changes
