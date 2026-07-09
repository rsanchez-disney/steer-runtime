# Splunk Services — DCL WFER Travel

## dcl-apps-travel-service

| Field | Value |
|:------|:------|
| Index | `dcl_dxp_s0001400` |
| Environments | `latest`, `stage`, `prod` |

### Query examples

```splunk
index=dcl_dxp_s0001400 source="*travel-service*" level=ERROR earliest=-24h
| table _time, message
```

```splunk
index=dcl_dxp_s0001400 source="*travel-service*" "*SwellSteps*" earliest=-24h
| table _time, message
```

```splunk
index=dcl_dxp_s0001400 source="*travel-service*" "*CMA*" "token" earliest=-24h
| table _time, message
```

## dcl-apps-travel-webapi

| Field | Value |
|:------|:------|
| Index | `dcl_dxp_s0001400` |
| Environments | `latest`, `stage`, `prod` |

### Query examples

```splunk
index=dcl_dxp_s0001400 source="*travel-webapi*" level=ERROR earliest=-24h
| table _time, message
```
