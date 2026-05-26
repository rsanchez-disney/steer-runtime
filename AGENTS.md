# Kiro Agents Reference

Complete reference for all agents across profiles.

## Agent Hierarchy

```mermaid
graph TD
    classDef orch fill:#4a90d9,stroke:#2c5f8a,color:#fff,font-weight:bold
    classDef agent fill:#f0f4f8,stroke:#8ba4c4,color:#1a1a1a
    classDef mcp fill:#e8f5e9,stroke:#66bb6a,color:#2e7d32,font-size:11px
    classDef tool fill:#fff3e0,stroke:#ffa726,color:#e65100,font-size:11px

    %% ─── dev-core ──────────────────────────────────
    subgraph DEV_CORE["dev-core · 21 agents"]
        ORCH["🎯 orchestrator<br/><i>thinking · todo · delegate</i>"]:::orch
        ORCH --> PLAN["planner<br/><i>jira · confluence · mywiki</i>"]:::agent
        ORCH --> STORY["story_analyzer<br/><i>jira · confluence · mywiki · github · knowledge</i>"]:::agent
        ORCH --> ARCH["architecture<br/><i>thinking · knowledge</i>"]:::agent
        ORCH --> BCTX["bounded_context"]:::agent
        ORCH --> ADR["adr_writer"]:::agent
        ORCH --> ASPEC["architecture_spec"]:::agent
        ORCH --> EXPLORE["codebase_explorer"]:::agent
        ORCH --> REVIEW["code_review<br/><i>jira · github</i>"]:::agent
        ORCH --> SEC["security_scanner"]:::agent
        ORCH --> COMPLY["compliance"]:::agent
        ORCH --> TEST["test_runner"]:::agent
        ORCH --> PERF["performance"]:::agent
        ORCH --> PR["pr_creator<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        ORCH --> DISC["discussion"]:::agent
        ORCH --> WRITER["technical_writer<br/><i>confluence · mywiki · github</i>"]:::agent
    end

    %% ─── dev-web ───────────────────────────────────
    subgraph DEV_WEB["dev-web · 5 agents"]
        BACK["backend<br/><i>bruno</i>"]:::agent
        WAPI["webapi<br/><i>bruno</i>"]:::agent
        UI["ui<br/><i>figma</i>"]:::agent
        UX["ux_specialist<br/><i>figma</i>"]:::agent
        ASTRO["astro<br/><i>figma</i>"]:::agent
    end

    %% ─── dev-mobile ────────────────────────────────
    subgraph DEV_MOB["dev-mobile · 3 agents"]
        FLUTTER["flutter<br/>"]:::agent
        ANDROID["android_native<br/>"]:::agent
        IOS["ios_native<br/>"]:::agent
    end


    %% ─── dev-python ────────────────────────────────
    subgraph DEV_PY["dev-python · 1 agent"]
        PYTHON["python<br/>"]:::agent
    end

    %% ─── dev-ai ────────────────────────────────────
    subgraph DEV_AI["dev-ai · 5 agents"]
        AI_ORCH["ai_orchestrator<br/>"]:::agent
        MLENGINEER["ml_engineer<br/>"]:::agent
        DATASCI["data_scientist<br/>"]:::agent
        LLMENG["llm_engineer<br/>"]:::agent
        MLOPS["mlops_engineer<br/>"]:::agent
        AI_ORCH --> MLENGINEER
        AI_ORCH --> DATASCI
        AI_ORCH --> LLMENG
        AI_ORCH --> MLOPS
    end

    %% ─── dev-infra ─────────────────────────────────
    subgraph DEV_INFRA["dev-infra · 1 agent"]
        TERRAFORM["terraform<br/>"]:::agent
    end

    %% ─── dev-dotnet ──────────────────────────────────
    subgraph DEV_DOTNET["dev-dotnet · 3 agents"]
        DOTNET_SENIOR["dotnet_senior_agent"]:::agent
        DOTNET_API["dotnet_self_host_api_agent"]:::agent
        DOTNET_SERVERLESS["dotnet_serverless_agent"]:::agent
    end

    %% ─── dev-php ───────────────────────────────────
    subgraph DEV_PHP["dev-php · 1 agent"]
        PHP["php_agent<br/>"]:::agent
    end

    %% ─── dev-ui ────────────────────────────────────
    subgraph DEV_UI["dev-ui · 3 agents"]
        UI_LEGACY["ui_legacy<br/><i>Angular v12–v18+ · confluence · mywiki</i>"]:::agent
        POLYMER["polymer<br/><i>Polymer 2/3 · confluence · mywiki</i>"]:::agent
        LAMBDA["lambda<br/><i>AWS Lambda Node.js</i>"]:::agent
    end

    %% ─── ba ────────────────────────────────────────
    subgraph BA["ba · 8 agents"]
        BA_ORCH["🎯 ba_orchestrator<br/><i>jira · confluence · mywiki · github<br/>thinking · todo · delegate</i>"]:::orch
        BA_ORCH --> SCOPE["scope_definer<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        BA_ORCH --> FEAT["feature_writer<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        BA_ORCH --> PRD["prd_generator<br/><i>jira · confluence</i>"]:::agent
        BA_ORCH --> BLOG["backlog_generator<br/><i>jira</i>"]:::agent
        BA_ORCH --> QGATE["quality_gate"]:::agent
        BA_ORCH --> ESTIM["estimation<br/><i>jira · confluence</i>"]:::agent
        BA_ORCH --> REQS["requirements_analyst<br/><i>jira · confluence · mywiki · github · knowledge</i>"]:::agent
    end

    %% ─── qa ────────────────────────────────────────
    subgraph QA["qa · 16 agents"]
        QA_ORCH["🎯 qa_orchestrator<br/><i>jira · confluence · mywiki · github · bruno<br/>thinking · todo · delegate</i>"]:::orch
        QA_ORCH --> TPLAN["test_planner<br/><i>jira · confluence · mywiki · github · bruno · knowledge</i>"]:::agent
        QA_ORCH --> TAUTO["test_automation<br/><i>bruno</i>"]:::agent
        QA_ORCH --> DEFECT["defect_analyst<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        QA_ORCH --> APITEST["api_tester<br/><i>bruno</i>"]:::agent
        QA_ORCH --> PERFTEST["performance_tester"]:::agent
        QA_ORCH --> QESTRAT["qe_strategy<br/><i>jira · confluence</i>"]:::agent
        QA_ORCH --> E2EGEN["e2e_test_generator<br/><i>jira</i>"]:::agent
        QA_ORCH --> WEBDISC["web_discovery"]:::agent
        QA_ORCH --> TESTFW["test_framework"]:::agent
        QA_ORCH --> TCOV["test_coverage_analyzer<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        QA_ORCH --> FLAKY["flaky_test_fixer"]:::agent
        QA_ORCH --> TREC["test_recorder<br/><i>chrome</i>"]:::agent
        QA_ORCH --> BRUNO["bruno_collection<br/><i>bruno</i>"]:::agent
    end

    %% ─── ops ───────────────────────────────────────
    subgraph OPS["ops · 9 agents"]
        OPS_ORCH["🎯 ops_orchestrator<br/><i>jira · confluence · mywiki · github<br/>thinking · todo · delegate</i>"]:::orch
        OPS_ORCH --> METRICS["ai_metrics<br/><i>jira · confluence · mywiki · github</i>"]:::agent
        OPS_ORCH --> INFRA["infra_check"]:::agent
        OPS_ORCH --> DEPLOY["deployment<br/><i>harness</i>"]:::agent
        OPS_ORCH --> QUALITY["code_quality<br/><i>sonarqube</i>"]:::agent
        OPS_ORCH --> RELMGR["release_manager<br/><i>github · jira</i>"]:::agent
        OPS_ORCH --> RELDOC["release_documenter<br/><i>confluence · github · jira</i>"]:::agent
    end

    %% ─── pm ────────────────────────────────────────
    subgraph PM["pm · 6 agents"]
        PM_ORCH["🎯 pm_orchestrator<br/><i>jira · confluence · mywiki · github<br/>thinking · todo · delegate</i>"]:::orch
        PM_ORCH --> SPRINT["sprint_manager<br/><i>jira · confluence · mywiki · todo</i>"]:::agent
        PM_ORCH --> STANDUP["standup<br/><i>jira</i>"]:::agent
        PM_ORCH --> RETRO["retro<br/><i>jira · confluence · mywiki</i>"]:::agent
        PM_ORCH --> RISK["risk_tracker<br/><i>jira · confluence · mywiki</i>"]:::agent
        PM_ORCH --> DELIVER["delivery_reporter<br/><i>jira · confluence · mywiki</i>"]:::agent
    end

    %% ─── inspector ─────────────────────────────────
    subgraph INSPECTOR["inspector · 10 agents"]
        INSP_ORCH["🎯 inspector_orchestrator<br/><i>yax · thinking · todo · subagent</i>"]:::orch
        INSP_ORCH --> SECREV["security_reviewer"]:::agent
        INSP_ORCH --> DEPAUD["dependency_auditor"]:::agent
        INSP_ORCH --> CONFINSP["config_inspector"]:::agent
        INSP_ORCH --> ACCANA["access_analyst"]:::agent
        INSP_ORCH --> DRIFTDET["drift_detector"]:::agent
        INSP_ORCH --> COMPCHK["compliance_checker"]:::agent
        INSP_ORCH --> ARCHCRIT["architecture_critic"]:::agent
        INSP_ORCH --> PERFAUD["performance_auditor"]:::agent
        INSP_ORCH --> LOGANA["log_analyst"]:::agent
    end


    %% ─── design ────────────────────────────────────
    subgraph DESIGN["design · 6 agents"]
        DES_ORCH["🎯 design_orchestrator<br/><i>confluence · jira<br/>thinking · todo · delegate</i>"]:::orch
        DES_ORCH --> DDISC["design_discovery<br/><i>confluence · jira</i>"]:::agent
        DES_ORCH --> URES["user_research<br/><i>confluence</i>"]:::agent
        DES_ORCH --> UTEST["usability_testing"]:::agent
        DES_ORCH --> DREP["design_research_reporter<br/><i>confluence</i>"]:::agent
        DES_ORCH --> PROTO["prototype_prompt"]:::agent
    end

    %% ─── cloudops ──────────────────────────────────
    subgraph CLOUDOPS["cloudops · 4 agents"]
        COP_ORCH["🎯 cloudops_orchestrator<br/><i>confluence · jira<br/>thinking · todo · delegate</i>"]:::orch
        COP_ORCH --> INFRA["infra_planner<br/><i>confluence</i>"]:::agent
        COP_ORCH --> CFGMGMT["config_management"]:::agent
        COP_ORCH --> RCA["rca_writer<br/><i>confluence · jira</i>"]:::agent
    end

    %% ─── presales ──────────────────────────────────
    subgraph PRESALES["presales · 1 agent"]
        PRESALE["presales_agent<br/><i>confluence · jira</i>"]:::agent
    end

    %% ─── dev alias ─────────────────────────────────
    DEV{{"dev (alias)"}}:::orch
    DEV -.-> DEV_CORE
    DEV -.-> DEV_WEB
    DEV -.-> DEV_MOB
    DEV -.-> DEV_PY
    DEV -.-> DEV_AI
    DEV -.-> DEV_INFRA
    DEV -.-> DEV_DOTNET
    DEV -.-> DEV_PHP
    DEV -.-> DEV_UI

    %% ─── cross-profile delegation ──────────────────
    ORCH -.->|delegates| BACK
    ORCH -.->|delegates| WAPI
    ORCH -.->|delegates| UI
    ORCH -.->|delegates| PYTHON
    ORCH -.->|delegates| AI_ORCH
    ORCH -.->|delegates| TERRAFORM
    ORCH -.->|delegates| FLUTTER
    ORCH -.->|delegates| UI_LEGACY
    ORCH -.->|delegates| POLYMER
    ORCH -.->|delegates| LAMBDA
```

