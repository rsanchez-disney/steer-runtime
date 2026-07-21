# Business Rules — DLR Retail Ordering Batch

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Execution success | 100% of scheduled runs | Splunk alerts |
| Processing time | < 30 min per run | AWS Batch metrics |

## Peak Periods

- Runs on scheduler; more records after high-volume merchandise days

## Business Logic

- Processes abandoned authorization refunds for DLR retail ordering (ROO)
- Runs on AWS Batch with Lambda trigger (wdpr-revmgmt-S0001535-usw2-prd-ro-awsbatch-cw)
- Same codebase as WDW batch, deployed to us-west-2

## Dependencies

- AWS Batch infrastructure
- Payment systems (refund execution)
- ROO DynamoDB tables

## Impact Classification

- **Full outage:** DLR retail abandoned authorizations not refunded. Guest funds held.
- **Degraded:** Partial processing, some refunds delayed.
