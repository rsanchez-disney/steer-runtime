# Troubleshooting — WDW UC SPA

## Query Templates

### By ConvoID
```spl
index=wdw_s000* "{CONVO_ID}" "*error*" earliest=-7d | head 20
```

### By SWID
```spl
index=wdw_s000* "{SWID}" earliest=-7d | head 30
```

### Payment Session Errors
```spl
index=wdw_s000* "{CONVO_ID}" ("STORED_VALUE_CARD" OR "balanceError" OR "paymentSessionId") earliest=-7d
```

## Known Issues

- Gift card / stored value card errors → route to `app-flwdw-payment`
- Payment session failures → extract `paymentSessionId` and `paymentClientId` for escalation

## Escalation

- Assignment Group: `web-global-salescart`
- CI: WDW Unified Checkout SPA
