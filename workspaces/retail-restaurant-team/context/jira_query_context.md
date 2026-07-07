# Jira Query Context — Retail & Restaurant

## Projects

| Prefix | Project | Instance |
|--------|---------|----------|
| FNB- | Food & Beverage | disneyexperiences.atlassian.net |
| MERCH- | Merchandise | disneyexperiences.atlassian.net |

## Common JQL Patterns

```jql
# Active sprint items
project IN (FNB, MERCH) AND sprint IN openSprints() AND status != Done

# My team's open bugs
project = FNB AND type = Bug AND status NOT IN (Done, Closed)

# DiSCO component items
project = FNB AND component = "DiSCO" AND sprint IN openSprints()

# Mobile Order items
project = FNB AND component IN ("MOO", "Mobile Order") AND status != Done

# Arrival Windows items
project = FNB AND component = "Arrival Windows" AND status != Done

# Recently updated
project IN (FNB, MERCH) AND updated >= -7d ORDER BY updated DESC
```

## Components

| Component | Services |
|-----------|----------|
| MOO / Mobile Order | mobile-ordering-orchestration-service, wdpr-mo-batch-svc |
| ROO / Retail Order | retail-ordering-orchestration-service, wdpr-ro-batch-svc, barcode-gen-svc |
| DiSCO | dine-self-checkin-orchestration-service, config-admin-ui, config-admin-api, config-service |
| Arrival Windows | wdpr-sales-dlrarrw-svc, wdpr-sales-dlrarrw-batch, arrwui-spa |
| Dining Menus | dlr-commerce2-menu-svc |
| Order Service | fnb-order-service |
| Reservation Sync | dinetime-reservation-sync |
