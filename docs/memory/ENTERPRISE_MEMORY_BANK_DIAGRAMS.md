# Enterprise Memory Bank — Before & After

## Before: Current Architecture

Each workspace is self-contained. Projects duplicate service knowledge in their own memory banks. No shared service or channel context.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#2d1b4e', 'primaryTextColor': '#e0d0ff', 'primaryBorderColor': '#7c5caa', 'lineColor': '#7c5caa', 'secondaryColor': '#1a1030', 'tertiaryColor': '#0d0d1a', 'fontFamily': 'Segoe UI, Arial', 'fontSize': '14px'}}}%%

graph TD
    classDef shared fill:#0d2847,stroke:#4ea8de,color:#fff,stroke-width:2px
    classDef workspace fill:#2d1b4e,stroke:#b56eff,color:#fff,stroke-width:2px
    classDef project fill:#3b2069,stroke:#b56eff,color:#e0d0ff,stroke-width:1px
    classDef memory fill:#1a1030,stroke:#7c5caa,color:#c0b0e0,stroke-width:1px,stroke-dasharray:4
    classDef problem fill:#3d0000,stroke:#ff4444,color:#ff6b6b,stroke-width:2px,stroke-dasharray:4

    SHARED["📚 shared/context/<br/>golden_rules.md<br/>project_mappings.md"]:::shared

    subgraph WS_PC["🏢 payments-core workspace"]
        direction TB
        PC_CFG["workspace.json<br/>profiles: dev-core, dev-web, qa, ops"]:::workspace
        subgraph PC_PROJECTS["Projects"]
            direction LR
            P1["wdpr-config-services"]:::project
            P2["wdpr-payment-controls-api"]:::project
            P3["wdpr-payment-controls-client"]:::project
        end
        P1_MB["memory-bank/<br/>tech.md, product.md<br/>guidelines.md, structure.md"]:::memory
        P2_MB["memory-bank/<br/>tech.md, product.md<br/>guidelines.md, structure.md"]:::memory
        P3_MB["memory-bank/<br/>tech.md, product.md<br/>guidelines.md, structure.md"]:::memory
    end

    subgraph WS_DTA["🏢 dta-team workspace"]
        direction TB
        DTA_CFG["workspace.json<br/>profiles: dev-core, dev-web"]:::workspace
        DTA_P1["cart-service-java8"]:::project
        DTA_MB["memory-bank/<br/>tech.md, product.md"]:::memory
    end

    subgraph WS_UAD["🏢 uad-ongoing workspace"]
        direction TB
        UAD_CFG["workspace.json<br/>profiles: dev-core, dev-web"]:::workspace
        UAD_P1["uad-project"]:::project
        UAD_MB["memory-bank/<br/>tech.md, product.md"]:::memory
    end

    SHARED -->|"inherited by all"| WS_PC
    SHARED -->|"inherited by all"| WS_DTA
    SHARED -->|"inherited by all"| WS_UAD

    P1 --- P1_MB
    P2 --- P2_MB
    P3 --- P3_MB
    DTA_P1 --- DTA_MB
    UAD_P1 --- UAD_MB

    DUP1["⚠️ Cart Service API docs<br/>duplicated in each project<br/>that uses it"]:::problem
    DUP2["⚠️ Channel flow docs<br/>duplicated per project"]:::problem
    DUP3["⚠️ No enterprise architecture<br/>glossary, or API standards"]:::problem

    P1_MB -.-> DUP1
    DTA_MB -.-> DUP1
    P2_MB -.-> DUP2
    UAD_MB -.-> DUP2
    SHARED -.-> DUP3
