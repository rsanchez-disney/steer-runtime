# DPE — Splunk Queries

Production Splunk queries for tracing Impact Analysis pipeline runs, triaging Calculator Service requests, and monitoring DPE health.

## Indexes & App Names

| Index | Purpose |
|-------|---------|
| `wdpr_dpe` | Primary DPE index — all services and Lambdas |
| `wdpr-packaging` | ECS container logs (alternative source for Calculator Service) |

| App Name | Service |
|----------|---------|
| `dpe-service` | Calculator Service |
| `dpe-datasvc` | Data Service |
| `dpe-cache-service` | Cache Service |
| `dpe-currencysvc` | Currency Conversion Service |
| `dpeProductAdapter` | Product Adapter Lambda |

## Common Rex Extractions

Site and environment from Lambda log group:

```spl
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
```

---

## Impact Analysis Queries

### Were Products Impacted?

```spl
index=wdpr_dpe
  Msg="*Full Impact Process: ProductPriceImpactResult*"
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| rex field=Msg "productPriceImpactMap=\{(?<impact_map>[^\}]*)\}"
| eval has_impacts=if(impact_map=="", "NO IMPACTS", "HAS IMPACTS")
| table _time, site, env, has_impacts, impact_map, "Identifiers.Correlation-Id"
```

### Trace a Single Run by Correlation ID

Replace the UUID with your correlation ID:

```spl
index=wdpr_dpe
  "98812aed-007f-4c7c-b420-7bd5bbb944e2"
| eval function=case(
    match(Logger, "IdentifyImpactsHandler"), "1_IdentifyImpacts",
    match(Logger, "PrecalculationProcessHandler"), "2_PreCalculation",
    match(Logger, "CacheEvictionHandler"), "3_CacheEviction",
    match(Logger, "SendNotificationsHandler"), "4_SendNotifications",
    match(Logger, "IdentifyImpactsService"), "1_IdentifyImpacts",
    match(Logger, "PreCalculationService"), "2_PreCalculation",
    match(Logger, "CacheEvictionService"), "3_CacheEviction",
    match(Logger, "SendNotificationsService"), "4_SendNotifications",
    match(Logger, "NotificationRepository"), "4_SendNotifications",
    match(Logger, "PriceImpactsWriter"), "1_IdentifyImpacts",
    match(Logger, "ProductPriceObjectMapper"), "2_PreCalculation",
    match(Logger, "FileWriter"), "2_PreCalculation",
    match(Logger, "CacheServiceClient"), "3_CacheEviction",
    1==1, "other"
)
| search function!="other"
| table _time, function, Msg
| sort _time
```

> Filter by function: `| search function="1_IdentifyImpacts"`
> Filter by message: `| search Msg="*Completed uploading*"`

### Notification Outcomes

```spl
index=wdpr_dpe
  Msg="*Event Manager*" (Msg="*Response on*" OR Msg="*did not notify*" OR Msg="*Failed to send*" OR Msg="*returned an error*")
| eval status=case(
    match(Msg, "Event Manager Response on"), "SUCCESS",
    match(Msg, "did not notify any subscribers"), "NO_SUBSCRIBERS",
    match(Msg, "Failed to send notification"), "FAILED",
    match(Msg, "returned an error"), "ERROR",
    1==1, "UNKNOWN"
)
| rex field=Msg "Correlation Id (?<correlation_id>[^\s,\"]+)"
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| table _time, site, env, status, correlation_id
```

### S3 Files Created

```spl
index=wdpr_dpe
  Msg="*Preparing for upload*"
| rex field=Msg "objectKey=(?<s3_file>[^\|\"]+)"
| rex field=Msg "requestId=(?<request_id>[^\|\"]+)"
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| table _time, site, env, request_id, s3_file
```

### Errors Only (Quick Health Check)

```spl
index=wdpr_dpe Level="ERROR"
| spath input=Identifiers output=correlation_id path=Correlation-Id
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| table _time, site, env, correlation_id, Logger, Msg
| sort -_time
```

### Pipeline Milestone Summary

