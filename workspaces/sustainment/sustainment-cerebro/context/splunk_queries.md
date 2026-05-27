# Splunk Queries — DX Profile Operations

## Query Templates

### By SWID (Session/Workflow ID)
```spl
index=dx_profile (swid="{SWID}" OR session_id="{SWID}") 
| sort _time 
| table _time, host, sourcetype, status, message, duration_ms
```

### By GUID (Guest Unique Identifier)
```spl
index=dx_profile (guid="{GUID}" OR guest_id="{GUID}" OR user_id="{GUID}") 
| sort _time 
| table _time, host, sourcetype, action, status, response_code
```

### By Correlation ID
```spl
index=dx_profile correlation_id="{CORR_ID}" 
| sort _time 
| table _time, host, sourcetype, service, operation, status, duration_ms, error_message
```

### Error Spike Detection
```spl
index=dx_profile sourcetype=app_logs level=ERROR 
| timechart span=5m count by service 
| where count > 50
```

### Latency Analysis (P95)
```spl
index=dx_profile sourcetype=app_logs duration_ms>* 
| stats avg(duration_ms) as avg_latency, p95(duration_ms) as p95_latency, max(duration_ms) as max_latency by service, endpoint 
| where p95_latency > 3000
```

### ECS Task Failures
```spl
index=dx_profile sourcetype=ecs_events (event_type="TASK_STOPPED" OR event_type="TASK_FAILED") 
| stats count by cluster, service, stop_reason 
| sort -count
```

### 5xx by Endpoint (Last 4h)
```spl
index=dx_profile sourcetype=alb_logs elb_status_code>=500 earliest=-4h 
| stats count by request_url, backend_status_code 
| sort -count
```

### Profile API Failures
```spl
index=dx_profile sourcetype=profile_api status>=400 
| stats count by endpoint, status, error_code 
| sort -count
```

## Cribl Format

For Cribl, wrap SPL queries:
```
source="splunk" | search [SPL_QUERY_HERE]
```

## AppDynamics Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time (avg) | > 2000ms | > 5000ms |
| Error Rate | > 1% | > 5% |
| CPU Utilization | > 70% | > 90% |
| Memory Utilization | > 75% | > 90% |
| DB Connection Pool | > 70% used | > 90% used |
| Queue Depth | > 1000 | > 10000 |
| 5xx Rate | > 0.5% | > 2% |

## Query Generation Rules

When generating a query from user input:
1. Identify ID type: SWID (alphanumeric/UUID), GUID (numeric/UUID), CorrID (UUID with dashes)
2. Select appropriate template
3. Default time range: last 4 hours unless specified
4. Output as single code block ready to paste
5. Add brief note about what the query will show