```

### Problems with current model

| # | Problem                                                      | Impact                                                                                  |
|---|--------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| 1 | **Service knowledge duplicated** across project memory banks | Cart Service API docs exist in 3+ places, drift over time                               |
| 2 | **No channel context**                                       | Each project re-documents DTC/TTC/UAD flows independently                               |
| 3 | **Shared knowledge is thin**                                 | Only golden_rules.md and project_mappings.md — no architecture, glossary, API standards |
| 4 | **No cross-project references**                              | Projects can't declare "I depend on Cart Service" — they copy-paste                     |

---

## After: Enterprise Memory Bank

Shared service and channel banks are the single source of truth. Workspaces declare which services and channels they need. `koda install` resolves references and flattens context for agents.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#0d0d1a', 'primaryTextColor': '#ccc', 'primaryBorderColor': '#444', 'lineColor': '#666', 'secondaryColor': '#0d0d1a', 'tertiaryColor': '#0d0d1a', 'fontFamily': 'Segoe UI, Arial', 'fontSize': '14px'}}}%%

graph TD
    classDef shared fill:#0d2847,stroke:#4ea8de,color:#fff,stroke-width:2px
    classDef service fill:#0a3328,stroke:#2dd4a8,color:#d0ffe8,stroke-width:2px
    classDef channel fill:#3d2800,stroke:#fca311,color:#ffe0a0,stroke-width:2px
    classDef workspace fill:#2d1b4e,stroke:#b56eff,color:#fff,stroke-width:2px
    classDef project fill:#3b2069,stroke:#b56eff,color:#e0d0ff,stroke-width:1px
    classDef runtime fill:#1a3a1a,stroke:#66cc66,color:#d0ffd0,stroke-width:2px

    subgraph SHARED["📚 SHARED KNOWLEDGE"]
        direction LR
        S1["golden_rules.md"]:::shared
        S2["enterprise_architecture.md"]:::shared
        S3["domain_glossary.md"]:::shared
        S4["api_standards.md"]:::shared
        S5["security_compliance.md"]:::shared
    end

    subgraph SERVICES["⚙️ SERVICE BANKS"]
        direction LR
        SVC_CART["🛒 cart-service/<br/>api-contracts.md<br/>architecture.md<br/>endpoints.md"]:::service
        SVC_ORDER["📦 order-service/<br/>api-contracts.md<br/>architecture.md"]:::service
        SVC_PEOS["💳 peos/<br/>api-contracts.md<br/>patterns.md"]:::service
        SVC_EVAS["🎫 evas-tms/<br/>api-contracts.md"]:::service
        SVC_MORE["...more services"]:::service
    end

    subgraph CHANNELS["📡 CHANNEL BANKS"]
        direction LR
        CH_DTC["🌐 digital-dtc/<br/>flows.md<br/>channel-contracts.md"]:::channel
        CH_TTC["🎟️ ttc/<br/>flows.md<br/>error-handling.md"]:::channel
        CH_UAD["📱 uad/<br/>flows.md"]:::channel
    end

    subgraph WS_TEP3["🎯 tep3 workspace"]
        direction TB
        TEP3_CFG["workspace.json<br/>profiles: dev-core, dev-web, dev-mobile<br/><b>services: cart, order, peos, evas</b><br/><b>channels: digital-dtc, ttc</b>"]:::workspace
        TEP3_P1["tep3-standalone"]:::project
    end

    subgraph WS_DRP["🎯 dlr-dynamic-pricing workspace"]
        direction TB
        DRP_CFG["workspace.json<br/>profiles: dev-core, dev-web<br/><b>services: cart, order</b><br/><b>channels: digital-dtc</b>"]:::workspace
        DRP_P1["dlr-pricing-api"]:::project
    end

    subgraph WS_UAD2["🎯 uad-ongoing workspace"]
        direction TB
        UAD2_CFG["workspace.json<br/>profiles: dev-core, dev-mobile<br/><b>services: cart, peos</b><br/><b>channels: uad</b>"]:::workspace
        UAD2_P1["uad-mobile-app"]:::project
    end

    SHARED -->|"inherited by all"| WS_TEP3
    SHARED -->|"inherited by all"| WS_DRP
    SHARED -->|"inherited by all"| WS_UAD2

    SVC_CART -->|"referenced"| WS_TEP3
    SVC_ORDER -->|"referenced"| WS_TEP3
    SVC_PEOS -->|"referenced"| WS_TEP3
    SVC_EVAS -->|"referenced"| WS_TEP3

    SVC_CART -->|"referenced"| WS_DRP
    SVC_ORDER -->|"referenced"| WS_DRP

    SVC_CART -->|"referenced"| WS_UAD2
    SVC_PEOS -->|"referenced"| WS_UAD2

    CH_DTC -->|"referenced"| WS_TEP3
    CH_TTC -->|"referenced"| WS_TEP3
    CH_DTC -->|"referenced"| WS_DRP
    CH_UAD -->|"referenced"| WS_UAD2

    subgraph RUNTIME["🔧 Agent Runtime (flat context)"]
        direction LR
        R1["svc-cart-service.md"]:::runtime
        R2["svc-order-service.md"]:::runtime
        R3["svc-peos.md"]:::runtime
        R4["ch-digital-dtc.md"]:::runtime
        R5["golden_rules.md"]:::runtime
    end

    WS_TEP3 -->|"koda install<br/>resolves & flattens"| RUNTIME
```


