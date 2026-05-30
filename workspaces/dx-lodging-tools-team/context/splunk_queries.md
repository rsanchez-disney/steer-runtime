# DX Lodging Tools — Splunk Queries

## Splunk App

Studio Rocket has a dedicated Splunk App:
- **Search:** `https://splunk.wdprapps.disney.com/en-GB/app/rocket/search`
- **Alerts:** `https://splunk.wdprapps.disney.com/en-GB/app/rocket/alerts`
- **Dashboards:** `https://splunk.wdprapps.disney.com/en-GB/app/rocket/dashboards`

## Indexes

| Application | Splunk Index |
|-------------|-------------|
| Authentication Service | `wdpr_authentication_svc` |
| Package Entitlement Service | `dlr_pkgentitlement_svc` |
| Resort Reservation VA | `dlr_resortreserv_va` |
| Cast Resort Reservation SPA + WebAPI | `dlr_castresortres-spa-api` |
| Guest Resort Reservation SPA + WebAPI | `dlr_guestresortres-spa-api` |
| Resort Sales Checkout SPA + WebAPI | `dlr_resortcheckout_spa_api` |
| Resort Sales Checkout VA | `dlr_resortcheckout_va` |
| Ticket Order Batch | `dlr_resortres_order_lambda` |
| Ticket and Voucher Batch | `dlr_resortres_voucher_lambda` |
| Celebrations | `wdpr_celebration` |
| Trade Retrieve (SPA + WebAPI + VA) | `wdpr_traderetrieve_spa` |
| Lodging Pinned Offer (SPA + WebAPI) | `wdpr_lodging_pinned_offer_spa` |
| Non-Disney Addons (SPA/API/VA) | `wdpr-revmgmt` (filter by `source=*non-disney-add-ons-{spa\|api\|va}*`) |

## Field Names (PascalCase)

| Field | Description |
|-------|-------------|
| `Level` | ERROR, WARN, INFO, PERF |
| `Msg` | Log message |
| `Logger` | Java logger class |
| `Identifiers.Correlation-Id` | Correlation ID |
| `Identifiers.X-Conversation-Id` | Conversation tracking |
| `Identifiers.CustomAttributes.TraceId` | Distributed trace |
| `Identifiers.CustomAttributes.TimeElapsed` | Response time |

## Common Queries

### All errors for a service (last 1h)
```splunk
index=<INDEX> Level=ERROR earliest=-1h
| stats count by Msg, Logger
| sort -count
```

### Cross-service correlation
```splunk
index=dlr_resortcheckout_spa_api OR index=dlr_resortcheckout_va OR index=dlr_pkgentitlement_svc Identifiers.Correlation-Id="<ID>"
| sort _time
| table _time, index, Level, Msg
```

### Studio-wide error spike
```splunk
index=wdpr_authentication_svc OR index=dlr_pkgentitlement_svc OR index=dlr_resortreserv_va OR index=dlr_castresortres-spa-api OR index=dlr_guestresortres-spa-api OR index=dlr_resortcheckout_spa_api OR index=dlr_resortcheckout_va OR index=wdpr_celebration OR index=wdpr_traderetrieve_spa OR index=wdpr_lodging_pinned_offer_spa Level=ERROR earliest=-1h
| timechart span=5m count by index
```

### Non-Disney Addons errors
```splunk
index=wdpr-revmgmt source=*non-disney-add-ons* Level=ERROR earliest=-1h
| stats count by source, Msg
| sort -count
```
