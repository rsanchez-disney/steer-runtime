# dps-core-resflowmgmt — Endpoints

## Base Path
`/v1`

## API Endpoints

- `POST /v1/sales-offers/packages/offer-freeze — Freeze (reserve inventory)`
- `GET /v1/sales-offers/packages/offer-freeze/{id} — Get freeze status`
- `POST /v1/sales-offers/packages/offer-freeze/confirm — Confirm reservation`
- `POST /v1/order/cancel — Cancel order`
- `POST /v1/order/cancellation-fee — Calculate cancellation fee`
- `POST /v1/order/modification-fee — Calculate modification fee`
- `POST /v1/order/reprice — Reprice existing order`

## Health Check
- `GET /actuator/health`
