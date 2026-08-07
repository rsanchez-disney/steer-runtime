---
name: coda-stepwise-setup
description: Comprehensive reference for setting up and using Globant's Coda + Stepwise AI workflow orchestration system. Covers installation, configuration, registry management, capabilities, skills, and troubleshooting.
---

# Coda + Stepwise Setup Reference

## Architecture Overview

Stepwise is a workflow orchestration system that delegates AI coding tasks to executors (primarily Coda in batch mode).

Agent Runtime, Stepwise, and AI Pods-as-Code form a deliberate separation of concerns:

- **AI Pods-as-Code** defines *what* should happen (declarative YAML in Git)
- **Stepwise** decides *when* and *in what order* (orchestrator, quality gate enforcer, session state manager)
- **Agent Runtime** (default: CODA CLI) executes *how* (runs skills, manages prompts, produces outputs)

```
AI Pods-as-Code (YAML) → Stepwise (orchestrator) → Agent Runtime (coda) → LLM → Artifacts
```

### Components

| Component | Role | Repository |
|-----------|------|------------|
| **aipods-stepwise** | Workflow engine, Web UI, TUI, API, CLI | Y1-REG092-87/aipods-stepwise |
| **aipods-agents-skills** | Skills registry (40+ skills, 68 capabilities) | Y1-REG092-87/aipods-agents-skills |
| **coda-core** | AI engine: agents, tools, LLM providers | 5G-AGE009-HZ/coda-core |
| **coda-cli** | Interactive terminal client | 5G-AGE009-HZ/coda-cli |

### Tech Stack

- **Stepwise**: Bun v1.3.14, TypeScript (ES2022), React + Tailwind CSS 4, Hono API, Ink TUI, Commander CLI
- **Coda**: Python 3.12+ (Poetry), OpenAI SDK (15+ providers), FastMCP, Langfuse observability
- **Monorepo packages**: @stepwise/core, @stepwise/cli, @stepwise/api, @stepwise/web, @stepwise/tui, @stepwise/playlist-orchestrator

### Ownership Boundaries

- **AI Pods-as-Code**: Defines delivery logic, evolves via versioned change, is the source of truth
- **Stepwise**: Executes definitions, enforces quality gates, manages state
- **Agent Runtime**: Runs skills, produces outputs, never decides quality
- **Domain Experts**: Validate or reject, trigger calibration, own quality decisions

---

## 1. Coda Installation

### Prerequisites

- Git 2.5+
- Terminal with ANSI support
- Provider credentials (GEAI API key or OAuth)

### Install

```bash
# macOS / Linux
curl -fsSL 'https://docs.globant.ai/en/filedownload?4622,12' | bash

# Windows (PowerShell)
irm 'https://docs.globant.ai/en/filedownload?5346,6' | iex

# Alternative (requires Globant npm registry)
npm i -g @globant/coda

# Verify
coda --version

# Upgrade
coda upgrade
```

### Glob.AI OS Environments

| Environment | Base URL | Console | Access |
|-------------|----------|---------|--------|
| AI Pod (Paid) | `https://api.clients.globant.com` | `console.clients.globant.com` | JSM ticket → Glob.AI OS Clients (Paid) |
| Corp (Free) | `https://api.os.corp.globant.com` | `console.corp.globant.com` | JSM ticket → Glob.AI OS Corp (auto-granted) |

### Provider Configuration

Edit `~/.coda/config.json`:

#### GEAI with API Key (Paid Environment)

```json
{
  "profiles": {
    "geai": {
      "provider": "glob-ai",
      "instance": "clients",
      "baseUrl": "https://api.clients.globant.com",
      "signInUrl": "https://console.clients.globant.com",
      "auth": { "method": "apikey", "secretRef": "GEAI_API_KEY" },
      "authDefaults": {
        "gamClientId": "glob-ai-clients",
        "gamRedirectUri": "http://localhost:9876/callback"
      },
      "model": "anthropic/claude-sonnet-4-6"
    }
  },
  "activeProfile": "geai"
}
```

