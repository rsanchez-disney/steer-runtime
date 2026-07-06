# DLR Unified Checkout API — Business Rules

## Related Flows
- uc-checkout
- gift-card-payment
- AP_TO_AP_UPGRADE (Magic Key upgrades)

## Business Context
The UC API is the BFF (Backend for Frontend) that sits between the UC SPA and Order VAS. It handles session management, conversation ID tracking, and orchestrates calls to downstream services.

## AP_TO_AP_UPGRADE
- SalesFlow: `AP_TO_AP_UPGRADE`, orderType: `UPGRADE`
- Product ID format: `believe-key-pass_X_3+_0_0_RF_AF_SOF_UT_progenstr`
- UC API diagLogs contain: conversationId, correlationId, payment session, full configurationData
- The `returnToOriginOnError: true` config causes redirect to `/admission/passes/my-passes/` on failure (the "Duck Out")
- Payment sheet initializes with session ID — this is the payment session to trace if needed
