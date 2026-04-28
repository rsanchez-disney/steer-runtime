# Splunk Common Indexes

Disney-wide Splunk index reference for the `splunk_query_agent`.

## Environment URLs

| Environment | Splunk Instance |
|---|---|
| latest, stage, load | `https://stage.splunk.wdprapps.disney.com` |
| prod | `https://splunk.wdprapps.disney.com` |

## Known Indexes

| Index | Services | Query Pattern |
|---|---|---|
| `wdpr_commerce_cart` | Cart Service | Legacy (source-based) |
| `*core_api*` | Order Service, Package Order | Legacy (source=*order-svc*) |
| `wdpr-ecommerce` | CME, TMS, EVAS, LexVAS, SA VAS, TPAC, Lexicon, BSGA | ECS-based |
| `wdpr-apps` | TixSale, Aplex, DTC, PACS, FAS | ECS-based |

## Brand Mapping

| Brand | Legacy (source) | ECS (ecs_cluster) |
|---|---|---|
| DLR | `source=*west-2*` | `ecs_cluster=*dlr*` |
| WDW | `source=*east-1*` | `ecs_cluster=*wdw*` |

## Environment Codes (ECS pattern)

| Environment | ECS filter |
|---|---|
| latest | `*lst*` |
| stage | `*stg*` |
| load | `*lod*` |
| prod | No env filter (single prod cluster) |

Teams: add your service-specific catalog to your workspace context file (e.g., `context/splunk_services.md`).
