# Project Mappings

## Config Studio

**Purpose**: Payment configuration management platform

**Repositories**:
- **UI**: `wdpr-payment-control-client` (../wdpr-payment-control-client)
  - Tech: Angular, TypeScript
  - Entry: `src/app/`
  
- **WebAPI**: `wdpr-payment-control-api` (../wdpr-payment-control-api)
  - Tech: Node.js, Express
  - Entry: `src/controllers/`
  
- **Backend**: `wdpr-config-services` (../wdpr-config-services)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`

**Jira Prefix**: `DPAY-`

---

## GCP (Gift Card Platform)

**Purpose**: Gift card administration and management

**Repositories**:
- **UI**: `wdpr-payment-control-client` (../wdpr-payment-control-client)
  - Tech: Angular, TypeScript
  - Entry: `src/app/`
  
- **WebAPI**: `wdpr-gcp-admin-api` (../wdpr-gcp-admin-api)
  - Tech: Node.js, Express
  - Entry: `src/controllers/`
  
- **Backend**: `gcp-admin-services` (../gcp-admin-services)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`
  
- **Legacy UI**: `wdpr-gcp-admin` (../wdpr-gcp-admin)
  - Tech: Angular (older version)
  - Status: Maintain backwards compatibility
  - Entry: `src/app/`

**Jira Prefix**: `GCP-`


## TRP|PAP (Transaction Reseach Portal | Payment Admin Portal)

**Purpose**: Transaction Reseach Portal and Payment Admin Portal

**Repositories**:
- **UI**: `wdpr-payment-control-client` (../wdpr-payment-control-client)
  - Tech: Angular, TypeScript
  - Entry: `src/app/`
  
- **WebAPI**: `dpay-admin-inquiry-webapi` (../wdpay-admin-inquiry-webapi)
  - Tech: Node.js, Express
  - Entry: `src/controllers/`
  
- **Backend**: `wdpr-app-inquiry-service` (../wdpr-app-inquiry-service)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`
  
- **Legacy UI**: `dpay-admin-inquiry-ui-client` (../dpay-admin-inquiry-ui-client)
  - Tech: Angular (older version)
  - Status: Maintain backwards compatibility
  - Entry: `src/app/`

**Jira Prefix**: `DPAY-`

---

## CAP (Content Accounting Platform)

**Purpose**: Revenue recognition and content accounting

**Base Path**: `/Users/ricardo.sanchez/Workspace/Disney/wdpr-cap-svcs`

**Repositories**:
- **Backend**: `wdpr-cap-rev-rec-svc` (wdpr-cap-svcs/wdpr-cap-rev-rec-svc)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`
  - Purpose: Revenue recognition service

**Jira Prefix**: `TIMON-`

---

## Smart Payment Routing (SPR)

**Purpose**: Intelligent payment routing and optimization

**Base Path**: `/Users/ricardo.sanchez/Workspace/Disney/SANCR225/Smart Payment Routing`

**Repositories**:
- **Documentation**: `spr-docs` (Smart Payment Routing/spr-docs)
  - Tech: MkDocs, Markdown
  - Entry: `docs/`
  - Purpose: Architecture, API docs, runbooks
  
- **Router**: `spr-router` (Smart Payment Routing/spr-router)
  - Tech: Go
  - Entry: `cmd/`, `internal/`
  - Purpose: Core routing service
  
- **Simulator**: `spr-sim` (Smart Payment Routing/spr-sim)
  - Tech: Python
  - Entry: `src/`
  - Purpose: Testing and simulation
  
- **AI Adapter**: `spr-ai-adapter` (Smart Payment Routing/spr-ai-adapter)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`
  - Purpose: AI integration layer

**Jira Prefix**: `SPR-`

---

## TRP|PAP (Transaction Research Portal | Payment Admin Portal)

**Purpose**: Transaction Research Portal and Payment Admin Portal

**Repositories**:
- **UI**: `wdpr-payment-control-client` (../wdpr-payment-control-client)
  - Tech: Angular, TypeScript
  - Entry: `src/app/`
  
- **WebAPI**: `dpay-admin-inquiry-webapi` (../wdpay-admin-inquiry-webapi)
  - Tech: Node.js, Express
  - Entry: `src/controllers/`
  
- **Backend**: `wdpr-app-inquiry-service` (../wdpr-app-inquiry-service)
  - Tech: Java, Spring Boot
  - Entry: `src/main/java/`
  
- **Legacy UI**: `dpay-admin-inquiry-ui-client` (../dpay-admin-inquiry-ui-client)
  - Tech: Angular (older version)
  - Status: Maintain backwards compatibility
  - Entry: `src/app/`

**Jira Prefix**: `DPAY-`

---

## Usage

When analyzing a Jira story:
1. Extract project prefix (DPAY, GCP, TIMON, SPR, TRP, PAP)
2. Map to correct repositories
3. Identify which repos need changes based on story scope
4. Navigate to correct directories

Example:
- `DPAY-14337` → Config Studio → UI + WebAPI + Backend
- `GCP-5678` → GCP → UI + WebAPI + Backend (+ Legacy UI if needed)
- `TIMON-7590` → CAP → Backend (wdpr-cap-rev-rec-svc)
- `SPR-1234` → Smart Payment Routing → Router + AI Adapter + Docs