#### OpenAI-Compatible Provider

```json
{
  "profiles": {
    "my-api": {
      "provider": "openai-compat",
      "baseUrl": "https://api.example.com/v1",
      "auth": { "method": "apikey", "secretRef": "MY_API_KEY" },
      "model": "my-model"
    }
  }
}
```

#### Supported Providers

geai, openai-compat, ollama, openai, anthropic, azure, google, vertex, groq, openrouter

### MCP Configuration

Add MCP servers in `~/.coda/mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

### Common Coda Commands

```bash
coda                              # Interactive mode
coda -p "say hi"                  # Headless (single prompt)
coda --model anthropic/claude-sonnet-4-6 -p "..."  # Specific model
coda --reconfigure                # Re-run setup wizard
coda marketplace install <url>    # Install plugin from repo
coda plugin install <path>        # Install local plugin
coda upgrade                      # Update to latest version
```

### Headless/Batch Mode (used by Stepwise)

```bash
coda -p "fix the failing test" --output json --timeout 120000
coda -p "refactor auth module" --auto-approve all --model anthropic/claude-sonnet-4-6
```

Key batch flags:
- `--tool-messages-format jsonl` — structured output for Stepwise parsing
- `--output-format json` — JSON results
- `--bash-security high` — security level for bash tool
- `--auto-approve all` — skip confirmation prompts
- `--timeout <ms>` — execution timeout

---

## 2. Stepwise Installation

### Quick Install

Installers available at: [Stepwise Installers (Google Drive)](https://drive.google.com/drive/folders/16A76iz_qH7IbAddZvhzgTC0MMe86BhKW)

#### macOS / Linux

```bash
# Download install.sh from Google Drive, then:
bash install.sh
```

The installer will:
- Detect OS and architecture (ARM64/x64)
- Authenticate with Azure DevOps via device code (browser login)
- Download the Stepwise binary from NuGet feed
- Install to `~/.stepwise/bin/stepwise`
- Configure PATH automatically

#### Windows (PowerShell)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install.ps1
```

### Azure Device Code Authentication

1. Script displays a URL (`https://microsoft.com/devicelogin`) and a code
2. Browser opens automatically
3. Enter the code and sign in with Globant Microsoft account
4. Return to terminal — installer continues

### macOS Security Warning

```bash
xattr -d com.apple.quarantine ~/.stepwise/bin/stepwise
```

### Updating

```bash
stepwise update              # Download and install latest
stepwise update --check      # Check without installing
stepwise update --force      # Reinstall current latest
stepwise update --clear-cache # Clear 24-hour check cache
```

### Web Interface

```bash
stepwise          # Starts web UI at http://127.0.0.1:3000
stepwise web      # Same as above
```

### Health Check

```bash
stepwise doctor          # Check system health
stepwise doctor --fix    # Auto-fix safe issues
```

---

## 3. Stepwise Configuration

Main config: `~/.ai_pods_stepwise/stepwise.config.yaml`

```yaml
registry:
  azure_devops_nuget:
    organization: g4g-artifactory-org
    feed: aipods-agents-skills
    client_id: dc71421f-1a4f-4ee0-a6ed-7b5d74478f18
    tenant_id: c160a942-c869-429f-8a96-f8c8296d57db
    auth_method: device-code

log_level: info

ui:
  show_management_capabilities: false

features:
  refinement:
    enabled: true
  playlists:
    enabled: true
  quality_gate_inbox:
    enabled: true

excursion:
  enabled: false
  default_budget:
    max_tokens: 2000000
    max_minutes: 90
    max_turns: 40
  sandbox:
    strategy: auto
    worktrees_enabled: true

agent_execution:
  executor: coda-batch
  coda_batch_path: coda-batch
  agent_model: anthropic/claude-sonnet-4-6
```

