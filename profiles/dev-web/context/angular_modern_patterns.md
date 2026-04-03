# Angular Modern Patterns (20+)

## Core Principles

- **100% Standalone** — No NgModules. Components, directives, and pipes are standalone by default.
- **Signal-driven** — Use Signals for local and derived state. Reserve RxJS for complex async streams and HTTP.
- **Zoneless-ready** — Use `provideExperimentalZonelessChangeDetection()` in app config.

## Architecture

Feature-Based Standalone Architecture:

```
main.ts + app.config.ts → app.routes.ts → src/features/**/pages/*.component.ts → src/features/**/ui/*.component.ts
```

| Path | Purpose |
|------|---------|
| `src/app/core/` | Singleton services (Auth, API wrappers), global providers |
| `src/app/shared/` | Generic UI components, pipes, directives used across features |
| `src/app/features/` | Domain-specific logic per feature |
| `features/*/pages/` | Smart components connected to routes |
| `features/*/components/` | Presentational (dumb) components |
| `features/*/services/` | Feature-specific data access/state |
| `features/*/models/` | TypeScript interfaces |

## Standalone Components

```typescript
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule, UserAvatarComponent],
  template: `
    @if (user(); as user) {
      <app-user-avatar [url]="user.picture" />
      <p>{{ user.name }}</p>
    }
  `,
})
export class UserProfileComponent {
  user = input.required<User>();
}
```

Rules:
- All dependencies explicitly listed in `imports: []`
- No NgModules — refactor any module-based components to standalone
- Use `input()` / `input.required()` signal inputs over `@Input()`
- Use `output()` signal outputs over `@Output()`

## Bootstrapping

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
  ],
};

// main.ts
bootstrapApplication(AppComponent, appConfig);
```

## Routing & Lazy Loading

```typescript
export const ROUTES: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/pages/dashboard.page'),
  },
];
```

- Use `loadComponent` for lazy-loading individual components
- Use `loadChildren` for lazy-loading child route sets

## Signals

```typescript
count = signal(0);                              // Local state
doubled = computed(() => this.count() * 2);     // Derived
user = toSignal(this.userService.getProfile()); // From observable
```

- Use `signal()` for local mutable state
- Use `computed()` for derived values
- Use `toSignal()` to bridge RxJS observables
- Use `effect()` for side effects

## Testing (Jest)

- Standalone components go in `imports`, not `declarations`
- Use `overrideComponent` to mock component-level providers
- Aim for ≥80% coverage