> **Color Legend:**
> 🔵 Blue = Shared Knowledge (read-only foundation) ·
> 🟢 Teal = Service Banks (backend services) ·
> 🟠 Amber = Channel Banks (sales channels) ·
> 🟣 Purple = Workspaces (team-owned) ·
> 🟩 Green = Agent Runtime (flat output)

### What changes

| # | Before                               | After                                                                   |
|---|--------------------------------------|-------------------------------------------------------------------------|
| 1 | Cart Service docs in 3+ memory banks | **One** `shared/services/cart-service/` — all projects reference it     |
| 2 | No channel context                   | `channels/digital-dtc/`, `channels/ttc/` etc. — referenced by workspace |
| 3 | Thin shared knowledge                | Enterprise architecture, glossary, API standards, security docs         |
| 4 | Copy-paste between projects          | `services: [cart-service]` in workspace.json — `koda install` resolves  |
| 5 | Agents see nested dirs               | Agents see **flat** `~/.kiro/context/` with merged files                |

---

## Data Flow: How `koda workspace apply tep3` works

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#2d1b4e', 'primaryTextColor': '#fff', 'primaryBorderColor': '#b56eff', 'lineColor': '#b56eff', 'secondaryColor': '#0d2847', 'actorBkg': '#0d0d1a', 'actorBorder': '#b56eff', 'actorTextColor': '#fff', 'activationBkgColor': '#2d1b4e', 'activationBorderColor': '#b56eff', 'signalColor': '#ccc', 'signalTextColor': '#fff', 'noteBkgColor': '#0d2847', 'noteBorderColor': '#4ea8de', 'noteTextColor': '#fff', 'fontFamily': 'Segoe UI, Arial', 'fontSize': '14px'}}}%%

sequenceDiagram
    participant User
    participant Koda
    participant Workspace as workspace.json
    participant Shared as shared/context/
    participant Services as shared/services/
    participant Channels as channels/
    participant Target as ~/.kiro/context/

    User->>Koda: koda workspace apply tep3
    Koda->>Workspace: Read tep3/workspace.json
    Note over Workspace: profiles: [dev-core, dev-web]<br/>services: [cart, order, peos]<br/>channels: [digital-dtc, ttc]

    Koda->>Koda: Install profiles (dev-core, dev-web)

    Koda->>Shared: Copy golden_rules.md, api_standards.md...
    Shared-->>Target: golden_rules.md, api_standards.md

    Koda->>Services: Read cart-service/*.md
    Services-->>Target: svc-cart-service.md (merged)
    Koda->>Services: Read order-service/*.md
    Services-->>Target: svc-order-service.md (merged)
    Koda->>Services: Read peos/*.md
    Services-->>Target: svc-peos.md (merged)

    Koda->>Channels: Read digital-dtc/*.md
    Channels-->>Target: ch-digital-dtc.md (merged)
    Koda->>Channels: Read ttc/*.md
    Channels-->>Target: ch-ttc.md (merged)

    Note over Target: Agent sees flat context:<br/>golden_rules.md<br/>api_standards.md<br/>svc-cart-service.md<br/>svc-order-service.md<br/>svc-peos.md<br/>ch-digital-dtc.md<br/>ch-ttc.md

    Koda-->>User: ✅ Workspace applied (5 services, 2 channels)
```