```spl
index=wdpr_dpe
  (Msg="*REQUEST:*site*" OR Msg="*Full Impact Process*" OR Msg="*Completed precalculation*" OR Msg="*Completed deleting the cache entries*" OR Msg="*Event Manager Response on*" OR Msg="*did not notify*" OR Msg="*ProductPriceImpactMap is empty*" OR Msg="*Pre-Calculation skipped*")
| spath input=Identifiers output=correlation_id path=Correlation-Id
| rex field=source "/aws/lambda/(?<site>[^-]+)-"
| rex field=source "-(?<env>[^-]+)-dpeimpals"
| eval milestone=case(
    match(Logger, "IdentifyImpactsHandler") AND match(Msg, "REQUEST"), "identify_started",
    match(Msg, "Full Impact Process"), "impacts_identified",
    match(Msg, "Completed precalculation"), "precalc_completed",
    match(Msg, "Pre-Calculation skipped"), "precalc_skipped",
    match(Msg, "Completed deleting the cache entries"), "cache_eviction_completed",
    match(Msg, "Event Manager Response on"), "notify_success",
    match(Msg, "did not notify any subscribers"), "notify_no_subscribers",
    match(Msg, "ProductPriceImpactMap is empty"), "notify_no_impacts"
)
| stats earliest(_time) as started, latest(_time) as ended, first(site) as site, first(env) as env, values(milestone) as milestones by correlation_id
| eval duration_sec=round((ended - started), 2)
| table correlation_id, site, env, started, duration_sec, milestones
| sort -started
```

---

## Calculator Service Queries

### GraphQL Request/Response Trace (All Sites)

Traces GraphQL queries and responses across all Calculator Service environments. Uses both `wdpr_dpe` and `wdpr-packaging` indexes to cover ECS container logs.

```spl
index=wdpr_dpe OR index=wdpr-packaging
(
    (container_name="*ecs-dpe-svc-latest*" ecs_cluster="*wdw-packaging2-S0001693-use1-lst*") OR
    (container_name="*ecs-dpe-svc-stage*"  ecs_cluster="*wdw-packaging2-S0001693-use1-stg*") OR
    (container_name="*ecs-dpe-svc-load*"   ecs_cluster="*wdw-packaging-S0001693-use1-lod*")  OR
    source IN (
        "us-east-1:wdw-packaging2-S0001693-use1-dpe-svc-svc-lst:dpe-svc-latest/dpe-svc/*",
        "us-east-1:wdw-packaging2-S0001693-use1-dpe-svc-svc-stg:dpe-svc-stage/dpe-svc/*",
        "us-east-1:wdw-packaging-S0001693-use1-dpe-svc-svc-lod:dpe-svc-load/dpe-svc/*",
        "us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-lst:pricingengine-svc/pricingengine-svc/*",
        "us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-lst2-svc-lst:pricingengine-svc-latest2/pricingengine-svc/*",
        "us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-stg:pricingengine-svc/pricingengine-svc/*",
        "us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-stg2-svc-stg:pricingengine-svc-stg2/pricingengine-svc/*",
        "us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-lod:pricingengine-svc/pricingengine-svc/*",
        "us-east-1:dlp-packaging2-S0001647-use1-pricingengine-calcsvc-dlp-svc-lst:dpe-calcsvc-dlp-latest/dpe-calcsvc-dlp/*",
        "us-east-1:dlp-packaging3-S0001647-use1-pricingengine-calcsvc-dlp-lst2-svc-lst:dpe-calcsvc-dlp-latest2/dpe-calcsvc-dlp/*",
        "us-east-1:dlp-packaging2-S0001647-use1-pricingengine-calcsvc-dlp-svc-stg:dpe-calcsvc-dlp-stage/dpe-calcsvc-dlp/*",
        "us-east-1:dlp-packaging3-S0001647-use1-pricingengine-calcsvc-dlp-stg2-svc-stg:dpe-calcsvc-dlp-stage2/dpe-calcsvc-dlp/*",
        "us-east-1:dlp-packaging-S0001647-use1-pricingengine-calcsvc-dlp-svc-lod:dpe-calcsvc-dlp-load/dpe-calcsvc-dlp/*",
        "us-east-1:wdpr-packaging2-S0001711-use1-pricingengine-calcsvc-dev-svc-lst:dpe-calcsvc-latest/dpe-calcsvc/*"
    )
)
  "*with response*" OR ("*Executing*" AND "*operation name*" AND "*query*")
| eval sourceToShow=case(
    match(container_name,"ecs-dpe-svc-latest") AND ecs_cluster="wdw-packaging2-S0001693-use1-lst", "WDW Latest",
    match(container_name,"ecs-dpe-svc-stage")  AND ecs_cluster="wdw-packaging2-S0001693-use1-stg", "WDW Stage",
    match(container_name,"ecs-dpe-svc-load")   AND ecs_cluster="wdw-packaging-S0001693-use1-lod",  "WDW Load",
    match(source,"us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-lst:pricingengine-svc\/pricingengine-svc\/"),                    "DLR Latest",
    match(source,"us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-lst2-svc-lst:pricingengine-svc-latest2\/pricingengine-svc\/.*"),      "DLR Latest 2",
    match(source,"us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-stg:pricingengine-svc\/pricingengine-svc\/"),                    "DLR Stage",
    match(source,"us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-stg2-svc-stg:pricingengine-svc-stg2\/pricingengine-svc\/.*"),        "DLR Stage 2",
    match(source,"us-west-2:dlr-packaging2-S0001691-usw2-pricingengine-svc-svc-lod:pricingengine-svc\/pricingengine-svc\/"),                    "DLR Load",
    match(source,"us-east-1:dlp-packaging2-S0001647-use1-pricingengine-calcsvc-dlp-svc-lst:dpe-calcsvc-dlp-latest\/dpe-calcsvc-dlp\/"),         "DLP Latest",
    match(source,"us-east-1:dlp-packaging3-S0001647-use1-pricingengine-calcsvc-dlp-lst2-svc-lst:dpe-calcsvc-dlp-latest2\/dpe-calcsvc-dlp\/.*"), "DLP Latest 2",
    match(source,"us-east-1:dlp-packaging2-S0001647-use1-pricingengine-calcsvc-dlp-svc-stg:dpe-calcsvc-dlp-stage\/dpe-calcsvc-dlp\/"),         "DLP Stage",
    match(source,"us-east-1:dlp-packaging3-S0001647-use1-pricingengine-calcsvc-dlp-stg2-svc-stg:dpe-calcsvc-dlp-stage2\/dpe-calcsvc-dlp\/.*"), "DLP Stage 2",
    match(source,"us-east-1:dlp-packaging-S0001647-use1-pricingengine-calcsvc-dlp-svc-lod:dpe-calcsvc-dlp-load\/dpe-calcsvc-dlp\/.*"),         "DLP Load",
    match(source,"us-east-1:wdpr-packaging2-S0001711-use1-pricingengine-calcsvc-dev-svc-lst:dpe-calcsvc-latest\/dpe-calcsvc\/.*"),              "DEV Sandbox",
    true(), source
)
| rex "query: '(?<query>[^']+)'"
| eval query=replace(query,"(\\\\)","")
| eval query=replace(query,"}n","}")
| rex "variables '(?<variables>[^']+)'"
| eval variables=replace(variables,"(\\\\)","")
| eval variables=replace(variables,"}n","}")
| rex "response '(?<response>[^']+)'"
| eval response=replace(response,"(\\\\)","")
| eval response=replace(response,"}n","}")
| table _time, sourceToShow, query, variables, response
| sort by "Identifiers.Correlation-Id", _time
```

