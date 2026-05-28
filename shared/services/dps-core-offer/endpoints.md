# dps-core-offer — Endpoints

## Base Path
`/v1`

## API Endpoints

- `POST /v1/sales-offers/packages — Scored offer search`
- `POST /v1/sales-offers/packages/selected-package-offers/ — Selected package offers`
- `GET /v1/sales-offers/packages/offer-collection/{id} — Get offer collection`
- `GET /v1/sales-offers/packages/offer-collection/{id}/offer/{offerId} — Get specific offer`
- `POST /v1/sales-offers/packages/product-offers — Product offers`
- `POST /v1/sales-offers/packages/combinable-product-offers — Combinable products`
- `GET /v1/score-scheme — List scoring schemes`
- `GET /v1/score-scheme/{name} — Get scoring scheme`

## Health Check
- `GET /actuator/health`
