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

---

## Usage

When analyzing a Jira story:
1. Extract project prefix (DPAY, GCP)
2. Map to correct repositories
3. Identify which repos need changes based on story scope
4. Navigate to correct directories

Example:
- `DPAY-14337` → Config Studio → UI + WebAPI + Backend
- `GCP-5678` → GCP → UI + WebAPI + Backend (+ Legacy UI if needed)
