# Angular Legacy & Uplift Patterns (v12–v18+)

## Overview

This context file covers Angular patterns across the legacy range (v12–v15) used in Config Studio pre-sales SPAs, plus incremental uplift guidance toward modern Angular (v16, v17, v18+). Most applications run v15; some older SPAs are on v12–v14.

**Always detect the project's Angular version before applying patterns.**

## Version Feature Matrix

| Feature | v12 | v13 | v14 | v15 | v16 | v17 | v18+ |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:----:|
| NgModules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@Input()` / `@Output()` decorators | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Zone.js change detection | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Typed reactive forms | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Standalone components | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `inject()` function | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Signals (`signal`, `computed`, `effect`) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `input()` / `output()` signal functions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `@if` / `@for` / `@switch` control flow | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `@defer` (deferrable views) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `takeUntilDestroyed()` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Functional guards / resolvers | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Zoneless change detection | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Part 1: Legacy Patterns (v12–v15)

### Core Principles

- **NgModule-based** — All components, directives, and pipes are declared in NgModules.
- **Decorator inputs/outputs** — Use `@Input()` and `@Output()` decorators for component communication.
- **Zone.js change detection** — Zone.js patches async APIs and triggers change detection automatically.
- **Constructor injection** — Use constructor parameters for DI, not the `inject()` function.

### Architecture

NgModule Feature Module Architecture:

```
main.ts → AppModule → AppRoutingModule → FeatureModule → FeatureRoutingModule → Components
```

| Module Type | Purpose | Example |
|-------------|---------|---------|
| `AppModule` | Root module — bootstraps `AppComponent`, imports `CoreModule` and `SharedModule` | `app.module.ts` |
| `CoreModule` | Singleton services (Auth, API wrappers, guards). Imported once in `AppModule` | `core/core.module.ts` |
| `SharedModule` | Reusable components, directives, pipes. Imported by every feature module | `shared/shared.module.ts` |
| `FeatureModule` | Domain-specific components, services, routing per feature | `features/dashboard/dashboard.module.ts` |

```
src/app/
├── app.module.ts
├── app-routing.module.ts
├── app.component.ts
├── core/
│   ├── core.module.ts
│   ├── services/
│   ├── guards/
│   └── interceptors/
├── shared/
│   ├── shared.module.ts
│   ├── components/
│   ├── directives/
│   └── pipes/
└── features/
    └── dashboard/
        ├── dashboard.module.ts
        ├── dashboard-routing.module.ts
        ├── pages/
        ├── components/
        ├── services/
        └── models/
