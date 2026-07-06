# DLR Order Service — Business Rules

## Related Flows
- uc-checkout
- AP_TO_AP_UPGRADE (Magic Key upgrade)

## Business Context
The Order Service is the core processing layer in the UC path. It receives orders from Order VAS, validates them, and submits to PEOS for fulfillment. It also handles pended order retries.

## AP_TO_AP_UPGRADE Flow
1. `POST v2/orders/initializations` → 201 (creates order, returns initializationKey)
2. Payment is authorized externally (RRN generated)
3. `PUT v2/orders/park-entitlements` → calls DTI Gateway → eGalaxy UpgradeEntitlementRequest
4. If DTI succeeds → PEOS fulfillment
5. If DTI fails → 500 returned, payment voided automatically

Key: payment is authorized BEFORE the DTI call. If DTI rejects, the auth is voided but the RRN exists in logs.
