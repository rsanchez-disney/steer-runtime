<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Impact Analysis — API Contracts

## Overview
Impact Analysis is a serverless pipeline — it does not expose a traditional REST API. Contracts are defined by its Lambda function inputs/outputs and S3 file formats.

## Step Function Input
```json
{
  "site": "WDW",
  "effectiveDate": "2026-01-15",
  "changeSetId": "CS-12345"
}
```

## S3 File Contracts

### Impact File (`s3://bucket/impacts/{site}/{date}/impacts.json`)
```json
{
  "site": "WDW",
  "effectiveDate": "2026-01-15",
  "impactedProducts": [
    { "productCode": "PROD-001", "affectedDates": ["2026-01-15", "2026-01-16"], "changeType": "RATE" }
  ]
}
```

### PreCalc Result (`s3://bucket/precalc/{site}/{date}/results.json`)
```json
{
  "site": "WDW",
  "calculatedAt": "2026-01-14T22:00:00Z",
  "results": [
    { "productCode": "PROD-001", "date": "2026-01-15", "price": 129.99, "status": "OK" }
  ]
}
```

## Dependencies
| Service | Contract | Direction |
|---------|----------|-----------|
| Calculator Service | GraphQL `productPricesV2` | Outbound (PreCalculation calls Calculator) |
| Cache Service | REST `DELETE /actuator/cache/*` | Outbound (CacheEviction calls Cache) |
| Event Manager | REST `POST /events` | Outbound (SendNotifications) |
| MySQL (RDS) | SQL queries (read-only) | Outbound (IdentifyImpacts) |
