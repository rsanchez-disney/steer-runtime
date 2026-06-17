---
inclusion: manual
tags: [splunk, logging, observability, troubleshooting]
scope: beast-team
purpose: Splunk query reference for DLP applications - indexes, log structure, field reference, and reusable query templates
applies_to: [sustainment_orchestrator_agent, rca_agent, log_analyzer_agent, incident_triage_agent]
---

# 🔍 Splunk Reference - Beast Team

> **App-specific Splunk queries now live in the App Knowledge Bank.** Load the relevant app file with `#<repo-name>` for per-app queries, source patterns, and known error patterns. This file covers generic Splunk knowledge: MCP syntax, indexes, log structure, field reference, and reusable query templates.

## Quick Index Reference for Beast BAPPs

- **Most DLP apps**: `index=wdpr_dlp_digital Identifiers.App-Name="<app-name>"`
- **BIO apps** (e.g., BAPP0215510): `index=wdpr_dlpis host IN (vl-frmv-rhe734,vl-frmv-rhe735,vl-frmv-rhe775) "Identifiers.App-Name"="<app-name>"`
- **TMS apps** (BAPP0201208, BAPP0201228): `index=wdpr_dlp_cme`

💡 **App-specific queries are now configured in each BAPP's `app.yaml` under the `splunk:` section.**

## MCP Tool Syntax

When using the Splunk MCP tool, queries **must** start with the `search` command. Bare `index=...` will fail.

```spl
-- ✅ Correct
search index=wdpr_dlp_digital ...

-- ❌ Will fail
index=wdpr_dlp_digital ...
```

The MCP tool also requires:
- `splunkconnectionname`: Use `splunk-prod` for production, `splunk-stage` for lower environments
- `maxresults`: Cap results to avoid timeouts (default 1000, max 10000)
- `maxtimeseconds`: Default 30s — increase for heavy aggregations
- `friendlyquerydescription`: Always provide a clear description of what the query does and why

## Splunk Connection
- **Production**: Use `splunk-prod` connection name
- **Non-prod/Lower environments**: Use `splunk-stage` connection name
- **Wildcard index search (`index=*`) is NOT allowed** — always specify the index explicitly
- **Splunk App for DGE alerts**: `dlp_digital_back_end`

## DLP-Relevant Indexes (Beast Scope)

### Primary Indexes (Most Used)
| Index | Scope | Description |
|---|---|---|
| `wdpr_dlp_digital` | DGE / APP | Main index for DGE digital backend services (IS providers, BFF, etc.) |
| `wdpr_dlp_cme` | ECO / Forky | CME ecommerce services, PACS batch, EPS-Tridion |
| `wdpr_dlp_cme_summary` | ECO | CME summary/aggregated data |
| `dlp_core_api` | APP | Core API services (package reservation, etc.) |
| `wdpr_dlpcoreapi` | APP | Core API (alternate index) |
| `wdpr_dlpis` | APP | DLP IS services |
| `wdpr_dlpis-lambda` | APP | DLP IS Lambda functions |
| `dlp_mobile_bff` | APP | Mobile BFF (Backend for Frontend) |

### Secondary Indexes
| Index | Scope | Description |
|---|---|---|
| `dlp-apps` | General | General DLP applications |
| `dlp-tools` | Infra | DLP tooling |
| `dlp_ecommerce` | ECO | Ecommerce services |
| `dlp_bmacs` | APP | BMACS services |
| `dlp_inpark` | APP | In-park services |
| `dlp_mpg` | APP | MPG services |
| `dlp_notification_service` | APP | Notification service |
| `dlp_payment` | ECO | Payment services |
| `dlp_avail_cal` | APP | Availability calendar |
| `dlp_gss` | APP | GSS services |
| `dlp_pvs` | APP | PVS services |
| `dlp_claim` | APP | Claim services |
| `dlp_recadapter` | APP | Rec adapter |
| `dlp_toll_plaza` | APP | Toll plaza |
| `dlp_pkg_gen_agents` | ECO | Package generation agents |
| `dlp_sre_tools` | Infra | SRE tooling |
| `dlp_talend` | Infra | Talend ETL jobs |
| `wdpr_dlp_data_lake` | Data | Data lake |
| `wdpr_dlp_ebx` | Data | EBX master data |
| `wdpr_dlpcco` | ECO | CCO services |

