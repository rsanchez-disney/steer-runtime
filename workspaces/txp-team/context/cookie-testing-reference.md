# Cookie Testing Reference (`roomForm_jar`)

The component persists form state in a `roomForm_jar` cookie. Set via browser console before reloading to test restoration.

## Cookie Format

URL-encoded JSON object. Keys vary by brand because each config can override param names.

## WDW / DLR (en-US) Cookie Keys

```
numberOfAdults, numberOfChildren, resort, checkInDate, checkOutDate,
kid1, kid2, ..., accessible, roomTypeId, components, cartId, cartItemId, numberOfRooms
```

### WDW Example

```js
document.cookie = `roomForm_jar=%7B%22numberOfAdults%22%3A%227%22%2C%22numberOfChildren%22%3A%221%22%2C%22resort%22%3A%2218390992%3BentityType%3Dresort%22%2C%22checkInDate%22%3A%222026-05-07%22%2C%22checkOutDate%22%3A%222026-05-17%22%2C%22kid1%22%3A%227%22%2C%22accessible%22%3A%221%22%2C%22roomTypeId%22%3Afalse%2C%22components%22%3A%22%22%2C%22cartId%22%3A%22%22%2C%22cartItemId%22%3A%22%22%2C%22numberOfRooms%22%3A%221%22%7D; path=/; max-age=86400`;
```

### DLR Example

```js
document.cookie = `roomForm_jar=%7B%22numberOfAdults%22%3A%227%22%2C%22numberOfChildren%22%3A%221%22%2C%22resort%22%3A%22334222%3BentityType%3Dresort%22%2C%22checkInDate%22%3A%222026-05-07%22%2C%22checkOutDate%22%3A%222026-05-17%22%2C%22kid1%22%3A%227%22%2C%22accessible%22%3A%221%22%2C%22roomTypeId%22%3Afalse%2C%22components%22%3A%22%22%2C%22cartId%22%3A%22%22%2C%22cartItemId%22%3A%22%22%2C%22numberOfRooms%22%3A%221%22%7D; path=/; max-age=86400`;
```

## UK (en-GB) Cookie Keys

UK uses different param names from config overrides:

```
adults, children, shopFor, arrivalDate, departureDate,
accessibleRoomRequest, child1, child2, ..., Sorting, Duration
```

### UK Example

```js
document.cookie = `roomForm_jar=%7B%22adults%22%3A2%2C%22children%22%3A1%2C%22shopFor%22%3A%22hotelVilla%22%2C%22arrivalDate%22%3A%222026-05-13%22%2C%22departureDate%22%3A%222026-05-23%22%2C%22accessibleRoomRequest%22%3A1%2C%22Sorting%22%3A%22Preis%22%2C%22Duration%22%3A9%2C%22child1%22%3A14%7D; path=/; max-age=86400`;
```

## Key Differences by Brand

| Field | WDW/DLR | UK (en-GB) |
|---|---|---|
| Adults | `numberOfAdults` | `adults` |
| Children | `numberOfChildren` | `children` |
| Check-in | `checkInDate` | `arrivalDate` |
| Check-out | `checkOutDate` | `departureDate` |
| Accessible | `accessible` | `accessibleRoomRequest` |
| Child age prefix | `kid` | `child` |

## Important Notes

- Legacy stores all values as strings (`"7"` not `7`). The `parseCookieNumber` helper handles both.
- Dates must be future ISO dates. Past dates are cleared on load.
- Resort values are IDs like `"18390992;entityType=resort"` — must match config `multiOptions`.
- Use `max-age=86400` (24h) to persist. Use `max-age=0` to delete.
