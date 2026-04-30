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
3. **Provide Jira URL**: `Implement https://myjira.disney.com/browse/DPAY-14337`
4. **Approve at gates** when prompted
5. **PR created** automatically

## Agent Routing (Recommended for Kiro IDE)

Kiro IDE does not read `~/.kiro/agents/*.json` directly. The **agent routing** mechanism
bridges this gap using steering files so that all kiro-cli agents are visible and delegatable
from Kiro IDE.

### Setup

1. Install profiles via Koda: `koda install dev-core dev-mobile qa`
2. Open Kiro IDE and say: **"sync my agents"**
3. This generates `~/.kiro/steering/70-agent-routing.md` (always-included routing table)
   plus per-agent manual steering files

From that point on, Kiro IDE knows about every installed agent and can delegate tasks
(e.g., "create a PR", "analyze this defect") to the correct specialist via `invokeSubAgent`.

See [Agent Routing E2E Examples](AGENT_ROUTING_E2E.md) for detailed walkthroughs.

### How it works

- The routing table maps trigger keywords to agent prompt files
- When a request matches, Kiro reads `~/.kiro/prompts/{agent}.md` and delegates via
  `invokeSubAgent` with `name: "general-task-execution"`
- For simple tasks, Kiro handles them directly using steering context — no delegation overhead
- For deep context, reference `#agent-{name}` in chat to load the full agent prompt inline

## Limitations

- **Subagent delegation**: Sub-agents run in isolated context; they inherit MCP access but not
  the parent conversation history
- **Tool availability**: Ensure MCP servers are configured in `~/.kiro/settings/mcp.json`
- **Routing table freshness**: Re-run "sync my agents" after installing or removing profiles

## Recommended Approach

**Primary**: Use Kiro IDE with agent routing — install profiles via Koda, sync once, then
delegate naturally through conversation.

**Fallback**: For agents that require specific tool bindings not available in Kiro IDE,
use `kiro-cli chat --agent {name}` directly.

---

**Note**: Kiro UI agent support may vary by version. Check Kiro documentation for latest compatibility.
