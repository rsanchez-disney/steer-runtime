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

## Flaky Test Prevention

Apply these rules to guarantee test isolation and avoid flaky failures across parallel shards:

### Mock lifecycle (tearDown ordering is critical)
- Never omit `unmockkAll()` from `tearDown()` — individual `unmockkObject`/`unmockkStatic` calls are insufficient because they miss mocks created in test methods or inherited from base class interactions.
- If using `mockkStatic` for extension functions, add an explicit `unmockkStatic(ClassName::functionName)` in `tearDown()` before `unmockkAll()`.

### Singleton handling (main source of cross-test contamination)
- Never call singleton `.init()` methods (e.g., `SharedPreferencesRepository.init()`, `UserManager.init()`, `RepositoryProvider.initialize()`). Use `mockkObject`/`mockkStatic` instead.
- If assigning a singleton directly (e.g., `RepositoryFactory.INSTANCE = mockk()`), always save the original value before and restore it in `tearDown()`.
- Never use `mockkObject(RepositoryFactory)` + `every { RepositoryFactory.INSTANCE }` — use direct assignment with save/restore instead.
- If using `mockkStatic(FeaturesManager::class)` + `every { FeaturesManager.INSTANCE }`, always save/restore the original INSTANCE value.

### Mock placement
- Move all `mockkStatic` calls to `setup()` rather than individual test methods to ensure consistent mock state across the entire test class.

### RxJava schedulers (prevents threading flakiness)
- Never use `verify(timeout = ...)` — trampoline schedulers make RxJava synchronous; use plain `verify`.
- Always set BOTH `RxAndroidPlugins.setInitMainThreadSchedulerHandler` AND `RxAndroidPlugins.setMainThreadSchedulerHandler` in `setup()`. The init handler only applies the first time `AndroidSchedulers.mainThread()` is called in the JVM; if a previous test already triggered initialization, only the regular handler takes effect.
- Always call `RxJavaPlugins.reset()` and `RxAndroidPlugins.reset()` at the START of `setup()` (before setting new handlers) to ensure a clean scheduler state regardless of what previous tests did.
- RxJava scheduler overrides (`RxJavaPlugins`, `RxAndroidPlugins`) must always be reset in `tearDown()` via `.reset()`.

### Coroutines
- `Dispatchers.setMain(...)` must always be paired with `Dispatchers.resetMain()` in `tearDown()`.

## RxSchedulers Setup Reference (copy-paste ready)

```kotlin
@Before
fun setup() {
    RxJavaPlugins.reset()
    RxAndroidPlugins.reset()
    RxJavaPlugins.setIoSchedulerHandler { Schedulers.trampoline() }
    RxJavaPlugins.setSingleSchedulerHandler { Schedulers.trampoline() }
    RxJavaPlugins.setNewThreadSchedulerHandler { Schedulers.trampoline() }
    RxAndroidPlugins.setInitMainThreadSchedulerHandler { Schedulers.trampoline() }
    RxAndroidPlugins.setMainThreadSchedulerHandler { Schedulers.trampoline() }
    // ... rest of setup
}

@After
fun tearDown() {
    RxJavaPlugins.reset()
    RxAndroidPlugins.reset()
    Dispatchers.resetMain() // only if Dispatchers.setMain() was used
    clearAllMocks()
    unmockkAll()
}
```

## Targeted Shard Verification

Run only the shards that contain new/updated tests to confirm no flaky failures:

```bash
# Build the sorted test list
find gc/AppetizeActivate/src/test/java gc/AppetizeActivate/src/testDisney/java \
     \( -name "*Test.kt" -o -name "*Test.java" -o -name "*Tests.kt" -o -name "*Tests.java" \) \
     ! -name "*TestBase.kt" ! -name "*TestBase.java" 2>/dev/null | \
  sed 's|.*/java/||; s|/|.|g; s|\.kt$||; s|\.java$||' | sort -u > /tmp/all_tests.txt
TOTAL=$(wc -l < /tmp/all_tests.txt)
PER_SHARD=$(( (TOTAL + 5 - 1) / 5 ))

# Find unique shards for all changed test classes
SHARDS=""
for TEST_CLASS in "TestClassA" "TestClassB"; do
  LINE=$(grep -n "$TEST_CLASS" /tmp/all_tests.txt | cut -d: -f1)
  [ -n "$LINE" ] && SHARDS="$SHARDS $(( (LINE - 1) / PER_SHARD + 1 ))"
done

# Run only the affected shards in parallel (deduplicated)
for SHARD in $(echo $SHARDS | tr ' ' '\n' | sort -u); do
  ./ci-scripts/run-test-shard.sh $SHARD 5 &
done
wait
```

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