### External/Related Indexes
| Index | Scope | Description |
|---|---|---|
| `akamai_ksd` | CDN | Akamai CDN logs |
| `appdynamics` | Monitoring | AppDynamics metrics |
| `dlp-pci` | Security | PCI-related logs |
| `dlp_apps_euw1_awsbatch` | Infra | AWS Batch jobs |

## Log Structure — JSON Logs (`wdpr_dlp_digital`)

### Top-Level Fields

```json
{
  "Host": "container-hostname",
  "Date": "2026-04-17T18:34:21,965+02:00",
  "Thread": "https-openssl-nio-8443-exec-25",
  "Identifiers": { ... },
  "Http-Attributes": { ... },
  "Marker": "WEB_SVC_RESPONSE",
  "Level": "INFO",
  "Logger": "com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter",
  "Msg": "..."
}
```

### Identifiers Block

| Field | Description | Example |
|---|---|---|
| `App-Name` | Application emitting the log | `wdpr-dlp-is-guest-oid-keyring-main-provider` |
| `Correlation-Id` | Trace ID for the call chain | `e24e3009-8011-411b-b3aa-f5e11370db70` |
| `X-Correlation-Id` | Same as Correlation-Id (some apps use this variant) | Same UUID |
| `x-app-unique-id` | Device/client unique identifier | `095c77c3-bf69-45f4-a7b4-eb333474e280` |
| `X-Conversation-Id` | Session/conversation identifier (prefix `boo-`) | `boo-d89fd6cc-b2fb-45d7-8b5d-8680349cfcdd` |
| `Version` | Application version | `v1.0.0-138` |
| `X-App-Id` | Client application identifier | `TPR-DLP-BMA-MAGIC-MOBILE-PROV.B2B-PROD` |
| `X-Media-Source` | Client type | `MobileApp` |
| `X-Ip-Source` | Client IP | `10.238.30.156` |
| `Accept-Language` | Locale | `en-ie` |

### Http-Attributes Block

| Field | Description |
|---|---|
| `Http-Method` | GET, POST, PUT, DELETE |
| `Request-URI` | The endpoint path |
| `Response-Code` | HTTP status code |
| `Client-Id` | Calling client identifier |

### Log Levels

| Level | Meaning | Typical Use |
|---|---|---|
| `INFO` | Normal operations | Request/response logging, business events |
| `PERF` | Performance metrics | Boundary times, auth filter durations |
| `WARN` | Warnings | Non-critical issues, degraded behavior |
| `ERROR` | Errors | Exceptions, failed operations |
| `DEBUG` | Debug output | Should not be in prod (ISPS T-SD-1) |
| `TRACE` | Trace output | Should not be in prod |

### Markers

| Marker | Description |
|---|---|
| `WEB_SVC_REQUEST` | Inbound HTTP request (SERVER_REQUEST_IN) |
| `WEB_SVC_RESPONSE` | Outbound HTTP response (SERVER_RESPONSE_OUT) |
| `REST_CLIENT_REQUEST` | Outbound client call (CLIENT_REQUEST_OUT) |
| `REST_CLIENT_RESPONSE` | Inbound client response (CLIENT_RESPONSE_IN) |
| `OPENTRACE` | Distributed tracing spans (Brave/Zipkin) |
| `BUSINESS_EVENT_INFO` | Business event logging |

### Msg Field — Nested JSON

For boundary markers, the `Msg` field contains a JSON string. Use `spath` to extract:

```spl
search index=wdpr_dlp_digital "Correlation-Id"="<uuid>"
| spath "Msg"
| spath input=Msg "logType"
| spath input=Msg "requestUrl"
| spath input=Msg "responseStatusCode"
| spath input=Msg "timeTakenInMillis"
```

`logType` values: `SERVER_REQUEST_IN`, `SERVER_RESPONSE_OUT`, `CLIENT_REQUEST_OUT`, `CLIENT_RESPONSE_IN`

