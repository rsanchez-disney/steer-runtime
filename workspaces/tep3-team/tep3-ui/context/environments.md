# Environments

## Debug Page

**URL:** `{env}/checkout-booking/debug/activities/`

### How to use:
1. Login with test credentials
2. Toggle "Full Request Body" ON (below guest login section)
3. Paste the request body (from `/initialize` call or generated payload)
4. Submit

> **Note:** When using mock services, add the header `x-disney-mock-payment-session: true` (via ModHeader or similar) so that `/establish` uses the mock payment credentials.

## Key Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Cart Service | `POST /cart-service/scopes/dlr/carts` | Create cart |
| Cart Service | `PUT /cart-service/scopes/dlr/carts/{cartId}` | Add items to cart |
| Cart Service | `GET /cart-service/scopes/dlr/carts/{cartId}` | Get cart by ID |
| Cart Plus API | `GET /cart-plus-api/api/v1/storeId/dlr/retrieve-cart/swid/{swid}` | Retrieve cart (browser) |
| UC API | `POST /uc/api/v1/orders` | Create order (initialize checkout) |
| UC API | `PUT /uc/api/v1/orders/{orderId}` | Update order |
| UC API | `POST /uc/api/v1/order/abandon` | Abandon order |
| OrderVAS | `POST /booking-service/orders` | Create booking order |
