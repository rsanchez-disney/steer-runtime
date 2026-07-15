# Skill: @ngrx/signals store patterns

## Composable Store with InjectionToken (dcl-apps-checkout-ui)

1. Create `signalStoreFeature` function: `export function withFeatureName()`
2. Define state with `withState<T>(initialState)`
3. Add computed values with `withComputed()`
4. Add methods with `withMethods()` using `patchState()`
5. Compose into main store: `signalStore(..., withFeatureName())`
6. Access via `BOOKING_STORE` InjectionToken in components
7. Test with mock store providing `signal()` values

### Example

```typescript
export function withPaymentState() {
    return signalStoreFeature(
        withState<PaymentState>(initialPaymentState),
        withComputed(({ selectedMethod, methods }) => ({
            isValid: computed(() =>
                methods().some((m) => m.id === selectedMethod()),
            ),
        })),
        withMethods((store) => ({
            selectMethod: (id: string) =>
                patchState(store, { selectedMethod: id }),
        })),
    );
}

export const CheckoutInfoStore = signalStore(
    { providedIn: "root" },
    withCheckoutInfoState(),
    withPaymentState(),
    withGuestMethods(),
);

export const BOOKING_STORE = new InjectionToken<BookingStore>("BookingStore");
```

## Simple Store (dcl-apps-online-checkin-spa)

1. Create store with `signalStore({ providedIn: 'root' }, ...)`
2. Define state interface and initial state with `withState<T>()`
3. Add computed values with `withComputed()`
4. Add methods with `withMethods()` using `patchState()`
5. Inject store in component via `inject(StoreName)`
6. Access state as signals: `store.field()`
7. Write test mocking the store with `signal()` values

### Example

```typescript
export const GuestsStore = signalStore(
    { providedIn: "root" },
    withState<GuestsState>({ guests: [], loading: false, error: null }),
    withComputed(({ guests }) => ({
        guestCount: computed(() => guests().length),
        hasGuests: computed(() => guests().length > 0),
    })),
    withMethods((store, guestsService = inject(GuestsService)) => ({
        loadGuests: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { loading: true })),
                switchMap((reservationId) =>
                    guestsService.getGuests(reservationId).pipe(
                        tapResponse({
                            next: (guests) =>
                                patchState(store, { guests, loading: false }),
                            error: (error) =>
                                patchState(store, {
                                    error: error.message,
                                    loading: false,
                                }),
                        }),
                    ),
                ),
            ),
        ),
    })),
);
```
