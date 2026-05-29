---
name: android-architecture
description: Expert guidance on setting up and maintaining a modern Android application architecture using Clean Architecture and Hilt. Use this when asked about dependency injection.
---

# Dependency Injection with Hilt

## Instructions

When designing or refactoring an Android application, adhere to the **Guide to App Architecture** and **Clean Architecture** principles. Use **Hilt** for all dependency injection.

*   **@HiltAndroidApp**: Annotate the `Application` class.
*   **@AndroidEntryPoint**: Annotate Activities and Fragments.
*   **@HiltViewModel**: Annotate ViewModels; use standard `constructor` injection.
*   **Modules**:
    *   Use `@Module` and `@InstallIn(SingletonComponent::class)` for app-wide singletons (e.g., Network, Database).
    *   Use `@Binds` in an abstract class to bind interface implementations (cleaner than `@Provides`).
    *   use standard `constructor` injection for presenter class
*   **Anti-Patterns**:
    *   Component Manual Creation: **No Manual Dagger**: Use Hilt Standard.
    *   Field Inject in Logic: **No Field Inject**: Only in Android Components.
*   **References**:
  * If create an '@AssistedFactory' interface add the annotation '@Suppress("kotlin:S6517")' for avoid error in sonar validation
  * All literal strings in `@Assisted("...")` annotations MUST be extracted to `const val` in the class `companion object`. Use them in both the constructor and the `@AssistedFactory` interface. Example:
    ```kotlin
    companion object {
        const val ASSISTED_MY_PARAM = "myParam"
    }
    // usage: @Assisted(ASSISTED_MY_PARAM) myParam: Type
    ```
  * Review all file from com.appetizeactivate.android.main.di.* and search previous injection