### Configuration Options

| Section | Key | Description |
|---------|-----|-------------|
| `registry` | `azure_devops_nuget` | NuGet feed for skill registry sync |
| `registry` | `git_url` | Alternative: Git-based registry source |
| `log_level` | - | Verbosity: debug, info, warn, error |
| `features.refinement` | `enabled` | Iterative refinement of outputs |
| `features.playlists` | `enabled` | DAG-based multi-step playlists |
| `features.quality_gate_inbox` | `enabled` | Quality gate review inbox |
| `excursion.default_budget` | - | Token/time/turn limits for exploration |
| `excursion.sandbox` | - | Isolation strategy (auto, worktrees) |
| `agent_execution.executor` | - | Executor backend to use |
| `agent_execution.agent_model` | - | Default LLM model |

### Supported Executors

| Executor | Description | Requirement |
|----------|-------------|-------------|
| `coda` | **Default.** Coda CLI in batch mode | `npm i -g @globant/coda` |
| `coda-batch` | Legacy Python-based executor | `pip install coda-batch` |
| `claude-code` | Anthropic Claude Code CLI | `claude` CLI in PATH |
| `windsurf` / `devin` | Windsurf IDE / Devin CLI | `devin` CLI in PATH |
| `copilot` | GitHub Copilot CLI | `copilot` CLI in PATH |
| `codex` | OpenAI Codex CLI | `codex` CLI in PATH |
| `kiro` | AWS Kiro CLI (macOS/Linux) | `curl -fsSL https://cli.kiro.dev/install \| bash` |
| `kilocode` | Kilo CLI | `kilo` CLI in PATH |
| `droid` | Factory.ai Droid CLI | `droid` CLI in PATH |
| `gemini` | Google Gemini CLI | `gemini` CLI in PATH |
| `antigravity` | Google Antigravity CLI (agy) | `agy` CLI in PATH |
| `cursor-agent` | Cursor Agent headless | `cursor-agent` CLI in PATH |
| `opencode` | OpenCode CLI | `curl -fsSL https://opencode.ai/install \| bash` |
| `mock` | Mock executor for testing | Built-in |

### Per-Step Executor Override

```yaml
spec:
  steps:
    - id: planning
      skill: code-planning
      executor: claude-code   # Only this step uses claude-code
    - id: implementation
      skill: code-implementation
      # Falls back to global config
```

### Executor Selection Priority

1. Step-level `executor` field (highest)
2. Global `executor` in stepwise.config.yaml
3. Default: `coda`

---

## 4. Registry Setup

The registry (`~/.ai_pods_stepwise/registry/`) contains all skills, capabilities, playlists, agents, and estimation models.

### Registry Structure

```
~/.ai_pods_stepwise/registry/
├── capabilities/               # 68 workflow definitions (YAML)
├── skills/                     # 40+ skills organized by category
│   ├── product-management/     # 10 skills
│   ├── engineering/            # 7 skills
│   ├── architecture/           # 8 skills
│   ├── quality-engineering/    # 21 skills
│   ├── documentation/          # 5 skills
│   ├── integrations/           # 1 skill
│   └── meta/                   # 2 skills
├── playlists/                  # 40 DAG-based workflows
├── agents/                     # 15 agent definitions
├── estimation/                 # 23 estimation models
├── evals/                      # 15 evaluation configs
└── STEPWISE_INTEGRATION.md
```

### Sync the Registry

```bash
stepwise registry sync
```

### Alternative: Git-Based Registry

```yaml
registry:
  git_url: https://github.com/Y1-REG092-87/aipods-agents-skills.git
  branch: main
```

### Project-Specific Registry

