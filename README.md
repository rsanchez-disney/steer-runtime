# steer-runtime

**Unified Multi-Profile Agent System**

Specialized Kiro agents for development, BA/PO work, and more. Easily extensible with new profiles.

---



## Prerequisites

### First Time Kiro Setup

If you haven't installed Kiro yet:

1. **Request Access**
   - Visit: https://developer.disney.com/ai-tools
   - Request access to **AmazonQ (Kiro)**
   - Wait for approval (typically 1-2 business days)

2. **Download Kiro**
   - Visit: https://kiro.dev/downloads/
   - Download for your operating system

3. **Sign in with Disney SSO**
   - Click "Sign in with your organization identity"
   - Select region: **us-east-1**
   - Input Start URL: `https://twdc-qdeveloper.awsapps.com/start`
   - Sign in using your **@disney.com** email address
   - You will be prompted to allow Kiro IDE access
   - Click "Allow" to grant permissions

4. **Verify Installation**
   ```bash
   kiro-cli --version
   ```

You should now be able to use Kiro CLI and Kiro UI!

---

## Quick Start

### 1. Clone Repository

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime
```

### 2. View Help

```bash
./setup.sh
```

### 3. List Available Profiles

```bash
./setup.sh list
```

Output:
```
📋 Available profiles:
  • ba (4 agents)
  • qa (6 agents)
  • dev (18 agents)
```

### 4. Install Profiles

**For Kiro CLI (global):**
```bash
./setup.sh install dev          # Install dev profile
./setup.sh install ba           # Install BA profile
./setup.sh install dev ba qa    # Install all three profiles
```

**For Kiro UI (project-specific):**
```bash
./setup.sh install dev --project ~/my-project
./setup.sh install ba --project ~/my-project
./setup.sh install dev ba --project ~/my-project
```

### 5. Setup MCP Servers

```bash
./setup.sh mcp-install
```

### 6. Use Agents

**With Kiro CLI:**
```bash
# Development
kiro-cli chat --agent orchestrator
kiro-cli chat --agent backend

# BA/PO
kiro-cli chat --agent scope_definer_agent
kiro-cli chat --agent feature_writer_agent

