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
  sync [--project <dir>]                Update installed profiles
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
  
  # Sync (update installed profiles)
  ./setup.sh sync                           # Update all installed profiles
  ./setup.sh sync --project ~/myapp         # Update project profiles
  
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

detect_installed_profiles() {
    local target_dir=$1
    local installed=()
    
    if [ ! -d "$target_dir/agents" ]; then
        return
    fi
    
    # Check each available profile
    for dir in "$STEER_ROOT"/.kiro-*; do
        if [ -d "$dir" ]; then
            profile=$(basename "$dir" | sed 's/^\.kiro-//')
            
            # Get first agent from this profile
            local first_agent=$(find "$dir/agents" -name "*.json" -print -quit 2>/dev/null)
            if [ -n "$first_agent" ]; then
                local agent_name=$(basename "$first_agent" .json)
                
                # Check if this agent exists in target
                if [ -f "$target_dir/agents/${agent_name}.json" ]; then
                    installed+=("$profile")
                fi
            fi
        fi
    done
    
    echo "${installed[@]}"
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
    
    echo "📦 Installing $profile profile..."
    
    mkdir -p "$target_dir/agents" "$target_dir/prompts"
    
    # Count files for progress
    local total_files=$(find "$source_dir" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "   Copying $total_files files..."
    
    cp -r "$source_dir/agents/"* "$target_dir/agents/" 2>/dev/null || true
    cp -r "$source_dir/prompts/"* "$target_dir/prompts/" 2>/dev/null || true
    
    for subdir in context powers skills steering; do
        if [ -d "$source_dir/$subdir" ]; then
            mkdir -p "$target_dir/$subdir"
            cp -r "$source_dir/$subdir/"* "$target_dir/$subdir/" 2>/dev/null || true
        fi
    done
    
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
    
    if [ -d "$STEER_ROOT/.kiro/tools" ]; then
        echo "📦 Installing shared tools..."
        mkdir -p "$target_dir/tools"
        
        # Copy excluding node_modules
        rsync -a --exclude='node_modules' "$STEER_ROOT/.kiro/tools/" "$target_dir/tools/" 2>/dev/null || \
        find "$STEER_ROOT/.kiro/tools" -mindepth 1 -maxdepth 1 ! -name 'node_modules' -exec cp -r {} "$target_dir/tools/" \; 2>/dev/null
        
        echo "✓ Installed MCP servers (run 'mcp-install' to setup dependencies)"
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
        
    sync)
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
        echo "🔄 Syncing profiles in $target_root..."
        echo ""
        
        # Detect installed profiles
        installed_profiles=($(detect_installed_profiles "$target_root"))
        
        if [ ${#installed_profiles[@]} -eq 0 ]; then
            echo "⚠️  No profiles detected. Use 'install' command first."
            exit 0
        fi
        
        echo "📋 Detected installed profiles: ${installed_profiles[*]}"
        echo ""
        
        install_shared "$target_root"
        
        for profile in "${installed_profiles[@]}"; do
            install_profile "$profile" "$target_root"
        done
        
        total=$(find "$target_root/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
        echo ""
        echo "✅ Sync complete ($total agents total)"
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
        echo ""
        
        # Check CLI installation
        if [ -d "$KIRO_ROOT/agents" ]; then
            echo "✓ CLI agents directory exists"
            
            # Detect installed profiles
            installed_profiles=($(detect_installed_profiles "$KIRO_ROOT"))
            
            if [ ${#installed_profiles[@]} -gt 0 ]; then
                echo "✓ Installed profiles: ${installed_profiles[*]}"
            else
                echo "⚠️  No profiles detected"
            fi
            
            total=$(find "$KIRO_ROOT/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
            echo "✓ Total agents: $total"
        else
            echo "❌ No CLI agents installed"
        fi
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