```bash
mkdir -p .stepwise

cat > .stepwise/stepwise.config.yaml <<EOF
directories:
  capabilities: capabilities
  skills: skills

registry:
  git_url: https://github.com/Y1-REG092-87/aipods-agents-skills.git
  branch: main

log_level: info
agent_runner: coda
agent_model: openai/gpt-4o-mini
EOF

export AI_PODS_STEPWISE_DIR=$(pwd)/.stepwise
stepwise registry sync
```

### Skill Resolution Order

1. Local project skills (`./skills/`) — highest priority
2. Registry skills (`~/.ai_pods_stepwise/registry/skills/`)
3. Nested categories (e.g., `skills/product-management/researching-prd/`)

---

## 5. Capabilities (Workflows)

### Available Capabilities

| Name | Description | Key Skills Used |
|------|-------------|----------------|
| `capability_product-definition` | Product discovery → epics → backlog | researching-prd, planning-epics |
| `capability_code-development` | Design → plan → implement → review | implementing-code, reviewing-code |
| `capability_software-architecture` | Architecture design & ADRs | designing-target-architecture, researching-adrs |
| `capability_quality-engineering-web-automation` | Web automation testing pipeline | analyze-test-cases, web-discovery, automation-code-generation |
| `capability_quality-engineering-planning` | QE planning & strategy | defining-qe-strategy, creating-qe-master-plan |
| `capability_quality-engineering-design` | QE test case design & generation | generating-test-cases |

### Recommended Execution Order

1. `product-definition` → PRD + validated epics
2. `software-architecture` → domain boundaries, ADRs, target architecture
3. `product-delivery` → user stories + delivery platform export
4. `quality-engineering-planning` → test strategy, master plan, test cases
5. `code-development` → research, implementation plan, code changes, validation
6. `quality-engineering-web-automation` → automation code, execution reports

### Executing a Capability

```bash
stepwise exec capability_product-definition \
  --param project_name="My Project" \
  --param project_brief="docs/brief.md"

stepwise exec capability_code-development \
  --param task="Implement user authentication"

stepwise exec capability_software-architecture \
  --param project_name="My Service" \
  --param requirements="docs/requirements.md"
```

### Custom Capabilities

```yaml
# my-capability.yaml
metadata:
  name: "my-custom-capability"
  version: "1.0.0"
  description: "Custom workflow"
spec:
  steps:
    - id: "research"
      name: "Research Phase"
      instructions: |
        Research the codebase...
      skills:
        - "researching-code-design"
    - id: "implement"
      name: "Implementation"
      skills:
        - "implementing-code"
```

---

## 6. Skills Catalog

### Product Management (10 skills)

- `researching-prd` — Research for product requirements docs
- `creating-prd` — Create PRD documents
- `planning-epics` — Plan epic breakdowns
- `generating-epics` — Generate epic definitions
- `generating-story-maps` — Create story maps
- `generating-user-stories` — Write user stories
- `implementing-user-stories` — Implement from stories
- `consolidating-backlog` — Consolidate backlog items
- `assembling-final-package` — Package deliverables
- `formatting-platform-export` — Format for platform export

### Engineering (7 skills)

- `implementing-code` — Code implementation
- `implementing-code-scripted` — Scripted code implementation
- `reviewing-code` — Code review
- `validating-code-review` — Validate review findings
- `researching-code-design` — Research code design patterns
- `planning-code-tasks` — Plan implementation tasks
- `interviewing-code` — Codebase interview/exploration

### Architecture (8 skills)

- `designing-target-architecture` — Design target architecture
- `establishing-architecture-foundation` — Establish architecture base
- `specifying-architecture` — Write architecture specs
- `discovering-bounded-contexts` — DDD bounded context discovery
- `researching-bounded-contexts` — Research bounded contexts
- `generating-adrs` — Generate ADR documents
- `researching-adrs` — Research for ADRs
- `synthesizing-documents` — Synthesize documentation

### Quality Engineering (21 skills)

