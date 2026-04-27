<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Impact Analysis — Endpoints

Impact Analysis is a serverless pipeline (AWS Step Functions + Lambda). It has no REST API — it's triggered by events or manual invocation.

## Trigger Methods

| Method | Source | Description |
|--------|--------|-------------|
| DataService mutation | `runManualImpactAnalysis` | Manual trigger via GraphQL |
| Scheduled | CloudWatch Events | Automatic pre-effective-date run |
| API Gateway | `start-step-function.js` | Direct Lambda invocation with site parameter |

## Lambda Functions

| Function | Input | Output |
|----------|-------|--------|
| `start-step-function.js` | `{ site: "WDW" }` | Step Function execution ARN |
| `IdentifyImpacts` | S3 config | S3 impact files |
| `PreCalculation` | S3 impact files | S3 precalc results |
| `CacheEviction` | S3 impact files | Eviction confirmations |
| `SendNotifications` | S3 impact chunks | Event Manager POST results |