**Legend:** 🎯 = orchestrator (has `thinking`, `todo`, `delegate`) · *italic* = MCP servers and special tools


---

## Dev Profiles (33 agents total)

Development agents split into composable sub-profiles. Use `dev` as a shorthand to install all three.

```bash
koda install dev                    # All 42 dev agents (alias → dev-core + dev-web + dev-mobile + dev-python + dev-ai + dev-infra + dev-dotnet + dev-php + dev-ui)
koda install dev-core dev-web       # Fullstack web developer (21 agents)
koda install dev-core dev-python    # Python developer (17 agents)
koda install dev-core dev-ai        # AI/ML engineer (21 agents)
koda install dev-core dev-infra     # Infra/Terraform developer (17 agents)
koda install dev-core dev-dotnet    # .NET developer (19 agents)
koda install dev-core dev-php       # PHP/Zend developer (17 agents)
koda install dev-core dev-mobile    # Mobile developer (19 agents)
koda install dev-core dev-ui        # L2 Studio legacy UI developer (9 agents)
koda install dev-core               # Core only — orchestrator + quality (17 agents)
```

---

### Profile: dev-core (17 agents)

Orchestrator, planning, quality, security, workflow, and documentation agents. Required base for all dev work.

#### orchestrator
**File:** `profiles/dev-core/agents/orchestrator.json`  
**Purpose:** SDLC orchestrator with automatic multi-agent delegation  
**Use for:** Implementing Jira stories end-to-end, coordinating multi-repo features  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context), preToolUse (guard writes), postToolUse (warn destructive)

**Workflow:**
1. Fetch & validate Jira story
2. Explore codebase
3. Review architecture
4. Create implementation plan
5. Approval gate #1 (user reviews plan)
6. Implement tasks (delegate to specialist agents) — **review mode** pauses after each task for approval; **autopilot** runs straight through
7. Run tests (coverage ≥90%)
8. Code review
9. Security scan
10. Quality report & approval gate #2
11. Create pull request
12. Complete (summary & PR URL)

#### planner_agent
**File:** `profiles/dev-core/agents/planner_agent.json`  
**Purpose:** Task planning and breakdown  
**Use for:** Breaking down complex tasks, creating implementation plans  
**Tools:** `thinking`  
**MCP Servers:** jira, confluence, mywiki

#### story_analyzer_agent
**File:** `profiles/dev-core/agents/story_analyzer_agent.json`  
**Purpose:** Jira story analysis and requirements extraction  
**Use for:** Analyzing Jira stories, extracting requirements  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github

#### architecture_agent
**File:** `profiles/dev-core/agents/architecture_agent.json`  
**Purpose:** Architecture review and design validation  
**Use for:** Reviewing architecture decisions, design patterns  
**Tools:** `thinking`, `knowledge`

#### bounded_context_agent
**File:** `profiles/dev-core/agents/bounded_context_agent.json`  
**Purpose:** Domain boundary analysis using DDD principles  
**Use for:** Identifying bounded contexts, aggregates, context maps

#### adr_writer_agent
**File:** `profiles/dev-core/agents/adr_writer_agent.json`  
**Purpose:** Architecture Decision Records  
**Use for:** Documenting technical decisions with context, alternatives, consequences

#### architecture_spec_agent
**File:** `profiles/dev-core/agents/architecture_spec_agent.json`  
**Purpose:** Target architecture design with diagrams  
**Use for:** Component diagrams, integration patterns, deployment topology

#### codebase_explorer_agent
**File:** `profiles/dev-core/agents/codebase_explorer_agent.json`  
**Purpose:** Code exploration and navigation  
**Use for:** Finding relevant code, understanding structure

#### code_review_agent
**File:** `profiles/dev-core/agents/code_review_agent.json`  
**Purpose:** Code review and quality checks  
**Use for:** Reviewing code changes, identifying issues  
**MCP Servers:** jira, github

#### security_scanner_agent
**File:** `profiles/dev-core/agents/security_scanner_agent.json`  
**Purpose:** Security analysis and vulnerability detection  
**Use for:** Security scans, finding vulnerabilities

#### compliance_agent
**File:** `profiles/dev-core/agents/compliance_agent.json`  
**Purpose:** Compliance validation (golden rules, standards)  
**Use for:** Checking compliance with coding standards

#### test_runner_agent
**File:** `profiles/dev-core/agents/test_runner_agent.json`  
**Purpose:** Test execution and coverage analysis  
**Use for:** Running tests, checking coverage

#### performance_agent
**File:** `profiles/dev-core/agents/performance_agent.json`  
**Purpose:** Performance optimization and analysis  
**Use for:** Performance profiling, optimization suggestions