- `defining-qe-strategy` — Define QE strategy
- `creating-qe-master-plan` — Create QE master plan
- `analyze-test-cases` — Analyze test cases
- `web-discovery` — Discover web app elements
- `framework-exploration` — Explore test frameworks
- `automation-planning` — Plan automation
- `automation-code-generation` — Generate automation code
- `automation-test-execution` — Execute automated tests
- `reporting-analysis` — Analyze and report results
- `generating-test-cases` — Generate test cases
- `generating-e2e-test-cases` — Generate E2E tests
- `executing-tests` — Execute tests
- `performing-acceptance-testing` — Acceptance testing
- `reviewing-quality` — Quality review
- `analyzing-impact` — Impact analysis
- `checking-production-readiness` — Production readiness checks

### Documentation (5 skills)

- `designing-structure` — Design doc structure
- `generating-content` — Generate content
- `creating-diagrams` — Create diagrams
- `refining-iteratively` — Iterative refinement
- `delivering-documentation` — Final delivery

### Meta (2 skills)

- `testing-skill` — Test a skill
- `human-quality-gate` — Human review gate

### Local Skill Overrides

```bash
mkdir -p skills/custom-skill

cat > skills/custom-skill/SKILL.md <<'EOF'
---
name: custom-skill
description: My custom skill
version: 1.0.0
---

# Custom Skill

Instructions for custom skill...
EOF
```

Priority: Local skills > Registry skills

### Skill Name Mapping (Legacy → Current)

| Old Name | New Path |
|----------|----------|
| `prd-research` | `product-management/researching-prd` |
| `backlog-epic-plan` | `product-management/planning-epics` |
| `code-implementation` | `engineering/implementing-code` |
| `code-design-research` | `engineering/researching-code-design` |
| `code-review-validation` | `engineering/reviewing-code` |
| `code-task-planning` | `engineering/planning-code-tasks` |
| `adr-generation-research` | `architecture/researching-adrs` |
| `bounding-context-research` | `architecture/researching-bounded-contexts` |
| `target-architecture-foundation` | `architecture/establishing-architecture-foundation` |
| `target-architecture-specifications` | `architecture/specifying-architecture` |
| `human-quality-gate` | `meta/human-quality-gate` |

---

## 7. Key Features

### Playlists (DAG Workflows)

Multi-capability orchestration as DAGs with dependency-aware execution:

```bash
stepwise playlist run <playlist-name>
```

40 pre-built playlists available in the registry.

### Quality Gates

Stepwise enforces quality gates defined in AI Pods-as-Code:
- Gates block execution until human approval
- Tri-state filter: Pass / Review / Fail
- Only Pass artifacts propagate downstream
- No "just this once" shortcuts

### Refinement

First-class workflow with quality gate review — Stepwise can re-run steps with feedback for iterative improvement.

### Excursion Mode

Autonomous exploration with budget limits:
- Max tokens: 2,000,000
- Max time: 90 minutes
- Max turns: 40
- Sandbox: worktrees for isolation

### Session Management

All execution state stored in `.stepwise/workflows/`:
- Activity Log, Prompts, Outputs
- Validation decisions, Gate transitions
- Enables resumability, auditability, calibration analysis
- Fresh context per stream execution (no leakage)

### Git Automation (when enabled)

```yaml
features:
  git_functionalities:
    enabled: true
```

- Dedicated Git branch per playlist (session name = branch name)
- Auto commit + push on step completion and gate approval
- Commit messages: `stepwise: step completed — <capability>/<stepId> [<session>]`

---

## 8. Project Structure Best Practices

### Recommended Layout

```
my-project/
├── context-pack/           # Standards, policies, domain rules (Markdown)
├── artifacts/
│   ├── inputs/             # Input documents
│   └── outputs/            # Generated artifacts
├── criteria/               # Acceptance/quality criteria
├── source/                 # Clones, submodules, or symlinks to source repos
└── stepwise.config.yaml    # Project-level config
```

