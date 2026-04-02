# steer-runtime Setup Guide

Quick guide to setting up steer-runtime agents.

## Prerequisites

- Node.js 18+
- npm
- Kiro CLI or Kiro UI
- Git

Check dependencies:
```bash
./setup.sh check
```

## Setup for Kiro CLI

Install agents to `~/.kiro/`:

```bash
./setup.sh cli
```

Update existing agents:
```bash
./setup.sh cli --sync
```

## Setup for Kiro UI

Install agents in current project:

```bash
cd ~/my-project
~/steer-runtime/setup.sh ui
```

This creates `.kiro/` in your project directory.

## Configure MCP Servers

Required for Jira and GitHub integration:

```bash
./setup.sh mcp
```

Then edit `~/.kiro/config.json` and add your tokens:
- Jira API token: https://id.atlassian.com/manage-profile/security/api-tokens
- GitHub PAT: https://github.com/settings/tokens

## Usage

### Kiro CLI
```bash
cd ~/my-project
kiro-cli chat --agent orchestrator
```

### Kiro UI
1. Open project in Kiro UI
2. Select agent from dropdown
3. Start chatting

## Available Agents

See `AGENTS.md` for complete list of 23 agents.

**Main agents:**
- `orchestrator` - Coordinates multi-repo work
- `backend` - Java services
- `webapi` - Node.js API
- `ui` - Angular frontend
- `flutter` - Mobile (Dart/Flutter)
- `android_native` - Android platform
- `ios_native` - iOS platform

**Utility agents:**
- `planner_agent` - Task planning
- `architecture_agent` - Architecture review
- `code_review_agent` - Code review
- `security_scanner_agent` - Security analysis
- And more...

## Troubleshooting

### Missing dependencies
```bash
# macOS
brew install node git
npm install -g @kiro/cli

# Linux
apt install nodejs npm git
npm install -g @kiro/cli
```

### Agents not found
Make sure you ran the setup in the correct location:
- CLI: Run from steer-runtime directory
- UI: Run from your project directory

### MCP servers not working
1. Check `~/.kiro/config.json` exists
2. Verify tokens are correct (not placeholders)
3. Test with: `kiro-cli chat --agent story_analyzer_agent`

## Documentation

- `AGENTS.md` - Complete agent reference
- `docs/PROMPT_GUIDE.md` - How to use agents effectively
- `docs/MOBILE_AGENTS_SETUP.md` - Mobile development setup
- `docs/MCP_SETUP.md` - Detailed MCP configuration
- `.kiro/README.md` - Configuration structure

## Quick Reference

```bash
# Check dependencies
./setup.sh check

# Setup for CLI
./setup.sh cli

# Setup for UI (in project dir)
./setup.sh ui

# Configure MCP
./setup.sh mcp

# Get help
./setup.sh --help
```