#### pr_creator_agent
**File:** `profiles/dev-core/agents/pr_creator_agent.json`  
**Purpose:** Pull request creation and management  
**Use for:** Creating PRs, formatting descriptions  
**MCP Servers:** jira, confluence, mywiki, github

#### discussion_agent
**File:** `profiles/dev-core/agents/discussion_agent.json`  
**Purpose:** Technical discussions and decision support  
**Use for:** Technical discussions, architecture decisions

#### technical_writer_agent
**File:** `profiles/dev-core/agents/technical_writer_agent.json`  
**Purpose:** Creates and maintains technical documentation  
**Use for:** READMEs, API docs, architecture guides, runbooks, onboarding materials  
**MCP Servers:** confluence, mywiki, github

#### ai_metrics_tracker_agent
**File:** `profiles/dev-core/agents/ai_metrics_tracker_agent.json`  
**Purpose:** Tracks AI-assisted development sessions and generates productivity metrics  
**Use for:** Branch-based AI productivity tracking, Google Form submission, Jira field updates

#### devops_runner_agent
**File:** `profiles/dev-core/agents/devops_runner_agent.json`  
**Purpose:** Executes builds, tests, git operations, and local dev commands  
**Use for:** Running builds, test suites, git branch/commit/push, linting, formatting

#### splunk_query_agent
**File:** `profiles/dev-core/agents/splunk_query_agent.json`  
**Purpose:** Queries Splunk logs via Chrome MCP browser automation with SSO  
**Use for:** Searching service logs, executing SPL queries, incident investigation  
**MCP Servers:** Chrome MCP

---

### Profile: dev-web (5 agents)

Fullstack web specialists for Config Studio (Java + Node.js + Angular + Astro).

#### backend
**File:** `profiles/dev-web/agents/backend.json`  
**Purpose:** Java services specialist for wdpr-config-services  
**Use for:** Backend API development, database changes, Java services  
**Hooks:** preToolUse (guard writes)

#### webapi
**File:** `profiles/dev-web/agents/webapi.json`  
**Purpose:** Node.js/TypeScript specialist for wdpr-payment-controls-api  
**Use for:** API layer, BFF logic, TypeScript interfaces  
**Hooks:** preToolUse (guard writes)

#### ui
**File:** `profiles/dev-web/agents/ui.json`  
**Purpose:** Angular specialist for wdpr-payment-controls-client  
**Use for:** Frontend development, components, services, routing  
**MCP Servers:** figma  
**Hooks:** preToolUse (guard writes)

#### ux_specialist_agent
**File:** `profiles/dev-web/agents/ux_specialist_agent.json`  
**Purpose:** Accessibility (WCAG 2.1 AA) and UX pattern review  
**Use for:** Accessibility audits, usability reviews, focus management, ARIA compliance  
**MCP Servers:** figma

#### astro
**File:** `profiles/dev-web/agents/astro.json`  
**Purpose:** Astro SSR specialist with React components and TypeScript  
**Use for:** Astro pages, React islands, server actions, Nanostores state  
**MCP Servers:** figma  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

---


### Profile: dev-python (1 agent)

Python specialist for FastAPI, Flask, Django, and general Python development.

#### python
**File:** `profiles/dev-python/agents/python.json`  
**Purpose:** Python development specialist for API services and general Python  
**Use for:** FastAPI/Flask/Django development, pytest, async patterns  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

---

### Profile: dev-ai (5 agents)

AI/ML engineering specialists covering the full lifecycle: data science, model training, LLM applications, and production MLOps.

#### ai_orchestrator
**File:** `profiles/dev-ai/agents/ai_orchestrator.json`  
**Purpose:** Routes and coordinates AI/ML tasks across specialist agents  
**Use for:** Multi-step AI workflows, architecture decisions, task routing

#### ml_engineer
**File:** `profiles/dev-ai/agents/ml_engineer.json`  
**Purpose:** Research-driven ML implementation — training, fine-tuning, evaluation, HF Hub operations  
**Use for:** SFT/DPO/GRPO training, dataset inspection, model evaluation, inference pipelines  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

#### data_scientist
**File:** `profiles/dev-ai/agents/data_scientist.json`  
**Purpose:** Data exploration, statistical modeling, feature engineering, classical ML  
**Use for:** EDA, statistical testing, visualization, scikit-learn/XGBoost, time series  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

#### llm_engineer
**File:** `profiles/dev-ai/agents/llm_engineer.json`  
**Purpose:** LLM application development — RAG, prompt engineering, agent frameworks  
**Use for:** RAG pipelines, vector DBs, LangChain/LlamaIndex, structured output, evaluations  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

#### mlops_engineer
**File:** `profiles/dev-ai/agents/mlops_engineer.json`  
**Purpose:** ML production infrastructure — serving, deployment, monitoring  
**Use for:** vLLM/TGI serving, MLflow, drift detection, CI/CD for models, A/B testing  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

---

### Profile: dev-infra (1 agent)

Infrastructure as Code specialist for Terraform and cloud provisioning.

#### terraform
**File:** `profiles/dev-infra/agents/terraform.json`  
**Purpose:** Terraform/IaC specialist for modules, state management, and provisioning  
**Use for:** Terraform modules, plan/apply workflows, security scanning  
**Hooks:** preToolUse (guard writes, secret scan)

---

### Profile: dev-dotnet (3 agents)

.NET specialists for self-hosted APIs and serverless applications.

#### dotnet_senior_agent
**File:** `profiles/dev-dotnet/agents/dotnet_senior_agent.json`  
**Purpose:** Senior .NET persona — reads project config, applies company standards, routes to archetype specialists  
**Use for:** Project scaffolding, archetype routing, cross-cutting .NET tasks  
**Tools:** thinking, todo, delegate, code, execute_bash, fs_read, fs_write, grep

#### dotnet_self_host_api_agent
**File:** `profiles/dev-dotnet/agents/dotnet_self_host_api_agent.json`  
**Purpose:** ASP.NET Core specialist — thin controllers, explicit DI, Swagger/OpenAPI, health checks  
**Use for:** Self-hosted APIs, Windows Services, Kubernetes backends  
**Tools:** code, execute_bash, fs_read, fs_write, grep

#### dotnet_serverless_agent
**File:** `profiles/dev-dotnet/agents/dotnet_serverless_agent.json`  
**Purpose:** Serverless specialist — thin handlers, service orchestration, explicit contracts, AWS adapter seams  
**Use for:** Lambda handlers, event-driven workflows, stateless execution  
**Tools:** code, execute_bash, fs_read, fs_write, grep

---

### Profile: dev-php (1 agent)

PHP specialist for Zend Framework 3 (Laminas) and legacy ZF1/ZF2.

#### php_agent
**File:** `profiles/dev-php/agents/php_agent.json`  
**Purpose:** PHP/Zend specialist — MVC, service managers, factory pattern, PSR-12, PHPUnit  
**Use for:** Zend/Laminas MVC apps, legacy ZF1/ZF2 migration, module development  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

---

### Profile: dev-mobile (3 agents)

Mobile specialists for Flutter cross-platform and native platform channels.

#### flutter
**File:** `profiles/dev-mobile/agents/flutter.json`  
**Purpose:** Dart/Flutter cross-platform development  
**Use for:** Flutter widgets, state management, platform channels  
**Hooks:** preToolUse (guard writes)

#### android_native
**File:** `profiles/dev-mobile/agents/android_native.json`  
**Purpose:** Kotlin/Java platform channels for Android  
**Use for:** Android-specific implementations, native integrations  

#### ios_native
**File:** `profiles/dev-mobile/agents/ios_native.json`  
**Purpose:** Swift/Obj-C platform channels for iOS  
**Use for:** iOS-specific implementations, native integrations  

---

### Profile: dev-ui (3 agents)

Legacy UI specialists for Angular 15, Polymer 2/3, and lightweight Lambda development for Config Studio pre-sales.

#### ui_legacy
**File:** `profiles/dev-ui/agents/ui_legacy.json`  
**Purpose:** Angular legacy & uplift specialist (v12–v18+) for Config Studio pre-sales applications  
**Use for:** Angular v12–v15 maintenance, incremental uplift to v16/v17/v18+, Vista design system integration  
**Tools:** `fs_read`, `fs_write`, `execute_bash`  
**MCP Servers:** confluence, mywiki  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

