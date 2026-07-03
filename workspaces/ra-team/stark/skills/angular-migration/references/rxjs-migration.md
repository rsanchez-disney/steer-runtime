# RxJS Migration Guide

## RxJS 5 → 6 (required for Angular 6+)

### Import path changes

```typescript
// ❌ RxJS 5 style
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

// ✅ RxJS 6 style
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
```

### Operator usage changes

```typescript
// ❌ RxJS 5: chaining
observable.map(x => x * 2).filter(x => x > 5).subscribe();

// ✅ RxJS 6: pipe
observable.pipe(
  map(x => x * 2),
  filter(x => x > 5)
).subscribe();
```

### Automatic migration

```bash
# Install the rxjs-tslint migration tool (for RxJS 5→6)
npm install -g rxjs-tslint
rxjs-5-to-6-migrate -p tsconfig.json

# Or use the compat layer as a bridge during migration
npm install rxjs-compat
```

### Common operator renames (5 → 6)

| RxJS 5 | RxJS 6 |
|--------|--------|
| `do()` | `tap()` |
| `catch()` | `catchError()` |
| `switch()` | `switchAll()` |
| `finally()` | `finalize()` |
| `throw()` | `throwError()` |
| `fromPromise()` | `from()` |

### Creation operators (import from 'rxjs')

```typescript
import {
  of, from, fromEvent, interval, timer,
  combineLatest, merge, concat, forkJoin,
  throwError, EMPTY, NEVER, Subject,
  BehaviorSubject, ReplaySubject, AsyncSubject
} from 'rxjs';
```

### Pipeable operators (import from 'rxjs/operators')

```typescript
import {
  map, filter, tap, switchMap, mergeMap, concatMap, exhaustMap,
  catchError, retry, finalize, take, takeUntil, first, last,
  debounceTime, throttleTime, distinctUntilChanged, share, shareReplay,
  startWith, withLatestFrom, combineLatestWith, pairwise, scan, reduce
} from 'rxjs/operators';
```

## RxJS 6 → 7 (required for Angular 12+)

### Key changes

- `toPromise()` deprecated → use `firstValueFrom()` or `lastValueFrom()`
- `subscribe(next, error, complete)` signature deprecated → use object `{ next, error, complete }`
- Some renamed exports from 'rxjs' directly (combineLatest)

```typescript
// ❌ RxJS 6 deprecated patterns
const result = await observable.toPromise();
observable.subscribe(val => {}, err => {}, () => {});

// ✅ RxJS 7
import { firstValueFrom, lastValueFrom } from 'rxjs';
const result = await firstValueFrom(observable);
observable.subscribe({
  next: val => {},
  error: err => {},
  complete: () => {}
});
```

### Removed in RxJS 7

| Removed | Replacement |
|---------|------------|
| `combineLatest(a$, b$)` | `combineLatest([a$, b$])` (array form) |
| `merge(a$, b$)` | `merge(a$, b$)` (still works, but import from 'rxjs') |
| `zip(a$, b$)` | `zip([a$, b$])` |
| `Observable.create()` | `new Observable(subscriber => {})` |
| `partition` from rxjs/operators | `partition` from 'rxjs' |

### Automatic migration for RxJS 7

```bash
npx rxjs-codemods <path>
```

## Angular-specific RxJS patterns

### Replacing subscriptions with signals (Angular 16+)

```typescript
// ❌ Old: manual subscription management
export class MyComponent implements OnInit, OnDestroy {
  data: Data[];
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.service.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => this.data = data);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}

// ✅ New: toSignal (Angular 16+)
export class MyComponent {
  private service = inject(MyService);
  data = toSignal(this.service.getData(), { initialValue: [] });
}
```

### Using takeUntilDestroyed (Angular 16+)

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MyComponent {
  constructor() {
    this.service.getData().pipe(
      takeUntilDestroyed()  // auto-unsubscribes on destroy
    ).subscribe(data => this.data = data);
  }
}
```

### HttpClient + Signals (Angular 19+)

```typescript
// ❌ Old: Observable-based
export class MyComponent {
  data$ = this.http.get<Data[]>('/api/data');
}

// ✅ New: httpResource (Angular 19+)
export class MyComponent {
  data = httpResource<Data[]>('/api/data');
  // data.value() — the data signal
  // data.isLoading() — loading state
  // data.error() — error state
}
```
