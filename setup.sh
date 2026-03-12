#!/bin/bash
# Unified setup for steer-runtime (multi-profile support)

set -e

STEER_ROOT="$(cd "$(dirname "$0")" && pwd)"
KIRO_ROOT="$HOME/.kiro"

show_usage() {
    cat << 'USAGE'
╔══════════════════════════════════════════════════════════════╗
║           steer-runtime Unified Setup                        ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  ./setup.sh <command> [profiles...]

COMMANDS:
  install <profiles>  Install one or more profiles
  list                List available profiles
  check               Verify installation
  mcp-install         Install MCP server dependencies
  help                Show this help message

PROFILES:
  dev                 Development (18 agents)
  ba                  BA/PO (4 agents)

EXAMPLES:
  ./setup.sh install dev          # Install dev only
  ./setup.sh install ba           # Install BA only
  ./setup.sh install dev ba       # Install both
  ./setup.sh list                 # Show available profiles
  ./setup.sh check                # Check installation
  ./setup.sh mcp-install          # Setup MCP servers

USAGE
}

list_profiles() {
    echo "📋 Available profiles:"
    echo ""
    for dir in "$STEER_ROOT"/.kiro-*; do
        if [ -d "$dir" ]; then
            profile=$(basename "$dir" | sed 's/^\.kiro-//')
            agent_count=$(find "$dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
            echo "  • $profile ($agent_count agents)"
        fi
    done
}

install_profile() {
    local profile=$1
    local source_dir="$STEER_ROOT/.kiro-$profile"
    
    if [ ! -d "$source_dir" ]; then
        echo "❌ Profile not found: $profile"
        return 1
    fi
    
    echo "📦 Installing $profile profile..."
    
    mkdir -p "$KIRO_ROOT/agents" "$KIRO_ROOT/prompts"
    
    cp -r "$source_dir/agents/"* "$KIRO_ROOT/agents/" 2>/dev/null || true
    cp -r "$source_dir/prompts/"* "$KIRO_ROOT/prompts/" 2>/dev/null || true
    
    [ -d "$source_dir/context" ] && {
        mkdir -p "$KIRO_ROOT/context"
        cp -r "$source_dir/context/"* "$KIRO_ROOT/context/"
    }
    
    [ -d "$source_dir/powers" ] && {
        mkdir -p "$KIRO_ROOT/powers"
        cp -r "$source_dir/powers/"* "$KIRO_ROOT/powers/"
    }
    
    [ -d "$source_dir/skills" ] && {
        mkdir -p "$KIRO_ROOT/skills"
        cp -r "$source_dir/skills/"* "$KIRO_ROOT/skills/"
    }
    
    [ -d "$source_dir/steering" ] && {
        mkdir -p "$KIRO_ROOT/steering"
        cp -r "$source_dir/steering/"* "$KIRO_ROOT/steering/"
    }
    
    local agent_count=$(find "$source_dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    echo "✓ Installed $profile ($agent_count agents)"
}

install_shared() {
    echo "📦 Installing shared tools..."
    
    if [ -d "$STEER_ROOT/.kiro/tools" ]; then
        mkdir -p "$KIRO_ROOT/tools"
        cp -r "$STEER_ROOT/.kiro/tools/"* "$KIRO_ROOT/tools/"
        echo "✓ Installed MCP servers"
    fi
}

case "${1:-help}" in
    install)
        shift
        if [ $# -eq 0 ]; then
            echo "❌ No profiles specified"
            echo ""
            show_usage
            exit 1
        fi
        
        install_shared
        
        for profile in "$@"; do
            install_profile "$profile"
        done
        
        total=$(find "$KIRO_ROOT/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "✅ Installation complete ($total agents total)"
        ;;
    list)
        list_profiles
        ;;
    check)
        echo "🔍 Installation status:"
        [ -d "$KIRO_ROOT/agents" ] && echo "✓ Agents directory exists" || echo "❌ No agents"
        total=$(find "$KIRO_ROOT/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo "✓ Total agents: $total"
        ;;
    mcp-install)
        echo "📦 Installing MCP dependencies..."
        for mcp in "$KIRO_ROOT/tools/mcp-servers"/*; do
            if [ -d "$mcp" ] && [ -f "$mcp/package.json" ]; then
                echo "Installing $(basename $mcp)..."
                (cd "$mcp" && npm install)
            fi
        done
        echo "✅ MCP servers ready"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
