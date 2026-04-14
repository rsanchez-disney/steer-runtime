---
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.html", "**/*.scss", "**/*.spec.ts", "angular.json", "package.json"]
---

# UI (Angular) steering — wdpr-payment-controls-client

## Project Context
This is an Angular 15 application using NGXS for state management and Jasmine for testing.

## Architecture
- Prefer reactive forms; keep components thin.
- Business logic belongs in services/facades; components coordinate.
- Avoid tightly coupling UI to backend fields: tolerate missing fields and default safely.
- Follow Angular style guide conventions.
- Smart (container) vs presentational (dumb) components properly separated.
- Services properly injected and scoped.
- Modules organized logically (feature, shared, core).
- Routing configured correctly with lazy loading.
- Dependency injection hierarchy respected.

## Export UX guidance
- Bubble messages should reflect report type and filters (inactive included, etc.).
- Prefer progress indicators derived from server-provided progress when available.
- If no true progress exists: show staged messaging (queued → generating → finalizing).

## Do not
- Do not introduce breaking changes to shared API models used across layers.

## General Coding Practices

### TypeScript Standards
- Use strict TypeScript settings with explicit types
- Prefer `const` over `let`, avoid `var`
- Use meaningful, descriptive variable and function names
- Enable and respect ESLint rules
- Use interface over type for object shapes
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.)
- **Use single-return style** — structure functions so the return value is clear at the end, using `if (condition) { ... }` blocks rather than early returns for guard clauses
```typescript
// ❌ AVOID: early return guard clause
function validate(): ValidationResult {
  const errorKey = getFormError();
  if (!errorKey) return { errors: {} };
  const validationErrors = { [errorKey]: { message: 'error' } };
  return { errors: validationErrors };
}

// ✅ PREFERRED: single-return style
function validate(): ValidationResult {
  const errorKey = getFormError();

  if (errorKey) {
    const validationErrors = { [errorKey]: { message: 'error' } };
    return { errors: validationErrors };
  }

  return { errors: {} };
}
```

### Angular Best Practices
- Use OnPush change detection strategy when possible
- Implement OnDestroy and unsubscribe from observables
- Prefer async pipe over manual subscriptions
- Use standalone components where appropriate (Angular 15+)
- Keep components focused and under 400 lines
- Extract complex logic into services
- Use dependency injection properly
- Implement proper error handling with catchError
- Use trackBy functions in *ngFor loops for performance
- Update unit tests for new UI logic and contracts
- Prefer stable selectors and predicate-based request matching in interceptors/tests

### Component Structure
```typescript
// Follow this order:
1. Decorator and metadata
2. Public properties
3. Private properties
4. Constructor
5. Lifecycle hooks (ngOnInit, ngOnDestroy, etc.)
6. Public methods
7. Private methods
```

## NGXS State Management

### State Class Structure
- Keep state classes focused and cohesive
- Use immutable state updates with spread operators or immer
- Name state classes with `State` suffix (e.g., `UserState`)
- Place state in dedicated folder: `src/app/state/`
- Use state name decorator: `@State({ name: 'users' })`

### Actions
- Create action classes in separate files: `*.actions.ts`
- Use descriptive action names with context (e.g., `[Users] Load Users`)
- Include payload types in action constructors
```typescript
export class LoadUsers {
  static readonly type = '[Users] Load Users';
  constructor(public filter?: UserFilter) {}
}
```

### Selectors
- Create selectors in `*.selectors.ts` files
- Use `@Selector()` decorator for memoization
- Keep selectors pure and performant
- Compose selectors when needed
```typescript
@Selector()
static users(state: UserStateModel) {
  return state.users;
}
```

### Actions in State
- Handle async operations properly with Observable patterns
- Use `ctx.patchState()` for partial updates
- Use `ctx.setState()` for complete state replacement
- Handle errors within action handlers
```typescript
@Action(LoadUsers)
loadUsers(ctx: StateContext<UserStateModel>, action: LoadUsers) {
  return this.userService.getUsers(action.filter).pipe(
    tap(users => ctx.patchState({ users })),
    catchError(error => {
      ctx.patchState({ error });
      return throwError(() => error);
    })
  );
}
```

## Testing with Jasmine

### Test Structure
- Follow AAA pattern: Arrange, Act, Assert
- Use descriptive test names that explain expected behavior
- One assertion per test when possible
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup
- Clean up in `afterEach` when necessary

