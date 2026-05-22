# Testing Conventions

## Unit Test Rules

1. `@Before fun setup()` and `@After fun tearDown()` required
2. All constructor and function parameters must be mocked
3. MockK library for all new tests
4. RxJava scheduler overrides (`RxJavaPlugins.setIoSchedulerHandler { Schedulers.trampoline() }`) must be reset in tearDown
5. Test naming: `` fun `given <pre-conditions> when <action> then <result>`() ``
6. `tearDown()` MUST call `clearAllMocks()` and `unmockkAll()` — omit `@After` only if no mocks used
7. `setup()` uses `MockKAnnotations.init(this)` when MockK annotations are present
8. Class under test manually instantiated in `setup()` — NO `@InjectMockKs`
9. Tests in `src/test/java` as Kotlin classes
10. Append to existing test class if one exists for the target
11. No wildcard imports — import specific classes, constants, functions
12. `mockkStatic`/`mockkObject` cleaned up with `unmockkStatic`/`unmockkObject` or `unmockkAll` in tearDown
13. All injected dependencies (constructor + function params) must be mocked
14. Primitive/String constants declared at top of class:
    ```kotlin
    private const val TEST_ID = 1234
    private const val API_PATH = "/users"
    ```
15. Use `@RelaxedMockK` or `@MockK` annotations for mocks
16. Use `mockkConstructor` or mock private members per MockK docs when necessary
17. Use `assertEquals(expected, result)` — never `assert(result == expected)`
18. Use `assertTrue(value)` / `assertFalse(value)` — never `assertEquals(true/false, value)`

## MockK Object vs Static Rules

**mockkObject** — for Kotlin `object` or `companion object` (non-`@JvmStatic`):
- `mockkObject(SharedPreferencesRepository)` → `every { SharedPreferencesRepository.getInstance() } returns mockk(relaxed = true)`
- `mockkObject(RepositoryProvider)` → `every { RepositoryProvider.instance } returns mockk(relaxed = true)`
- `mockkObject(AuditRepositoryManager)`
- `mockkObject(NetworkState)`

**mockkStatic** — for `@JvmStatic` functions or top-level/extension functions:
- `mockkStatic(Rx2SchedulerUtils::class)` → `every { Rx2SchedulerUtils.io(any()) } returns Schedulers.trampoline()`
- `mockkStatic(UserManager::class)` → `every { UserManager.getInstance() } returns userManager`
- `mockkStatic(Repo::class)`, `mockkStatic(PaymentUtil::class)`, `mockkStatic(DecimalUtil::class)`
- `mockkStatic(AppetizeApplication::class)` → `every { AppetizeApplication.getLoggedInUser() } returns mockk(relaxed = true)`
- `mockkStatic(PaymentsRepositoryProvider::class)` → `every { PaymentsRepositoryProvider.getRepository() } returns mockk(relaxed = true)`

**Both** — for classes needing both:
- `mockkObject(AuditReporter)` + `mockkStatic(AuditReporter::class)`

**Extension functions** — prefer function references:
- `mockkStatic(Throwable::isRetrofitNetworkException)` over `mockkStatic("com.appetizeactivate.android.util.NetworkUtilsKt")`

## Gradle Commands

- Run all unit tests: `./gradlew :AppetizeActivate:testDisneyDebugUnitTest`
- Compile test sources: `./gradlew :AppetizeActivate:compileDisneyDebugUnitTest`
- Run specific class: `./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.utils.PaymentUtilTest"`
- Available flavors: `disney`, `disneyHongKong`, `qa`
- Task pattern: `test{Flavor}{BuildType}UnitTest`
- Module path: `:AppetizeActivate` (NOT `:gc:AppetizeActivate`)

## Test Template

```kotlin
import io.mockk.MockKAnnotations
import io.mockk.clearAllMocks
import io.mockk.unmockkAll
import io.mockk.impl.annotations.MockK
import io.mockk.impl.annotations.RelaxedMockK
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.Assert.assertEquals

private const val FAKE_STRING = "fake"
private const val FAKE_INT = 1

class <ClassName>Test {

    @RelaxedMockK
    private lateinit var mockDependency: DependencyType

    private lateinit var subject: ClassUnderTest

    @Before
    fun setup() {
        MockKAnnotations.init(this)
        subject = ClassUnderTest(mockDependency)
    }

    @After
    fun tearDown() {
        clearAllMocks()
        unmockkAll()
    }

    @Test
    fun `given precondition when action then expected`() {
        // Arrange
        // Act
        // Assert
        assertEquals(expected, result)
    }
}
```
