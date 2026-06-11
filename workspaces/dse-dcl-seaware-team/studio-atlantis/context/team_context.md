# Studio Atlantis — Platform & Infrastructure

## Mission
Platform engineering, security posture, change/release management, and vendor application ownership for all Versonix products across DCL and ABD.

## Team
| Role | Name |
|------|------|
| Tech Lead / Manager | Ken Sias |
| Business Analysis | Kama Kugler |
| Project Manager | Hareesha Rodda |
| Lead Product Manager | Daniel Hutson |
| Financial PM Lead | Robyn Turpish |
| Scrum Master | Christopher Furtado |
| Dev | Matt Mezydlo, David Venegas |

## Business Context
Atlantis is the **infrastructure backbone** of SEAS. It doesn't build customer-facing features directly — instead it ensures the Seaware reservation engine (owned by Versonix) runs reliably, securely, and is upgraded on schedule. The studio coordinates release trains with Versonix for fix versions, manages the ActiveMQ messaging backbone, and owns all deployment automation via Ansible/AWX.

## Supported BAPPs

### Versonix (DCL)
- BAPP0248478 — DCL Vx BizLogic & Batch
- BAPP0248480 — DCL Vx Inventory
- BAPP0248482 — DCL Vx OTA API
- BAPP0248488 — DCL Vx Seaware Main
- BAPP0248490 — DCL Vx Seaware Touch & CMS
- BAPP0248486 — DCL Vx Seaware Historical

### Versonix (ABD)
- BAPP0248406 — ABD Vx BizLogic & Batch
- BAPP0248410 — ABD Vx Inventory
- BAPP0243192 — ABD Vx Seaware Main
- BAPP0243194 — ABD Vx Seaware Historical

### Non-Versonix Vendor
- BAPP0012368 — DCL Amadeus Air
- BAPP0248444 — DCL Amadeus Async
- BAPP0080251 — DCL Amadeus Management Center (AMC)
- BAPP0007031 — DCL TravCom
- BAPP0248414 — SEAS ActiveMQ
- BAPP0245020 — Seaware Ignite DPA

## Repositories

### GitLab (`gitlab.disney.com/dse/`)
| Repo | Purpose |
|------|---------|
| `container-applications/seaware/seaware-inventory` | Inventory node containers |
| `container-applications/seaware/seaware-jease` | CMS/JEase containers |
| `container-applications/seaware/seaware-swtouch` | Seaware Touch UI |
| `container-applications/seaware/amadeus_service` | Amadeus sync |
| `container-applications/seaware/activemq` | ActiveMQ broker |
| `ansible-playbooks/seawarefull` | Ansible deployment playbooks |
| `container-applications/seaware/solarwinds-database-performance-analyzer` | DPA |

### GitHub (`github.disney.com/`)
| Repo | Purpose |
|------|---------|
| `dcl-applications/dcl-apps-dclseawarefull-analytics` | Seaware analytics |
| `dcl-applications/dcl-apps-dclseawarefull-ccui` | Seaware Touch & CMS UI |
| `dcl-applications/dcl-apps-dclseawarefull-jease-cms` | JEase CMS |
| `dcl-applications/dcl-apps-dclseawarefull-otaapi` | OTA API |
| `dse-infra-config/dcl-pci-B0012443-use1-lst-seashore-aps-builder` | PCI infra |

## Architecture
- **Deployment:** Versonix artifacts from Nexus3 → Ansible playbooks → AWS EC2/ECS
- **Messaging:** ActiveMQ (JMS) backbone for all inter-service async communication
- **Inventory nodes:** Sharded Seaware inventory serving cabin/pricing availability
- **Monitoring:** Grafana (RDS, ECS, EC2), AppDynamics, Splunk alerts
- **Release flow:** Versonix delivers fix version → Atlantis validates → staged rollout across environments

## Products
- Seaware core reservation engine (Versonix)
- Seaware Touch (agent UI)
- CMS (Content Management)
- Amadeus Air ticketing
- ActiveMQ messaging infrastructure
- Inventory node cluster management
