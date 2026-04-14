# Enterprise Architecture

## Service Map
High-level overview of the Walt Disney World commerce service ecosystem.

<!-- TODO: Add service dependency diagram -->

## Infrastructure
- Cloud: AWS
- Container orchestration: ECS
- CI/CD: Harness
- Monitoring: Datadog / Splunk

## Key Integration Patterns
- Synchronous: REST over HTTPS (mTLS between services)
- Asynchronous: SQS/SNS for event-driven flows
- Data: Oracle DB, DynamoDB, S3
