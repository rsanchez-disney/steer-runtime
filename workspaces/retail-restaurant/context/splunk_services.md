# Splunk Service Catalog — Retail & Restaurant

## Service Patterns

All Java ECS services use Fluent Bit log routing to Splunk via firelens.

| Service Name | Index | ECS Task Definition | Pattern |
|---|---|---|---|
| mobile-ordering-orchestration-service | wdpr-ecommerce | mobile-ordering-orchestration-* | ECS / apiLog |
| wdpr-mo-batch-svc | wdpr-ecommerce | wdpr-mo-batch-* | ECS / apiLog |
| retail-ordering-orchestration-service | wdpr-ecommerce | retail-ordering-orchestration-* | ECS / apiLog |
| wdpr-ro-batch-svc | wdpr-ecommerce | wdpr-ro-batch-* | ECS / apiLog |
| dine-self-checkin-orchestration-service | wdpr-ecommerce | dine-self-checkin-orchestration-* | ECS / apiLog |
| dine-self-checkin-config-admin-api | wdpr-ecommerce | dine-self-checkin-config-admin-api-* | ECS / apiLog |
| dine-self-checkin-config-service | wdpr-ecommerce | dine-self-checkin-config-service-* | ECS / apiLog |
| wdpr-sales-dlrarrw-svc | wdpr-ecommerce | wdpr-sales-dlrarrw-* | ECS / apiLog |
| wdpr-sales-dlrarrw-batch | wdpr-ecommerce | wdpr-sales-dlrarrw-batch-* | ECS / apiLog |
| dlr-commerce2-menu-svc | wdpr-ecommerce | dlr-commerce2-menu-* | ECS / apiLog |
| fnb-order-service | wdpr-ecommerce | fnb-order-* | ECS / apiLog |
| dinetime-reservation-sync | wdpr-ecommerce | dinetime-reservation-* | ECS / apiLog |
| barcode-gen-svc | wdpr-ecommerce | N/A (Lambda) | CloudWatch |

## Common Query Patterns

```splunk
# All FNB services errors (last 1h)
index=wdpr-ecommerce source=stdout level=ERROR earliest=-1h

# Specific service
index=wdpr-ecommerce source=stdout "mobile-ordering-orchestration" level=ERROR earliest=-1h

# MOO order failures
index=wdpr-ecommerce source=stdout "mobile-ordering-orchestration" "orderStatus=FAILED" earliest=-24h

# DiSCO check-in errors
index=wdpr-ecommerce source=stdout "dine-self-checkin" level=ERROR earliest=-1h

# Arrival Windows availability
index=wdpr-ecommerce source=stdout "wdpr-sales-dlrarrw" earliest=-1h | stats count by level
```

## Dashboards

| Dashboard | Scope |
|-----------|-------|
| MOO General Stats | WDW/DLR Mobile Ordering |
| Mobile Order Monitoring Tool | DLR |
| Mobile Order Guest Tracing Tool | All |
| WDWD MOO Health | WDW |
| MOTE Abandoned Sessions | All |
| WDW/DLR VenueNext Stats | VenueNext integration |
| Arrival Windows General Stats | All |
| DiSCO General Status | WDW/DLR |
| DiSCO Troubleshooting Dashboard | All |
| WDW Dine Bookings Stats | WDW |

## Alert Configuration

- Interval: 15–30 minutes
- Threshold: 5–25 error count triggers
- Notification: #fnb-mobile-monitoring Slack + email
- Services covered: MOO, MOBatch, DiSCO
