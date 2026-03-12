# steer-runtime

**Multi-Agent Development System for Config Studio**

Specialized Kiro agents for orchestrating development across backend (Java), webapi (Node.js), UI (Angular), and mobile (Flutter/Android/iOS) repositories.

---

## Quick Start

### 1. Clone Repository

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime
```

### 2. Check Dependencies

```bash
./setup.sh check
```

Requires: Node.js 18+, npm, kiro-cli, git

### 3. Setup for Kiro CLI

```bash
./setup.sh cli
```

Installs 20 agents and MCP server tools to `~/.kiro/`

### 4. Install MCP Server Dependencies

```bash
./setup.sh mcp-install
```

Installs npm dependencies and configures credentials for:
- Jira MCP
- Confluence MCP
- GitHub MCP
- Mermaid Diagram MCP

The script will:
1. Run `npm install` in each MCP server project
2. Copy `.env.example` to `.env` for each project
3. Prompt you to configure credentials interactively
4. Display token generation URLs for each service

### 5. Use in Your Project

```bash
cd ~/my-project
kiro-cli chat --agent orchestrator
```

---

## What's Included

### 23 Specialized Agents

**Orchestration (3 agents)**
- `orchestrator` - Routes work to specialized agents
- `orchestrator_agent` - Generic orchestration
- `orchestrator_multiagent` - Advanced multi-agent patterns

**Config Studio Specialists (3 agents)**
- `backend` - Java services (wdpr-config-services)
- `webapi` - Node.js API (wdpr-payment-controls-api)
- `ui` - Angular frontend (wdpr-payment-controls-client)

**Mobile Development (3 agents)**
- `flutter` - Dart/Flutter cross-platform
- `android_native` - Kotlin/Java platform channels
- `ios_native` - Swift/Obj-C platform channels

**Planning & Analysis (4 agents)**
- `planner_agent` - Task planning and breakdown
- `story_analyzer_agent` - Jira story analysis
- `architecture_agent` - Architecture review
- `codebase_explorer_agent` - Code exploration

**Quality & Security (5 agents)**
- `code_review_agent` - Code review
- `security_scanner_agent` - Security analysis
- `compliance_agent` - Compliance validation
- `test_runner_agent` - Test execution
- `performance_agent` - Performance optimization

**Workflow (2 agents)**
- `pr_creator_agent` - Pull request creation
- `discussion_agent` - Technical discussions

See `AGENTS.md` for complete reference.

### 4 Development Powers

- **git-ops** - Git operations (status, diff, log)
- **code-analysis** - Find files, search code, count lines
- **file-ops** - Backup, compare, find duplicates
- **test-runner** - Run tests, find tests, coverage

See `.kiro/powers/GUIDE.md` for creating custom powers.

### 4 MCP Servers

- **jira-mcp** - Jira integration for story analysis
- **confluence-mcp** - Confluence documentation access
- **github-mcp** - GitHub repository operations
- **mermaid-diagram-mcp** - Diagram generation

Located in `.kiro/tools/mcp-servers/` with relative path configuration.

---

## Setup Options

### For Kiro CLI

Install agents globally:
```bash
./setup.sh cli
```

Update existing agents:
```bash
./setup.sh cli --sync
```

Install MCP server dependencies:
```bash
./setup.sh mcp-install
```

This will:
- Install npm packages for each MCP server
- Create `.env` files from `.env.example`
- Prompt for credentials with token generation URLs
- Configure Jira, Confluence, and GitHub access

### For Kiro UI

Install agents in project:
```bash
cd ~/my-project
~/steer-runtime/setup.sh ui
```

### MCP Configuration

Setup Jira and GitHub integration:
```bash
./setup.sh mcp
```

See `docs/MCP_SETUP.md` for details.

---

## Usage Examples

### Feature Implementation

```bash
kiro-cli chat --agent orchestrator
> Review JIRA story DPAY-14561 and create implementation plan
```

Orchestrator coordinates backend, webapi, and ui agents.

### Mobile Development

```bash
kiro-cli chat --agent orchestrator
> Add biometric authentication to the Flutter app
```

Orchestrator coordinates flutter, android_native, and ios_native agents.

### Code Review

```bash
kiro-cli chat --agent code_review_agent
> Review changes in src/app/features/
```

### Architecture Review

```bash
kiro-cli chat --agent architecture_agent
> Review the proposed microservices architecture
```

See `docs/PROMPT_GUIDE.md` for effective prompts.

---

## Project Structure

```
steer-runtime/
├── .kiro/                  # All configuration
│   ├── agents/            # 23 agent configs
│   ├── prompts/           # Agent prompts
│   ├── skills/            # Specialized skills
│   ├── steering/          # Project steering docs
│   ├── powers/            # Development powers
│   ├── context/           # Project context
│   └── tools/             # MCP servers
│       └── mcp-servers/   # MCP server projects
│           ├── jira-mcp/
│           ├── confluence-mcp/
│           ├── github-mcp/
│           └── mermaid-diagram-mcp/
├── docs/                   # Documentation
│   ├── PROMPT_GUIDE.md
│   ├── MOBILE_AGENTS_SETUP.md
│   ├── KIRO_CLI_VS_UI.md
│   └── ...
├── setup.sh               # Unified setup script
├── README.md              # This file
└── AGENTS.md              # Agent reference
```

---

## Documentation

**Getting Started**
- `README.md` - Quick start (this file)
- `AGENTS.md` - Complete agent reference
- `docs/SETUP_GUIDE.md` - Detailed setup instructions

**Usage Guides**
- `docs/PROMPT_GUIDE.md` - How to use agents effectively
- `docs/KIRO_CLI_VS_UI.md` - CLI vs UI comparison
- `.kiro/powers/GUIDE.md` - Creating custom powers

**Setup & Configuration**
- `docs/MCP_SETUP.md` - MCP server configuration
- `docs/KIRO_UI_SETUP.md` - Kiro UI setup
- `docs/MOBILE_AGENTS_SETUP.md` - Mobile development setup

**Architecture**
- `docs/DESIGN.md` - System architecture
- `.kiro/README.md` - Configuration structure

---

## Requirements

- **Node.js 18+** - Runtime for MCP servers
- **npm** - Package manager
- **kiro-cli** or **Kiro UI** - Agent runtime
- **git** - Version control

Install missing dependencies:
```bash
# macOS
brew install node git
npm install -g @kiro/cli

