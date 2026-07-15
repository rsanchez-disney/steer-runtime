# Skill: DCL Angular component creation

Detect the repo by prefix and apply the correct pattern.

## Standalone Library Component (dcl-apps-checkout-ui)

1. Create standalone component with `dcl-checkout` prefix
2. List all dependencies in `imports: []`
3. Use `@Input()` / `@Output()` decorators (NOT signal inputs)
4. Default change detection (NOT OnPush)
5. Inject BOOKING_STORE via `inject(BOOKING_STORE)`
6. Add `CUSTOM_ELEMENTS_SCHEMA` if using @wdpr/\* web components
7. Write Jasmine test with standalone component in `imports`
8. Mock store with `signal()` values

## Standalone App Component (dcl-apps-online-checkin-spa)

1. Create standalone component with `online-checkin` prefix
2. List all dependencies in `imports: []`
3. Use `inject()` for DI
4. Use @ngrx/signals stores
5. Add route with `loadComponent` for lazy loading
6. Write Jasmine test with standalone component in `imports`

## NgModule Library Component (dcl-post-booking-mr)

1. Create component with `myres` prefix
2. Declare in `DclPostBookingModule`
3. Use `@Input()` / `@Output()` decorators
4. Use constructor injection
5. Use BehaviorSubject services for state
6. Write Jasmine test with `TestBed`, `jasmine.createSpyObj()`

## Hybrid SPA Component (dcl-cruise-101-spa)

### New feature (standalone + signals)

1. Create standalone component with `cruise101` prefix + OnPush
2. Use `inject()` for DI, `signal()`/`computed()` for state
3. Add route with `loadComponent` for lazy loading
4. Write Jasmine test with component in `imports`
5. Verify 80% coverage

### Existing feature modification

1. Follow existing NgModule pattern
2. Use `@Input()`/`@Output()`, constructor injection
3. Update existing tests
4. Minimal diff

## Shared Library Component (dcl-ui-global-components-library-v2)

1. Create component folder in `projects/dcl-ui-global-components-library-v2/src/lib/`
2. Create: `*.component.ts`, `*.component.html`, `*.component.scss`, `*.component.spec.ts`, `*.module.ts`
3. Use `dcl-ui-global` prefix for selector
4. Use `@Input()` / `@Output()` decorators
5. Create NgModule that declares and exports the component
6. Expose CSS custom properties on `:host` for consumer overrides
7. Export component and module from `public-api.ts`
8. Create `README.md` with usage docs
9. Write Jasmine test with 90% coverage
10. Build: `ng build dcl-ui-global-components-library-v2`
11. Test locally: `npm run build:watch:yalc` + `yalc add` in consumer app
