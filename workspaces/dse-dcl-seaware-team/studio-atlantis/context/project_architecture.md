# Studio Atlantis — Project Architecture

## GitHub Repos (Container Packaging)

These are **docker-only** repos — no application source code. They package Versonix WAR artifacts from Nexus3 into Docker images for deployment.

### Shared Base Image
All use: `wdpr-ra-docker-base-tomcat-tc8jre8:v2` (Tomcat 8 / JRE 8)

---

### dcl-apps-dclseawarefull-analytics

**Source:** `github.disney.com/dcl-applications/dcl-apps-dclseawarefull-analytics` (branch: `develop`)

| Property | Value |
|----------|-------|
| Artifact | `analytics-etl` WAR from Nexus3 (`versonix/dclseawarefull/analytics-etl/`) |
| Database | Oracle (includes `ojdbc6.jar`) |
| Security | `ENABLE_SECURE_PORTS=true` (Last Mile Security) |
| Deploy Path | `$CATALINA_HOME/webapps/analytics-etl.war` |

---

### dcl-apps-dclseawarefull-ccui

**Source:** `github.disney.com/dcl-applications/dcl-apps-dclseawarefull-ccui` (branch: `develop`)

| Property | Value |
|----------|-------|
| Artifact | `callcenterui` WAR from Nexus3 (`versonix/dclseawarefull/callcenterui/`) |
| Purpose | Seaware Touch — agent-facing call center UI |
| Security | `ENABLE_SECURE_PORTS=true`, IDP SAML configs, payment PEM/keys |
| Deploy Path | `$CATALINA_HOME/webapps/callcenterui.war` |
| Config | Properties override files, IDP XML, payment certs |

---

### dcl-apps-dclseawarefull-otaapi

**Source:** `github.disney.com/dcl-applications/dcl-apps-dclseawarefull-otaapi` (branch: `develop`)

| Property | Value |
|----------|-------|
| Artifact | `ota` WAR from Nexus3 (`versonix/dclseawarefull/ota/`) |
| Purpose | OTA (Open Travel Alliance) API — industry-standard booking interface |
| Deploy Path | `$CATALINA_HOME/webapps/otaapi.war` |
| Config | Custom Tomcat `conf/` files |

---

### dcl-apps-dclseawarefull-jease-cms

**Status:** Repo not accessible / may not exist on GitHub. JEase CMS containers are managed via GitLab (`gitlab.disney.com/dse/container-applications/seaware/seaware-jease`).

---

## GitLab Repos (Infrastructure)

| Repo | Purpose | Stack |
|------|---------|-------|
| `container-applications/seaware/seaware-inventory` | Seaware Inventory node containers | Docker / Versonix |
| `container-applications/seaware/seaware-jease` | CMS/JEase containers | Docker / Versonix |
| `container-applications/seaware/seaware-swtouch` | Seaware Touch UI containers | Docker / Versonix |
| `container-applications/seaware/amadeus_service` | Amadeus air ticketing sync | Docker |
| `container-applications/seaware/activemq` | ActiveMQ message broker | Docker / ActiveMQ |
| `ansible-playbooks/seawarefull` | Deployment automation | Ansible / AWX |
| `container-applications/seaware/solarwinds-database-performance-analyzer` | DB monitoring | DPA |

## Deployment Pattern
```
Versonix delivers WAR → Nexus3
    ↓
GitHub/GitLab repo (Dockerfile downloads WAR at build time)
    ↓
CI builds Docker image → ECR
    ↓
Ansible/AWX deploys to ECS/EC2
```

## Notes
- These repos are maintained by the Platform team (Atlantis) for packaging vendor artifacts
- No custom application logic — all business logic is in the WAR files from Versonix
- Version pinning is done via `ARG CODE_VERSION` in Dockerfiles
- Credentials for Nexus3 downloads are embedded in build args (should be moved to secrets)
