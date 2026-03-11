#!/bin/bash
# Create steer-runtime distribution package with MCP servers

set -e

VERSION="1.0.0"
DIST_NAME="steer-runtime-v${VERSION}"
DIST_DIR="dist/${DIST_NAME}"
MCP_SOURCE="$HOME/Workspace/Disney/mcp-servers"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        Creating steer-runtime Distribution Package          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Clean previous dist
rm -rf dist
mkdir -p "$DIST_DIR"

# Copy core files
echo "📦 Copying core files..."
cp -r .kiro "$DIST_DIR/"
cp setup-kiro.sh "$DIST_DIR/"
cp setup-ui.sh "$DIST_DIR/"
cp setup-mcp-cli.sh "$DIST_DIR/"

# Copy documentation
echo "📚 Copying documentation..."
for doc in README.md DESIGN.md IMPLEMENTATION_PLAN.md GSD_ENHANCEMENTS.md \
           JIRA_COMPLETENESS_CRITERIA.md ORCHESTRATOR_COMPARISON.md \
           ORCHESTRATOR_DELEGATION_REVIEW.md PHASE2_COMPLETE.md \
           AGENTS_OVERVIEW.md KIRO_UI_SETUP.md MCP_SETUP.md MCP_DISTRIBUTION.md; do
    [ -f "$doc" ] && cp "$doc" "$DIST_DIR/"
done

# Copy MCP config template
echo "🔧 Copying MCP configuration..."
cp mcp-config-template.json "$DIST_DIR/"

# Copy MCP servers if they exist
if [ -d "$MCP_SOURCE" ]; then
    echo "🔌 Copying MCP servers..."
    mkdir -p "$DIST_DIR/mcp-servers"
    
    for mcp in jira-mcp github-mcp confluence-mcp mermaid-diagram-mcp; do
        if [ -d "$MCP_SOURCE/$mcp" ]; then
            echo "  • Copying $mcp..."
            mkdir -p "$DIST_DIR/mcp-servers/$mcp"
            
            # Copy only necessary files (exclude node_modules, .git, etc.)
            rsync -a --exclude='node_modules' \
                     --exclude='.git' \
                     --exclude='.env' \
                     --exclude='*.log' \
                     "$MCP_SOURCE/$mcp/" "$DIST_DIR/mcp-servers/$mcp/"
        fi
    done
else
    echo "⚠️  MCP servers not found at $MCP_SOURCE"
    mkdir -p "$DIST_DIR/mcp-servers"
    echo "# Place custom MCP servers here" > "$DIST_DIR/mcp-servers/README.md"
fi



# Create README for distribution
cat > "$DIST_DIR/INSTALL.txt" << 'READMEEOF'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              steer-runtime Distribution Package              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Extract this package
2. Run: ./install.sh
3. Follow on-screen instructions

WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• 16 specialized Kiro agents
• Setup scripts for CLI and UI
• MCP server configuration templates
• Custom MCP servers (jira-mcp, github-mcp, etc.)
• Complete documentation

REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Kiro CLI or Kiro UI installed
• Node.js 18+ (for MCP servers)
• Git (for workflow)
• Jira and GitHub access

MCP SERVERS INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• jira-mcp - Fetch Jira tickets
• github-mcp - Create PRs and manage repos
• confluence-mcp - Access Confluence pages
• mermaid-diagram-mcp - Generate diagrams

DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• README.md - Quick start guide
• MCP_SETUP.md - MCP server configuration
• AGENTS_OVERVIEW.md - All agents reference
• KIRO_UI_SETUP.md - Kiro UI setup guide

SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For issues or questions, see documentation or contact your team.
READMEEOF

# Create zip file
echo ""
echo "📦 Creating zip archive..."
cd dist
zip -r "${DIST_NAME}.zip" "${DIST_NAME}" -q
cd ..

# Calculate size
SIZE=$(du -h "dist/${DIST_NAME}.zip" | cut -f1)

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Distribution package created!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📦 Package: dist/${DIST_NAME}.zip"
echo "📊 Size: $SIZE"
echo ""
echo "📋 Contents:"
echo "  • 16 Kiro agents"
echo "  • Setup scripts (CLI, UI, MCP)"
echo "  • Complete documentation"
if [ -d "$MCP_SOURCE" ]; then
    echo "  • MCP servers:"
    for mcp in jira-mcp github-mcp confluence-mcp mermaid-diagram-mcp; do
        [ -d "$DIST_DIR/mcp-servers/$mcp" ] && echo "    - $mcp"
    done
fi
echo ""
echo "🚀 Distribution ready for sharing!"
echo ""

# Create installation script with dependency validation
echo "📝 Creating installation script..."
cp /tmp/install-with-deps.sh "$DIST_DIR/install.sh"
chmod +x "$DIST_DIR/install.sh"
