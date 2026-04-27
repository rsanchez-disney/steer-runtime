<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-23 -->
# DPE Calculator Service — API Contracts

## Overview
The heart of DPE — performs real-time price calculations using configurable calculator beans. GraphQL API with OAuth2 authentication.

## Base URL
| Environment | Port | URL Pattern |
|---|---|---|
| Local | 8181 | `http://localhost:8181/graphql` |
| Dev/Stage/Prod | — | Per-site ECS service (see `aws_applications.md`) |

## Key Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/graphql` | Price calculation queries (productPrices, productPricesV2) |
| GET | `/graphiql` | Interactive GraphQL explorer |
| GET | `/actuator/health` | Health check |
| DELETE | `/actuator/cache/*` | Cache eviction (used by Impact Analysis) |

## Authentication
OAuth2 bearer token. Scopes: `tpr-dpe-svc-query-price`, `tpr-dpe-svc-query-product`, `tpr-dpe-svc-price-token`, `tpr-dpe-svc-actuator`.

## GraphQL — Price Calculation Request

```graphql
query {
  productPricesV2(criteria: {
    products: [{
      productCodes: ["PRODUCT_CODE"]
      arrival: "2026-01-15"
      duration: 3
      ages: [{ ageGroup: "ADULT", quantity: 2 }]
      components: [{ productCodes: ["COMPONENT_CODE"], arrival: "2026-01-15" }]
    }]
    effectiveAt: "2026-01-01T00:00:00"
  }) {
    product { productCode calculatorCode }
    prices {
      usageDate
      age { ageGroup }
      base gross discount commission tax
      retailTotals { subTotal total }
      netTotals { subTotal total }
    }
  }
}
```

## Constraints
- Max 10 products per request
- Query timeout: 60 seconds
- Calculator bean cache TTL: 60 seconds
- Freeze duration: 30 minutes (price stability guarantee)
- Price tokens stored in DynamoDB with TTL

## Dependencies
| Service | Purpose |
|---|---|
| MySQL (dpe schema) | Product and pricing metadata |
| DynamoDB | Price token storage |
| Redis | Calculation result caching |
| DataService | Data queries (when batch loading disabled) |