## Log Structure — Plain-Text Logs (`wdpr_dlp_cme`)

Some apps use a plain-text log4j pattern:

```
2026-04-15 15:54:16,673 INFO taskExecutor-457 ConvoId=SYS502128455934 CorrId=ff98815f-ac3f-4b4a-96af-faae277bcb9d PageId= AppId=TPR-CME-ELIGIBILITY-SVC.B2B-PROD [c.d.w.s.t.s.i.EntitlementServiceImpl] Ticket updated...
```

Extract fields with `rex`:

```spl
search index=wdpr_dlp_cme "CorrId=<correlation_id>"
| rex "(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})\s+(?<level>\w+)\s+(?<thread>\S+)\s+ConvoId=(?<convo_id>\S*)\s+CorrId=(?<corr_id>\S*)\s+.*\[(?<logger>[^\]]+)\]\s+(?<message>.*)"
```

## Source Path Convention

The `source` field follows this pattern:

```
eu-west-1:dlp-apps-{KINESIS_STREAM_ID}-euw1-prd-applogs:{service-alias}/{container-name}/{ecs-task-id}
```

### Known Kinesis Streams

| Stream ID | Index | Applications |
|---|---|---|
| `S0001481` | `wdpr_dlp_digital` | All DLP IS Digital apps |
| `S0001479` | `wdpr_dlp_cme` | CME / TMS apps |

## Key Loggers

| Logger | Purpose |
|---|---|
| `com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter` | Server request/response boundary |
| `com.disney.dlp.is.foundation.fw.restclient.RestReqResLoggingInterceptor` | Outbound REST client logging |
| `com.wdpr.ee.loggingapi.filter.HttpLoggingFilterServlet5` | PERF boundary time |
| `com.wdpr.ee.auth.processor.AbstractProcessor` | AUTHZ filter performance |
| `com.wdpr.ee.authz.RestConnector` | AUTHZ server call performance |
| `com.disney.dlp.is.foundation.fw.retry.SimpleRetryListener` | Retry operation start/end |
| `brave.Tracer` | Distributed tracing spans (OPENTRACE) |

## Transversal Query Templates (Building Blocks)

These are the foundational query patterns used across ALL DGE apps. They work for any service because all apps use the DLP IS Foundation framework. Swap `{APP_NAME}` with the target app's `Identifiers.App-Name` value.

