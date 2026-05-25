# Troubleshooting — WDPR CME Admin

## Common Issues

<!-- Add known issues as they are documented -->

---

## Escalation Decision Tree

- Assignment Group: `app-global-cme`
- CI: WDPR CME Admin

## Known Quirks

-

## Query Templates

### DLR — Errors
```spl
index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S98628-usw2-prd" ecs_task_definition="cme-admin*" "ERROR" earliest=-1h | stats count by _time
```

### WDW — Errors
```spl
index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S00892-use1*" ecs_task_definition="cme-admin-java17*" "ERROR" earliest=-1h | stats count by _time
```
