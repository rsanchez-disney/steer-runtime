# Splunk Service Catalog — Payments

Service-level detail for `index=wdpr_payment`.

## Field conventions

| Field    | Values                                                    |
|----------|-----------------------------------------------------------|
| `level`  | 50=ERROR, 40=WARN, 30=INFO, 20=DEBUG (numeric, Bunyan)   |
| `name`   | `apiLog`, `modLog`                                        |
| `source` | `<service-name>/<container-id>`                           |

No `environment` field — environment is encoded in source path or cluster name:

- `*lst*` = latest
- `*stg*` = stage
- `*lod*` = load
- No suffix = prod

## Services

| Service                    | Source pattern                   | Region              |
|----------------------------|----------------------------------|---------------------|
| paymentsheet-ui-external   | `paymentsheet-ui-external/*`     | us-east-1           |
| paymentsheet-api-external  | `paymentsheet-api-external/*`    | us-east-1           |
| paymentsheet-ui-ent        | `paymentsheet-ui-ent/*`          | us-east-1, us-west-2 |
| paymentsheet-api-ent       | `paymentsheet-api-ent/*`         | us-east-1, us-west-2 |
| admininquiry-webapi        | `admininquiry-webapi/*`          | us-east-1           |
| paymentcontrols-api        | `paymentcontrols-api/*`          | us-east-1           |
| paymentcontrols-ui         | `paymentcontrols-ui/*`           | us-east-1           |

## Common queries

```text
# All errors (last 15m)
index=wdpr_payment level=50 earliest=-15m

# Errors by service
index=wdpr_payment level=50 earliest=-15m | stats count by source

# Specific service in prod
index=wdpr_payment source=paymentsheet-api-external* level=50 earliest=-1h

# Specific service in load environment
index=wdpr_payment source=*lod* level=50 earliest=-15m
```