### Mocking Strategy
**CRITICAL: Always mock ALL dependencies in tests**
- Never import real services, pipes, or directives in tests
- Use `jasmine.createSpyObj()` for service mocks
- **IMPORTANT: Use class reference instead of string in createSpyObj** - `jasmine.createSpyObj(AuthService, [...])` NOT `jasmine.createSpyObj('AuthService', [...])`
- This ensures IDE refactoring updates test mocks automatically
- **Use conditional mock returns based on parameters** - `mockService.method.and.callFake((param) => { if (param === 'x') return of(data1); return of(data2); })`
- Mock child components with stub components
- Mock pipes with spy objects or stub pipes
- Mock directives with stub directives
- Use `NO_ERRORS_SCHEMA` or `CUSTOM_ELEMENTS_SCHEMA` sparingly (prefer explicit mocks)
- Mock NGXS Store with spy object
- Mock ActivatedRoute, Router, and other Angular services

### Advanced Mocking Patterns

#### Conditional Mock Returns Based on Parameters
**PREFER `withArgs()` over `callFake()` with conditionals for better maintainability**

```typescript
beforeEach(() => {
  mockUserService = jasmine.createSpyObj(UserService, ['getUser', 'getUsersByRole']);
  
  // ✅ PREFERRED: Use withArgs() - cleaner and more maintainable
  mockUserService.getUser.withArgs(1).and.returnValue(of({ id: 1, name: 'John' }));
  mockUserService.getUser.withArgs(2).and.returnValue(of({ id: 2, name: 'Jane' }));
  mockUserService.getUser.withArgs(3).and.returnValue(throwError(() => new Error('User not found')));
  
  mockUserService.getUsersByRole.withArgs('admin').and.returnValue(of([{ id: 1, name: 'Admin User' }]));
  mockUserService.getUsersByRole.withArgs('user').and.returnValue(of([{ id: 2, name: 'Regular User' }]));
  mockUserService.getUsersByRole.withArgs('guest').and.returnValue(of([]));
});

it('should load different users based on ID', () => {
  component.loadUser(1);
  expect(component.user.name).toBe('John');

  component.loadUser(2);
  expect(component.user.name).toBe('Jane');
});

it('should handle different roles', () => {
  component.loadUsersByRole('admin');
  expect(component.users.length).toBe(1);
  expect(component.users[0].name).toBe('Admin User');
});
```

#### Mocking NGXS Store Select and Dispatch with withArgs()
**CRITICAL: Always use `withArgs()` when mocking Store.select() and Store.dispatch()**

```typescript
describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj(Store, ['dispatch', 'select', 'selectSnapshot']);
    
    // ✅ Mock different selectors with withArgs()
    mockStore.select.withArgs(UserState.users).and.returnValue(of([{ id: 1, name: 'John' }]));
    mockStore.select.withArgs(UserState.loading).and.returnValue(of(false));
    mockStore.select.withArgs(UserState.error).and.returnValue(of(null));
    
    // ✅ Mock selectSnapshot with withArgs()
    mockStore.selectSnapshot.withArgs(UserState.currentUser).and.returnValue({ id: 1, name: 'John' });
    mockStore.selectSnapshot.withArgs(UserState.permissions).and.returnValue(['read', 'write']);
    
    // ✅ Mock dispatch responses for specific actions
    mockStore.dispatch.withArgs(jasmine.any(LoadUsers)).and.returnValue(of({}));
    mockStore.dispatch.withArgs(jasmine.any(DeleteUser)).and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [UserDashboardComponent],
      providers: [{ provide: Store, useValue: mockStore }]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should select users from store', () => {
    component.ngOnInit();
    
    expect(mockStore.select).toHaveBeenCalledWith(UserState.users);
    expect(component.users).toEqual([{ id: 1, name: 'John' }]);
  });

  it('should dispatch LoadUsers action', () => {
    component.loadUsers();
    
    expect(mockStore.dispatch).toHaveBeenCalledWith(new LoadUsers());
  });
});
```

#### Using Jasmine Matchers with withArgs()
```typescript
// Use jasmine.any() for type-based returns
mockService.process.withArgs(jasmine.any(String)).and.returnValue(of('string result'));
mockService.process.withArgs(jasmine.any(Number)).and.returnValue(of('number result'));

// Use jasmine.objectContaining() for partial object matching
mockService.update.withArgs(jasmine.objectContaining({ id: 1 })).and.returnValue(of({ success: true }));

// Combine multiple matchers
mockStore.dispatch.withArgs(jasmine.objectContaining({ type: '[User] Load' })).and.returnValue(of({}));
```

