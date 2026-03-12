#!/bin/bash
# Unified setup script for steer-runtime
# Supports: CLI, UI, and MCP configuration

set -e

STEER_ROOT="$(cd "$(dirname "$0")" && pwd)"
KIRO_ROOT="$HOME/.kiro"
PROJECT_ROOT=$(pwd)

show_usage() {
    cat << 'USAGE'
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              steer-runtime Setup Script                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  ./setup.sh <command> [options]

COMMANDS:
  cli [--sync]    Setup agents for Kiro CLI in ~/.kiro
                  --sync: Update existing files
  
  ui              Setup agents for Kiro UI in current project
  
  mcp             Setup MCP server configuration for CLI
  
  mcp-install     Install dependencies for MCP server projects
  
  check           Check dependencies and installation status

EXAMPLES:
  ./setup.sh cli              # Install agents for CLI
  ./setup.sh cli --sync       # Update CLI agents
  ./setup.sh ui               # Install agents in current project for UI
  ./setup.sh mcp              # Configure MCP servers
  ./setup.sh mcp-install      # Install MCP server dependencies
  ./setup.sh check            # Check dependencies

USAGE
}

check_dependencies() {
    echo "🔍 Checking dependencies..."
    echo ""
    
    local all_ok=true
    
    # Check Node.js
    if command -v node &> /dev/null; then
        echo "✓ Node.js: $(node --version)"
    else
        echo "✗ Node.js: Not found"
        all_ok=false
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        echo "✓ npm: $(npm --version)"
    else
        echo "✗ npm: Not found"
        all_ok=false
    fi
    
    # Check kiro-cli
    if command -v kiro-cli &> /dev/null; then
        echo "✓ kiro-cli: $(kiro-cli --version 2>/dev/null || echo 'installed')"
    else
        echo "✗ kiro-cli: Not found"
        all_ok=false
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        echo "✓ git: $(git --version | cut -d' ' -f3)"
    else
        echo "✗ git: Not found"
        all_ok=false
    fi
    
    echo ""
    
    if [ "$all_ok" = false ]; then
        echo "⚠️  Missing dependencies detected"
        echo ""
        echo "Install missing dependencies:"
        echo "  macOS: brew install node git && npm install -g @kiro/cli"
        echo "  Linux: apt install nodejs npm git && npm install -g @kiro/cli"
        return 1
    fi
    
    echo "✅ All dependencies satisfied"
    return 0
}