> **Source:** [🚑 Monitoring PROD Links — Splunk useful queries](https://mywiki.disney.com/spaces/SBH/pages/842928480)

### Inbound Requests (What calls YOUR app)

Base pattern using `HttpBoundaryLoggingFilter` — shows all requests received by a service:

```spl
-- Inbound requests with response codes and timing
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Marker=WEB_SVC_RESPONSE
Logger=com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter
| spath input=Msg path=timeTakenInMillis output=timeTakenInMillis
| spath input=Msg path=requestUrl output=requestUrl
| spath input=Msg path=responseStatusCode output=responseStatusCode
| spath input=Msg path=requestMethod output=requestMethod
| rex field=requestUrl "%7B(?<swid>[%0-9A-Za-z-_]+)%7D"
```

```spl
-- Inbound slow responses (> 4000ms)
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Marker=WEB_SVC_RESPONSE
Logger=com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter
| spath input=Msg path=timeTakenInMillis output=timeTakenInMillis
| spath input=Msg path=requestUrl output=requestUrl
| search requestUrl="*" timeTakenInMillis>4000
```

```spl
-- Inbound HTTP status breakdown by time
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Marker=WEB_SVC_RESPONSE
Logger=com.disney.dlp.is.foundation.fw.servletfilter.HttpBoundaryLoggingFilter
| spath input=Msg path=responseStatusCode output=status
| spath input=Msg path=requestUrl output=requestUrl
| eval http2xxCount=if(status>=200 AND status<400,1,0)
| eval http4xxCount=if(status>=400 AND status<500,1,0)
| eval http5xxCount=if(status>=500,1,0)
| bin span=10m _time
| stats sum(http2xxCount) as "HTTP 2xx", sum(http4xxCount) as "HTTP 4xx", sum(http5xxCount) as "HTTP 5xx" by _time, requestUrl
| addtotals
```

### Outbound Calls (What YOUR app calls externally)

Base pattern using `RestReqResLoggingInterceptor` — shows all REST calls made by a service to other services:

```spl
-- Outbound calls with response codes and timing
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Logger=com.disney.dlp.is.foundation.fw.restclient.RestReqResLoggingInterceptor
Marker=REST_CLIENT_RESPONSE
| spath input=Msg path=responseStatusCode output=responseStatusCode
| spath input=Msg path=requestUrl output=requestUrl
| spath input=Msg path=timeTakenInMillis output=timeTakenInMillis
```

```spl
-- Outbound slow responses (> 4000ms)
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Logger=com.disney.dlp.is.foundation.fw.restclient.RestReqResLoggingInterceptor
Marker=REST_CLIENT_RESPONSE
| spath input=Msg path=responseStatusCode output=responseStatusCode
| spath input=Msg path=requestUrl output=requestUrl
| spath input=Msg path=timeTakenInMillis output=timeTakenInMillis
| search requestUrl=* timeTakenInMillis>4000
```

```spl
-- Outbound error responses (4xx/5xx) by destination URL
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
Logger=com.disney.dlp.is.foundation.fw.restclient.RestReqResLoggingInterceptor
Marker=REST_CLIENT_RESPONSE
| spath input=Msg path=responseStatusCode output=responseStatusCode
| spath input=Msg path=requestUrl output=requestUrl
| where responseStatusCode >= 400
| timechart span=5m count by requestUrl
```

### Combined: Full Service Health Overview

```spl
-- Service health: inbound error rate + outbound error rate in one view
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}"
(Marker=WEB_SVC_RESPONSE OR Marker=REST_CLIENT_RESPONSE) earliest=-1h
| spath input=Msg path=responseStatusCode output=status
| eval direction=if(Marker=="WEB_SVC_RESPONSE", "inbound", "outbound")
| eval is_error=if(status>=400, 1, 0)
| timechart span=5m sum(is_error) as errors count as total by direction
```

---

## Generic Investigation Query Templates

### Quick Error Count by App
```spl
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}" Level=ERROR
earliest=-4h latest=now
| timechart span=15m count
```

### Error Messages Breakdown
```spl
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}" Level=ERROR
earliest=-4h latest=now
| stats count by Msg | sort -count | head 20
```

### Unique Guests/Requests Impacted
```spl
search index=wdpr_dlp_digital "Identifiers.App-Name"="{APP_NAME}" Level=ERROR
earliest=-4h latest=now
| stats dc("Identifiers.Correlation-Id") as unique_requests
```

### Multi-App Correlation
```spl
search index=wdpr_dlp_digital ("Identifiers.App-Name"="{APP_1}" OR "Identifiers.App-Name"="{APP_2}") Level=ERROR
earliest=-4h latest=now
| timechart span=15m count by "Identifiers.App-Name"
```

### Trace a Single Request
```spl
search index=wdpr_dlp_digital "Identifiers.Correlation-Id"="{CORRELATION_ID}"
| sort _time | table _time, Level, Logger, Msg
```

### HTTP Error Rate by Application
```spl
search index=wdpr_dlp_digital Marker="WEB_SVC_RESPONSE" earliest=-1h
| spath "Msg"
| spath input=Msg "responseStatusCode"
| spath "Identifiers.App-Name" output=app_name
| eval is_error=if(responseStatusCode>=400, 1, 0)
| stats count as total, sum(is_error) as errors by app_name
| eval error_rate=round(errors/total*100, 2)
| sort -error_rate
```

### Downstream Call Latency Analysis
```spl
search index=wdpr_dlp_digital "App-Name"="{APP_NAME}" Marker="REST_CLIENT_RESPONSE" earliest=-1h
| spath "Msg"
| spath input=Msg "requestUrl"
| spath input=Msg "timeTakenInMillis"
| stats avg(timeTakenInMillis) as avg_ms, max(timeTakenInMillis) as max_ms, p95(timeTakenInMillis) as p95_ms, count by requestUrl
| sort -avg_ms
```

### Track a Device/User Across Requests
```spl
search index=wdpr_dlp_digital "x-app-unique-id"="{DEVICE_UUID}" earliest=-24h
| spath "Identifiers.App-Name" output=app_name
| spath "Identifiers.Correlation-Id" output=corr_id
| sort _time
| table _time, app_name, corr_id, Marker, Level
```

### Response Time Distribution (Boundary Time)
```spl
search index=wdpr_dlp_digital "App-Name"="{APP_NAME}" Level=PERF "Boundary Time" earliest=-1h
| rex "Boundary Time :(?<boundary_ns>\d+)"
| eval boundary_ms=round(boundary_ns/1000000, 2)
| stats avg(boundary_ms) as avg_ms, p50(boundary_ms) as p50_ms, p95(boundary_ms) as p95_ms, p99(boundary_ms) as p99_ms, max(boundary_ms) as max_ms, count
```

### AUTHZ Filter Performance
```spl
search index=wdpr_dlp_digital "App-Name"="{APP_NAME}" Level=PERF "authz filter execution" earliest=-1h
| rex "is (?<authz_ms>[\d.]+) milliseconds"
| stats avg(authz_ms) as avg_ms, p95(authz_ms) as p95_ms, max(authz_ms) as max_ms, count
```

### Retry Analysis
```spl
search index=wdpr_dlp_digital "App-Name"="{APP_NAME}" "Retry Operation Ended" earliest=-1h
| rex "RetryCount=\[(?<retry_count>\d+)\]"
| rex "Exception=\[(?<exception>[^\]]*)\]"
| where retry_count > 0
| table _time, retry_count, exception
```

### OpenTrace / Distributed Tracing Spans
```spl
search index=wdpr_dlp_digital "Correlation-Id"="{UUID}" Marker="OPENTRACE" earliest=-24h
| spath "Msg"
| spath input=Msg "name" output=span_name
| spath input=Msg "kind" output=span_kind
| spath input=Msg "duration" output=span_duration_us
| eval span_duration_ms=round(span_duration_us/1000, 2)
| spath input=Msg "tags.http.status_code" output=status_code
| spath input=Msg "tags.http.url" output=url
| table _time, span_name, span_kind, span_duration_ms, status_code, url
| sort _time
```

### Database Query Tracing (via OPENTRACE)
```spl
search index=wdpr_dlp_digital "Correlation-Id"="{UUID}" Marker="OPENTRACE" "java-jdbc" earliest=-24h
| spath "Msg"
| spath input=Msg "tags.db.statement" output=sql
| spath input=Msg "tags.db.type" output=db_type
| spath input=Msg "tags.peer.address" output=db_host
| spath input=Msg "duration" output=duration_us
| eval duration_ms=round(duration_us/1000, 2)
| table _time, db_type, db_host, duration_ms, sql
```

### Detect DEBUG/TRACE in Production (Compliance Check)
```spl
search index=wdpr_dlp_digital earliest=-1h
| regex _raw="(\sTRACE\s|\sDEBUG\s)"
| eval check=if(Level=="ERROR" OR Level=="INFO", "false_positive", "ok")
| search check != "false_positive"
| spath "Identifiers.App-Name" output=app_name
| stats count by app_name, Level
| sort -count
```

### Cross-Index Call Trace
```spl
search index=*_* "{CORRELATION_ID}" earliest=-24h
| stats count by index, source
| sort -count
```

## Mobile BFF / Package Investigation Queries

### BFF — Full flow for a booking
```spl
search index=dlp_mobile_bff source=*bff-core* "{BOOKING_ID}" earliest=-15d
| table _time, Msg
| sort +_time
| head 100
```

### BFF — Outbound calls breakdown for a booking
```spl
search index=dlp_mobile_bff source=*bff-core* "{BOOKING_ID}" earliest=-15d
| spath input=Msg output=context path=context
| spath input=Msg output=url path=url
| spath input=Msg output=bound path=bound
| spath input=Msg output=status path=status
| spath input=Msg output=type path=type
| table _time, context, bound, type, status, url
| sort +_time
```