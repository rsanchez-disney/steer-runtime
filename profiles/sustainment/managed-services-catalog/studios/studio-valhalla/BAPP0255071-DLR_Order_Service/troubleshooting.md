# DLR Order Service — Troubleshooting

## Overview
Core order processing for DLR. Sits between Order VAS and PEOS in the UC path.

## Quick Checks
1. Check Grafana PACE dashboard for CPU/memory spikes
2. Check Splunk: `index=wdpr_core_api source="*west-*:order-service*" ERROR | timechart count span=1m`
3. Check AppDynamics for slow transactions

## Common Issues

### Timeout errors to downstream
- Check PEOS DLR health
- Check Payment Reference service
- Check Config Manager connectivity
- Review: `index=wdpr_core_api source=*us-west*order-service* "Read timed out" "CLIENT_RESP_IN"`

### FAULT_OUT errors
- Check: `index=wdpr_core_api source=*us-west*order-service* FAULT_OUT | spath input=Msg | stats count by error.type`

### FAILED_TO_BOOK_ENTITLEMENTS (DTI rejection)

Payment authorized but eGalaxy rejects the entitlement booking. The `revenueLoss` payload in the FAULT log contains:
- `rrn` — Retrieval Reference Number (use to trace in DTI Gateway: `index=wdpr_dtigw_svc "<RRN>"`)
- `dtiErrorCode` — the eGalaxy-mapped error
- `issuerAuthCode` — payment auth code (confirms payment was captured)

Extract query:
```spl
search index=wdpr_core_api source=*:order-service* "<VID>" "FAULT" earliest=-14d
| rex field=_raw "dtiErrorCode\":\"(?P<dtiError>[^\"]+)"
| rex field=_raw "rrn\":\"(?P<rrn>[^\"]+)"
| table _time dtiError rrn
```

#### Tracing into DTI Gateway (downstream of Order Service)

1. Get RRN from Order Service FAULT log (above)
2. Search DTI GW: `search index=wdpr_dtigw_svc "<RRN>" earliest=-14d`
3. Get `messageId` from the result
4. Full trace: `search index=wdpr_dtigw_svc "<messageId>" | sort _time`
5. Look for "Received response from DLR provider system" — contains eGalaxy XML error

eGalaxy endpoint: `https://egalaxysales.wdprapps.disney.com`

Known DTI/eGalaxy errors:
| DTI Code | eGalaxy Code | Meaning | Route to |
|----------|-------------|---------|----------|
| 849 | 248 | Orphaned photo ID on ticket — photo record not found in eGalaxy | `app-cadlr-galaxy`, CI: eGalaxy |
| 849 | — | "Client info not found" — generic eGalaxy data issue | `app-cadlr-galaxy`, CI: eGalaxy |

## Routing
- Assignment Group: web-global-salescart
- Escalation: Studio Valhalla
- If DTI/eGalaxy error → `app-cadlr-galaxy`, CI: eGalaxy