### Calculator Service Source → Environment Mapping

| Source Pattern | Environment Label |
|---------------|-------------------|
| `wdw-packaging2-S0001693-use1-lst` | WDW Latest |
| `wdw-packaging2-S0001693-use1-stg` | WDW Stage |
| `wdw-packaging-S0001693-use1-lod` | WDW Load |
| `dlr-packaging2-S0001691-usw2-*-svc-lst` | DLR Latest |
| `dlr-packaging2-S0001691-usw2-*-lst2-svc-lst` | DLR Latest 2 |
| `dlr-packaging2-S0001691-usw2-*-svc-stg` | DLR Stage |
| `dlr-packaging2-S0001691-usw2-*-stg2-svc-stg` | DLR Stage 2 |
| `dlr-packaging2-S0001691-usw2-*-svc-lod` | DLR Load |
| `dlp-packaging2-S0001647-use1-*-svc-lst` | DLP Latest |
| `dlp-packaging3-S0001647-use1-*-lst2-svc-lst` | DLP Latest 2 |
| `dlp-packaging2-S0001647-use1-*-svc-stg` | DLP Stage |
| `dlp-packaging3-S0001647-use1-*-stg2-svc-stg` | DLP Stage 2 |
| `dlp-packaging-S0001647-use1-*-svc-lod` | DLP Load |
| `wdpr-packaging2-S0001711-use1-*-svc-lst` | DEV Sandbox |

---

## Key Log Lines Reference

### Impact Analysis Functions

| Function | Log Pattern | Meaning |
|----------|------------|---------|
| IdentifyImpacts | `REQUEST: {"site":"..."}` | Started |
| IdentifyImpacts | `Full Impact Process: ProductPriceImpactResult` | Impacts identified |
| IdentifyImpacts | `Preparing for upload...objectKey=...` | S3 file written |
| PreCalculation | `Completed precalculation\|...\|runtime=Xms` | Success |
| PreCalculation | `Pre-Calculation skipped` | Toggle off |
| PreCalculation | `Error calling DPE Calculator Service` | Failed |
| CacheEviction | `Completed deleting the cache entries` | Success |
| CacheEviction | `Error calling Cache Service` | Failed |
| SendNotifications | `Event Manager Response on X/Y` | Delivered |
| SendNotifications | `did not notify any subscribers` | No subscribers |
| SendNotifications | `Failed to send notification` | HTTP error |

### Calculator Service

| Log Pattern | Meaning |
|------------|---------|
| `Executing * operation name * query` | GraphQL request received |
| `with response` | GraphQL response sent |
| `Error` + `Level="ERROR"` | Request failed |
