# Using steer-runtime with Kiro UI

## Differences: CLI vs UI

| Aspect         | kiro-cli                   | Kiro UI                   |
|----------------|----------------------------|---------------------------|
| Agent location | `~/.kiro/agents/` (global) | `.kiro/agents/` (project) |
| Resource paths | `file://~/.kiro/context/`  | `file://.kiro/context/`   |
| Prompt paths   | Absolute or relative       | Relative to agent file    |
| Invocation     | `--agent agent_name`       | Select from UI dropdown   |

## Setup for Kiro UI

### Option 1: Copy to Target Project (Recommended)

```bash
# Navigate to your project
cd ~/my-project

# Copy steer-runtime agents to project
cp -r ~/steer-runtime/.kiro .kiro

# Update resource paths
find .kiro/agents -name "*.json" -exec sed -i '' 's|file://~/\.kiro/|file://.kiro/|g' {} \;

# Open project in Kiro UI
# Agents will appear in the agent selector
```

### Option 2: Symlink (Development)

```bash
cd ~/my-project
ln -s ~/steer-runtime/.kiro .kiro

# Note: Resource paths still need updating for UI
```

### Option 3: Use CLI Agents from UI

Kiro UI can access CLI agents if configured:

1. Keep agents in `~/.kiro/agents/`
2. In Kiro UI settings, enable "Use global agents"
3. Agents will appear in dropdown

## Updated Agent Format for UI

Create `.kiro/agents/orchestrator_agent.json` in your project:

```json
{
  "name": "orchestrator_agent",
  "description": "Main workflow orchestrator for automated SDLC",
  "prompt": "../prompts/orchestrator_agent.md",
  "tools": [
    "use_subagent",
    "execute_bash",
    "fs_read",
    "fs_write",
    "grep",
    "code"
  ],
  "resources": [
    "file://.kiro/context/golden_rules.md",
    "file://.kiro/context/project_mappings.md"
  ],
  "welcomeMessage": "Ready to orchestrate your workflow!"
}
```

## Quick Setup Script

Run this in your target project:

```bash
#!/bin/bash
# setup.sh ui

PROJECT_ROOT=$(pwd)
STEER_ROOT="$HOME/steer-runtime"

# Copy agents
cp -r "$STEER_ROOT/.kiro" "$PROJECT_ROOT/.kiro"

# Update resource paths for UI
find "$PROJECT_ROOT/.kiro/agents" -name "*.json" -exec sed -i '' \
  's|file://~/\.kiro/|file://.kiro/|g' {} \;

# Update prompt paths to be relative
find "$PROJECT_ROOT/.kiro/agents" -name "*.json" -exec sed -i '' \
  's|"prompt": "\([^/]*\.md\)"|"prompt": "../prompts/\1"|g' {} \;

echo "✅ steer-runtime agents ready for Kiro UI"
echo "Open this project in Kiro UI and select orchestrator_agent"
```

## Usage in Kiro UI

1. **Open your project** in Kiro UI
2. **Select agent** from dropdown: `orchestrator_agent`
3. **Provide Jira URL**: `Implement https://disneyexperiences.atlassian.net/browse/DPAY-14337`
4. **Approve at gates** when prompted
5. **PR created** automatically

## Limitations

- **Subagent delegation**: May work differently in UI vs CLI
- **Tool availability**: Ensure all tools are enabled in UI settings
- **MCP servers**: Must be configured in UI (Jira, GitHub)

## Recommended Approach

**For production use**: Keep using `kiro-cli` with global agents (`~/.kiro/`)

**For UI testing**: Copy agents to project (`.kiro/`) with updated paths

**Hybrid**: Use CLI for orchestration, UI for manual agent invocation

---

**Note**: Kiro UI agent support may vary by version. Check Kiro documentation for latest compatibility.