#### polymer
**File:** `profiles/dev-ui/agents/polymer.json`  
**Purpose:** Polymer 2/3 web component specialist for legacy uplift  
**Use for:** Polymer 2/3 web components, uplift from Polymer 2→3→Lit, Vista component integration  
**Tools:** `fs_read`, `fs_write`, `execute_bash`  
**MCP Servers:** confluence, mywiki  
**Hooks:** preToolUse (guard writes, secret scan), postToolUse (lint on write)

#### lambda
**File:** `profiles/dev-ui/agents/lambda.json`  
**Purpose:** Lightweight AWS Lambda specialist for Node.js handlers  
**Use for:** Lambda function development, thin-handler pattern, cold start optimization, SAM CLI  
**Tools:** `fs_read`, `fs_write`, `execute_bash`  
**Hooks:** preToolUse (guard writes, secret scan)

---

## Profile: ba (9 agents)

Business Analyst and Product Owner agents for requirements, scope, and feature definition.

### BA Orchestrator (1)

#### ba_orchestrator_agent
**File:** `profiles/ba/agents/ba_orchestrator_agent.json`  
**Purpose:** Coordinates BA/PO tasks and delegates to specialized agents  
**Use for:** Complex BA workflows requiring multiple steps  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** scope_definer_agent, feature_writer_agent, requirements_analyst_agent, estimation_agent

---

### BA Specialists (7)

#### scope_definer_agent
**File:** `profiles/ba/agents/scope_definer_agent.json`  
**Purpose:** Defines project and feature scope, boundaries, and constraints  
**Use for:** Starting new projects, clarifying scope, documenting assumptions  
**MCP Servers:** jira, confluence, mywiki, github

#### feature_writer_agent
**File:** `profiles/ba/agents/feature_writer_agent.json`  
**Purpose:** Creates user stories, acceptance criteria, and feature specifications  
**Use for:** Writing user stories, breaking down epics, refining backlog  
**MCP Servers:** jira, confluence, mywiki, github

#### requirements_analyst_agent
**File:** `profiles/ba/agents/requirements_analyst_agent.json`  
**Purpose:** Analyzes requirements, identifies gaps, validates completeness  
**Use for:** Reviewing requirements, gap analysis, sprint planning prep  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github

#### prd_generator_agent
**File:** `profiles/ba/agents/prd_generator_agent.json`  
**Purpose:** Generates Product Requirements Documents from Jira epics  
**Use for:** Creating PRDs, stakeholder analysis, requirements gathering  
**MCP Servers:** jira, confluence, mywiki, github

#### backlog_generator_agent
**File:** `profiles/ba/agents/backlog_generator_agent.json`  
**Purpose:** Generates epic/story breakdowns from PRDs  
**Use for:** Story writing, backlog creation, sprint planning prep  
**MCP Servers:** jira

#### quality_gate_agent
**File:** `common/agents/quality_gate_agent.json`  
**Purpose:** Formal review gate — approve/reject/revise artifacts  
**Use for:** PRD review, backlog review, test plan review, any artifact approval  
**Shared across:** All profiles (BA, QA, dev-core)

#### estimation_agent
**File:** `profiles/ba/agents/estimation_agent.json`  
**Purpose:** Dual-mode project estimation — CCV (hours/story points/FTEs) and DRIFT (tokens/cost)  
**Use for:** RFP estimation, sprint planning, AI cost projection, team sizing  
**MCP Servers:** jira, confluence

#### web_scraping_validator_agent
**File:** `profiles/ba/agents/web_scraping_validator_agent.json`  
**Purpose:** Validates web pages by browsing, checking structure, accessibility, and content  
**Use for:** Validating requirements against live UI, checking content correctness, browsing URLs  
**MCP Servers:** Chrome MCP

---

## Profile: qa (14 agents)

Quality Assurance and Test Automation agents for comprehensive testing.

### QA Orchestrator (1)

#### qa_orchestrator_agent
**File:** `profiles/qa/agents/qa_orchestrator_agent.json`  
**Purpose:** Orchestrates QA tasks and coordinates specialized testing agents  
**Use for:** Complex QA workflows requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github, qtest

**Delegates to:** test_planner_agent, test_automation_agent, defect_analyst_agent, api_tester_agent, performance_tester_agent, test_coverage_analyzer_agent

---

### QA Specialists (10)

#### test_planner_agent
**File:** `profiles/qa/agents/test_planner_agent.json`  
**Purpose:** Creates test plans, test cases, and test scenarios from requirements  
**Use for:** Test planning, test case design, coverage analysis  
**Tools:** `knowledge`  
**MCP Servers:** jira, confluence, mywiki, github, qtest

#### test_automation_agent
**File:** `profiles/qa/agents/test_automation_agent.json`  
**Purpose:** Creates and maintains automated test scripts  
**Use for:** UI tests, API tests, integration tests, test frameworks  
**Hooks:** preToolUse (guard writes)  
**MCP Servers:** qtest

#### defect_analyst_agent
**File:** `profiles/qa/agents/defect_analyst_agent.json`  
**Purpose:** Analyzes defects, performs root cause analysis  
**Use for:** Bug triage, root cause analysis, detailed bug reports  
**MCP Servers:** jira, confluence, mywiki, github, qtest

#### api_tester_agent
**File:** `profiles/qa/agents/api_tester_agent.json`  
**Purpose:** Tests REST APIs and validates contracts  
**Use for:** API test suites, contract testing, endpoint validation  
**Hooks:** preToolUse (guard writes)

#### performance_tester_agent
**File:** `profiles/qa/agents/performance_tester_agent.json`  
**Purpose:** Creates and executes performance and load tests  
**Use for:** Load testing, stress testing, performance benchmarks

#### qe_strategy_agent
**File:** `profiles/qa/agents/qe_strategy_agent.json`  
**Purpose:** Test strategy documents with scope, approach, and risk assessment  
**Use for:** Defining testing approach, risk-based prioritization  
**MCP Servers:** jira, confluence

#### e2e_test_generator_agent
**File:** `profiles/qa/agents/e2e_test_generator_agent.json`  
**Purpose:** Generates Gherkin E2E test scenarios from user stories  
**Use for:** Happy path, edge case, and negative test scenarios  
**MCP Servers:** jira

#### web_discovery_agent
**File:** `profiles/qa/agents/web_discovery_agent.json`  
**Purpose:** Discovers testable elements and page objects from web app source  
**Use for:** Test automation prep, selector mapping, user flow discovery

#### test_framework_agent
**File:** `profiles/qa/agents/test_framework_agent.json`  
**Purpose:** Generates test automation scaffolding per tech stack  
**Use for:** Test config, base helpers, CI pipeline snippets

#### test_coverage_analyzer_agent
**File:** `profiles/qa/agents/test_coverage_analyzer_agent.json`  
**Purpose:** Analyzes test coverage for epics against Jira/Xray and discovers reusable tests  
**Use for:** Coverage gap analysis, reuse discovery across projects, coverage matrix reports  
**MCP Servers:** jira, confluence, mywiki, github


#### flaky_test_fixer_agent
**File:** `profiles/qa/agents/flaky_test_fixer_agent.json`  
**Purpose:** Diagnoses intermittently failing tests, experiments with fixes, verifies stability  
**Use for:** Flaky test diagnosis, retry/wait strategy fixes, test stability verification

#### test_recorder_agent
**File:** `profiles/qa/agents/test_recorder_agent.json`  
**Purpose:** Records browser interactions via Playwright codegen, produces TypeScript specs with page objects  
**Use for:** Test recording, selector capture, page object generation  
**MCP Servers:** chrome

#### bruno_collection_agent
**File:** `profiles/qa/agents/bruno_collection_agent.json`  
**Purpose:** Converts Gherkin, OpenAPI specs, or test cases into organized Bruno collections  
**Use for:** API collection generation, environment configs, assertion scripts  
**MCP Servers:** bruno

---

## Profile: ops (7 agents)

Operations agents for AI metrics, infrastructure, deployments, and code quality.

### Ops Orchestrator (1)

#### ops_orchestrator_agent
**File:** `profiles/ops/agents/ops_orchestrator_agent.json`  
**Purpose:** Coordinates ops workflows and delegates to specialized agents  
**Use for:** Complex ops tasks requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** ai_metrics_agent, infra_check_agent, deployment_agent, code_quality_agent, release_manager_agent, release_documenter_agent

