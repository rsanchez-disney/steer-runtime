# Android Architecture Patterns Reference

## Pattern Selection Matrix

| Scenario | Pattern | Reason |
|----------|---------|--------|
| New feature | MVVM + Compose + Coroutines | Modern stack, testable |
| Extending existing MVP | Continue MVP | Consistency within feature |
| Domain logic | Interactor/UseCase | Single responsibility |
| Data access | Repository interface in `domain` | Abstraction layer |

## Module Dependency Rules

```
AppetizeActivate → domain, dataModel, common-lib, feature modules
Feature modules → domain, dataModel (NOT AppetizeActivate)
domain → (nothing - pure Kotlin, no Android framework)
```

## Package Structure (New Feature)

```
feature/
├── di/              # Hilt/Dagger modules
├── interactor/      # Use cases
├── model/           # Feature-specific models
├── mvp/             # View interfaces (if MVP)
├── presenter/       # Presenters (if MVP)
├── viewmodel/       # ViewModels (if MVVM)
├── composable/      # Compose UI (if MVVM)
├── adapter/         # RecyclerView adapters
├── view/            # Custom views
└── delegates/       # Delegate pattern
```

## DI Setup (Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class FeatureModule {
    @Binds
    abstract fun bindRepository(impl: RepositoryImpl): Repository
}

@Module
@InstallIn(ViewModelComponent::class)
object FeatureProviderModule {
    @Provides
    fun provideUseCase(repo: Repository): FeatureUseCase =
        FeatureUseCase(repo)
}
```

## Threading

- New code: Kotlin Coroutines with injectable dispatchers
- Existing RxJava: maintain consistency within same feature
- Never hardcode `Dispatchers.IO` or `Dispatchers.Main`

## Business Models

Every feature must consider:
1. **Merchandise** — retail point of sale
2. **QSR** — food ordering with KDS integration
3. **Table Service** — check-based dining, server transfers, split checks