### Context Pack Guidelines

- Keep stable guidance separate from session outputs
- Layered structure for large estates (enterprise → domain → service-group)
- Update when: tech decisions change, architecture evolves, or AI makes systematic errors
- Indexed, short, authoritative top-level files linking to deeper references

### Anti-Patterns to Avoid

- Monolithic standards files
- Mixing stable standards with initiative outputs
- Running unrelated initiatives in one artifact chain
- Approving weak artifacts to keep momentum
- Committing `.coda/skills/` to version control
- Pushing `.coda/`, skills, capabilities, calibration, or observability to client repo

---

## 9. Integration Points

| Integration | How It Works |
|-------------|-------------|
| **Jira** | Ticket ingestion, status updates, Definition of Done enforcement |
| **GitHub/Azure DevOps** | Agent branches (`feature/jira-123-agent`), PR descriptions with plan links, Domain Expert as mandatory reviewer |
| **Figma** | Agent reads Figma URLs for layout/color/copy; validates implementation against spec |
| **Confluence/SharePoint** | Knowledge Connector indexes spaces for RAG; agents generate doc updates back |
| **Glob.ai OS** | Optional enterprise orchestration with Goals/WorkItems sync |

---

## 10. Troubleshooting

### Coda Issues

| Error | Fix |
|-------|-----|
| "Invalid model name" | Use `provider/model` format (e.g., `anthropic/claude-sonnet-4-6`) |
| "Quota exceeded" | Wait for reset or try different model |
| "No OAuth configuration" | Add `authDefaults` block to profile |
| 401 Unauthorized | Check API key is valid and not expired |
| "argument list too long" | Agent prompts too large — reduce context |

### Stepwise Issues

| Error | Fix |
|-------|-----|
| "Registry not synced" | Run `stepwise registry sync` |
| "Skill not found" | Check: `find ~/.ai_pods_stepwise/registry/skills -name "SKILL.md" \| grep <name>` |
| Capability validates but skill not found | Check skill name mapping table (section 6) |
| Registry sync fails | Verify git access: `git clone <registry-url> /tmp/test` |
| "Executor not found" | Ensure executor binary is in PATH |
| Authentication timeout | Complete browser login within 5 minutes |
| "Permission denied" (macOS) | `xattr -d com.apple.quarantine ~/.stepwise/bin/stepwise` |
| "Command not found" | Verify PATH: `echo $PATH \| grep stepwise` |
| CODA_SINGLE_AGENT_MAX_ITERATIONS too low | Run `stepwise doctor --fix` (sets to 300) |

### Windows-Specific Issues

| Error | Fix |
|-------|-----|
| "coda-batch is not recognized" | Stepwise v0.9.0+ auto-resolves; or set `coda_batch_path` manually |
| "ENOTDIR: not a directory" | Use absolute paths in config |
| Skills not executing | Copy skills to `.coda/skills/` and set `CODA_SKILL_OUTPUT_DIR=./` in `.coda/.env` |

### Logs

Execution logs: `~/.ai_pods_stepwise/logs/`

---

## 11. Directory Structure Summary

```
~/.stepwise/
└── bin/stepwise              # Stepwise binary

~/.ai_pods_stepwise/
├── stepwise.config.yaml      # Main configuration
├── registry/                 # Synced skills & capabilities
│   ├── capabilities/
│   ├── skills/
│   ├── playlists/
│   ├── agents/
│   ├── estimation/
│   └── ...
└── logs/                     # Execution logs

~/.coda/
├── config.json               # Coda provider configuration
├── mcp.json                  # MCP server definitions
└── .env                      # Environment (CODA_SINGLE_AGENT_MAX_ITERATIONS)
```

---

## 12. Fresh Machine Setup (End-to-End)

