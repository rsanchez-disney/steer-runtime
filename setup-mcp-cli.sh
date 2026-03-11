#!/bin/bash
# Setup MCP servers for Kiro CLI
# This creates a config template - you must add your tokens

set -e

KIRO_CONFIG="$HOME/.kiro/config.json"
TEMPLATE="$(dirname "$0")/mcp-config-template.json"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          Setup MCP Servers for Kiro CLI                     ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if config already exists
if [ -f "$KIRO_CONFIG" ]; then
    echo "⚠️  $KIRO_CONFIG already exists"
    echo ""
    echo "To add MCP servers manually:"
    echo "  1. Edit: $KIRO_CONFIG"
    echo "  2. Add mcpServers section from: $TEMPLATE"
    echo "  3. Replace placeholder tokens with real values"
    echo ""
    exit 0
fi

# Create .kiro directory if needed
mkdir -p "$HOME/.kiro"

# Copy template
echo "📝 Creating config template at $KIRO_CONFIG..."
cp "$TEMPLATE" "$KIRO_CONFIG"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Config template created!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Add your tokens before using"
echo ""
echo "Edit: $KIRO_CONFIG"
echo ""
echo "Replace:"
echo "  • your.email@disney.com → Your Disney email"
echo "  • your-jira-api-token → Get from https://id.atlassian.com/manage-profile/security/api-tokens"
echo "  • your-github-personal-access-token → Get from https://github.com/settings/tokens"
echo ""
echo "Then test:"
echo "  kiro-cli chat --agent story_analyzer_agent"
echo "  > Fetch DPAY-14337"
echo ""
