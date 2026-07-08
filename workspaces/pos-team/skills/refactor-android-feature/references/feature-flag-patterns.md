# Feature Flag Patterns for ActivateX

## FeaturesManager Integration

```kotlin
// In FeaturesManager.kt
enum class Feature(val key: String, val defaultEnabled: Boolean = false) {
    // ... existing flags
    REFACTORED_RECEIPT_FLOW("refactored_receipt_flow", false),
}

fun isEnabled(feature: Feature): Boolean {
    return remoteConfig.getBoolean(feature.key, feature.defaultEnabled)
}
```

## Usage in Code

### Clean Branching (Preferred)

```kotlin
class ReceiptInteractor @Inject constructor(
    private val featuresManager: FeaturesManager,
    private val legacyHandler: LegacyReceiptHandler,
    private val newHandler: RefactoredReceiptHandler
) {
    fun processReceipt(data: ReceiptData): Result {
        return if (featuresManager.isEnabled(Feature.REFACTORED_RECEIPT_FLOW)) {
            newHandler.process(data)
        } else {
            legacyHandler.process(data)
        }
    }
}
```

### DI-Based Flag (Complex Cases)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object ReceiptModule {
    @Provides
    fun provideReceiptHandler(
        featuresManager: FeaturesManager,
        legacy: LegacyReceiptHandler,
        refactored: RefactoredReceiptHandler
    ): ReceiptHandler {
        return if (featuresManager.isEnabled(Feature.REFACTORED_RECEIPT_FLOW)) {
            refactored
        } else {
            legacy
        }
    }
}
```

## Testing Both Paths

```kotlin
class ReceiptInteractorTest {
    @MockK private lateinit var featuresManager: FeaturesManager
    
    @Test
    fun `process receipt with new flow enabled`() {
        every { featuresManager.isEnabled(Feature.REFACTORED_RECEIPT_FLOW) } returns true
        // test new behavior
    }
    
    @Test
    fun `process receipt with new flow disabled (legacy)`() {
        every { featuresManager.isEnabled(Feature.REFACTORED_RECEIPT_FLOW) } returns false
        // test old behavior is preserved
    }
}
```

## Rules

1. Flag defaults to OFF (safe deploy)
2. One flag per refactored behavior (no compound flags)
3. Flag check at highest possible level (interactor, not deep in utility)
4. Old code path remains untouched (no "cleanup" during refactor)
5. Remove flag + old path only after 2 sprints of production stability
