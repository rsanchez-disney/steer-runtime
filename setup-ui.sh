#!/bin/bash
# Setup steer-runtime agents for Kiro UI
# Run this in your target project directory

set -e

PROJECT_ROOT=$(pwd)
STEER_ROOT="$HOME/steer-runtime"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        Setup steer-runtime Agents for Kiro UI               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if steer-runtime exists
if [ ! -d "$STEER_ROOT/.kiro" ]; then
    echo "❌ Error: $STEER_ROOT/.kiro not found"
    echo "   Please ensure steer-runtime is cloned to ~/steer-runtime"
    exit 1
fi

# Check if already exists
if [ -d "$PROJECT_ROOT/.kiro-steer" ]; then
    echo "⚠️  .kiro-steer already exists in this project"
    read -p "   Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    rm -rf "$PROJECT_ROOT/.kiro-steer"
fi

# Copy agents
echo "📦 Copying agents to .kiro-steer/..."
cp -r "$STEER_ROOT/.kiro" "$PROJECT_ROOT/.kiro-steer"

# Update resource paths for UI (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔧 Updating resource paths for Kiro UI (macOS)..."
    find "$PROJECT_ROOT/.kiro-steer/agents" -name "*.json" -exec sed -i '' \
      's|file://~/\.kiro/|file://.kiro-steer/|g' {} \;
else
    # Linux
    echo "🔧 Updating resource paths for Kiro UI (Linux)..."
    find "$PROJECT_ROOT/.kiro-steer/agents" -name "*.json" -exec sed -i \
      's|file://~/\.kiro/|file://.kiro-steer/|g' {} \;
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📂 Agents installed in: .kiro-steer/"
echo ""
echo "🚀 Next steps:"
echo "   1. Open this project in Kiro UI"
echo "   2. Select 'orchestrator_agent' from agent dropdown"
echo "   3. Provide Jira URL to start workflow"
echo ""
echo "💡 Tip: Ensure MCP servers (Jira, GitHub) are configured in Kiro UI"
echo ""

echo "⚙️  MCP Server Configuration Required"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "steer-runtime requires 2 MCP servers:"
echo "  • Jira MCP (for story_analyzer_agent)"
echo "  • GitHub MCP (for pr_creator_agent)"
echo ""
echo "Configure in Kiro UI:"
echo "  Settings → MCP Servers → Add Server"
echo ""
echo "See MCP_SETUP.md for detailed instructions"
echo ""
