# Studio Rocket — Alerts Runbook

## Splunk App

Studio Rocket has a dedicated Splunk App:

| Resource | URL |
|----------|-----|
| Search | `https://splunk.wdprapps.disney.com/en-GB/app/rocket/search` |
| Alerts | `https://splunk.wdprapps.disney.com/en-GB/app/rocket/alerts` |
| Reports | `https://splunk.wdprapps.disney.com/en-GB/app/rocket/reports` |
| Dashboards | `https://splunk.wdprapps.disney.com/en-GB/app/rocket/dashboards` |
| Datasets | `https://splunk.wdprapps.disney.com/en-GB/app/rocket/datasets` |

## Alert Severity Levels

| Severity | Action |
|----------|--------|
| 🔴 Critical | Urgent — requires immediate attention to prevent critical issues |
| 🟡 Warning | Active monitoring — initial analysis, create ticket if needed |
| 🟢 Info | Low priority — monitor only, no immediate action required |

## Alert Handling Guide

### General Steps
1. Check the alert description to identify the failing process
2. For "Lost Splunk Logs" → check `#dx-splunk` to validate it's not a general issue
3. If specific to Rocket app → open INC to `app-flwdw-splunk` assignment group
4. For HTTP Errors → check `#dpep_monitoring` for known issues
5. Check AppDynamics dashboards and Splunk queries
6. Create Jira ticket if further investigation needed
7. Post findings in Teams channel with Jira/INC number

## Alerts Inventory

### Authentication Service

| Alert | Severity | Notifications |
|-------|----------|---------------|
| Authentication Service [HTTP Errors] | 🔴 | Email, Teams, PagerDuty |
| Authentication Service [Lost Splunk Logs] | 🔴 | Email, Teams, PagerDuty |
| Authentication Service [Min Transactions] | 🔴 | Email, Teams, PagerDuty |

### DLR Package Entitlement SVC

| Alert | Severity | Notifications |
|-------|----------|---------------|
| DLR Package Entitlement SVC [High Avg Response Time] | 🔴 | Email, Teams, PagerDuty |
| DLR Package Entitlement SVC [High Number Of Feign Connector Errors] | 🔴 | Email, Teams, PagerDuty |
| DLR Package Entitlement SVC [High Number Of Level-Error Logs] | 🔴 | Email, Teams, PagerDuty |
| DLR Package Entitlement SVC [High Number Of Response Codes 4++/5++] | 🔴 | Email, Teams, PagerDuty |
| DLR Package Entitlement SVC [Lost Splunk Logs] | 🔴 | Teams, PagerDuty |
| DLR Package Entitlement SVC [Low Avg Transactions] | 🔴 | Email, Teams, PagerDuty |

### DLR Resort Reservation VA

| Alert | Severity | Notifications |
|-------|----------|---------------|
| DLR Resort Reservation VA [ADM To PLU Mapping Not Found In RPVA Response] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [Addon Product Mapping Config Not Found] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [Admission Code Not Found Error From RPVA Response] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [Credit Card Found In Logs] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [DMP Batch - AJO Errors] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [DMP Batch - Failure] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [High Number Of Feign Connector Errors] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [Lost Splunk Logs] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [High Number Of Level-Error Logs] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [No Nodes/Hosts] | 🔴 | Email, Teams |
| DLR Resort Reservation VA [Low Avg Transactions] | 🔴 | Email, Teams |

#### VA Alert Handling — Feign Connector Errors

| Connector | Action |
|-----------|--------|
| PackageEntitlementServiceConnector | Check threshold, evaluate severity, report if needed |
| PackageReservationRetrieveConnector | Check threshold, evaluate severity, report if needed |
| ResortPackageVAFeignConnector | Check threshold, evaluate severity, report if needed |
| OlciVAServiceConnector | Check if timeouts from OLCI VA → report to `#rocket-olci-partnership` |
| PackageOrderServiceConnector | Check threshold, evaluate severity, report if needed |

### DLR Resort Sales Checkout VA

| Alert | Severity | Notifications |
|-------|----------|---------------|
| DLR Resort Sales Checkout VA [AJOException - AJO Send Email Failure] | 🔴 | Email, Teams |
| DLR Resort Sales Checkout VA [Error TBX Calling Accommodation Service] | 🔴 | Email, Teams, PagerDuty |
| DLR Resort Sales Checkout VA [High Avg Response Time] | 🔴 | Email, Teams, PagerDuty |
| DLR Resort Sales Checkout VA [High Number Of Feign Connector Errors] | 🔴 | Email, Teams, PagerDuty |
| DLR Resort Sales Checkout VA [High Number Of Level-Error Logs] | 🔴 | Email, Teams, PagerDuty |
| DLR Resort Sales Checkout VA [High Number Of Response Codes 4++/5++] | 🔴 | Email, Teams, PagerDuty |

### DLR Guest Resort Reservation SPA/API

| Alert | Severity | Notifications |
|-------|----------|---------------|
| DLR Guest Resort Reservation SPA [Caliper Bot] | 🟡 | Teams |

**Caliper Bot handling:**
1. Check alert result to validate hits count
2. Monitor AppDynamics for Guest RR SPA
3. Monitor AppDynamics and Dashboard for RRVA and Package Entitlement SVC
4. Report to team — AOE will likely reach out
5. Alert has 60min throttle (won't re-trigger for 60min)

### DLR Rocket Order Batch — CME Update Visual ID Failure

**Steps:**
1. Ask for `tkt_visual_ids` for failed reservations in `#dlr-rocket-cme`
2. Receive CSV file (`reservation_xxxxx.csv`) with required data
3. Create SQL query with the visual IDs (use Python script or manually)
4. Create INC in ServiceNow for DBAs to run the SQL (model: INC25162844)
5. Upload text file with SQL query to the INC

## DMP Batch Process Troubleshooting

1. Go to Splunk Dashboard
2. Scroll to "Search Type" section, paste reservation number
3. Select correlation ID once loaded
4. Press "Check ALL related Logs" button
5. Search for `[DMP Batch]-[Reservation: {number}, Process: Main] - (Started)`
6. Check how many times DMP Processing was triggered
7. Analyze each correlation ID for successful retry (false positive)
8. If actual error after 3rd retry, check known errors:

| Category | Error | Action |
|----------|-------|--------|
| admissionProduct | "No admission option code present for order" | Call Package Reservation API with reservation ID, check if `admissionProduct` exists. If not → contact Alan.L.Roberts@disney.com or DL.Travel.Sales.Service.Specialists@disney.com |
| stayPeriod | "No value present" + "activeInsurancePrice" | Call Package Reservation API, check if `startDate` exists. If not → contact Alan.L.Roberts |

**Package Reservation API call:**
```
GET https://package-reservation-svc-dlr.wdprapps.disney.com/api/v1/reservations/{reservation-id}/packages?expands=ALL&communicationChannel=Internet
Token client_id: TPR-DLR-RESORT-RESVA.B2B-PROD
```

## Alert Naming Convention

```
Alert: {Branch} {App} [{Alert_description}]
```
Example: `Alert: DLR Package Entitlement SVC [High Number Of Feign Connector Errors]`

## Alert Configuration

- **Permissions:** Shared in APP
- **Expires:** 10 Days
- **Trigger:** Once
- **Throttle:** Varies per alert
- **Splunk Scripts Repo:** `https://github.disney.com/studio-expedition/trade-splunk-scripts`
