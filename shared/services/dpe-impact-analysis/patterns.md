<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Impact Analysis — Patterns

## Step Function Pipeline
- Sequential Lambda execution: Identify → PreCalculate → Evict → Notify
- Each step reads/writes to S3 (decoupled via files)
- Wait step delays execution until `effective_date - preprocessing_window`

## Impact Identification
- 6 DB queries identify products affected by a price factor change
- Results written to S3 as impact files
- Each impact file contains: product codes, affected dates, change type

## Thread Pool Pattern
- PreCalculation uses configurable thread pool (`CALC_SVC_THREADS`, default 10)
- CacheEviction uses separate pool (`CACHE_SVC_THREADS`)
- Prevents overwhelming downstream services
