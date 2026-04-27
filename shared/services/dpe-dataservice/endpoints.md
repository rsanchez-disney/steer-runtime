<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Data Service — Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/graphql` | All data queries and mutations | OAuth2 |
| GET | `/graphiql` | Interactive GraphQL explorer | OAuth2 |
| GET | `/actuator/health` | Health check | None |
| GET | `/actuator/info` | Service info | None |

## Key GraphQL Operations

| Type | Operation | Description |
|------|-----------|-------------|
| Query | `products` | List/filter products with pagination |
| Query | `product` | Get product by code |
| Query | `priceChangeSets` | List change sets by effective date |
| Query | `productChangeSets` | List product change sets |
| Mutation | `createProduct` | Create product with rates |
| Mutation | `updateProduct` | Update product metadata |
| Mutation | `createPriceChangeSet` | Schedule pricing update |
| Mutation | `createProductChangeSet` | Schedule product config change |
| Mutation | `runManualImpactAnalysis` | Trigger Impact Analysis Lambda |
