# Business Rules — WDW Retail Ordering Batch

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Execution success | 100% of scheduled runs | Splunk alerts |
| Processing time | < 30 min per run | AWS Batch metrics |

## Peak Periods

- Runs on scheduler; more records after high-volume merchandise days

## Business Logic

- Processes abandoned authorization refunds for WDW retail ordering (ROO)
- Runs on AWS Batch with Lambda trigger (wdpr-revmgmt-S0001320-use1-prd-ro-awsbatch-cw)
- Reads pending refunds, executes refund via payment systems

## Dependencies

- AWS Batch infrastructure
- Payment systems (refund execution)
- ROO DynamoDB tables

## Impact Classification

- **Full outage:** WDW retail abandoned authorizations not refunded. Guest funds held. Financial reconciliation issues.
- **Degraded:** Partial processing, some refunds delayed.