# Linux
apt install nodejs npm git
npm install -g @kiro/cli
```

---

## Features

✅ **23 specialized agents** - Orchestrator, backend, ui, webapi, mobile, utilities
✅ **Multi-repo coordination** - Seamless work across repositories
✅ **Mobile development** - Flutter, Android, iOS support
✅ **MCP server integration** - Jira, Confluence, GitHub, Mermaid
✅ **Development powers** - Git, code analysis, file ops, testing
✅ **Unified setup** - Single script for all configurations
✅ **Interactive credential setup** - Guided token configuration
✅ **Comprehensive docs** - Guides, examples, troubleshooting

---

## Troubleshooting

### Agents not found
```bash
# Verify installation
ls ~/.kiro/agents/

# Reinstall
./setup.sh cli --sync
```

### MCP servers not working
```bash
# Check MCP servers are installed
ls ~/.kiro/tools/mcp-servers/

# Reinstall dependencies
./setup.sh mcp-install

# Verify .env files exist
ls ~/.kiro/tools/mcp-servers/*/.env

# Test with story analyzer
kiro-cli chat --agent story_analyzer_agent
```

### Dependencies missing
```bash
./setup.sh check
```

### MCP server credentials
```bash
# Reconfigure credentials
cd ~/.kiro/tools/mcp-servers/jira-mcp
nano .env

# Token URLs:
# Jira/Confluence: https://id.atlassian.com/manage-profile/security/api-tokens
# GitHub: https://github.com/settings/tokens/new
```

See `docs/SETUP_GUIDE.md` for more troubleshooting.

---

## Contributing

1. Add new agents to `.kiro/agents/`
2. Create prompts in `.kiro/prompts/`
3. Add skills to `.kiro/skills/`
4. Update `AGENTS.md`
5. Test with `./setup.sh cli --sync`

---

## Version

**Version:** 2.1.0  
**Last Updated:** March 12, 2026  
**Agents:** 23  
**Powers:** 4  
**MCP Servers:** 4  
**Repositories:** Config Studio (backend, webapi, ui) + Mobile

---

## License

Internal Disney tool - not for external distribution.