#### When to Use callFake() (Rare Cases)
Only use `callFake()` when you need complex logic that can't be expressed with `withArgs()`:

```typescript
// ❌ AVOID: Simple conditionals - use withArgs() instead
mockService.calculate.and.callFake((value: number) => {
  if (value > 10) return of(100);
  return of(0);
});

// ✅ ONLY use callFake() for truly complex calculations
mockService.calculatePrice.and.callFake((items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = total > 100 ? total * 0.1 : 0;
  return of(total - discount);
});
```

### Component Testing
```typescript
describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spies for all service dependencies
    // IMPORTANT: Use class reference, not string
    mockUserService = jasmine.createSpyObj(UserService, [
      'getUser',
      'updateUser',
      'deleteUser'
    ]);
    mockStore = jasmine.createSpyObj(Store, ['dispatch', 'select', 'selectSnapshot']);
    mockRouter = jasmine.createSpyObj(Router, ['navigate']);

    // Setup default return values
    mockUserService.getUser.and.returnValue(of({ id: 1, name: 'Test User' }));
    mockStore.select.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      declarations: [
        UserProfileComponent,
        MockChildComponent, // Mock child components
        MockCustomPipe // Mock pipes
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Store, useValue: mockStore },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { 
          snapshot: { params: { id: '1' } },
          params: of({ id: '1' })
        }}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user on init', () => {
    // Arrange
    const mockUser = { id: 1, name: 'John Doe' };
    mockUserService.getUser.and.returnValue(of(mockUser));

    // Act
    component.ngOnInit();
    fixture.detectChanges();

    // Assert
    expect(mockUserService.getUser).toHaveBeenCalledWith(1);
    expect(component.user).toEqual(mockUser);
  });

  it('should navigate on save', () => {
    // Arrange
    mockUserService.updateUser.and.returnValue(of({}));
    component.user = { id: 1, name: 'Updated' };

    // Act
    component.save();

    // Assert
    expect(mockUserService.updateUser).toHaveBeenCalledWith(component.user);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
  });
});

// Mock child component
@Component({
  selector: 'app-user-details',
  template: ''
})
class MockChildComponent {
  @Input() user: any;
  @Output() save = new EventEmitter();
}

// Mock pipe
@Pipe({ name: 'customFormat' })
class MockCustomPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
```

### Service Testing
**Always mock all dependencies - HttpClient, other services, etc.**
```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLoggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    // Create spies for all service dependencies
    mockAuthService = jasmine.createSpyObj(AuthService, ['getToken', 'isAuthenticated']);
    mockLoggerService = jasmine.createSpyObj(LoggerService, ['log', 'error']);

    // Setup default behaviors
    mockAuthService.getToken.and.returnValue('mock-token');
    mockAuthService.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: LoggerService, useValue: mockLoggerService }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should retrieve users from API with auth token', () => {
    const mockUsers = [{ id: 1, name: 'Test' }];

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
      expect(mockAuthService.getToken).toHaveBeenCalled();
    });

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush(mockUsers);
  });

  it('should handle errors and log them', () => {
    const errorMessage = 'Server error';

    service.getUsers().subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(mockLoggerService.error).toHaveBeenCalledWith(jasmine.any(String));
      }
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});
```

### Pipe Testing
**Always mock dependencies injected into pipes**
```typescript
describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;
  let mockDateService: jasmine.SpyObj<DateService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    mockDateService = jasmine.createSpyObj(DateService, ['format', 'getLocale']);
    mockTranslateService = jasmine.createSpyObj(TranslateService, ['instant']);

    mockDateService.getLocale.and.returnValue('en-US');
    mockTranslateService.instant.and.returnValue('translated text');

    pipe = new DateFormatPipe(mockDateService, mockTranslateService);
  });

  it('should format date using injected service', () => {
    mockDateService.format.and.returnValue('Jan 1, 2024');
    
    const result = pipe.transform('2024-01-01');
    
    expect(mockDateService.format).toHaveBeenCalledWith('2024-01-01');
    expect(result).toBe('Jan 1, 2024');
  });

  it('should handle null values', () => {
    const result = pipe.transform(null);
    
    expect(result).toBe('');
    expect(mockDateService.format).not.toHaveBeenCalled();
  });
});
```

