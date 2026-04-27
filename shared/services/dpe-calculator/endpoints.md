<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Calculator Service — Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/graphql` | Price calculation queries (productPrices, productPricesV2) | OAuth2 |
| GET | `/graphiql` | Interactive GraphQL explorer | OAuth2 |
| GET | `/actuator/health` | Health check | None |
| GET | `/actuator/info` | Service info | None |
| DELETE | `/actuator/cache/*` | Cache eviction (used by Impact Analysis) | OAuth2 |

## GraphQL Operations

| Type | Operation | Description |
|------|-----------|-------------|
| Query | `productPrices` | Calculate prices for products (v1) |
| Query | `productPricesV2` | Calculate prices with enhanced response (v2) |
| Query | `priceToken` | Retrieve a stored price token |