---

### Ops Specialists (6)

#### ai_metrics_agent
**File:** `profiles/ops/agents/ai_metrics_agent.json`  
**Purpose:** Tracks AI-assisted development metrics and updates Jira  
**Use for:** AI productivity reports, updating Jira AI custom fields  
**MCP Servers:** jira, confluence, mywiki, github

#### infra_check_agent
**File:** `profiles/ops/agents/infra_check_agent.json`  
**Purpose:** Checks AWS infrastructure status  
**Use for:** ECS task counts, cluster health, infrastructure reports

#### deployment_agent
**File:** `profiles/ops/agents/deployment_agent.json`  
**Purpose:** Manages CI/CD pipelines via Harness  
**Use for:** Pipeline status, recent deployments, deployment logs  
**MCP Servers:** harness

#### code_quality_agent
**File:** `profiles/ops/agents/code_quality_agent.json`  
**Purpose:** Retrieves code quality metrics from SonarQube  
**Use for:** Quality gate status, coverage reports, bug/vulnerability counts  
**MCP Servers:** sonarqube

#### release_manager_agent
**File:** `profiles/ops/agents/release_manager_agent.json`  
**Purpose:** Manages releases — compares tags, generates release notes, creates GitHub releases  
**Use for:** Release notes, tag comparison, readiness checks, GitHub releases  
**MCP Servers:** github, jira

#### release_documenter_agent
**File:** `profiles/ops/agents/release_documenter_agent.json`  
**Purpose:** Documents releases in Confluence with changes, rollback plan, dependencies  
**Use for:** Confluence release pages, change documentation, rollback procedures  
**MCP Servers:** confluence, mywiki, github, jira

---

## Profile: pm (6 agents)

Project Manager / Scrum Master agents for sprint execution, ceremonies, risk tracking, and delivery reporting.

### PM Orchestrator (1)

#### pm_orchestrator_agent
**File:** `profiles/pm/agents/pm_orchestrator_agent.json`  
**Purpose:** Coordinates PM/Scrum Master workflows and delegates to specialists  
**Use for:** Complex PM tasks requiring multiple agents  
**Tools:** `thinking`, `todo`, `delegate`, `use_subagent`  
**Hooks:** agentSpawn (git context)  
**MCP Servers:** jira, confluence, mywiki, github

**Delegates to:** sprint_manager_agent, standup_agent, retro_agent, risk_tracker_agent, delivery_reporter_agent

---

### PM Specialists (5)

#### sprint_manager_agent
**File:** `profiles/pm/agents/sprint_manager_agent.json`  
**Purpose:** Manages sprint planning, capacity, backlog grooming, and sprint health  
**Use for:** Sprint planning, capacity analysis, backlog review  
**Tools:** `todo`  
**MCP Servers:** jira, confluence, mywiki

#### standup_agent
**File:** `profiles/pm/agents/standup_agent.json`  
**Purpose:** Generates daily standup summaries from Jira activity  
**Use for:** Standup prep, stale item detection, blocker alerts  
**MCP Servers:** jira

#### retro_agent
**File:** `profiles/pm/agents/retro_agent.json`  
**Purpose:** Facilitates retrospectives with data-driven insights and action item tracking  
**Use for:** Sprint retros, trend analysis, action item follow-up  
**MCP Servers:** jira, confluence, mywiki

#### risk_tracker_agent
**File:** `profiles/pm/agents/risk_tracker_agent.json`  
**Purpose:** Identifies blockers, dependencies, and risks across sprints and epics  
**Use for:** Risk assessment, blocker tracking, dependency mapping  
**MCP Servers:** jira, confluence, mywiki

#### delivery_reporter_agent
**File:** `profiles/pm/agents/delivery_reporter_agent.json`  
**Purpose:** Generates velocity reports, burndown analysis, and release readiness assessments  
**Use for:** Sprint reports, velocity trends, release readiness  
**MCP Servers:** jira, confluence, mywiki

---

## Profile: leadership (5 agents)

Cross-team analytics, quarterly reporting, and executive briefings for Tech Directors and Delivery Managers.

### Leadership Orchestrator (1)

#### leadership_orchestrator_agent
**File:** `profiles/leadership/agents/leadership_orchestrator_agent.json`  
**Purpose:** Coordinates cross-team queries, quarterly reports, and executive briefings  
**Use for:** Multi-team analysis, report coordination, delegation to specialists  
**Tools:** thinking, todo, delegate, use_subagent  
**MCP Servers:** jira, confluence, mywiki

**Delegates to:** portfolio_analyst_agent, quarterly_reporter_agent, cross_team_coordinator_agent, executive_briefing_agent

---

### Leadership Specialists (4)

#### portfolio_analyst_agent
**File:** `profiles/leadership/agents/portfolio_analyst_agent.json`  
**Purpose:** Cross-team Jira analytics — velocity, delivery accuracy, carry-over rates, cycle time  
**Use for:** Multi-team velocity comparison, capacity analysis, trend identification  
**MCP Servers:** jira

#### quarterly_reporter_agent
**File:** `profiles/leadership/agents/quarterly_reporter_agent.json`  
**Purpose:** Generates 10-section quarterly business reports for Disney directors  
**Use for:** Quarterly reviews, business impact reporting, achievement summaries  
**MCP Servers:** jira, confluence, mywiki

#### cross_team_coordinator_agent
**File:** `profiles/leadership/agents/cross_team_coordinator_agent.json`  
**Purpose:** Tracks cross-team dependencies, shared blockers, and integration risks  
**Use for:** Dependency mapping, blocker escalation, coordination risk assessment  
**MCP Servers:** jira

#### executive_briefing_agent
**File:** `profiles/leadership/agents/executive_briefing_agent.json`  
**Purpose:** Produces audience-tailored executive summaries for directors, colleagues, and partners  
**Use for:** Executive briefings, stakeholder updates, partner communications  
**MCP Servers:** jira, confluence, mywiki

---

## Profile: inspector (10 agents)

Multi-dimensional audit profile. Fan-out to 9 specialist agents, synthesize findings into a deduplicated ranked report with severity scoring and yax-based trend tracking.

```bash
koda install inspector
```

### Inspector Orchestrator (1)