# QA
kiro-cli chat --agent test_planner_agent
kiro-cli chat --agent test_automation_agent
```

**With Kiro UI:**
1. Open Kiro UI
2. Select your project directory
3. Agents will be available in the UI
---

## Available Profiles

### dev (18 agents)
Development agents for backend, webapi, UI, mobile, testing, security, and code review.

**Key agents:**
- `orchestrator` - Main development orchestrator
- `backend` - Java backend development
- `webapi` - Node.js API development
- `ui` - Angular frontend development
- `flutter`, `android_native`, `ios_native` - Mobile development
- `code_review_agent`, `security_scanner_agent`, `test_runner_agent` - Quality

**Documentation:** See `docs/PROMPT_GUIDE.md` for dev workflows

### ba (4 agents)
Business Analyst and Product Owner agents for requirements, scope, and feature definition.

**Key agents:**
- `ba_orchestrator_agent` - Coordinates BA/PO tasks
- `scope_definer_agent` - Defines project scope and boundaries
- `feature_writer_agent` - Creates user stories and acceptance criteria
- `requirements_analyst_agent` - Analyzes and validates requirements

**Documentation:** See `docs/BA_PROMPT_GUIDE.md` for BA/PO workflows

### qa (6 agents)
Quality Assurance and Test Automation agents for comprehensive testing.

**Key agents:**
- `qa_orchestrator_agent` - Coordinates QA workflows
- `test_planner_agent` - Creates test plans and test cases
- `test_automation_agent` - Writes automated tests (UI, API, integration)
- `defect_analyst_agent` - Analyzes bugs and root causes
- `api_tester_agent` - Tests REST APIs and validates contracts
- `performance_tester_agent` - Load and performance testing

**Documentation:** See `docs/QA_PROMPT_GUIDE.md` for QA workflows

## Commands

```bash
./setup.sh                      # Show help
./setup.sh list                 # List available profiles
./setup.sh install <profiles>   # Install one or more profiles
./setup.sh check                # Verify installation
./setup.sh mcp-install          # Setup MCP servers
```

---

## Usage Examples
## Usage Examples

### Development Workflow

```bash
kiro-cli chat --agent orchestrator
> "Implement Jira story DPAY-14561 for payment validation"
```

Orchestrator automatically:
1. Fetches story from Jira
2. Analyzes requirements
3. Creates implementation plan
4. Coordinates backend, webapi, UI agents
5. Runs tests and quality checks
6. Creates pull request

### BA/PO Workflow

```bash
kiro-cli chat --agent ba_orchestrator_agent
> "Analyze epic DPAY-500 and create complete story breakdown"
```

BA Orchestrator automatically:
1. Fetches epic from Jira
2. Defines scope and boundaries
3. Identifies requirements
4. Creates user stories with acceptance criteria
5. Documents in Confluence

### QA Workflow

```bash
kiro-cli chat --agent qa_orchestrator_agent
> "Create complete test suite for feature DPAY-500"
```

QA Orchestrator automatically:
1. Creates test plan from requirements
2. Generates test cases
3. Writes automated tests (UI + API)
4. Executes tests and reports results
5. Documents test coverage
---

## Documentation

### For Developers
- 📖 [Development Prompts & Workflows](docs/PROMPT_GUIDE.md)
- 📖 [Mobile Development Setup](docs/MOBILE_AGENTS_SETUP.md)
- 📖 [System Architecture](docs/DESIGN.md)
- 📖 [MCP Server Configuration](docs/MCP_SETUP.md)

### For Business Analysts / Product Owners
- 📖 [BA/PO Prompt Guide](docs/BA_PROMPT_GUIDE.md) - 12+ workflow examples
- 📖 [BA/PO Complete Workflows](docs/BA_WORKFLOWS.md) - End-to-end processes
- 📖 [BA/PO Quick Reference](docs/BA_QUICK_REFERENCE.md) - Printable reference card
- 📖 [BA Guidelines](.kiro-ba/context/ba_guidelines.md) - Best practices
- 📖 [Story Templates](.kiro-ba/context/story_templates.md) - Jira templates

### For QA Engineers / Test Automation
- 📖 [QA Prompt Guide](docs/QA_PROMPT_GUIDE.md) - 12+ testing workflow examples
- 📖 [QA Complete Workflows](docs/QA_WORKFLOWS.md) - End-to-end testing processes
- 📖 [QA Quick Reference](docs/QA_QUICK_REFERENCE.md) - Printable reference card
- 📖 [QA Profile Overview](docs/QA_PROFILE_OVERVIEW.md) - Complete guide
- 📖 [QA Guidelines](.kiro-qa/context/qa_guidelines.md) - Testing best practices
- 📖 [Test Templates](.kiro-qa/context/test_templates.md) - Test case templates
- 📖 [Automation Patterns](.kiro-qa/context/automation_patterns.md) - Code patterns
---

## Adding New Profiles

1. Create `.kiro-<profile>/` directory
2. Add `agents/` and `prompts/` subdirectories
3. Add agent configurations
4. Run `./setup.sh install <profile>`

Example:
```bash
mkdir -p .kiro-qa/agents .kiro-qa/prompts
# Add agent configs...
./setup.sh install qa
```

The setup script auto-discovers all `.kiro-*` directories.

---

## Structure

```
steer-runtime/
├── .kiro-dev/          # Development profile (18 agents)
│   ├── agents/
│   ├── prompts/
│   ├── powers/
│   ├── skills/
│   └── steering/
├── .kiro-ba/           # BA/PO profile (4 agents)
│   ├── agents/
│   ├── prompts/
│   └── context/
├── .kiro/              # Shared (MCP servers)
│   └── tools/
│       └── mcp-servers/
├── docs/               # Documentation
│   ├── PROMPT_GUIDE.md
│   ├── BA_PROMPT_GUIDE.md
│   ├── BA_WORKFLOWS.md
│   └── ...
├── setup.sh            # Unified setup script
└── README.md           # This file
```

---

## Troubleshooting

### Show help
```bash
./setup.sh
./setup.sh help
./setup.sh --help
```

### Check installation
```bash
./setup.sh check
```

### List available profiles
```bash
./setup.sh list
```

### Agents not found
```bash
# Verify installation
ls ~/.kiro/agents/

# Reinstall
./setup.sh install dev ba
```

### MCP servers not working
```bash
# Check MCP servers installed
ls ~/.kiro/tools/mcp-servers/

# Reinstall dependencies
./setup.sh mcp-install

# Verify .env files exist
ls ~/.kiro/tools/mcp-servers/*/.env
```

---

## Features

✅ **22 specialized agents** - Dev (18) + BA/PO (4)  
✅ **Multi-profile support** - Install what you need  
✅ **Auto-discovery** - Add profiles by creating `.kiro-*` dirs  
✅ **Unified setup** - Single script for all profiles  
✅ **MCP integration** - Jira, Confluence, GitHub, Mermaid  
✅ **Comprehensive docs** - Guides for devs and BAs  
✅ **Extensible** - Easy to add new profiles  

---

## Version

**Version:** 3.0.0 (Unified)  
**Profiles:** dev (18 agents), ba (4 agents)  
**Total Agents:** 22  
**Last Updated:** March 12, 2026  

---

## License

Internal Disney tool - not for external distribution.
