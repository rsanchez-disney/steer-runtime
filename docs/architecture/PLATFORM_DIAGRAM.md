# Steer Platform — High-Level Architecture Diagram

## Full Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1a1a2e', 'primaryTextColor': '#eee', 'lineColor': '#74b9ff', 'fontSize': '14px'}}}%%
graph TB
    %% === User Layer ===
    subgraph users["👤 Users"]
        dev["Developer"]
        ba["BA / PO"]
        qa["QA Engineer"]
        pm["PM / Scrum Master"]
        ops["Ops / SRE"]
        lead["Leadership"]
    end

    %% === IDE Runtime Layer ===
    subgraph ides["🖥️ IDE Runtimes"]
        kiro["Kiro CLI<br/>(primary runtime)"]
        cursor["Cursor IDE<br/>(.mdc rules)"]
        amazonq["Amazon Q<br/>(.md rules)"]
        kite["Kite Desktop<br/>(Tauri + React)"]
    end

    %% === Management Layer ===
    subgraph mgmt["⚙️ Koda — Go CLI + TUI"]
        install["install / sync"]
        upgrade["upgrade / auto-update"]
        workspaces["workspace apply"]
        doctor["doctor / check"]
        chat["chat / delegate"]
        teams["agent teams"]
    end

    %% === steer-runtime Core ===
    subgraph steer["📦 steer-runtime"]
        subgraph profiles["Profiles — 20"]
            devcore["dev-core (20)"]
            qaprof["qa (16)"]
            baprof["ba (8)"]
            pmprof["pm (6)"]
            opsprof["ops (9)"]
            more["+ 15 more"]
        end

        subgraph agents["Agents — 115 unique"]
            orch["orchestrator"]
            planner["planner"]
            backend["backend"]
            reviewer["code_review"]
            security["security_scanner"]
            moreag["...110 more"]
        end

        subgraph shared["Shared Resources"]
            rules["22 Coding Rules"]
            context["Context Files"]
            hooks["Hooks"]
            steering["Steering Rules"]
        end

        subgraph ws["Workspaces — 22 teams"]
            wsjson["workspace.json"]
        end
    end

    %% === MCP Integration Layer ===
    subgraph mcp["🔌 MCP Servers — 13"]
        jira["jira-mcp"]
        confluence["confluence-mcp"]
        github["github-mcp"]
        splunk["splunk-mcp"]
        snow["servicenow-mcp"]
        appd["appdynamics-mcp"]
        figma["figma-mcp"]
        sharepoint["sharepoint-mcp"]
        qtest["qtest-mcp"]
        chrome["chrome-mcp"]
        bruno["bruno-mcp"]
        memorymcp["memory-mcp"]
        mermaidmcp["mermaid-mcp"]
    end

    %% === External Systems ===
    subgraph external["🌐 External Systems"]
        jiraext["Jira"]
        confext["Confluence"]
        ghext["GitHub"]
        splunkext["Splunk"]
        snowext["ServiceNow"]
        appdext["AppDynamics"]
        figmaext["Figma"]
        spext["SharePoint"]
    end

    %% === Memory Layer ===
    subgraph mem["🧠 Persistent Memory"]
        yax["Yax<br/>(observations, sessions, graph)"]
        membank["Memory Banks<br/>(per-project knowledge)"]
    end

    %% === Distribution ===
    subgraph dist["📤 Distribution"]
        ghpub["GitHub Releases"]
        autoupd["Auto-update (daily 9 AM)"]
        tarball["Encrypted Tarballs"]
    end

    %% === Connections ===
    users --> ides
    ides --> mgmt
    mgmt --> steer
    steer --> agents
    profiles --> agents
    ws --> profiles

    agents --> mcp
    mcp --> external

    agents --> mem
    mgmt --> dist
    dist --> mgmt

    %% === Styling ===
    style users fill:#2d3436,stroke:#00b894,color:#fff,stroke-width:2px
    style ides fill:#0984e3,stroke:#74b9ff,color:#fff,stroke-width:2px
    style mgmt fill:#6c5ce7,stroke:#a29bfe,color:#fff,stroke-width:2px
    style steer fill:#1e3a5f,stroke:#00b894,color:#fff,stroke-width:2px
    style profiles fill:#1a472a,stroke:#00b894,color:#fff
    style agents fill:#1a472a,stroke:#00b894,color:#fff
    style shared fill:#1a472a,stroke:#00b894,color:#fff
    style ws fill:#1a472a,stroke:#00b894,color:#fff
    style mcp fill:#4a1a1a,stroke:#e17055,color:#fff,stroke-width:2px
    style external fill:#2d3436,stroke:#636e72,color:#dfe6e9,stroke-width:2px
    style mem fill:#3d3100,stroke:#fdcb6e,color:#ffeaa7,stroke-width:2px
    style dist fill:#3d1010,stroke:#d63031,color:#ff7675,stroke-width:2px
```

## Simplified Version (for slides)

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1a1a2e', 'primaryTextColor': '#eee', 'lineColor': '#e94560'}}}%%
graph LR
    subgraph Users[" "]
        U["👤 Dev · BA · QA · PM · Ops · Leadership"]
    end

    subgraph Runtime[" "]
        R["🖥️ Kiro CLI · Cursor · Amazon Q · Kite"]
    end

    subgraph Koda[" "]
        K["⚙️ Koda — install · sync · upgrade · chat · teams"]
    end

    subgraph Platform[" "]
        P["📦 steer-runtime — 20 Profiles · 115 Agents · 22 Rules · 22 Workspaces"]
    end

    subgraph MCP[" "]
        M["🔌 Jira · Confluence · GitHub · Splunk · ServiceNow · AppDynamics · Figma · SharePoint"]
    end

    subgraph Memory[" "]
        Y["🧠 Yax (persistent memory) · Memory Banks"]
    end

    U --> R --> K --> P --> MCP
    P --> Y

    style Users fill:#2d3436,stroke:#00b894,color:#fff,stroke-width:2px
    style Runtime fill:#0984e3,stroke:#74b9ff,color:#fff,stroke-width:2px
    style Koda fill:#6c5ce7,stroke:#a29bfe,color:#fff,stroke-width:2px
    style Platform fill:#1e3a5f,stroke:#00b894,color:#fff,stroke-width:2px
    style MCP fill:#4a1a1a,stroke:#e17055,color:#fff,stroke-width:2px
    style Memory fill:#3d3100,stroke:#fdcb6e,color:#ffeaa7,stroke-width:2px
```