#### inspector_orchestrator
**File:** `profiles/inspector/agents/inspector_orchestrator.json`  
**Purpose:** Coordinates 9 audit specialists, deduplicates findings, writes ranked report, tracks trends  
**Use for:** Full service audits, targeted dimension checks, remediation planning  
**Tools:** thinking, todo, subagent, fs_write, @yax/*  
**Scoring:** 🟢 PASS (0 critical, 0 high) · 🟡 CONDITIONAL (0 critical, any high) · 🔴 BLOCKED (any critical)

**Delegates to:** security_reviewer, dependency_auditor, config_inspector, access_analyst, drift_detector, compliance_checker, architecture_critic, performance_auditor, log_analyst

---

### Inspector Specialists (9)

#### security_reviewer_agent
**File:** `profiles/inspector/agents/security_reviewer_agent.json`  
**Purpose:** OWASP Top 10, hardcoded secrets, injection vectors, auth/authz flaws  
**Use for:** Security vulnerability scanning

#### dependency_auditor_agent
**File:** `profiles/inspector/agents/dependency_auditor_agent.json`  
**Purpose:** CVE cross-referencing, stale dependency detection, license incompatibility  
**Use for:** Dependency tree audit (Node, Python, Go, Java, Rust, .NET)

#### config_inspector_agent
**File:** `profiles/inspector/agents/config_inspector_agent.json`  
**Purpose:** Plaintext secrets in config, insecure defaults, exposed debug endpoints  
**Use for:** Configuration file audit

#### access_analyst_agent
**File:** `profiles/inspector/agents/access_analyst_agent.json`  
**Purpose:** IAM least-privilege analysis, privilege escalation chains, stale credentials  
**Use for:** Permission and access control audit

#### drift_detector_agent
**File:** `profiles/inspector/agents/drift_detector_agent.json`  
**Purpose:** Terraform drift, destructive pending changes, shadow resources, state issues  
**Use for:** Infrastructure-as-code drift detection

#### compliance_checker_agent
**File:** `profiles/inspector/agents/compliance_checker_agent.json`  
**Purpose:** GDPR, SOC 2, PCI-DSS policy evaluation, PII handling, data retention  
**Use for:** Regulatory and policy compliance checks

#### architecture_critic_agent
**File:** `profiles/inspector/agents/architecture_critic_agent.json`  
**Purpose:** Circular dependencies, coupling metrics, layer violations, missing resilience patterns  
**Use for:** Structural architecture audit

#### performance_auditor_agent
**File:** `profiles/inspector/agents/performance_auditor_agent.json`  
**Purpose:** N+1 query patterns, missing indexes, unbounded memory allocation, caching opportunities  
**Use for:** Performance anti-pattern detection

#### log_analyst_agent
**File:** `profiles/inspector/agents/log_analyst_agent.json`  
**Purpose:** PII in logs, swallowed exceptions, unstructured output, missing trace context  
**Use for:** Logging quality and observability audit

---

## Profile: steer-master (5 agents)

Internal profile for steer-runtime and Koda development. Not installed by default — used by maintainers.

#### steer_orchestrator_agent
**File:** `profiles/steer-master/agents/steer_orchestrator_agent.json`
Orchestrates development and review workflows for steer-runtime and Koda. Delegates to specialist agents for implementation, review, compatibility checks, and releases.

#### steer_reviewer_agent
**File:** `profiles/steer-master/agents/steer_reviewer_agent.json`
Reviews steer-runtime PRs for breaking changes, schema violations, and consistency issues.

#### koda_reviewer_agent
**File:** `profiles/steer-master/agents/koda_reviewer_agent.json`
Reviews Koda Go PRs for backward compatibility, model safety, and CLI consistency.

#### compatibility_agent
**File:** `profiles/steer-master/agents/compatibility_agent.json`
Detects cross-repo impacts between steer-runtime and Koda changes.

#### steer_release_manager_agent
**File:** `profiles/steer-master/agents/steer_release_manager_agent.json`
Manages steer-runtime and Koda releases — version bumps, RELEASE_NOTES.md, CHANGELOG.md, tagging, and GitHub release creation. Wraps `make publish-all` with version bump intelligence. Distinct from the ops profile's `release_manager_agent` which handles generic project releases.

---



## Profile: core (6 agents)

Shared utility agents available across all profiles.

#### email_agent
**File:** `profiles/core/agents/email_agent.json`  
**Purpose:** Sends emails via Compass MCP. Confirms with user before sending  
**Use for:** Sending notifications, status updates, and reports via email

#### log_analyzer_agent
**File:** `profiles/core/agents/log_analyzer_agent.json`  
**Purpose:** Analyzes application logs across Splunk, ServiceNow, and other systems to trace errors, patterns, and incidents  
**Use for:** Log analysis, error tracing, incident investigation  
**MCP Servers:** compass (Splunk, ServiceNow)

#### story_analyzer_agent
**File:** `profiles/core/agents/story_analyzer_agent.json`  
**Purpose:** Fetches and analyzes Jira stories, Confluence pages, and GitHub repos  
**Use for:** Story analysis, requirements extraction, cross-system context gathering  
**MCP Servers:** jira, confluence, mywiki, github


#### document_analyzer_agent
**File:** `profiles/core/agents/document_analyzer_agent.json`  
**Purpose:** Parses and analyzes PDFs, DOCX, XLSX, and other document formats. Supports OCR for scanned documents, extracts text, summarizes content, and outputs markdown  
**Use for:** Document parsing, text extraction, OCR, content summarization, document comparison  
**MCP Servers:** confluence, mywiki


#### deck_builder_agent
**File:** `profiles/core/agents/deck_builder_agent.json`  
**Purpose:** Generates PPTX presentations from markdown or context. Supports audience-level adaptation, custom styling, diagrams, charts, and images  
**Use for:** Presentation generation, slide decks, executive summaries, technical talks, workshop materials  
**MCP Servers:** mermaid, confluence, mywiki


#### ai_adoption_stats_agent
**File:** `profiles/core/agents/ai_adoption_stats_agent.json`  
**Purpose:** Measures AI adoption across teams using GitHub commit patterns and Jira historical data. Identifies trends, compares teams, and produces statistical summaries  
**Use for:** AI adoption measurement, team comparison, trend analysis, adoption scoring, velocity correlation  
**MCP Servers:** github, jira, confluence, mywiki

---

## Profile: design (7 agents)

Design discovery, user research, and UX pipeline.

### Design Orchestrator (1)

#### design_orchestrator_agent
**File:** `profiles/design/agents/design_orchestrator_agent.json`  
**Purpose:** Orchestrates design workflows and delegates to specialized design agents  
**Use for:** Complex design workflows spanning discovery, research, testing, and prototyping  
**Tools:** `thinking`, `todo`, `delegate`  
**Delegates to:** design_discovery_agent, user_research_agent, usability_testing_agent, design_research_reporter_agent, prototype_prompt_agent, ux_specialist_agent  
**Cross-profile:** `ux_specialist_agent` (from dev-web) — install dev-web alongside design for full coverage

---

### Design Specialists (5)

#### design_discovery_agent
**File:** `profiles/design/agents/design_discovery_agent.json`  
**Purpose:** Orchestrates design discovery: competitive analysis, heuristic audits, vision frameworks, elevator pitches  
**Use for:** Competitive landscape analysis, heuristic evaluations, product vision alignment  
**MCP Servers:** jira, confluence

#### user_research_agent
**File:** `profiles/design/agents/user_research_agent.json`  
**Purpose:** Plans and synthesizes user research: interview guides, personas, journey maps, JTBD analysis  
**Use for:** Research planning, persona creation, journey mapping, stakeholder RACI  
**MCP Servers:** confluence

#### usability_testing_agent
**File:** `profiles/design/agents/usability_testing_agent.json`  
**Purpose:** Designs usability test scripts, concept validation sessions, surveys  
**Use for:** Test protocol design, survey instruments, findings synthesis

#### design_research_reporter_agent
**File:** `profiles/design/agents/design_research_reporter_agent.json`  
**Purpose:** Produces research plans, desktop research reports, and executive summaries  
**Use for:** Research documentation, executive readouts, knowledge base entries  
**MCP Servers:** confluence

#### prototype_prompt_agent
**File:** `profiles/design/agents/prototype_prompt_agent.json`  
**Purpose:** Transforms requirements into high-fidelity design prompts for Figma Make, Google Stitch, or v0  
**Use for:** AI-powered prototyping, use case catalogs, prompt template libraries

#### web_scraping_validator_agent
**File:** `profiles/design/agents/web_scraping_validator_agent.json`  
**Purpose:** Validates web pages by browsing, checking structure, accessibility, and content  
**Use for:** Browsing prototypes, capturing screenshots, validating UI against specs, accessibility checks  
**MCP Servers:** Chrome MCP

---

## Profile: cloudops (4 agents)

Infrastructure strategy, environment planning, and SRE.

### CloudOps Orchestrator (1)

#### cloudops_orchestrator_agent
**File:** `profiles/cloudops/agents/cloudops_orchestrator_agent.json`  
**Purpose:** Orchestrates infrastructure and operations workflows  
**Use for:** Complex infra tasks spanning planning, configuration, incidents, and execution  
**Tools:** `thinking`, `todo`, `delegate`  
**Delegates to:** infra_planner_agent, config_management_agent, rca_writer_agent, devops_runner_agent, log_analyzer_agent  
**Cross-profile:** `devops_runner_agent` (from dev-core), `log_analyzer_agent` (from core) — install dev-core alongside cloudops for full coverage

---

### CloudOps Specialists (3)

#### infra_planner_agent
**File:** `profiles/cloudops/agents/infra_planner_agent.json`  
**Purpose:** Plans environments, sizes infrastructure, assesses feature impact on ops stability  
**Use for:** Resource matrices, IaC recommendations, capacity planning, impact assessments  
**MCP Servers:** confluence

#### config_management_agent
**File:** `profiles/cloudops/agents/config_management_agent.json`  
**Purpose:** Defines configuration management: version control strategy, secret management, drift detection, DR  
**Use for:** Config policies, secret rotation plans, drift reports, backup/DR documentation

#### rca_writer_agent
**File:** `profiles/cloudops/agents/rca_writer_agent.json`  
**Purpose:** Produces publishable RCA documents from incident data, logs, and timelines  
**Use for:** Post-mortems, incident timelines, remediation tracking, blameless RCAs  
**MCP Servers:** jira, confluence

---

## Profile: presales (1 agent)

Pre-sales discovery, client intake, and project scoping.

#### presales_agent
**File:** `profiles/presales/agents/presales_agent.json`  
**Purpose:** Processes client materials into organized markdown. Generates discovery questions, project briefs, and feasibility assessments  
**Use for:** RFP processing, client intake summaries, project briefs, GO/NO-GO feasibility  
**MCP Servers:** jira, confluence

---

## Other IDEs

The coding standards, MCP integrations, and workflow guidance from these agents are also available in other IDEs:

| IDE | Format | Setup |
|-----|--------|-------|
| **Cursor** | `.mdc` rule files + shared MCP | [Cursor Setup](docs/getting-started/CURSOR_SETUP.md) |
| **Amazon Q** | Plain `.md` rule files | [Amazon Q README](.amazonq-templates/README.md) |
| **Kite** | Desktop GUI over Kiro CLI | [Kite repo](https://github.disney.com/SANCR225/Kite) |

---

## Advanced Tools

Some agents use advanced kiro-cli tools that require global settings. Enable with:

```bash
koda enable-tools
```

| Tool | What it does | Agents |
|------|-------------|--------|
| `thinking` | Step-by-step reasoning for complex decisions | 5 orchestrators, architecture, planner |
| `todo` | Persistent task tracking across sessions | 5 orchestrators, sprint_manager |
| `delegate` | Async non-blocking agent delegation | 5 orchestrators |
| `knowledge` | Long-term semantic memory across conversations | story_analyzer, architecture, test_planner, requirements_analyst |

Agents degrade gracefully when settings are off — tools simply won't appear.

---

## Hooks

Reusable hook scripts in `.kiro/hooks/` provide guardrails and context injection:

| Script | Event | Agents | Behavior |
|--------|-------|:------:|----------|
| `git-context.sh` | agentSpawn | 5 orchestrators | Injects current branch + dirty file count on start |
| `guard-writes.sh` | preToolUse (fs_write) | 6 write agents | Blocks writes to `node_modules/`, `dist/`, `.git/` |
| `secret-scan.sh` | preToolUse (fs_write) | 6 write agents | Scans for potential secrets before writing |
| `branch-guard.sh` | preToolUse (execute_bash) | 5 orchestrators | Blocks direct commits/pushes to `main`/`master` |
| `warn-destructive.sh` | postToolUse (execute_bash) | dev-core orchestrator | Warns on `rm -rf`, `DROP TABLE`, `--force` |
| `lint-on-write.sh` | postToolUse (fs_write) | 6 write agents | Auto-runs linter/formatter after file writes |

Full reference: [Hooks & Powers](docs/reference/HOOKS_AND_POWERS.md)

---

## MCP Server Coverage

Pre-built Node.js MCP bundles in `~/.kiro/tools/mcp-servers/`. Tokens centralized in `~/.kiro/tokens.env` (configured via `koda mcp-install` or `koda configure`).

| Profile | Agent | Jira | Confluence | MyWiki | GitHub | qTest | Other |
|---------|-------|:----:|:----------:|:------:|:------:|:-----:|:-----:|
| **dev-core** | story_analyzer_agent | ✅ | ✅ | ✅ | ✅ | | |
| **dev-core** | pr_creator_agent | ✅ | ✅ | ✅ | ✅ | | |
| **dev-core** | code_review_agent | ✅ | | | ✅ | | |
| **dev-core** | planner_agent | ✅ | ✅ | ✅ | | | |
| **dev-core** | technical_writer_agent | | ✅ | ✅ | ✅ | | |
| **dev-web** | backend | | | | | | |
| **dev-web** | webapi | | | | | | |
| **dev-web** | ui | | | | | | Figma |
| **dev-web** | ux_specialist_agent | | | | | | Figma |
| **dev-web** | astro | | | | | | Figma |
| **dev-python** | python | | | | | | |
| **dev-ai** | ai_orchestrator | | | | | | |
| **dev-ai** | ml_engineer | | | | | | |
| **dev-ai** | data_scientist | | | | | | |
| **dev-ai** | llm_engineer | | | | | | |
| **dev-ai** | mlops_engineer | | | | | | |
| **dev-infra** | terraform | | | | | | |
| **dev-dotnet** | dotnet_senior_agent | | | | | | |
| **dev-dotnet** | dotnet_self_host_api_agent | | | | | | |
| **dev-dotnet** | dotnet_serverless_agent | | | | | | |
| **dev-php** | php_agent | | | | | | |
| **dev-mobile** | flutter | | | | | | |
| **dev-mobile** | android_native | | | | | | |
| **dev-mobile** | ios_native | | | | | | |
| **dev-ui** | ui_legacy | | ✅ | ✅ | | | |
| **dev-ui** | polymer | | ✅ | ✅ | | | |
| **dev-ui** | lambda | | | | | | |
| **ba** | ba_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | | |
| **ba** | feature_writer_agent | ✅ | ✅ | ✅ | ✅ | | |
| **ba** | requirements_analyst_agent | ✅ | ✅ | ✅ | ✅ | | |
| **ba** | scope_definer_agent | ✅ | ✅ | ✅ | ✅ | | |
| **qa** | qa_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **qa** | test_planner_agent | ✅ | ✅ | ✅ | ✅ | ✅ | |
| **qa** | defect_analyst_agent | ✅ | ✅ | ✅ | ✅ | | |
| **qa** | test_automation_agent | | | | | | |
| **ops** | ops_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | | |
| **ops** | ai_metrics_agent | ✅ | ✅ | ✅ | ✅ | | |
| **ops** | code_quality_agent | | | | | | SonarQube |
| **ops** | deployment_agent | | | | | | Harness |
| **pm** | pm_orchestrator_agent | ✅ | ✅ | ✅ | ✅ | | |
| **pm** | sprint_manager_agent | ✅ | ✅ | ✅ | | | |
| **pm** | standup_agent | ✅ | | | | | |
| **pm** | retro_agent | ✅ | ✅ | ✅ | | | |
| **pm** | risk_tracker_agent | ✅ | ✅ | ✅ | | | |
| **pm** | delivery_reporter_agent | ✅ | ✅ | ✅ | | | |
| **sustainment** | sustainment_orchestrator_agent | ✅ | ✅ | ✅ | | | AppDynamics, ServiceNow, Splunk, Compass |
| **sustainment** | incident_triage_agent | | | | | | |
| **sustainment** | rca_agent | | | | | | |
| **sustainment** | stability_validator_agent | | | | | | |
| **sustainment** | gsm_analyst_agent | | | | | | |

---

## Context Files

Shared context loaded via agent `resources`:

| File | Used by |
|------|---------|
| `golden_rules.md` | dev-core orchestrator, architecture, compliance, security, code_review, pr_creator, pm_orchestrator |
| `project_mappings.md` | dev-core orchestrator, story_analyzer, planner, codebase_explorer, discussion, test_automation |
| `ba_guidelines.md` | All BA agents |
| `qa_guidelines.md` | All QA agents |
| `ops_guidelines.md` | All ops agents |
| `pm_guidelines.md` | All PM agents |
| `test_templates.md` | qa_orchestrator, test_planner |
| `story_templates.md` | feature_writer |
| `automation_patterns.md` | test_automation |
| `defect_templates.md` | defect_analyst |
| `api_test_patterns.md` | api_tester |
| `qtest_guidelines.md` | qa_orchestrator, test_planner |
| `performance_patterns.md` | performance_tester |
| `coverage_matrix_template.md` | test_coverage_analyzer |
| `python_guidelines.md` | python |
| `ml_engineering_guidelines.md` | ml_engineer, ai_orchestrator |
| `angular_modern_patterns.md` | ui |
| `java_conventions.md` | backend |
| `node_conventions.md` | webapi |
| `astro_project_patterns.md` | astro |
| `vista_web_components.md` | astro, ui, ux_specialist |
| `terraform_guidelines.md` | terraform |
| `dotnet_engineering_principles.md` | dotnet_senior, dotnet_self_host_api, dotnet_serverless |
| `dotnet_tech_standards.md` | dotnet_senior, dotnet_self_host_api, dotnet_serverless |
| `dotnet_testing_strategy.md` | dotnet_senior, dotnet_self_host_api, dotnet_serverless |
| `dotnet_aws_platform_guidance.md` | dotnet_senior, dotnet_self_host_api, dotnet_serverless |
| `dotnet_self_host_api_guidance.md` | dotnet_senior, dotnet_self_host_api |
| `dotnet_serverless_guidance.md` | dotnet_senior, dotnet_serverless |
| `php_zend_conventions.md` | php_agent |
| `php_testing_strategy.md` | php_agent |
| `php_legacy_migration.md` | php_agent |
| `php_review_checklist.md` | php_agent |
| `angular_legacy_patterns.md` | ui_legacy |
| `polymer_patterns.md` | polymer |
| `lambda_patterns.md` | lambda |

---

## Quick Reference

```bash
# Dev Core
kiro-cli chat --agent orchestrator              # Dev orchestrator
kiro-cli chat --agent code_review_agent         # Code review
kiro-cli chat --agent technical_writer_agent    # Technical docs

# Dev Web
kiro-cli chat --agent backend                   # Java backend
kiro-cli chat --agent webapi                    # Node.js API
kiro-cli chat --agent ui                        # Angular frontend
kiro-cli chat --agent ux_specialist_agent       # Accessibility & UX review
kiro-cli chat --agent astro                     # Astro SSR + React

# Dev Python
kiro-cli chat --agent python                    # Python development

# Dev AI
kiro-cli chat --agent ai_orchestrator              # AI/ML task routing
kiro-cli chat --agent ml_engineer               # ML training
kiro-cli chat --agent data_scientist            # Data science
kiro-cli chat --agent llm_engineer              # LLM applications
kiro-cli chat --agent mlops_engineer            # ML deployment

# Dev Infra
kiro-cli chat --agent terraform                 # Terraform/IaC
kiro-cli chat --agent dotnet_senior_agent       # .NET senior persona
kiro-cli chat --agent dotnet_self_host_api_agent  # ASP.NET Core APIs
kiro-cli chat --agent dotnet_serverless_agent     # .NET serverless

# Dev PHP
kiro-cli chat --agent php_agent                   # PHP/Zend Framework

# Dev Mobile
kiro-cli chat --agent flutter                   # Flutter mobile
kiro-cli chat --agent android_native            # Android native
kiro-cli chat --agent ios_native                # iOS native

# Dev UI
kiro-cli chat --agent ui_legacy                 # Angular legacy & uplift (v12–v18+)
kiro-cli chat --agent polymer                   # Polymer 2/3
kiro-cli chat --agent lambda                    # AWS Lambda

# BA/PO
kiro-cli chat --agent ba_orchestrator_agent     # BA orchestrator
kiro-cli chat --agent scope_definer_agent       # Define scope
kiro-cli chat --agent feature_writer_agent      # Write stories
kiro-cli chat --agent requirements_analyst_agent # Analyze requirements
kiro-cli chat --agent estimation_agent          # CCV + DRIFT estimation

# QA
kiro-cli chat --agent qa_orchestrator_agent     # QA orchestrator
kiro-cli chat --agent test_planner_agent        # Test planning
kiro-cli chat --agent test_automation_agent     # Test automation
kiro-cli chat --agent defect_analyst_agent      # Defect analysis
kiro-cli chat --agent api_tester_agent          # API testing
kiro-cli chat --agent performance_tester_agent  # Performance testing
kiro-cli chat --agent test_coverage_analyzer_agent # Coverage analysis
kiro-cli chat --agent flaky_test_fixer_agent    # Flaky test diagnosis & fix
kiro-cli chat --agent test_recorder_agent       # Playwright recording → specs
kiro-cli chat --agent bruno_collection_agent    # OpenAPI/Gherkin → Bruno collections

# Ops
kiro-cli chat --agent ops_orchestrator_agent    # Ops orchestrator
kiro-cli chat --agent ai_metrics_agent          # AI metrics
kiro-cli chat --agent infra_check_agent         # AWS/ECS checks
kiro-cli chat --agent deployment_agent          # Harness CI/CD
kiro-cli chat --agent code_quality_agent        # SonarQube metrics
kiro-cli chat --agent release_manager_agent     # Release notes, tag comparison, GitHub releases
kiro-cli chat --agent release_documenter_agent  # Confluence release documentation

# PM/Scrum Master
kiro-cli chat --agent pm_orchestrator_agent     # PM orchestrator
kiro-cli chat --agent sprint_manager_agent      # Sprint management
kiro-cli chat --agent standup_agent             # Standup summaries
kiro-cli chat --agent retro_agent               # Retrospectives
kiro-cli chat --agent risk_tracker_agent        # Risk tracking
kiro-cli chat --agent delivery_reporter_agent   # Delivery reports

# Leadership
kiro-cli chat --agent leadership_orchestrator_agent  # Cross-team orchestrator
kiro-cli chat --agent portfolio_analyst_agent         # Multi-team Jira analytics
kiro-cli chat --agent quarterly_reporter_agent        # Quarterly business reports
kiro-cli chat --agent cross_team_coordinator_agent    # Dependency tracking
kiro-cli chat --agent executive_briefing_agent        # Executive summaries

# Inspector (audit)
kiro-cli chat --agent inspector_orchestrator          # Full multi-dimensional audit
kiro-cli chat --agent security_reviewer_agent         # Security scan
kiro-cli chat --agent dependency_auditor_agent        # CVE & dependency audit
kiro-cli chat --agent architecture_critic_agent       # Architecture analysis

# Design
kiro-cli chat --agent design_orchestrator_agent       # Design orchestrator
kiro-cli chat --agent design_discovery_agent          # Competitive analysis, heuristic audits
kiro-cli chat --agent user_research_agent             # Personas, journey maps, JTBD
kiro-cli chat --agent usability_testing_agent         # Test scripts, concept validation
kiro-cli chat --agent design_research_reporter_agent  # Research reports, executive summaries
kiro-cli chat --agent prototype_prompt_agent          # Design prompts for Figma/v0

# CloudOps
kiro-cli chat --agent cloudops_orchestrator_agent     # CloudOps orchestrator
kiro-cli chat --agent infra_planner_agent             # Environment sizing, IaC
kiro-cli chat --agent config_management_agent         # Secrets, drift detection, DR
kiro-cli chat --agent rca_writer_agent                # Post-mortems, RCA documents

# Pre-Sales
kiro-cli chat --agent presales_agent                  # Client intake, project briefs, feasibility

# Core (shared utilities)
kiro-cli chat --agent email_agent                     # Send emails via Compass
kiro-cli chat --agent log_analyzer_agent              # Log analysis (Splunk, ServiceNow)
kiro-cli chat --agent story_analyzer_agent            # Jira/Confluence/GitHub analysis

# Sustainment
kiro-cli chat --agent sustainment_orchestrator_agent  # Sustainment orchestrator
kiro-cli chat --agent incident_triage_agent           # Incident triage
kiro-cli chat --agent rca_agent                       # Root cause analysis
kiro-cli chat --agent stability_validator_agent       # Stability validation
kiro-cli chat --agent gsm_analyst_agent               # GSM analysis
```

---

## Installation

```bash
koda install dev                    # All 42 dev agents (alias → dev-core + dev-web + dev-mobile + dev-python + dev-ai + dev-infra + dev-dotnet + dev-php + dev-ui)
koda install dev-core dev-web       # Fullstack web developer
koda install dev-core dev-mobile    # Mobile developer
koda install dev-core dev-ai        # AI/ML engineer (5 agents)
koda install dev-core dev-ui        # L2 Studio legacy UI developer (9 agents)
koda install dev ba qa ops pm       # Install all profiles
koda install design                 # Design discovery & UX research (6 agents)
koda install cloudops               # Infrastructure strategy & SRE (4 agents)
koda install presales               # Pre-sales & client intake (1 agent)
koda install inspector              # Multi-dimensional audit (10 agents)
koda enable-tools                   # Enable thinking, todo, knowledge
```

---

**Total Agents:** 124 (dev-core: 21, dev-web: 5, dev-dotnet: 3, dev-php: 1, dev-python: 1, dev-ai: 5, dev-infra: 1, dev-mobile: 3, dev-ui: 3, core: 3, ba: 8, qa: 16, ops: 9, pm: 6, leadership: 5, sustainment: 5, design: 6, cloudops: 4, presales: 1, inspector: 10, steer-master: 8)  
**Last Updated:** May 8, 2026