```

### NgModule Declaration

```typescript
@NgModule({
  declarations: [
    DashboardPageComponent,
    DashboardCardComponent,
    DashboardFilterPipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    DashboardRoutingModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
```

### CoreModule Guard

```typescript
@NgModule({
  providers: [AuthService, LoggingService],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
```

### Component Patterns — @Input() and @Output()

```typescript
@Component({
  selector: 'app-user-card',
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <button (click)="onSelect()">Select</button>
    </div>
  `,
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<User>();

  onSelect(): void {
    this.selected.emit(this.user);
  }
}
```

### @ViewChild and @ContentChild

```typescript
export class TabsComponent implements AfterViewInit, AfterContentInit {
  @ViewChild('tabBody') tabBody!: ElementRef<HTMLDivElement>;
  @ContentChild(TabLabelDirective) tabLabel!: TabLabelDirective;
  @ContentChildren(TabPanelComponent) tabPanels!: QueryList<TabPanelComponent>;

  ngAfterViewInit(): void {
    // @ViewChild available here
  }

  ngAfterContentInit(): void {
    // @ContentChild available here
  }
}
```

### Bootstrapping

```typescript
// main.ts
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
```

### Routing & Lazy Loading

```typescript
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
  },
  {
    path: 'clients',
    loadChildren: () =>
      import('./features/clients/clients.module').then(m => m.ClientsModule),
    canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

### Class-Based Route Guards

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
```

### Change Detection

Zone.js default strategy — automatic change detection on async events.

OnPush strategy for performance-critical components:

```typescript
@Component({
  selector: 'app-client-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-client-card *ngFor="let client of clients" [client]="client"
      (selected)="onClientSelected($event)">
    </app-client-card>
  `,
})
export class ClientListComponent {
  @Input() clients: Client[] = [];
  @Output() clientSelected = new EventEmitter<Client>();

  onClientSelected(client: Client): void {
    this.clientSelected.emit(client);
  }
}
```

Manual change detection with `ChangeDetectorRef.markForCheck()`:

```typescript
export class LiveFeedComponent implements OnInit, OnDestroy {
  latestMessage = '';
  private destroy$ = new Subject<void>();

  constructor(private feedService: FeedService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.feedService.messages$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      this.latestMessage = msg;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Lifecycle Hooks

| Hook | Timing | Common Use |
|------|--------|------------|
| `ngOnChanges` | Before `ngOnInit` and on `@Input()` changes | React to input changes |
| `ngOnInit` | Once, after first `ngOnChanges` | Fetch data, initialize state |
| `ngAfterContentInit` | After projected content initialized | Access `@ContentChild` |
| `ngAfterViewInit` | After view initialized | Access `@ViewChild`, DOM |
| `ngOnDestroy` | Before destruction | Unsubscribe, cleanup |

### Testing (v12–v15)

```typescript
describe('ClientListComponent', () => {
  let component: ClientListComponent;
  let fixture: ComponentFixture<ClientListComponent>;
  let mockClientService: jasmine.SpyObj<ClientService>;

  beforeEach(async () => {
    mockClientService = jasmine.createSpyObj('ClientService', ['getClients']);
    mockClientService.getClients.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ClientListComponent, ClientCardComponent],
      imports: [CommonModule],
      providers: [{ provide: ClientService, useValue: mockClientService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Version-Specific Notes (v12–v14)

**v12:**
- No typed forms — use `FormGroup` / `FormControl` without generic types.
- `ViewChild` may require explicit `{ static: true/false }`.
- `emitEvent` and `onlySelf` options on form methods.

**v13:**
- `ViewChild` static default stabilized.
- `destroyRef` not available — use `takeUntil` pattern.
- Dynamic component creation via `ViewContainerRef.createComponent()` simplified (no `ComponentFactoryResolver` needed).

**v14:**
- Typed reactive forms introduced: `FormControl<string>`, `FormGroup<{ name: FormControl<string> }>`.
- Standalone components available as developer preview — do NOT use in production v14 projects.
- `inject()` function available in limited contexts but not recommended for v14.

---

## Part 2: Uplift Patterns (v15 → v16 → v17 → v18+)

**⚠️ MANDATORY: Consult RA wiki guides before any uplift.**

All Angular version uplifts in Config Studio follow the RA (Reusable Assets) team's migration guides. The patterns in this section are supplementary Angular-level reference — they do NOT replace the RA wiki steps.

### RA Migration Wiki Discovery

The RA team publishes migration guides in Confluence and Confluence Cloud. **Do not rely on hardcoded URLs** — pages may move. Always search dynamically using MCP tools.

**How to find RA migration guides:**

1. **Search Confluence** (space key: `DPEPRA`) with queries like:
   - `"Angular migration"` — general Angular migration guides
   - `"Angular [source] to [target] migration"` — e.g., "Angular 15 to 18 migration"
   - `"Angular [version] application migration"` — e.g., "Angular 18 application migration"
   - `"RA block migration Angular"` — RA block/library compatibility guides
   - `"DPEP Reference Architecture"` — the RA space root page with links to all guides

2. **Search Confluence Cloud** (space key: `CUDR`) with queries like:
   - `"Uplifting from Angular Versions"` — general uplift overview
   - `"Angular migration"` — additional migration resources

### Uplift Workflow

Before applying any Angular migration pattern:
1. **Detect** current Angular version from `package.json`.
2. **Identify** the target version.
3. **Search Confluence (DPEPRA space) and Confluence Cloud (CUDR space)** via MCP tools for the RA migration guide matching the version jump.
4. **Read and present the RA wiki steps to the user** — summarize what the guide prescribes and ask for confirmation before proceeding.
5. **Check RA library/block compatibility** — ensure RA components support the target version.
6. **Follow RA-prescribed steps first** — dependency updates, RA block migrations, breaking change fixes.
7. **Then apply** the Angular-level patterns below as supplementary guidance.

### Uplift v15 → v16: Standalone Components & Signals Introduction

#### Standalone Components

New components can be created as standalone. Existing NgModule components coexist.

```typescript
// NEW standalone component (v16+)
@Component({
  standalone: true,
  selector: 'app-search-bar',
  imports: [CommonModule, ReactiveFormsModule],
  template: `<input [formControl]="searchControl" placeholder="Search...">`,
})
export class SearchBarComponent {
  searchControl = new FormControl('');
}
```

```typescript
// Using standalone component in an NgModule
@NgModule({
  declarations: [DashboardPageComponent],
  imports: [
    CommonModule,
    SearchBarComponent,  // standalone components go in imports, not declarations
  ],
})
export class DashboardModule {}
```

#### inject() Function

Replaces constructor injection for cleaner DI:

```typescript
// BEFORE (v12–v15): constructor injection
export class ClientService {
  constructor(private http: HttpClient, private config: AppConfig) {}
}

// AFTER (v16+): inject() function
export class ClientService {
  private http = inject(HttpClient);
  private config = inject(AppConfig);
}
```

#### Signals (Developer Preview in v16)

```typescript
// Basic signal usage (v16+)
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment(): void {
    this.count.update(c => c + 1);
  }
}
```

#### takeUntilDestroyed()

Replaces manual `takeUntil` + `destroy$` pattern:

```typescript
// BEFORE (v12–v15)
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnInit() {
    this.data$.pipe(takeUntil(this.destroy$)).subscribe(...);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// AFTER (v16+)
export class MyComponent {
  private destroyRef = inject(DestroyRef);
  ngOnInit() {
    this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
  }
}
```

#### Functional Guards

```typescript
// BEFORE (v12–v15): class-based guard
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    return this.auth.isAuthenticated() || (this.router.navigate(['/login']), false);
  }
}

// AFTER (v16+): functional guard
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() || router.createUrlTree(['/login']);
};
```

#### Migration Strategy (v15 → v16)
- New components: create as standalone.
- Existing components: leave as NgModule-declared until touched.
- Use `importProvidersFrom()` to bridge NgModule providers into standalone bootstrap.
- Adopt `inject()` in new services and components.
- Use `takeUntilDestroyed()` in new code.
- Run `ng update @angular/core@16 @angular/cli@16`.

---

### Uplift v16 → v17: Built-in Control Flow & Signal I/O

#### Built-in Control Flow

```html
<!-- BEFORE (v12–v16): structural directives -->
<div *ngIf="isLoading; else content">Loading...</div>
<ng-template #content>
  <div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
</ng-template>

<!-- AFTER (v17+): built-in control flow -->
@if (isLoading) {
  <div>Loading...</div>
} @else {
  @for (item of items; track item.id) {
    <div>{{ item.name }}</div>
  }
}
```

```html
<!-- @switch -->
@switch (status) {
  @case ('active') { <span class="badge-active">Active</span> }
  @case ('inactive') { <span class="badge-inactive">Inactive</span> }
  @default { <span>Unknown</span> }
}
```

#### Deferrable Views

```html
<!-- Lazy-load heavy components -->
@defer (on viewport) {
  <heavy-data-table [data]="reportData"></heavy-data-table>
} @placeholder {
  <div>Scroll down to load table...</div>
} @loading (minimum 500ms) {
  <wdpr-spinner></wdpr-spinner>
} @error {
  <p>Failed to load component.</p>
}
```

#### Signal Inputs and Outputs

```typescript
// BEFORE (v12–v16): decorator-based
@Component({ ... })
export class ClientCardComponent {
  @Input() client!: Client;
  @Input() isActive = false;
  @Output() selected = new EventEmitter<Client>();
}

// AFTER (v17+): signal-based
@Component({ ... })
export class ClientCardComponent {
  client = input.required<Client>();
  isActive = input(false);
  selected = output<Client>();

  onSelect(): void {
    this.selected.emit(this.client());
  }
}
```

#### Signal Queries

```typescript
// BEFORE: decorator queries
@ViewChild('chart') chart!: ElementRef;
@ContentChildren(TabPanel) panels!: QueryList<TabPanel>;

// AFTER (v17+): signal queries
chart = viewChild.required<ElementRef>('chart');
panels = contentChildren(TabPanel);
```

#### Migration Strategy (v16 → v17)
- Run `ng generate @angular/core:control-flow` schematic for automatic `*ngIf`/`*ngFor` migration.
- Migrate `@Input()`/`@Output()` to signal-based when touching a component.
- Use `@defer` for heavy components to improve initial load.
- Run `ng update @angular/core@17 @angular/cli@17`.

---

### Uplift v17 → v18+: Zoneless & Full Signal Architecture

#### Zoneless Change Detection

```typescript
// v18+ bootstrap without Zone.js
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
  ],
});
```

Prerequisites before enabling zoneless:
- All components must use `OnPush` change detection or signals.
- Remove `zone.js` from `polyfills` in `angular.json`.
- Replace `setTimeout`/`setInterval` triggers with signal-based reactivity.

#### Standalone Bootstrap

```typescript
// BEFORE (v12–v15): NgModule bootstrap
platformBrowserDynamic().bootstrapModule(AppModule);

// AFTER (v18+): standalone bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(CoreModule),  // bridge existing NgModule providers
  ],
});
```

#### Migration Strategy (v17 → v18+)
- Ensure all components use `OnPush` + signals before enabling zoneless.
- Replace `bootstrapModule(AppModule)` with `bootstrapApplication(AppComponent, { providers: [...] })`.
- Use `importProvidersFrom()` to bridge remaining NgModule providers.
- Remove Zone.js from polyfills.
- Run `ng update @angular/core@18 @angular/cli@18`.

---

## Part 3: Version-Aware Anti-Patterns

### For v12–v15 Projects

| Pattern | Why NOT |
|---------|---------|
| `standalone: true` | Not available until v16 (dev preview in v14, not production-ready) |
| `signal()`, `computed()`, `effect()` | Not available until v16 |
| `input()`, `output()` signal functions | Not available until v17 |
| `@if` / `@for` / `@switch` control flow | Not available until v17 |
| `@defer` | Not available until v17 |
| `inject()` function | Not available until v16 |
| `takeUntilDestroyed()` | Not available until v16 |
| Functional guards (`CanActivateFn`) | Not available until v16 |
| `provideRouter()` | Not available until v16 |
| Zoneless change detection | Not available until v18 |

### For v16+ Projects (When Uplifting)

| Pattern | Recommendation |
|---------|---------------|
| NgModules for new components | Use standalone components instead |
| Constructor injection in new code | Use `inject()` function |
| Manual `takeUntil` + `destroy$` | Use `takeUntilDestroyed()` |
| Class-based guards for new routes | Use functional guards |
| `*ngIf` / `*ngFor` in new templates (v17+) | Use `@if` / `@for` control flow |
| `@Input()` decorator in new components (v17+) | Use `input()` signal function |

### Always Avoid (Any Version)

| Pattern | Why |
|---------|-----|
| Direct DOM manipulation (`document.querySelector`) | Use Angular template bindings or `@ViewChild` |
| `any` types for component I/O | Use typed inputs/outputs |
| Business logic in components | Extract to services |
| Subscribing without unsubscribing | Memory leaks — use `takeUntil` or `takeUntilDestroyed` |
| Hardcoded API URLs | Use environment files or injection tokens |
