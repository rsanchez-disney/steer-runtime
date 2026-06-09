# Angular Test Patterns — OpSheet Plus

Reference document with the testing patterns used in OpSheet Angular projects.

---

## 1. TestBed Configuration

### Component Tests

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyComponent } from './my-component.component';
import { MyService } from '../services/my.service';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let mockService: jasmine.SpyObj<MyService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('MyService', ['getData', 'saveData']);

    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [
        { provide: MyService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
});
```

### Service Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService]
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## 2. Mocking with createSpyObj

```typescript
// Create a spy object with specific methods
const mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
const mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

// Configure return values
mockService.getData.and.returnValue(of(mockData));
mockService.saveData.and.returnValue(of(true));

// Spy on errors
mockService.getData.and.returnValue(throwError(() => new Error('Network error')));
```

---

## 3. HTTP Testing

```typescript
it('should fetch data from API', () => {
  const mockResponse = { items: [{ id: 1, name: 'Test' }] };

  service.getData().subscribe(data => {
    expect(data).toEqual(mockResponse);
  });

  const req = httpMock.expectOne('/api/v1/items');
  expect(req.request.method).toBe('GET');
  req.flush(mockResponse);
});

it('should handle HTTP error', () => {
  service.getData().subscribe({
    error: (err) => {
      expect(err.status).toBe(500);
    }
  });

  const req = httpMock.expectOne('/api/v1/items');
  req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
});
```

---

## 4. Async Testing

### fakeAsync + tick

```typescript
it('should debounce input', fakeAsync(() => {
  component.searchControl.setValue('test');
  tick(300); // debounce time
  fixture.detectChanges();

  expect(mockService.search).toHaveBeenCalledWith('test');
}));
```

### waitForAsync (formerly async)

```typescript
it('should load data on init', waitForAsync(() => {
  mockService.getData.and.returnValue(of(mockData));
  fixture.detectChanges();

  fixture.whenStable().then(() => {
    expect(component.items.length).toBe(3);
  });
}));
```

---

## 5. DOM Interaction

```typescript
import { By } from '@angular/platform-browser';

it('should display items in list', () => {
  component.items = [{ id: 1, name: 'Item 1' }];
  fixture.detectChanges();

  const listItems = fixture.debugElement.queryAll(By.css('.item-row'));
  expect(listItems.length).toBe(1);
  expect(listItems[0].nativeElement.textContent).toContain('Item 1');
});

it('should call save on button click', () => {
  const button = fixture.debugElement.query(By.css('[data-testid="save-btn"]'));
  button.triggerEventHandler('click', null);

  expect(mockService.saveData).toHaveBeenCalled();
});
```

---

## 6. Observable Testing

```typescript
import { of, throwError, BehaviorSubject } from 'rxjs';

// Mock observable property
const dataSubject = new BehaviorSubject<Item[]>([]);
mockStore.select.and.returnValue(dataSubject.asObservable());

// Emit new values during test
dataSubject.next([{ id: 1, name: 'New Item' }]);
fixture.detectChanges();
```

---

## 7. Test Types by Layer

| Type | TestBed Config | Notes |
|------|---------------|-------|
| Model/Interface | None | Pure type checks, `fromJson`/`toJson` only |
| Pipe | Minimal | Just the pipe, test `transform()` |
| Service (no HTTP) | Providers only | Mock dependencies |
| Service (HTTP) | HttpClientTestingModule | Use `HttpTestingController` |
| Component (simple) | Declarations + providers | Mock all services |
| Component (with routing) | RouterTestingModule | Mock activated route |
| Component (with forms) | ReactiveFormsModule | Test form state |

---

## 8. Naming Conventions

- Spy objects: `mockXxx` (e.g., `mockService`, `mockRouter`)
- Test data: `mockData`, `testItems`, `expectedResult`
- Test IDs in DOM: `data-testid="descriptive-name"`
- Describe blocks: component/service name
- It blocks: `'should {action} when {condition}'`

---

## Quick Reference

| Aspect | Pattern |
|--------|---------|
| Mock library | Jasmine spies (`createSpyObj`) |
| HTTP testing | `HttpClientTestingModule` + `HttpTestingController` |
| Async | `fakeAsync` + `tick()` |
| DOM queries | `By.css()` on `debugElement` |
| Observable mock | `and.returnValue(of(...))` |
| Error mock | `and.returnValue(throwError(...))` |
| Detect changes | `fixture.detectChanges()` after state change |
| Cleanup | `httpMock.verify()` in `afterEach` |
| OPP tags | `describe('OPP-XXXXX: Summary', ...)` |
