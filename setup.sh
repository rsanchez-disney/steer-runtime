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
  cli [--sync|--check|--clean]    Setup agents for Kiro CLI in ~/.kiro
                  --sync: Update existing files
                  --check: Validate installation
                  --clean: Remove old files
  
  ui              Setup agents for Kiro UI in current project
  
  mcp             Setup MCP server configuration for CLI
  
  check           Check dependencies and installation status

EXAMPLES:
  ./setup.sh cli              # Install agents for CLI
  ./setup.sh cli --sync       # Update CLI agents
  ./setup.sh ui               # Install agents in current project for UI
  ./setup.sh mcp              # Configure MCP servers
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
    
    # Copy skills and steering
    cp -r "$STEER_ROOT/.kiro/skills"/*.md "$KIRO_ROOT/skills/" 2>/dev/null || true
    cp -r "$STEER_ROOT/.kiro/steering"/*.md "$KIRO_ROOT/steering/" 2>/dev/null || true
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "✅ CLI setup complete!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📊 Installed: 23 agents"
    echo "📂 Location: $KIRO_ROOT"
    echo ""
    echo "Usage:"
    echo "  cd ~/my-project"
    echo "  kiro-cli chat --agent orchestrator"
    echo ""
    echo "Next: ./setup.sh mcp  (configure MCP servers)"
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

# CLI Check and Clean commands
if [ "$1" = "cli" ] && [ "$2" = "--check" ]; then
    echo "Checking ~/.kiro installation..."
    [ ! -d "$HOME/.kiro" ] && echo "✗ ~/.kiro not found" && exit 1
    echo "✓ Directory exists"
    count=$(ls -1 "$HOME/.kiro/agents"/*.json 2>/dev/null | wc -l | tr -d " ")
    echo "✓ $count agents installed (expected 18)"
    old_found=0
    for f in android-native ios-native backend_agent ui_agent webapi_agent orchestrator_agent orchestrator_multiagent; do
        [ -f "$HOME/.kiro/agents/$f.json" ] && echo "  ⚠️  Old: agents/$f.json" && ((old_found++))
        [ -f "$HOME/.kiro/prompts/$f.md" ] && echo "  ⚠️  Old: prompts/$f.md" && ((old_found++))
    done
    [ $old_found -gt 0 ] && echo "Run: ./setup.sh cli --clean" || echo "✓ No old files"
    exit 0
fi

if [ "$1" = "cli" ] && [ "$2" = "--clean" ]; then
    echo "Cleaning ~/.kiro..."
    [ ! -d "$HOME/.kiro" ] && echo "Nothing to clean" && exit 0
    removed=0
    for f in android-native ios-native backend_agent ui_agent webapi_agent orchestrator_agent orchestrator_multiagent; do
        [ -f "$HOME/.kiro/agents/$f.json" ] && rm -f "$HOME/.kiro/agents/$f.json" && echo "✓ Removed agents/$f.json" && ((removed++))
        [ -f "$HOME/.kiro/prompts/$f.md" ] && rm -f "$HOME/.kiro/prompts/$f.md" && echo "✓ Removed prompts/$f.md" && ((removed++))
    done
    echo "✅ Removed $removed file(s)"
    exit 0
fi

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
