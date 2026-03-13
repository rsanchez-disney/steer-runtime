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
  remove <profiles> [--project <dir>]   Remove specific profiles
  clean [--project <dir>]               Remove ALL profiles and agents
  list                                   List available profiles
  check                                  Verify installation
  mcp-install                            Install MCP server dependencies
  help                                   Show this help message

PROFILES:
  dev                 Development (18 agents)
  ba                  BA/PO (4 agents)
  qa                  QA/Testing (6 agents)

OPTIONS:
  --project <dir>     Target project directory (for Kiro UI)
                      Default: ~/.kiro (for Kiro CLI)

EXAMPLES:
  # Install
  ./setup.sh install dev                    # Install dev to ~/.kiro (CLI)
  ./setup.sh install ba qa                  # Install multiple profiles
  ./setup.sh install dev --project ~/myapp  # Install to project (UI)
  
  # Remove
  ./setup.sh remove ba                      # Remove BA profile
  ./setup.sh remove dev ba --project ~/app  # Remove from project
  
  # Clean
  ./setup.sh clean                          # Remove ALL from ~/.kiro
  ./setup.sh clean --project ~/myapp        # Remove ALL from project
  
  # Other
  ./setup.sh list                           # Show available profiles
  ./setup.sh check                          # Check installation

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

get_profile_agents() {
    local profile=$1
    local source_dir="$STEER_ROOT/.kiro-$profile"
    
    if [ ! -d "$source_dir/agents" ]; then
        return
    fi
    
    find "$source_dir/agents" -name "*.json" -exec basename {} .json \;
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

remove_profile() {
    local profile=$1
    local target_dir=$2
    
    echo "🗑️  Removing $profile profile from $target_dir..."
    
    # Get list of agents for this profile
    local agents=$(get_profile_agents "$profile")
    
    if [ -z "$agents" ]; then
        echo "⚠️  No agents found for profile: $profile"
        return
    fi
    
    local removed=0
    for agent in $agents; do
        if [ -f "$target_dir/agents/${agent}.json" ]; then
            rm -f "$target_dir/agents/${agent}.json"
            ((removed++))
        fi
        if [ -f "$target_dir/prompts/${agent}.md" ]; then
            rm -f "$target_dir/prompts/${agent}.md"
        fi
    done
    
    echo "✓ Removed $profile ($removed agents)"
}

clean_all() {
    local target_dir=$1
    
    echo "🧹 Cleaning ALL profiles from $target_dir..."
    echo ""
    read -p "⚠️  This will remove ALL agents and profiles. Continue? (y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 0
    fi
    
    local count=0
    [ -d "$target_dir/agents" ] && count=$(find "$target_dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    
    rm -rf "$target_dir/agents"
    rm -rf "$target_dir/prompts"
    rm -rf "$target_dir/context"
    rm -rf "$target_dir/powers"
    rm -rf "$target_dir/skills"
    rm -rf "$target_dir/steering"
    
    echo "✓ Removed $count agents"
    echo "✅ Clean complete"
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

get_target_dir() {
    local project_dir=$1
    
    if [ -n "$project_dir" ]; then
        project_dir="${project_dir/#\~/$HOME}"
        
        if [ ! -d "$project_dir" ]; then
            echo "❌ Project directory does not exist: $project_dir"
            exit 1
        fi
        
        echo "$project_dir/.kiro"
    else
        echo "$KIRO_ROOT"
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
        
        target_root=$(get_target_dir "$project_dir")
        [ -n "$project_dir" ] && echo "🎯 Target: $target_root (Kiro UI)" || echo "🎯 Target: $target_root (Kiro CLI)"
        
        install_shared "$target_root"
        
        for profile in "${profiles[@]}"; do
            install_profile "$profile" "$target_root"
        done
        
        total=$(find "$target_root/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "✅ Installation complete ($total agents total)"
        ;;
        
    remove)
        shift
        if [ $# -eq 0 ]; then
            echo "❌ No profiles specified"
            echo ""
            show_usage
            exit 1
        fi
        
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
        
        target_root=$(get_target_dir "$project_dir")
        echo "🎯 Target: $target_root"
        
        for profile in "${profiles[@]}"; do
            remove_profile "$profile" "$target_root"
        done
        
        remaining=$(find "$target_root/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "✅ Removal complete ($remaining agents remaining)"
        ;;
        
    clean)
        shift
        project_dir=""
        
        if [ "$1" = "--project" ]; then
            shift
            if [ $# -eq 0 ]; then
                echo "❌ --project requires a directory argument"
                exit 1
            fi
            project_dir="$1"
        fi
        
        target_root=$(get_target_dir "$project_dir")
        echo "🎯 Target: $target_root"
        
        clean_all "$target_root"
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