### Directive Testing
**Always mock services and create proper test host components**
```typescript
@Component({
  template: '<div appHighlight [color]="color"></div>'
})
class TestHostComponent {
  color = 'yellow';
}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: HighlightDirective;
  let element: HTMLElement;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockLogger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    mockPermissionService = jasmine.createSpyObj(PermissionService, ['hasPermission']);
    mockLogger = jasmine.createSpyObj(LoggerService, ['debug']);

    mockPermissionService.hasPermission.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [HighlightDirective, TestHostComponent],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    });

    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement.querySelector('div');
    directive = fixture.debugElement.query(By.directive(HighlightDirective)).injector.get(HighlightDirective);
  });

  it('should apply highlight color when user has permission', () => {
    fixture.detectChanges();

    expect(mockPermissionService.hasPermission).toHaveBeenCalled();
    expect(element.style.backgroundColor).toBe('yellow');
  });

  it('should not apply highlight when user lacks permission', () => {
    mockPermissionService.hasPermission.and.returnValue(false);
    
    fixture.detectChanges();

    expect(element.style.backgroundColor).toBe('');
  });
});
```

### NGXS Testing
**Use REAL Store when testing States, mock it when testing consumers**

#### Testing NGXS State Classes (Use Real Store)
When testing state classes, use the real NGXS Store to verify state transitions and action handling. Mock only the services that the state depends on.

```typescript
describe('UserState', () => {
  let store: Store; // Real Store, not mocked
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    // Create spies for ALL services used by the state
    mockUserService = jasmine.createSpyObj(UserService, [
      'getUsers', 
      'createUser', 
      'updateUser',
      'deleteUser'
    ]);
    mockNotificationService = jasmine.createSpyObj(NotificationService, ['success', 'error']);
    mockAnalyticsService = jasmine.createSpyObj(AnalyticsService, ['trackEvent']);

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([UserState])], // Use real NGXS module
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AnalyticsService, useValue: mockAnalyticsService }
      ]
    });

    store = TestBed.inject(Store); // Inject real Store
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should load users into state', async () => {
    const mockUsers = [{ id: 1, name: 'Test' }];
    mockUserService.getUsers.and.returnValue(of(mockUsers));

    await store.dispatch(new LoadUsers()).toPromise();

    const users = store.selectSnapshot(UserState.users);
    expect(users).toEqual(mockUsers);
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });

  it('should handle errors and show notification', async () => {
    const error = new Error('Failed to load');
    mockUserService.getUsers.and.returnValue(throwError(() => error));

    await store.dispatch(new LoadUsers()).toPromise().catch(() => {});

    expect(mockNotificationService.error).toHaveBeenCalledWith('Failed to load users');
    const errorState = store.selectSnapshot(UserState.error);
    expect(errorState).toBeTruthy();
  });

  it('should track analytics when user is created', async () => {
    const newUser = { name: 'New User' };
    mockUserService.createUser.and.returnValue(of({ id: 2, ...newUser }));

    await store.dispatch(new CreateUser(newUser)).toPromise();

    expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('user_created');
    expect(mockNotificationService.success).toHaveBeenCalled();
  });
});
```

#### Testing Components/Services that Use Store (Mock Store)
When testing components or services that consume state, mock the Store to isolate the unit under test.

```typescript
describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockStore: jasmine.SpyObj<Store>; // Mock Store for component tests

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj(Store, ['dispatch', 'select', 'selectSnapshot']);
    
    // Configure default behaviors
    const mockUsers = [{ id: 1, name: 'Test User' }];
    mockStore.select.and.returnValue(of(mockUsers));
    mockStore.selectSnapshot.and.returnValue(mockUsers);

    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      providers: [
        { provide: Store, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should load users from store on init', () => {
    const mockUsers = [{ id: 1, name: 'John' }];
    mockStore.select.and.returnValue(of(mockUsers));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.users).toEqual(mockUsers);
  });

  it('should dispatch action when adding user', () => {
    const newUser = { name: 'New User' };

    component.addUser(newUser);

    expect(mockStore.dispatch).toHaveBeenCalledWith(new CreateUser(newUser));
  });
});
```

### Common Mocking Patterns

#### Mock Store (NGXS)
```typescript
const mockStore = jasmine.createSpyObj(Store, ['dispatch', 'select', 'selectSnapshot']);
mockStore.select.and.returnValue(of(mockData));
mockStore.selectSnapshot.and.returnValue(mockData);
```

#### Mock Router
```typescript
const mockRouter = jasmine.createSpyObj(Router, ['navigate', 'navigateByUrl']);
mockRouter.navigate.and.returnValue(Promise.resolve(true));
```

