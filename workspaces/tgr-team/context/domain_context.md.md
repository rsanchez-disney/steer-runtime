# TGRv5 Lambda API Specification

> **Version:** 5.2026.08  
> **Last Updated:** 2026-08-02  
> **System:** Tips & Gratuity Reporting v5 (TGRv5)  
> **Audience:** Frontend developers (tgrv5-spa), integration engineers, QA

---

## Table of Contents

- [1. System Overview](#1-system-overview)
  - [1.1 Architecture Summary](#11-architecture-summary)
  - [1.2 Technology Stack](#12-technology-stack)
  - [1.3 Deployment Topology](#13-deployment-topology)
- [2. API Base URLs](#2-api-base-urls)
- [3. Authentication](#3-authentication)
  - [3.1 Authentication Methods](#31-authentication-methods)
  - [3.2 Authentication Flow](#32-authentication-flow)
  - [3.3 Required Headers](#33-required-headers)
- [4. Authorization](#4-authorization)
  - [4.1 Role Definitions](#41-role-definitions)
  - [4.2 Role-Based Access Control](#42-role-based-access-control)
- [5. Request/Response Contracts](#5-requestresponse-contracts)
  - [5.1 Standard Success Response](#51-standard-success-response)
  - [5.2 Standard Error Response](#52-standard-error-response)
  - [5.3 Error Types](#53-error-types)
  - [5.4 Error Code Format](#54-error-code-format)
- [6. Standard Handler Lifecycle](#6-standard-handler-lifecycle)
- [7. Input Validation](#7-input-validation)
- [8. Lambda Functions by Domain](#8-lambda-functions-by-domain)
  - [8.1 Authentication & Identity](#81-authentication--identity)
  - [8.2 Cast Member Management](#82-cast-member-management)
  - [8.3 Location Management](#83-location-management)
  - [8.4 Financial Operations](#84-financial-operations)
  - [8.5 Check-in & Attendance](#85-check-in--attendance)
  - [8.6 Audit](#86-audit)
  - [8.7 Reporting](#87-reporting)
  - [8.8 Data Integration](#88-data-integration)
  - [8.9 System Administration](#89-system-administration)
  - [8.10 Scheduled/Background](#810-scheduledbackground)
- [9. Health Check Contract](#9-health-check-contract)
- [10. External Integrations](#10-external-integrations)
- [11. Database](#11-database)
  - [11.1 Schema Overview](#111-schema-overview)
  - [11.2 Business Day Logic](#112-business-day-logic)
- [12. Flutter Client Integration](#12-flutter-client-integration)
  - [12.1 Network Layer](#121-network-layer)
  - [12.2 Feature-to-Lambda Mapping](#122-feature-to-lambda-mapping)
- [13. Deployment](#13-deployment)
  - [13.1 Cassian v3 Platform](#131-cassian-v3-platform)
  - [13.2 Lambda Naming Convention](#132-lambda-naming-convention)
  - [13.3 Environment Progression](#133-environment-progression)
- [14. Local Development](#14-local-development)
- [15. Per-Lambda Swagger Format](#15-per-lambda-swagger-format)
- [16. Related Documentation](#16-related-documentation)

---

## 1. System Overview

**TGRv5** (Tips & Gratuity Reporting version 5) is an enterprise system for managing tips, gratuities, and service bonuses across Walt Disney Parks & Resorts — including Walt Disney World (WDW), Disneyland Resort (DLR), and European parks (EU).

### 1.1 Architecture Summary

The backend consists of **34 AWS Lambda functions**, each deployed as an independent unit behind AWS API Gateway with proxy integration. All Lambdas share a common library (`lambdas/lib/`) symlinked at build time and connect to a shared MariaDB (RDS) instance.

```
┌─────────────────────┐       ┌──────────────────────┐       ┌─────────────┐
│   tgrv5-spa         │──────▶│  AWS API Gateway     │──────▶│  Lambda(s)  │
│   (Flutter Web)     │  HTTP │  /api/ base path     │ proxy │  34 funcs   │
└─────────────────────┘       └──────────────────────┘       └──────┬──────┘
                                                                    │
                                                              ┌─────▼──────┐
                                                              │  MariaDB   │
                                                              │  (RDS)     │
                                                              └────────────┘
```

Key architectural decisions:

- **Cookie-first authentication** (`__t5` fast auth cookie) with OIDC and API key fallbacks
- **Role-based authorization** enforced at the handler level via `reqRoles` maps
- **Business day boundary at 04:00** (not midnight) for all date-based queries
- **Structured JSON logging** with `x-conversation-id` tracing across all requests
- **Shared library pattern** — common utilities, validators, and DAO helpers in `lambdas/lib/`

### 1.2 Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 16.x |
| Database | MariaDB (AWS RDS) via `mysql2` |
| API Gateway | AWS API Gateway (proxy integration) |
| Compute | AWS Lambda |
| Scheduling | AWS EventBridge |
| Storage | AWS S3 |
| Secrets | AWS Secrets Manager |
| Auth Provider | MyID IDP (OIDC) |
| IaC | Terraform |
| CI/CD | Harness |
| Platform | Cassian v3 |

### 1.3 Deployment Topology

The system is deployed across three AWS regions, each serving a distinct park destination:

| Region | AWS Region | Destination |
|--------|-----------|-------------|
| East | us-east-1 | Walt Disney World (WDW) |
| West | us-west-2 | Disneyland Resort (DLR) |
| Europe | eu-west-1 | European Parks (EU) |

Each region maintains independent Lambda deployments, database instances, and environment progressions.

---

## 2. API Base URLs

All endpoints are served under the `/api/` base path.

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local Dev | `http://localhost:3003/api/` | Local development (Express server) |
| Latest | `https://tgrv5-api-latest.wdprapps.disney.com/api/` | Integration testing |
| Stage | `https://tgrv5-api-stage.wdprapps.disney.com/api/` | Staging/QA |
| Load | `https://tgrv5-api-load.wdprapps.disney.com/api/` | Performance testing |
| Production (WDW) | `https://tgrv5-api.wdprapps.disney.com/api/` | us-east-1 |
| Production (DLR) | `https://tgrv5-api.wdprapps.disney.com/api/` | us-west-2 |
| Production (EU) | `https://tgrv5-api.wdprapps.disney.com/api/` | eu-west-1 |

---

## 3. Authentication

### 3.1 Authentication Methods

Requests are authenticated using a priority-ordered cascade:

| Priority | Method | Mechanism | Use Case |
|----------|--------|-----------|----------|
| 1 | Cookie Auth (fast path) | `__t5` cookie with encoded claims | Browser sessions (tgrv5-spa) |
| 2 | OIDC Token | `Authorization: Bearer <token>` | API clients, SSO redirect |
| 3 | API Key | `apikey` + `perner` headers | B2B / service-to-service |

**Cookie Auth** is the preferred method for the Flutter web client. The `__t5` cookie contains pre-encoded claims that bypass network calls to the identity provider, providing sub-millisecond authentication.

**OIDC Token** is validated against the MyID Identity Provider. This is the fallback when no cookie is present (e.g., first login, token refresh).

**API Key** authentication uses a combination of `apikey` and `perner` headers for machine-to-machine communication (scheduled jobs, internal service calls).

### 3.2 Authentication Flow

```
Request arrives
    │
    ▼
┌─ Check __t5 cookie ─┐
│   Present & valid?   │
│   YES → extract      │
│         claims       │
│   NO  → continue     │
└──────────┬───────────┘
           ▼
┌─ Check Authorization ┐
│   Bearer token?      │
│   YES → validate     │
│         via MyID     │
│   NO  → continue     │
└──────────┬───────────┘
           ▼
┌─ Check API headers ──┐
│   apikey + perner?   │
│   YES → validate     │
│         credentials  │
│   NO  → 401         │
└──────────────────────┘
```

### 3.3 Required Headers

| Header | Required | Description |
|--------|----------|-------------|
| `x-conversation-id` | Recommended | UUID for request tracing. Auto-generated if absent. |
| `Authorization` | Conditional | `Bearer <token>` — required if no `__t5` cookie |
| `Cookie` | Conditional | `__t5=<encoded_claims>` — preferred auth method |
| `apikey` | Conditional | API key for B2B authentication |
| `perner` | Conditional | Personnel number (with `apikey` for B2B auth) |
| `Content-Type` | For POST/PUT | `application/json` |

---

## 4. Authorization

### 4.1 Role Definitions

| Code | Role | Access Level | Scope |
|------|------|-------------|-------|
| **TA** | Technical Admin | Full system access | Global |
| **SA** | Senior Admin | Administrative operations | Destination-wide |
| **LM** | Location Manager | Location-scoped management | Assigned locations |
| **CA** | Cast Associate | Own data only | Self |
| **AC** | Accounting | Financial/reporting access | Destination-wide |

### 4.2 Role-Based Access Control

Each Lambda handler defines a `reqRoles` map that specifies which roles are authorized for each endpoint:

```javascript
const reqRoles = {
  "get locations":                          ["TA", "LM", "SA"],
  "post locations":                         ["TA", "SA"],
  "get cast-members/{perner}/destinations": [],  // authenticated only
};
```

**Rules:**

- An empty array `[]` means no role check is performed — any authenticated user may access the endpoint.
- A populated array requires the user to hold **at least one** of the listed roles.
- Roles are loaded from the database (`castmemberrolelocation` table) based on the user's perner and destination/location context.
- Role checks are performed after authentication and before request routing.

**Authorization failure** returns HTTP 403 with error type `FORBIDDEN`.

---

## 5. Request/Response Contracts

### 5.1 Standard Success Response

All Lambda responses follow the API Gateway proxy integration format:

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Credentials": "true",
    "Cache-Control": "no-store",
    "x-conversation-id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "body": "{\"data\": [...] }"
}
```

> **Note:** The `body` field is a **stringified JSON** payload. Clients must parse `JSON.parse(response.body)` to access the actual data.

Common success status codes:

| Code | Usage |
|------|-------|
| `200` | Successful GET, PUT, PATCH |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no content) |

### 5.2 Standard Error Response

#### Validation Error (400)

```json
{
  "typeId": "FIELD_VALIDATION_ERRORS",
  "message": "Field validation errors.",
  "convoID": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "L14_H00_02",
  "validationFailures": [
    {
      "validationType": "INVALID_VALUES",
      "field": "perner",
      "message": "Perner must be numeric and 8 characters.",
      "rejectedValue": "abc"
    }
  ]
}
```

#### Authentication Error (401)

```json
{
  "typeId": "UNAUTHORIZED",
  "message": "Authentication required.",
  "convoID": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "L01_H00_01"
}
```

#### Authorization Error (403)

```json
{
  "typeId": "FORBIDDEN",
  "message": "Insufficient permissions.",
  "convoID": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "L01_H00_03"
}
```

#### Not Found (404)

```json
{
  "typeId": "NOT_FOUND",
  "message": "Resource not found.",
  "convoID": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "L14_H00_04"
}
```

#### System Error (500)

```json
{
  "typeId": "SYSTEM_ERROR",
  "message": "An unexpected error occurred.",
  "convoID": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "L01_H00_99"
}
```

### 5.3 Error Types

| Type ID | HTTP Status | Description |
|---------|-------------|-------------|
| `FIELD_VALIDATION_ERRORS` | 400 | Input validation failures with field-level details |
| `UNAUTHORIZED` | 401 | Authentication failure (missing/invalid credentials) |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `DATABASE_ERROR` | 500 | Database operation failure |
| `SYSTEM_ERROR` | 500 | Unexpected internal error |

### 5.4 Error Code Format

Error codes follow a structured pattern for traceability:

```
L{lambdaNumber}_H{handlerNumber}_{sequenceNumber}
```

| Segment | Description | Example |
|---------|-------------|---------|
| `L{nn}` | Lambda identifier number | `L14` = cast-members lambda |
| `H{nn}` | Handler/route within the lambda | `H00` = primary handler |
| `{nn}` | Sequential error number | `02` = second validation error |

**Example:** `L14_H00_02` → Lambda 14 (cast-members), handler 0, error #2.

---

## 6. Standard Handler Lifecycle

Every Lambda function follows a consistent request processing lifecycle:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. EXTRACT CONVERSATION ID                                       │
│    • From x-conversation-id header or cookie                     │
│    • Generate UUID if absent                                     │
├─────────────────────────────────────────────────────────────────┤
│ 2. HEALTH CHECK DETECTION                                        │
│    • If path matches /healthcheck → return {status, version}     │
│    • Short-circuit: no auth, no DB                               │
├─────────────────────────────────────────────────────────────────┤
│ 3. INITIALIZE                                                    │
│    • Configure structured logging with conversation ID           │
│    • Begin load-time performance tracking                        │
├─────────────────────────────────────────────────────────────────┤
│ 4. AUTHENTICATE                                                  │
│    a. Try __t5 cookie (fast path, no network call)               │
│    b. Fallback: OIDC token validation (MyID IDP)                 │
│    c. Fallback: API key + perner headers (B2B)                   │
│    • Failure → 401 UNAUTHORIZED                                  │
├─────────────────────────────────────────────────────────────────┤
│ 5. EXTRACT IDENTITY                                              │
│    • Parse perner (8-digit personnel number) from claims         │
│    • Resolve user context (destination, location)                │
├─────────────────────────────────────────────────────────────────┤
│ 6. AUTHORIZE                                                     │
│    • Look up user roles from DB (castmemberrolelocation)         │
│    • Check against reqRoles map for target endpoint              │
│    • Failure → 403 FORBIDDEN                                     │
├─────────────────────────────────────────────────────────────────┤
│ 7. ROUTE                                                         │
│    • Match httpMethod + endpointPath to handler function          │
│    • Unknown route → 404 NOT_FOUND                               │
├─────────────────────────────────────────────────────────────────┤
│ 8. VALIDATE INPUTS                                               │
│    • Run validators on request parameters/body                   │
│    • Accumulate all failures (do not fail-fast)                  │
│    • Any failures → 400 FIELD_VALIDATION_ERRORS                  │
├─────────────────────────────────────────────────────────────────┤
│ 9. EXECUTE                                                       │
│    • Call service layer → DAO layer → MariaDB                    │
│    • Business logic processing                                   │
├─────────────────────────────────────────────────────────────────┤
│ 10. RESPOND                                                      │
│     • Format standardized success response                       │
│     • Include x-conversation-id in response headers              │
├─────────────────────────────────────────────────────────────────┤
│ 11. ERROR HANDLING                                               │
│     • Catch unhandled errors                                     │
│     • Return normalized error response with error code           │
│     • Log error with full context                                │
├─────────────────────────────────────────────────────────────────┤
│ 12. FINALIZE                                                     │
│     • Flush load-time performance stats                          │
│     • Close any open connections if needed                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Input Validation

All user inputs are validated before processing. Validation errors are **accumulated** (not fail-fast) and returned as a single 400 response with all failures listed.

### 7.1 Built-in Validators

| Validator | Rule | Error Message |
|-----------|------|---------------|
| `isRequired` | Non-null, non-empty, non-undefined | `"{field} is required"` |
| `isValidDate` | Format: `yyyy-mm-dd` | `"Invalid date format"` |
| `isValidTime` | Format: `HH:mm:ss` | `"Invalid time format"` |
| `isValidPerner` | Exactly 8 digits, numeric only | `"Perner must be numeric and 8 characters"` |
| `isValidDestination` | One of: `WDW`, `DLR`, `AULANI`, `WDWBELL` | `"Invalid destination"` |
| `isMoneyString` | Numeric, max 2 decimal places | `"Invalid money format"` |
| `isIn` | Value exists in allowed set | `"Value not in allowed values"` |

### 7.2 Validation Response Format

```json
{
  "typeId": "FIELD_VALIDATION_ERRORS",
  "message": "Field validation errors.",
  "convoID": "<uuid>",
  "errorCode": "L{xx}_H{xx}_{xx}",
  "validationFailures": [
    {
      "validationType": "REQUIRED",
      "field": "locationId",
      "message": "locationId is required",
      "rejectedValue": null
    },
    {
      "validationType": "INVALID_VALUES",
      "field": "date",
      "message": "Invalid date format",
      "rejectedValue": "2026/08/01"
    }
  ]
}
```

### 7.3 Validation Types

| Type | Description |
|------|-------------|
| `REQUIRED` | Field is missing or empty |
| `INVALID_VALUES` | Field value does not match expected format |
| `INVALID_LENGTH` | Field exceeds maximum length |
| `NOT_IN_SET` | Field value not in allowed enumeration |

---

## 8. Lambda Functions by Domain

The 34 Lambda functions are organized into functional domains. Each Lambda is an independent deployable unit with its own handler, routes, and swagger definition.

### 8.1 Authentication & Identity

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `login` | `/api/login` | Initiates MyID SSO login flow |
| `oidc` | `/api/oidc` | OIDC callback handler — exchanges auth code for tokens, sets `__t5` cookie |
| `logout` | `/api/logout` | Terminates session, clears `__t5` cookie |
| `cast-member-login` | `/api/cast-member-login` | Records cast member login events for tracking |
| `validate` | `/api/validate` | Validates current session/token, returns user claims |

**Key Behaviors:**

- `login` redirects to MyID with appropriate redirect URI
- `oidc` performs token exchange and sets `__t5` cookie with encoded claims
- `validate` is called by the Flutter app on startup to check session validity
- `cast-member-login` tracks login timestamps for audit/reporting purposes

### 8.2 Cast Member Management

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `cast-members` | `/api/cast-members` | CRUD for cast member profiles (perner-based lookup) |
| `castmemberlocations` | `/api/castmemberlocations` | Manage cast member ↔ location associations |
| `castmemberrolelocation` | `/api/castmemberrolelocation` | Role assignments per location for cast members |
| `cast-roles` | `/api/cast-roles` | Role management for specific locations |
| `cast-members-sales` | `/api/cast-members-sales` | Sales data aggregated per cast member |
| `cast-members-shares` | `/api/cast-members-shares` | Tip share data per cast member |

**Key Behaviors:**

- Cast members are identified by **perner** (8-digit personnel number)
- `cast-members` supports filtering by destination, location, active status
- `castmemberrolelocation` is the source of truth for authorization decisions
- `cast-members-sales` and `cast-members-shares` provide read-only aggregated views

### 8.3 Location Management

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `locations` | `/api/locations` | Destination/store/location hierarchy CRUD |
| `locationcastmembers` | `/api/locationcastmembers` | List cast members assigned to a location |
| `locationmessages` | `/api/locationmessages` | Location-scoped messages and announcements |

**Key Behaviors:**

- Locations follow a hierarchy: **Destination → Store → Location**
- Valid destinations: `WDW`, `DLR`, `AULANI`, `WDWBELL`
- `locationcastmembers` provides a location-centric view of assigned cast members
- `locationmessages` supports CRUD for announcements visible to cast at a location

### 8.4 Financial Operations

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `sales-tips-and-grats` | `/api/sales-tips-and-grats` | Core sales, tips & gratuities data (GET/POST/PUT by location+date) |
| `splits` | `/api/splits` | Tip split creation, viewing, acknowledgment, and deletion |
| `splits-process` | `/api/splits-process` | Batch tip split processing (EventBridge scheduled) |
| `share-types` | `/api/share-types` | Share type definitions (percentage, fixed, etc.) |
| `cost-centers` | `/api/cost-centers` | Cost center management for financial categorization |

**Key Behaviors:**

- `sales-tips-and-grats` is the primary financial data endpoint, queried by location + business date
- Supports individual and bulk update operations for tips/gratuities
- `splits` manages the splitting of tips among cast members (create, view, cancel, acknowledge)
- `splits-process` runs on a schedule to finalize pending splits
- All monetary values use string format with max 2 decimal places (e.g., `"12.50"`)
- Business date boundary is **04:00 AM** (not midnight)


### 8.5 Check-in & Attendance

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `checkin` | `/api/checkin` | Cast member shift check-in for the business day |

**Key Behaviors:**

- Cast members check in at the start of their shift
- Check-in is location-specific and tied to the current business day
- A checked-in cast member becomes eligible for tip/gratuity distribution
- Check-in status is used by other lambdas (sales-tips-and-grats, splits) to determine eligibility

### 8.6 Audit

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `audit` | `/api/audit` | Audit creation, date management, and status tracking |
| `audit-interface` | `/api/audit-interface` | Audit review interface — approve/revoke operations |

**Key Behaviors:**

- Audits are created per location for a date range
- `audit-interface` provides batch approve/revoke capabilities for audited cast members
- Audit status tracks the lifecycle: created → in-review → approved/revoked
- Audits lock financial data for the covered period once approved
- Supports GIS (Gratuity Income Statement) audit report generation

### 8.7 Reporting

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `reports` | `/api/reports` | Report generation (async Lambda invoke pattern) |
| `pos-daily-report` | `/api/pos-daily-report` | Daily POS (Point of Sale) report |

**Key Behaviors:**

- `reports` supports multiple report types:
  - Cast Member Audit Report
  - Daily Tip Journal
  - End of Day Report
  - Location Total Report
  - Tip & Gratuity Location Report
  - Gratuity Tip Declaration Report
  - Adjustment Audit Report
  - Zero Cash Tips Report
  - Cast Login Report
  - Role Changes Report
  - GIS Audit Report
  - File Uploader Report
- Report generation is **asynchronous** — the Lambda invokes a secondary Lambda for processing
- Reports are generated as downloadable files (stored in S3)
- `pos-daily-report` is a specialized daily summary of POS transactions

### 8.8 Data Integration

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `pull-pos-data` | `/api/pull-pos-data` | POS data pull from Appetize (on-demand or scheduled) |
| `sap` | `/api/sap` | SAP CSV feed generation (uploaded to S3) |
| `data-migration` | `/api/data-migration` | Data migration utilities |
| `spreadsheet-imports` | `/api/spreadsheet-imports` | Spreadsheet/CSV bulk import for sales and tips |

**Key Behaviors:**

- `pull-pos-data` fetches transaction data from the Appetize POS system
  - Can be triggered on-demand (per-store) or via nightly EventBridge schedule
  - Processes data in batches to avoid timeouts
  - Maps POS tickets to cast members and locations
- `sap` generates payroll feed CSVs for SAP integration
  - Runs on schedule via EventBridge
  - Outputs CSV files to S3 for downstream pickup
- `spreadsheet-imports` allows bulk data upload via CSV/spreadsheet
  - Validates file format and content before processing
  - Supports location setup imports and sales/tips imports

### 8.9 System Administration

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `configurations` | `/api/configurations` | System configuration key/value management (CRUD) |
| `system-details` | `/api/system-details` | System info, version, and status |
| `system-functions` | `/api/system-functions` | System function code definitions |
| `roles` | `/api/roles` | Role definitions and permissions |
| `justification` | `/api/justification` | Justification text values for auditable actions |
| `healthcheck` | `/api/healthcheck` | Global health check endpoint |

**Key Behaviors:**

- `configurations` manages application-wide settings (feature flags, thresholds, display text)
- `system-functions` defines the function codes used throughout the system
- `justification` provides predefined text options when users must justify an action (adjustments, reversals)
- `healthcheck` performs a lightweight liveness check across the system

### 8.10 Scheduled/Background

| Lambda | Base Path | Description |
|--------|-----------|-------------|
| `overnight-processing` | `/api/overnight-processing` | Nightly batch processing (EventBridge scheduled) |

**Key Behaviors:**

- Triggered by EventBridge on a nightly schedule
- Performs end-of-day rollup calculations
- Processes pending splits that were not manually processed during the day
- Generates service bonus rollups
- Runs after the 04:00 AM business day boundary

---

## 9. Health Check Contract

Every Lambda responds to a health check request. This enables monitoring, load balancer health probes, and Lambda warmup from the Flutter client.

**Endpoint:** `GET /api/{lambda-path}/healthcheck`

**Response:**

```json
{
  "status": "UP",
  "version": "5.2026.02.0"
}
```

**Characteristics:**

- No authentication required
- No database connection required
- Short-circuits at step 2 of the handler lifecycle
- Returns immediately (cold-start warmup use case)
- Version follows format: `5.{year}.{release}.{patch}`

---

## 10. External Integrations

The TGRv5 Lambda layer integrates with multiple internal Disney systems and AWS services:

| System | Purpose | Integration Type | Lambda(s) Using |
|--------|---------|-----------------|-----------------|
| **MyID IDP** | SSO authentication, token validation | OIDC / REST | login, oidc, validate |
| **Keystone PIP** | Policy enforcement point | REST | All (via lib) |
| **B2B AuthZ** | Service-to-service authorization | Token exchange | Scheduled lambdas |
| **Cast API** | Personnel data lookup | REST | cast-members |
| **Appetize POS** | Point-of-sale ticket data | REST | pull-pos-data |
| **Commerce Config Manager** | Location hierarchy configuration | REST | locations |
| **SAP** | Payroll feed delivery | File-based (CSV → S3) | sap |
| **AWS Secrets Manager** | Credentials and configuration secrets | AWS SDK | All |
| **AWS S3** | File storage (reports, SAP feeds, imports) | AWS SDK | reports, sap, spreadsheet-imports |
| **AWS EventBridge** | Scheduled triggers for batch jobs | Events | splits-process, pull-pos-data, sap, overnight-processing |
| **AWS Lambda (invoke)** | Async report generation | AWS SDK | reports |

### Integration Authentication

| Integration | Auth Method |
|-------------|-------------|
| MyID IDP | OIDC client credentials (from Secrets Manager) |
| Appetize POS | API key (from Secrets Manager) |
| Cast API | B2B token exchange |
| Commerce Config Manager | B2B token exchange |
| AWS Services | IAM Role (Lambda execution role) |

---

## 11. Database

### 11.1 Schema Overview

| Attribute | Value |
|-----------|-------|
| Engine | MariaDB (AWS RDS) |
| Schema | `tgrv5` |
| Driver | `mysql2` with connection pooling |
| Tables | 40+ |
| Views | 3 key views |

**Key Tables:**

| Table | Domain | Purpose |
|-------|--------|---------|
| `castmember` | Identity | Cast member profiles and perners |
| `castmemberrolelocation` | Auth | Role assignments per location |
| `location` | Location | Location/store definitions |
| `servicebonus` | Financial | Individual service bonus records |
| `servicebonusrollup` | Financial | Aggregated service bonus summaries |
| `salerevenue` | Financial | Sales revenue data |
| `split` | Financial | Tip split records |
| `posticket` | POS | Point-of-sale ticket data |
| `audit` | Audit | Audit records and status |
| `configuration` | System | Key/value system settings |

**Key Views:**

| View | Purpose |
|------|---------|
| `view_sales` | Aggregated sales data by location/date |
| `view_salestipsgrats` | Combined sales, tips & gratuities view |
| `view_shares` | Tip share distribution view |

### 11.2 Business Day Logic

TGRv5 uses a non-standard day boundary for all date-based operations:

```
Business Day = 04:00 AM → 04:00 AM (next calendar day)
```

**Examples:**

- A transaction at 2026-08-02 03:30 AM belongs to business day **2026-08-01**
- A transaction at 2026-08-02 04:01 AM belongs to business day **2026-08-02**

**SQL Pattern:**

```sql
WHERE transaction_time >= '2026-08-02 04:00:00'
  AND transaction_time <  '2026-08-03 04:00:00'
```

This boundary aligns with park/restaurant operating hours where late-night activity (after midnight) belongs to the previous business day.

---

## 12. Flutter Client Integration

The primary consumer of this API layer is **tgrv5-spa**, a Flutter 3.38+ / Dart web application.

### 12.1 Network Layer

The Flutter app uses a custom `RestJsonApi` wrapper that provides:

- **Automatic retry** with exponential backoff for transient failures
- **Conversation ID injection** — generates and attaches `x-conversation-id` to every request
- **Cookie-based auth** — leverages browser same-origin cookie handling for `__t5`
- **Mock data support** — development builds can swap real API calls for mock providers
- **Response parsing** — handles the stringified `body` field in Lambda proxy responses

**Request Flow (Flutter → Lambda):**

```
Flutter Feature → Provider/Riverpod → RestJsonApi → HTTP Request
    ↓                                                    ↓
    ← parsed model ← JSON decode ← Lambda Response ←────┘
```

### 12.2 Feature-to-Lambda Mapping

| Flutter Feature Module | Lambda Function(s) | Primary Operations |
|----------------------|--------------------|--------------------|
| `login` | login, oidc, logout, validate | SSO flow, session management |
| `cast_admin` | cast-members, castmemberlocations, castmemberrolelocation | Cast member CRUD, role assignment |
| `financial_locations` | locations, locationcastmembers | Location hierarchy browsing |
| `cash_tips` | sales-tips-and-grats | Add/edit cash tips |
| `split_tips` | splits | Create/cancel/acknowledge splits |
| `share_tips` | cast-members-shares | View/manage tip shares |
| `adjustments` | sales-tips-and-grats | Financial adjustments |
| `audits` | audit, audit-interface | Audit creation and review |
| `global_report` | reports | Report generation requests |
| `summary_report` | reports | Summary report views |
| `print_report` | reports | Printable report generation |
| `pull_pos` | pull-pos-data | On-demand POS data import |
| `system_configurations` | configurations | Admin configuration management |
| `system_announcements` | locationmessages | Location announcement CRUD |
| `role_selector` | roles, cast-roles | Role selection UI |
| `lambda_warmup` | healthcheck | Cold-start warmup pings |

### 12.3 Client-Side Auth Flow

```
1. App launch → call /api/validate
2. If valid __t5 cookie → extract claims → route to role selector
3. If no valid session → redirect to /api/login (MyID SSO)
4. MyID callback → /api/oidc → sets __t5 cookie → redirect to app
5. App receives cookie → /api/validate → proceed to dashboard
```

### 12.4 Role-Based UI Routing

The Flutter app uses `go_router` with permission-based redirects:

- **CA** → Cast Associate dashboard (own tips, check-in)
- **LM** → Location Manager view (team management, splits)
- **SA** → Senior Admin panel (multi-location, audits)
- **TA** → Technical Admin (full system access)
- **AC** → Accounting view (reports, SAP feeds)

---

## 13. Deployment

### 13.1 Cassian v3 Platform

TGRv5 Lambdas are deployed via **Cassian v3**, Disney's internal Lambda deployment platform, with Terraform for infrastructure-as-code and Harness for CI/CD pipelines.

| Attribute | Value |
|-----------|-------|
| Platform | Cassian v3 |
| IaC | Terraform (repo: `tgrv5-lambda-terraform`) |
| CI/CD | Harness pipelines |
| Runtime | Node.js 16.x |
| Default Timeout | 60 seconds |
| Memory | Configured per-lambda in Terraform |

### 13.2 Lambda Naming Convention

```
tgrv5-{region_code}-{env}-tgrv5-eb-{lambda-name}
```

**Constraint:** Total name must be < 64 characters.

| Component | Values | Example |
|-----------|--------|---------|
| Region Code | `use1`, `usw2`, `euw1` | `use1` |
| Environment | `dev`, `lst`, `stg`, `lod`, `prd` | `prd` |
| Lambda Name | Function identifier | `cast-members` |

**Example:** `tgrv5-use1-prd-tgrv5-eb-cast-members`

### 13.3 Environment Progression

```
dev → latest → stage → load → prod
```

| Environment | Code | Purpose |
|-------------|------|---------|
| Development | `dev` | Active development, unstable |
| Latest | `lst` | Integration testing, CI deploys |
| Stage | `stg` | QA validation, demo |
| Load | `lod` | Performance/load testing |
| Production | `prd` | Live traffic |

Each environment is independently deployed per region. Promotion between environments is managed through Harness pipelines with approval gates.

---

## 14. Local Development

### 14.1 Starting the Local Server

```bash
cd lambdas
nodemon server.js --env=dev --region=us-east-1
# Server runs on http://localhost:3003
```

### 14.2 How the Local Server Works

The local development server (`lambdas/server.js`) emulates API Gateway behavior:

1. **Discovery** — Reads all `swaggers/api` files from each lambda folder
2. **Route Registration** — Converts API Gateway-style path templates to Express routes
3. **Request Translation** — Wraps incoming Express requests into Lambda event format:
   ```json
   {
     "httpMethod": "GET",
     "path": "/api/cast-members",
     "headers": { ... },
     "queryStringParameters": { ... },
     "body": "...",
     "pathParameters": { ... }
   }
   ```
4. **Handler Invocation** — Calls `handler.handler(event, context)` for the matched lambda
5. **Response Translation** — Extracts `statusCode`, `headers`, and `body` from the Lambda response and sends to HTTP client

### 14.3 Local Auth Bypass

In local development, authentication can be configured via environment variables to bypass MyID SSO. See the project's `.env.example` for available overrides.

---

## 15. Per-Lambda Swagger Format

Each Lambda defines its API contract in a `swaggers/api` file (JSON, no extension) within its directory. This file is used by both the local server and the API Gateway deployment (via Terraform).

**Format:**

```json
{
  "cast-members": {
    "get": {
      "tags": ["CastMembers"],
      "description": "Get cast members",
      "produces": ["application/json"],
      "parameters": [
        {
          "name": "destination",
          "in": "query",
          "required": true,
          "type": "string",
          "description": "Destination code (WDW, DLR, etc.)"
        },
        {
          "name": "locationId",
          "in": "query",
          "required": false,
          "type": "string",
          "description": "Location ID filter"
        }
      ],
      "responses": {
        "200": {
          "description": "Successful response"
        },
        "400": {
          "description": "Validation error"
        },
        "401": {
          "description": "Unauthorized"
        }
      },
      "x-amazon-apigateway-integration": {
        "uri": "${arn}",
        "passthroughBehavior": "when_no_templates",
        "httpMethod": "POST",
        "type": "aws_proxy"
      }
    }
  },
  "cast-members/{perner}": {
    "get": {
      "tags": ["CastMembers"],
      "description": "Get cast member by perner",
      "parameters": [
        {
          "name": "perner",
          "in": "path",
          "required": true,
          "type": "string",
          "description": "8-digit personnel number"
        }
      ],
      "responses": { ... }
    }
  }
}
```

**Key Points:**

- Path segments with `{param}` denote path parameters
- The `x-amazon-apigateway-integration` block is used by Terraform for API Gateway configuration
- `"type": "aws_proxy"` indicates Lambda proxy integration (all request data passes through)
- Each lambda's swagger file is the source of truth for its route definitions

---

## 16. Related Documentation

This specification is the canonical reference for the TGRv5 Lambda API layer. For deeper detail on specific topics, refer to:

| Document | Location | Content |
|----------|----------|---------|
| OpenAPI 3.0.3 Spec | `docs/api/openapi.yaml` | Full machine-readable API spec (~100 routes) |
| Endpoint-Specific Docs | `docs/REST APIs/` | 66 detailed endpoint documents |
| Handler-API Mapping | `docs/REST APIs/handler-api-mapping.md` | Complete handler → endpoint → role matrix |
| Architecture Diagrams | `docs/architecture/` | 11 Mermaid sequence/component diagrams |
| ER Diagrams | `docs/data/er-diagram.md` | Full database entity-relationship diagrams |
| Integration Details | `docs/integrations/` | 13 integration-specific documents |
| Feature Documentation | `docs/features/` | 13 feature descriptions and behaviors |
| Postman Collection | `docs/tgrv5.postman_collection.json` | Importable request collection (67KB) |
| SQL Schemas | `docs/sql/` | DDL, views, and migration scripts |
| Troubleshooting | `docs/troubleshooting/` | Known issues and resolution guides |

---

## Appendix A: Complete Lambda Inventory

| # | Lambda Name | Domain | Trigger | Roles Required |
|---|------------|--------|---------|---------------|
| 1 | login | Auth | HTTP | None (public) |
| 2 | oidc | Auth | HTTP | None (callback) |
| 3 | logout | Auth | HTTP | Authenticated |
| 4 | cast-member-login | Auth | HTTP | Authenticated |
| 5 | validate | Auth | HTTP | None (public) |
| 6 | cast-members | Cast | HTTP | TA, SA, LM |
| 7 | castmemberlocations | Cast | HTTP | TA, SA, LM |
| 8 | castmemberrolelocation | Cast | HTTP | TA, SA |
| 9 | cast-roles | Cast | HTTP | TA, SA, LM |
| 10 | cast-members-sales | Cast | HTTP | TA, SA, LM, CA |
| 11 | cast-members-shares | Cast | HTTP | TA, SA, LM, CA |
| 12 | locations | Location | HTTP | TA, SA, LM |
| 13 | locationcastmembers | Location | HTTP | TA, SA, LM |
| 14 | locationmessages | Location | HTTP | TA, SA, LM |
| 15 | sales-tips-and-grats | Financial | HTTP | TA, SA, LM |
| 16 | splits | Financial | HTTP | TA, SA, LM |
| 17 | splits-process | Financial | EventBridge | N/A (scheduled) |
| 18 | share-types | Financial | HTTP | TA, SA, LM |
| 19 | cost-centers | Financial | HTTP | TA, SA |
| 20 | checkin | Attendance | HTTP | TA, SA, LM, CA |
| 21 | audit | Audit | HTTP | TA, SA, LM |
| 22 | audit-interface | Audit | HTTP | TA, SA, LM |
| 23 | reports | Reporting | HTTP | TA, SA, LM, AC |
| 24 | pos-daily-report | Reporting | HTTP | TA, SA, LM |
| 25 | pull-pos-data | Integration | HTTP + EventBridge | TA, SA, LM |
| 26 | sap | Integration | EventBridge | N/A (scheduled) |
| 27 | data-migration | Integration | HTTP | TA |
| 28 | spreadsheet-imports | Integration | HTTP | TA, SA |
| 29 | configurations | System | HTTP | TA, SA |
| 30 | system-details | System | HTTP | TA |
| 31 | system-functions | System | HTTP | TA, SA |
| 32 | roles | System | HTTP | TA, SA |
| 33 | justification | System | HTTP | TA, SA, LM |
| 34 | healthcheck | System | HTTP | None (public) |
| — | overnight-processing | Background | EventBridge | N/A (scheduled) |

---

## Appendix B: Common Query Parameters

These query parameters appear across multiple endpoints:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `destination` | string | Park destination code | `WDW` |
| `locationId` | string | Location identifier | `12345` |
| `storeId` | string | Store identifier | `67890` |
| `date` | string | Business date (yyyy-mm-dd) | `2026-08-01` |
| `startDate` | string | Range start (yyyy-mm-dd) | `2026-08-01` |
| `endDate` | string | Range end (yyyy-mm-dd) | `2026-08-07` |
| `perner` | string | 8-digit personnel number | `12345678` |
| `active` | boolean | Filter by active status | `true` |

---

## Appendix C: Versioning

The TGRv5 API uses **implicit versioning** — there is no `/v1/` prefix in the URL. Breaking changes are avoided; evolution is additive (new fields, new endpoints).

**Version format:** `5.{year}.{release}.{patch}`

- `5` — Major system version (TGRv5)
- `{year}` — Release year
- `{release}` — Release number within the year
- `{patch}` — Patch/hotfix number

**Example:** `5.2026.02.0` — TGRv5, 2026, second release, no patches.

---

*This document is the canonical API specification for the tgrv5-lambda service layer. For updates or corrections, modify this file and submit a PR to the tgrv5-lambda repository.*
