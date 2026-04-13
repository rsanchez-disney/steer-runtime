# steer-runtime Documentation Index

Complete guide to all documentation.

## Getting Started

1. **[README.md](../README.md)** - Quick start guide
2. **[GETTING_STARTED.md](GETTING_STARTED.md)** - First-time setup (SSO, access, downloads)
3. **[SETUP.md](SETUP.md)** - Detailed installation (macOS/Linux)
4. **[WINDOWS_SETUP.md](WINDOWS_SETUP.md)** - Windows installation (WSL)
5. **[AGENTS.md](../AGENTS.md)** - Complete agent reference (55 agents)

## Usage Guides

- **[PROMPT_GUIDE.md](PROMPT_GUIDE.md)** - How to use agents effectively with examples
- **[KIRO_CLI_VS_UI.md](KIRO_CLI_VS_UI.md)** - When to use CLI vs UI
- **[Powers Guide](../profiles/dev-core/powers/GUIDE.md)** - Creating custom powers

## Setup & Configuration

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - First-time setup (SSO, access)
- **[SETUP.md](SETUP.md)** - Complete setup instructions (macOS/Linux)
- **[WINDOWS_SETUP.md](WINDOWS_SETUP.md)** - Windows setup (WSL)
- **[MCP_SETUP.md](MCP_SETUP.md)** - MCP server configuration (Jira, GitHub)
- **[KIRO_UI_SETUP.md](KIRO_UI_SETUP.md)** - Kiro UI specific setup
- **[MOBILE_AGENTS_SETUP.md](MOBILE_AGENTS_SETUP.md)** - Mobile development setup

## Architecture & Design

- **[DESIGN.md](DESIGN.md)** - System architecture and design decisions
- **[ORCHESTRATOR_DELEGATION_REVIEW.md](ORCHESTRATOR_DELEGATION_REVIEW.md)** - Orchestration patterns

## Change History

- **[SETUP_CONSOLIDATION.md](SETUP_CONSOLIDATION.md)** - Setup script consolidation (March 2026)

## Quick Links

### For New Users
1. [README.md](../README.md) - Start here
2. [GETTING_STARTED.md](GETTING_STARTED.md) - Access & SSO
3. [SETUP.md](SETUP.md) / [WINDOWS_SETUP.md](WINDOWS_SETUP.md) - Installation
4. [AGENTS.md](../AGENTS.md) - Available agents

### For Developers
1. [PROMPT_GUIDE.md](PROMPT_GUIDE.md) - Effective prompts
2. [DESIGN.md](DESIGN.md) - Architecture
3. [Powers Guide](../profiles/dev-core/powers/GUIDE.md) - Custom powers

### For Mobile Development
1. [MOBILE_AGENTS_SETUP.md](MOBILE_AGENTS_SETUP.md) - Setup
2. [AGENTS.md](../AGENTS.md#mobile-agents) - Mobile agents
3. [PROMPT_GUIDE.md](PROMPT_GUIDE.md) - Mobile prompts

## File Organization

```
steer-runtime/
├── README.md              # Main entry point
├── AGENTS.md              # Agent reference
├── setup.sh               # Bash fallback (Koda is primary)
├── docs/                  # All documentation
│   ├── INDEX.md          # This file
│   ├── GETTING_STARTED.md
│   ├── SETUP.md
│   ├── WINDOWS_SETUP.md
│   ├── PROMPT_GUIDE.md
│   ├── KIRO_CLI_VS_UI.md
│   ├── MCP_SETUP.md
│   ├── KIRO_UI_SETUP.md
│   ├── MOBILE_AGENTS_SETUP.md
│   ├── DESIGN.md
│   ├── DOCUMENTATION_STATUS.md
│   ├── HOOKS_AND_POWERS.md
│   ├── ORCHESTRATOR_DELEGATION_REVIEW.md
│   └── SETUP_CONSOLIDATION.md
```

## Need Help?

1. Check [SETUP.md](SETUP.md) troubleshooting section
2. Run `koda check` to verify dependencies
3. Review [AGENTS.md](../AGENTS.md) for agent capabilities
4. See [PROMPT_GUIDE.md](PROMPT_GUIDE.md) for usage examples

---

**Last Updated:** April 13, 2026
