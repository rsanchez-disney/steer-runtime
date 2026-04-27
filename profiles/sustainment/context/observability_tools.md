# Observability Tools

All observability data is accessed through **Compass MCP** (`@compass/*`). Compass provides a unified interface to query logs, metrics, and traces across multiple platforms.

## Supported Platforms (via Compass)

| Platform | Data Type | Use For |
|----------|-----------|---------|
| Splunk | Logs, events | Error tracing, log correlation, search by ID |
| AppDynamics | APM metrics, transactions, anomalies | Performance analysis, transaction tracing |
| AWS CloudWatch | Logs, metrics, alarms | AWS service health, Lambda errors, ECS metrics |
| New Relic | APM, logs, distributed tracing | Transaction traces, error rates, throughput |
| GCP Cloud Logging | Logs, metrics | GCP service health, error tracing |
| Datadog | Metrics, APM, logs | Infrastructure monitoring, APM traces |
| Grafana | Dashboards, metrics | Visualization, alerting thresholds |
| Archer | GRC, risk management | Compliance and risk tracking |
| LogInsights | Log analytics | Pattern detection, anomaly identification |

## Query Patterns

### Error Investigation
- Search by correlation ID, trace ID, or request ID across all platforms
- Filter by time window (default: last 4 hours for active incidents)
- Group errors by service, endpoint, and error type

### Performance Analysis
- Compare current metrics against baseline (last 7 days)
- Identify latency spikes, throughput drops, error rate increases
- Trace slow transactions end-to-end

### Health Validation
- Check error rates (should be < baseline + 10%)
- Check response times (should be < baseline + 20%)
- Check throughput (should be > baseline - 10%)
- Verify no new error patterns introduced

## Key Identifiers
- **Correlation ID** — traces a request across services
- **Trace ID** — distributed tracing identifier
- **Request ID** — single request identifier
- **Session ID** — user session
- **INC number** — ServiceNow incident
- **CTASK number** — ServiceNow change task