#### Mock ActivatedRoute
```typescript
const mockActivatedRoute = {
  snapshot: { 
    params: { id: '1' },
    queryParams: { filter: 'active' },
    data: { title: 'Test' }
  },
  params: of({ id: '1' }),
  queryParams: of({ filter: 'active' })
};
```

#### Mock FormBuilder (if needed)
```typescript
// Usually use real FormBuilder, but if mocking:
const mockFormBuilder = jasmine.createSpyObj(FormBuilder, ['group', 'control', 'array']);
```

#### Mock Child Components
```typescript
@Component({
  selector: 'app-child',
  template: ''
})
class MockChildComponent {
  @Input() data: any;
  @Output() action = new EventEmitter();
}
```

#### Mock Multiple Pipes
```typescript
@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Pipe({ name: 'dateFormat' })
class MockDateFormatPipe implements PipeTransform {
  transform(value: any): string {
    return value ? value.toString() : '';
  }
}
```

### Test Coverage
- Aim for 80%+ code coverage
- Prioritize testing business logic and critical paths
- Test edge cases and error scenarios
- **Mock ALL external dependencies - no real services, pipes, or directives in tests**
- Every test should be isolated and not depend on real implementations

### Testing Checklist
- [ ] All service dependencies mocked with jasmine.createSpyObj
- [ ] All child components replaced with mock components
- [ ] All pipes replaced with mock pipes
- [ ] All directives mocked or tested with host components
- [ ] HttpClient mocked with HttpClientTestingModule
- [ ] Store/Router/ActivatedRoute mocked appropriately
- [ ] Default spy return values configured in beforeEach
- [ ] Tests follow AAA pattern
- [ ] Each test is isolated and independent
- [ ] Error cases tested with spy configurations

## Code Quality Rules

### DRY Principle
- Extract repeated code into reusable functions/services
- Create shared components for common UI patterns
- Use utility functions for common operations

### SOLID Principles
- Single Responsibility: One class/component does one thing
- Keep interfaces focused and minimal
- Depend on abstractions, not concretions
- Prefer composition over inheritance

### Performance
- Use OnPush change detection strategy
- Lazy load modules when possible
- Unsubscribe from observables to prevent memory leaks
- Use pure pipes for transformations
- Implement virtual scrolling for large lists

### Security
- Sanitize user inputs
- Use Angular's built-in XSS protection
- Never use `bypassSecurityTrust` unless absolutely necessary
- Validate data on both client and server

## Documentation
- Add JSDoc comments for complex functions
- Document state shape and actions
- Keep README updated
- Comment non-obvious business logic
- Use TODO comments with ticket numbers for pending work

## Code Review Checklist
- [ ] Follows Angular style guide
- [ ] No console.logs in production code
- [ ] Proper error handling implemented
- [ ] Observable subscriptions cleaned up
- [ ] Tests added/updated for changes
- [ ] State updates are immutable
- [ ] Type-safe throughout
- [ ] Performance considerations addressed

## Forbidden Patterns
- ❌ Don't use early return guard clauses — use single-return style for better readability
- ❌ Don't mutate state directly in NGXS
- ❌ Don't subscribe to observables in services (return Observable instead)
- ❌ Don't use `any` type unless absolutely necessary
- ❌ Don't create massive components (split them up)
- ❌ Don't forget to unsubscribe from observables
- ❌ Don't use `subscribe()` in templates (use async pipe)
- ❌ Don't test implementation details, test behavior
- ❌ **NEVER use real services, pipes, or directives in tests - ALWAYS mock ALL dependencies**
- ❌ **NEVER import actual child components in component tests - use mock components**
- ❌ **NEVER use NO_ERRORS_SCHEMA to avoid mocking - explicitly mock dependencies**
- ❌ Don't share mock objects between tests without resetting them
- ❌ Don't test private methods directly (test through public API)

## When Generating Code
1. Always include proper TypeScript types
2. **Always generate comprehensive Jasmine tests with ALL dependencies mocked**
3. Follow the project structure conventions
4. Use NGXS patterns correctly
5. Include error handling
6. Add necessary imports
7. Follow Angular lifecycle properly
8. Consider performance implications
9. **Create mock components, pipes, and directives for tests**
10. **Use jasmine.createSpyObj for all service dependencies**
11. **Configure default return values for spies in beforeEach**
12. **Never use real implementations in unit tests**
