# Project Mappings

## REMY Automation Platform

**Purpose**: REMY Automation Platform

**Repositories**:
- **CQE**: `remy-web-test-automation` (`/Users/john.lozano/Documents/Projects/Globant/Disney/Remy/remy-webTestAutomation/remy-web-test-automation`)
  - Tech: Node.js, Selenium
  - Entry: `.`

- **STUI**: `standalone_tickets` (`/Users/john.lozano/Documents/Projects/Globant/Disney/Remy/STUI/standalone_tickets`)
  - Tech: Python, Behave, Selenium, rest
  - Entry: `.`

- **JOBS**: `jenkins-config` (`/Users/john.lozano/Documents/Projects/Globant/Disney/Remy/Jenkins-Jobs/jenkins-config`)
  - Tech: Groovy, Jenkins Job DSL
  - Entry: `.`

- **DS_API**: `dnxdmnsvctest` (`/Users/john.lozano/Documents/Projects/Globant/Disney/Remy/FnB_Backend_Collections/dnxdmnsvctest`)
  - Tech: Postman Collections, JavaScript (Postman scripts)
  - Entry: `.`
  - Purpose: Legacy API test scripts for Domain Services (candidate for migration to STUI)

**Jira Prefix**: `REMY-`

---

## Usage

When analyzing a Jira story:
1. Extract project prefix (DPAY, GCP, TIMON, SPR, TRP, PAP, REMY)
2. Map to correct repositories
3. Identify which repos need changes based on story scope
4. Navigate to correct directories

Example:
- `DPAY-14337` → Config Studio → UI + WebAPI + Backend
- `GCP-5678` → GCP → UI + WebAPI + Backend (+ Legacy UI if needed)
- `TIMON-7590` → CAP → Backend (wdpr-cap-rev-rec-svc)
- `SPR-1234` → Smart Payment Routing → Router + AI Adapter + Docs
- `REMY-XXXXX` → REMY Automation → STUI + CQE + JOBS + DS_API
