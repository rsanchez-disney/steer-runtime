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
  ./setup.sh <command> [profiles...] [options]

COMMANDS:
  install <profiles> [--project <dir>]  Install one or more profiles
  list                                   List available profiles
  check                                  Verify installation
  mcp-install                            Install MCP server dependencies
  help                                   Show this help message

PROFILES:
  dev                 Development (18 agents)
  ba                  BA/PO (4 agents)

OPTIONS:
  --project <dir>     Install to project directory (for Kiro UI)
                      Default: ~/.kiro (for Kiro CLI)

EXAMPLES:
  ./setup.sh install dev                    # Install dev to ~/.kiro (CLI)
  ./setup.sh install ba                     # Install BA to ~/.kiro (CLI)
  ./setup.sh install dev ba                 # Install both to ~/.kiro (CLI)
  ./setup.sh install dev --project ~/myapp  # Install dev to ~/myapp/.kiro (UI)
  ./setup.sh list                           # Show available profiles
  ./setup.sh check                          # Check installation
  ./setup.sh mcp-install                    # Setup MCP servers

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
    local target_dir=$2
    local source_dir="$STEER_ROOT/.kiro-$profile"
    
    if [ ! -d "$source_dir" ]; then
        echo "❌ Profile not found: $profile"
        return 1
    fi
    
    echo "📦 Installing $profile profile to $target_dir..."
    
    mkdir -p "$target_dir/agents" "$target_dir/prompts"
    
    cp -r "$source_dir/agents/"* "$target_dir/agents/" 2>/dev/null || true
    cp -r "$source_dir/prompts/"* "$target_dir/prompts/" 2>/dev/null || true
    
    [ -d "$source_dir/context" ] && {
        mkdir -p "$target_dir/context"
        cp -r "$source_dir/context/"* "$target_dir/context/"
    }
    
    [ -d "$source_dir/powers" ] && {
        mkdir -p "$target_dir/powers"
        cp -r "$source_dir/powers/"* "$target_dir/powers/"
    }
    
    [ -d "$source_dir/skills" ] && {
        mkdir -p "$target_dir/skills"
        cp -r "$source_dir/skills/"* "$target_dir/skills/"
    }
    
    [ -d "$source_dir/steering" ] && {
        mkdir -p "$target_dir/steering"
        cp -r "$source_dir/steering/"* "$target_dir/steering/"
    }
    
    local agent_count=$(find "$source_dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    echo "✓ Installed $profile ($agent_count agents)"
}

install_shared() {
    local target_dir=$1
    echo "📦 Installing shared tools to $target_dir..."
    
    if [ -d "$STEER_ROOT/.kiro/tools" ]; then
        mkdir -p "$target_dir/tools"
        cp -r "$STEER_ROOT/.kiro/tools/"* "$target_dir/tools/"
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
        
        # Parse arguments
        profiles=()
        project_dir=""
        
        while [ $# -gt 0 ]; do
            case "$1" in
                --project)
                    shift
                    if [ $# -eq 0 ]; then
                        echo "❌ --project requires a directory argument"
                        exit 1
                    fi
                    project_dir="$1"
                    shift
                    ;;
                *)
                    profiles+=("$1")
                    shift
                    ;;
            esac
        done
        
        # Determine target directory
        if [ -n "$project_dir" ]; then
            # Expand tilde
            project_dir="${project_dir/#\~/$HOME}"
            
            # Create project directory if it doesn't exist
            if [ ! -d "$project_dir" ]; then
                echo "❌ Project directory does not exist: $project_dir"
                exit 1
            fi
            
            target_root="$project_dir/.kiro"
            echo "🎯 Target: $target_root (Kiro UI)"
        else
            target_root="$KIRO_ROOT"
            echo "🎯 Target: $target_root (Kiro CLI)"
        fi
        
        install_shared "$target_root"
        
        for profile in "${profiles[@]}"; do
            install_profile "$profile" "$target_root"
        done
        
        total=$(find "$target_root/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "✅ Installation complete ($total agents total)"
        
        if [ -n "$project_dir" ]; then
            echo ""
            echo "📝 For Kiro UI:"
            echo "   Open Kiro UI and select: $project_dir"
        fi
        ;;
    list)
        list_profiles
        ;;
    check)
        echo "🔍 Installation status:"
        [ -d "$KIRO_ROOT/agents" ] && echo "✓ CLI agents directory exists" || echo "❌ No CLI agents"
        total=$(find "$KIRO_ROOT/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo "✓ Total CLI agents: $total"
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
