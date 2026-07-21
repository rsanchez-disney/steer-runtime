# Business Rules — WDPRT MO Batch Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Execution success | 100% of scheduled runs | CloudWatch / Splunk alerts |
| Processing time | < 30 min per run | AWS Batch metrics |

## Peak Periods

- Runs on scheduler (not traffic-dependent)
- More records to process after high-volume days (holidays, weekends)

## Business Logic

- Refunds abandoned payment authorizations tracked by MOO
- Runs on AWS Batch scheduler for both WDW (us-east-1) and DLR (us-west-2)
- Reads from DynamoDB orders table, processes refunds, writes to processedorders table
- Cross-region replicas on production DynamoDB tables
- Failure to run means abandoned authorizations hold guest funds longer than expected

## Dependencies

- DynamoDB (order state)
- Payment systems (for refund execution)
- AWS Batch infrastructure

## Impact Classification

- **Full outage:** Abandoned authorizations not refunded. Guest funds held unnecessarily. Financial reconciliation issues.
- **Degraded:** Partial processing, some refunds delayed. Minimal immediate guest impact.