setup_mcp_projects() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║         Install MCP Server Project Dependencies             ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    local mcp_dir="$KIRO_ROOT/tools/mcp-servers"
    local projects=("confluence-mcp" "github-mcp" "jira-mcp" "mermaid-diagram-mcp")
    
    if [ ! -d "$mcp_dir" ]; then
        echo "⚠️  MCP servers not found in $mcp_dir"
        echo ""
        echo "Run './setup.sh cli' first to copy agents and tools to ~/.kiro"
        echo ""
        exit 1
    fi
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║         Install MCP Server Project Dependencies             ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    local mcp_dir="$STEER_ROOT/.kiro/tools/mcp-servers"
    local projects=("confluence-mcp" "github-mcp" "jira-mcp" "mermaid-diagram-mcp")
    
    
    for project in "${projects[@]}"; do
        local project_path="$mcp_dir/$project"
        
        if [ ! -d "$project_path" ]; then
            echo "⊙ $project (not found, skipping)"
            continue
        fi
        
        echo "📦 Setting up $project..."
        
        # Copy .env.example to .env if it doesn't exist
        if [ -f "$project_path/.env.example" ] && [ ! -f "$project_path/.env" ]; then
            cp "$project_path/.env.example" "$project_path/.env"
            echo "  ✓ Created .env from .env.example"
        fi
        
        # Run npm install
        if [ -f "$project_path/package.json" ]; then
            (cd "$project_path" && npm install --silent)
            echo "  ✓ Dependencies installed"
        fi
        
        echo ""
    done
    
    echo "═══════════════════════════════════════════════════════════════="
    echo "✅ Dependencies installed!"
    echo "═══════════════════════════════════════════════════════════════="
    echo ""
    echo "🔑 Configure credentials for MCP servers"
    echo ""
    
    read -p "Would you like to configure credentials now? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "You can configure credentials later by editing:"
        for project in "${projects[@]}"; do
            if [ -f "$mcp_dir/$project/.env" ]; then
                echo "  • $mcp_dir/$project/.env"
            fi
        done
        echo ""
        return
    fi
    
    echo ""
    
    # Jira configuration
    if [ -f "$mcp_dir/jira-mcp/.env" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔧 Jira MCP Configuration"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Generate token: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo ""
        read -p "Jira email: " jira_email
        read -p "Jira API token: " jira_token
        read -p "Jira domain (e.g., yourcompany.atlassian.net): " jira_domain
        
        sed -i.bak "s|JIRA_EMAIL=.*|JIRA_EMAIL=$jira_email|" "$mcp_dir/jira-mcp/.env"
        sed -i.bak "s|JIRA_API_TOKEN=.*|JIRA_API_TOKEN=$jira_token|" "$mcp_dir/jira-mcp/.env"
        sed -i.bak "s|JIRA_DOMAIN=.*|JIRA_DOMAIN=$jira_domain|" "$mcp_dir/jira-mcp/.env"
        rm "$mcp_dir/jira-mcp/.env.bak"
        echo "  ✓ Jira configured"
        echo ""
    fi
    
    # Confluence configuration
    if [ -f "$mcp_dir/confluence-mcp/.env" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔧 Confluence MCP Configuration"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Generate token: https://id.atlassian.com/manage-profile/security/api-tokens"
        echo ""
        read -p "Confluence email: " confluence_email
        read -p "Confluence API token: " confluence_token
        read -p "Confluence domain (e.g., yourcompany.atlassian.net): " confluence_domain
        
        sed -i.bak "s|CONFLUENCE_EMAIL=.*|CONFLUENCE_EMAIL=$confluence_email|" "$mcp_dir/confluence-mcp/.env"
        sed -i.bak "s|CONFLUENCE_API_TOKEN=.*|CONFLUENCE_API_TOKEN=$confluence_token|" "$mcp_dir/confluence-mcp/.env"
        sed -i.bak "s|CONFLUENCE_DOMAIN=.*|CONFLUENCE_DOMAIN=$confluence_domain|" "$mcp_dir/confluence-mcp/.env"
        rm "$mcp_dir/confluence-mcp/.env.bak"
        echo "  ✓ Confluence configured"
        echo ""
    fi
    
    # GitHub configuration
    if [ -f "$mcp_dir/github-mcp/.env" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔧 GitHub MCP Configuration"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Generate token: https://github.com/settings/tokens/new"
        echo "Required scopes: repo, read:org"
        echo ""
        read -p "GitHub Personal Access Token: " github_token
        
        sed -i.bak "s|GITHUB_TOKEN=.*|GITHUB_TOKEN=$github_token|" "$mcp_dir/github-mcp/.env"
        rm "$mcp_dir/github-mcp/.env.bak"
        echo "  ✓ GitHub configured"
        echo ""
    fi
    
    # Mermaid (no credentials needed)
    if [ -f "$mcp_dir/mermaid-diagram-mcp/.env" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔧 Mermaid MCP Configuration"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  ✓ No credentials required"
        echo ""
    fi
    
    echo "═══════════════════════════════════════════════════════════════="
    echo "✅ MCP server projects setup complete!"
    echo "═══════════════════════════════════════════════════════════════="
    echo ""

setup_cli() {
    local sync_mode=false
    if [ "$1" = "--sync" ]; then
        sync_mode=true
    fi
    
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           Setup steer-runtime for Kiro CLI                  ║"
    if [ "$sync_mode" = true ]; then
        echo "║                    (SYNC MODE)                               ║"
    fi
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_dependencies || exit 1
    
    echo ""
    echo "📁 Creating Kiro directories..."
    mkdir -p "$KIRO_ROOT"/{agents,prompts,context,skills,steering}
    
    # Copy agents
    echo ""
    echo "📦 Copying agents..."
    for agent in "$STEER_ROOT/.kiro/agents"/*.json; do
        local agent_name=$(basename "$agent")
        if [ -f "$KIRO_ROOT/agents/$agent_name" ] && [ "$sync_mode" = false ]; then
            echo "  ⊙ $agent_name (exists, skipping)"
        else
            cp "$agent" "$KIRO_ROOT/agents/"
            echo "  ✓ $agent_name"
        fi
    done
    
    # Copy prompts
    echo ""
    echo "📝 Copying prompts..."
    cp "$STEER_ROOT/.kiro/prompts"/*.md "$KIRO_ROOT/prompts/" 2>/dev/null || true
    echo "  ✓ Prompts copied"
    
    # Copy context
    echo ""
    echo "📚 Copying context..."
    cp "$STEER_ROOT/.kiro/context"/*.md "$KIRO_ROOT/context/" 2>/dev/null || true
    echo "  ✓ Context copied"
    
    # Copy tools (MCP servers)
    echo ""
    echo "🔧 Copying MCP server tools..."
    if [ -d "$STEER_ROOT/.kiro/tools" ]; then
        mkdir -p "$KIRO_ROOT/tools"
        cp -r "$STEER_ROOT/.kiro/tools"/* "$KIRO_ROOT/tools/" 2>/dev/null || true
        echo "  ✓ Tools copied"
    fi
    
    # Copy skills and steering
    cp -r "$STEER_ROOT/.kiro/skills"/*.md "$KIRO_ROOT/skills/" 2>/dev/null || true
    cp -r "$STEER_ROOT/.kiro/steering"/*.md "$KIRO_ROOT/steering/" 2>/dev/null || true
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ CLI setup complete!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 Installed: 20 agents"
    echo "📂 Location: $KIRO_ROOT"
    echo ""
    echo "Usage:"
    echo "  cd ~/my-project"
    echo "  kiro-cli chat --agent orchestrator"
    echo ""
    echo "Next steps:"
    echo "  ./setup.sh mcp-install  (install MCP server dependencies)"
    echo "  ./setup.sh mcp          (configure MCP servers)"
    echo ""
}

setup_ui() {
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║           Setup steer-runtime for Kiro UI                   ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ -d "$PROJECT_ROOT/.kiro" ]; then
        echo "⚠️  .kiro already exists in this project"
        read -p "   Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 1
        fi
        rm -rf "$PROJECT_ROOT/.kiro"
    fi
    
    echo "📦 Copying agents to project..."
    cp -r "$STEER_ROOT/.kiro" "$PROJECT_ROOT/.kiro"
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ UI setup complete!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📂 Agents installed in: .kiro/"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Open this project in Kiro UI"
    echo "   2. Select 'orchestrator' from agent dropdown"
    echo "   3. Configure MCP servers in UI settings"
    echo ""
}

setup_mcp() {
    local kiro_config="$HOME/.kiro/config.json"
    local template="$STEER_ROOT/.kiro/mcp-config-template.json"
    
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║          Setup MCP Servers for Kiro CLI                     ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ -f "$kiro_config" ]; then
        echo "⚠️  $kiro_config already exists"
        echo ""
        echo "To add MCP servers manually:"
        echo "  1. Edit: $kiro_config"
        echo "  2. Add mcpServers section from: $template"
        echo "  3. Replace placeholder tokens"
        echo ""
        exit 0
    fi
    
    mkdir -p "$HOME/.kiro"
    
    echo "📝 Creating config template..."
    cp "$template" "$kiro_config"
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ Config template created!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  IMPORTANT: Add your tokens"
    echo ""
    echo "Edit: $kiro_config"
    echo ""
    echo "Replace:"
    echo "  • your.email@disney.com"
    echo "  • your-jira-api-token"
    echo "  • your-github-personal-access-token"
    echo ""
    echo "Get tokens:"
    echo "  Jira: https://id.atlassian.com/manage-profile/security/api-tokens"
    echo "  GitHub: https://github.com/settings/tokens"
    echo ""
}

# Main
case "${1:-}" in
    cli)
        setup_cli "$2"
        ;;
    ui)
        setup_ui
        ;;
    mcp)
        setup_mcp
        ;;
    mcp-install)
        setup_mcp_projects
        ;;
    check)
        check_dependencies
        ;;
    -h|--help|help|"")
        show_usage
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
