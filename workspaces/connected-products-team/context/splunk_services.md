# Splunk Services

## cpx-task-manager-api

| Field | Value |
|---|---|
| Index | `wdpr_sarg` |
| Source | `cpx-task-manager-api-wdw-{env}` |
| Logger | `com.wdpr.nge.edt.sarg.taskmanagerapi*` |
| Environments | `lod`, `lst`, `stg` |

### Query Examples

```splunk
index="wdpr_sarg" source="cpx-task-manager-api-wdw-lod" Logger="com.wdpr.nge.edt.sarg.taskmanagerapi*" level=ERROR
| table _time, Logger, message
```

---

## show-ready-cast-operations-api

| Field | Value |
|---|---|
| Index | `wdpr-dcp` |
| BAPP ID | `BAPP0255924` |
| Container Name | `showready-api` |
| ECS Cluster | `wdpr-dcp-B0255924-use1-{env}-showready-api` |
| ECS Task Definition | `showready-api-{env}*` |
| Environments | `latest`, `stage`, `load`, `prod` |

### Query Examples

```splunk
index=wdpr-dcp bapp_id=BAPP0255924 container_name="showready-api" ecs_task_definition="showready-api-latest*"
| table _time, message
```

```splunk
index=wdpr-dcp bapp_id=BAPP0255924 ecs_cluster="wdpr-dcp-B0255924-use1-latest-showready-api" level=ERROR
| table _time, message
```

---

## sarg-bigbelly-provider

| Field | Value |
|---|---|
| Index | `wdpr_sarg` |
| Source | `sarg-plus-bigbelly-provider-wdw-{env}` |
| Logger | `com.wdpr.cpx.sarg.provider.bigbelly*` |
| Key Fields | `X-Correlation-Id` |
| Environments | `latest`, `stage`, `load`, `prod` |

### Query Examples

```splunk
index="wdpr_sarg" source="sarg-plus-bigbelly-provider-wdw-load" Logger="com.wdpr.cpx.sarg.provider.bigbelly*" level=ERROR
| table _time, Logger, message, X-Correlation-Id
```

```splunk
index="wdpr_sarg" source="sarg-plus-bigbelly-provider-wdw-load" X-Correlation-Id="<id>"
| table _time, Logger, message
```