```bash
# 1. Install Coda
curl -fsSL 'https://docs.globant.ai/en/filedownload?4622,12' | bash

# 2. Configure Coda provider
coda --reconfigure
# Or manually edit ~/.coda/config.json with GEAI profile

# 3. Verify Coda works
coda -p "hello world"

# 4. Install Stepwise
# Download install.sh from Google Drive folder, then:
bash install.sh
# Follow Azure Device Code auth in browser

# 5. Add to PATH (if not auto-configured)
export PATH="$HOME/.stepwise/bin:$PATH"

# 6. Verify Stepwise
stepwise --version

# 7. Run health check
stepwise doctor --fix

# 8. Sync registry
stepwise registry sync

# 9. List available capabilities
stepwise list

# 10. Launch web UI
stepwise
```

---

## 13. AI Pods Handbook Site Map

*(Source: https://ai-pods-handbook.globant.com — requires Globant SSO)*

```
01. Handbook Guide
    ├── SSOT Principle
    ├── How to Use
    ├── Voice and Tone
    └── Glossary
02. Philosophy & Principles
    ├── Why Shift
    ├── Operating Principles
    └── Handbook vs Code
03. Ethics & Governance
    ├── AI Manifesto
    └── Human in the Loop
04. AI Pods Framework
    ├── What Is and Isn't
    ├── Introduction
    ├── Three Layer Architecture
    ├── Streams Catalog
    ├── Playlists Catalog
    ├── Context Packs
    ├── Human Supervision & QA
    ├── AI Pods-as-Code
    ├── Creating a new Capability
    ├── Frequent Intentional Compaction
    └── Skill Engineering Playbook
05. Delivery
    ├── New Delivery Model
    ├── Engagement Lifecycle
    ├── Engagement Setup
    ├── Three Phase Workflow
    ├── Calibration Cycle
    ├── Best Practices
    └── Transition & Onboarding
06. Tools & Platforms           ← KEY SECTION
    ├── AI Pods Execution & Supervision Planes
    ├── Glob.AI Platform
    ├── Agent Runtime and Stepwise
    ├── Stepwise Installation Guide
    ├── Stepwise User Manual
    ├── Stepwise Best Practices
    ├── Integration Points
    ├── Git Branching & Glob.ai Code Sync
    └── Deep Dive: Devin & Windsurf Architecture
07. Roles & Responsibilities
    ├── AI Pod Architect
    ├── Domain Experts
    ├── Activator
    ├── Gatekeeper
    └── APMO
08. Observability & Metrics
    ├── Strategic Metrics
    ├── Key Dimensions
    ├── Dashboards
    └── Reporting
09. Selling AI Pods
    ├── Commercial Model
    ├── Token Economics
    ├── Sales Playbook
    ├── Salesforce Flagging
    ├── Resources Tools
    ├── Hybrid Models
    ├── Solutioning
    ├── Success Cases
    └── Estimation (VTUs)
10. AI Pods Studio
11. Help & Support
12. Training & Enablement
13. For Clients
    ├── Getting Started
    └── Stepwise End-User Guide
```

---

## 14. Related Local Resources

| Resource | Path |
|----------|------|
| Coda setup skill | `~/.kiro/skills/coda-setup/SKILL.md` |
| Full Coda reference (1,678 lines) | `~/.kiro/skills/coda-setup/references/coda-full-reference.md` |
| Stepwise integration guide | `~/.ai_pods_stepwise/registry/STEPWISE_INTEGRATION.md` |
| Registry catalog | `~/.ai_pods_stepwise/registry/CATALOG.md` |
| Capabilities README | `~/.ai_pods_stepwise/registry/capabilities/README.md` |
| Skills catalog | `~/.ai_pods_stepwise/registry/.agents/SKILLS.md` |
| Local handbook repo | `~/Workspace/Globant/Y1-REG092-87/aipods-handbook/docs/06-tools-platforms/` |
| AI Pods Handbook (web) | https://ai-pods-handbook.globant.com/ (requires Globant SSO) |
