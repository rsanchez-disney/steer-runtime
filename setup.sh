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
  rules [list|install]                   Manage common coding rules
  prompts [list|install]                 Manage standalone prompts
  init-memory <dir>                      Initialize project memory bank
  configure                              Configure MCP tokens interactively
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

  # Rules & Prompts
  ./setup.sh rules list                     # List available rules
  ./setup.sh rules install --all            # Install all rules
  ./setup.sh prompts list                   # List available prompts
  ./setup.sh init-memory ~/myapp            # Initialize memory bank

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
    
    if [ -d "$STEER_ROOT/.kiro/context" ]; then
        echo "📦 Installing shared context..."
        mkdir -p "$target_dir/context"
        cp "$STEER_ROOT/.kiro/context/"*.md "$target_dir/context/" 2>/dev/null || true
        echo "✓ Installed shared context files"
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
        echo ""
        
        # Check npm exists
        if ! command -v npm &> /dev/null; then
            echo "❌ npm not found. Please install Node.js first."
            exit 1
        fi
        
        # Sync npm registry from user's local config (only if Disney internal)
        local_registry=$(npm config get registry 2>/dev/null)
        if [ -n "$local_registry" ] && [ "$local_registry" != "undefined" ] && echo "$local_registry" | grep -qi "disney\|dtci"; then
            echo "🔧 Syncing npm registry: $local_registry"
            for mcp in "$KIRO_ROOT/tools/mcp-servers"/*; do
                if [ -d "$mcp" ] && [ -f "$mcp/package.json" ]; then
                    echo "registry=$local_registry" > "$mcp/.npmrc"
                fi
            done
            echo ""
        else
            echo "ℹ️  Using bundled .npmrc (Disney internal packages require Nexus registry)"
        fi
        
        # Install npm dependencies
        for mcp in "$KIRO_ROOT/tools/mcp-servers"/*; do
            if [ -d "$mcp" ] && [ -f "$mcp/package.json" ]; then
                echo "Installing $(basename $mcp)..."
                (cd "$mcp" && npm install)
            fi
        done
        echo ""
        
        # Configure tokens
        echo "╔══════════════════════════════════════════════════════════════╗"
        echo "║              MCP Server Token Configuration                 ║"
        echo "╚══════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Generate Personal Access Tokens from these URLs:"
        echo ""
        echo "  Jira:"
        echo "  https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens"
        echo ""
        echo "  Confluence:"
        echo "  https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action"
        echo ""
        echo "  GitHub:"
        echo "  https://github.disney.com/settings/tokens"
        echo ""
        
        read -p "Would you like to configure tokens now? (y/N): " configure_tokens
        
        if [[ "$configure_tokens" =~ ^[Yy]$ ]]; then
            echo ""
            
            # Jira token
            echo "━━━ Jira ━━━"
            read -r -p "Paste your Jira Personal Access Token (or Enter to skip): " jira_token
            if [ -n "$jira_token" ]; then
                jira_env="$KIRO_ROOT/tools/mcp-servers/jira-mcp/.env"
                cat > "$jira_env" << JIRAEOF
JIRA_PAT=$jira_token
JIRAEOF
                echo "  ✓ Saved to jira-mcp/.env"
            else
                echo "  ⏭ Skipped"
            fi
            echo ""
            
            # Confluence token
            echo "━━━ Confluence ━━━"
            read -r -p "Paste your Confluence Personal Access Token (or Enter to skip): " confluence_token
            if [ -n "$confluence_token" ]; then
                confluence_env="$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env"
                cat > "$confluence_env" << CONFEOF
CONFLUENCE_URL=https://confluence.disney.com
CONFLUENCE_PAT=$confluence_token
CONFEOF
                echo "  ✓ Saved to confluence-mcp/.env"
            else
                echo "  ⏭ Skipped"
            fi
            echo ""
            
            # GitHub token
            echo "━━━ GitHub ━━━"
            read -r -p "Paste your GitHub Personal Access Token (or Enter to skip): " github_token
            if [ -n "$github_token" ]; then
                github_env="$KIRO_ROOT/tools/mcp-servers/github-mcp/.env"
                cat > "$github_env" << GHEOF
GITHUB_TOKEN_disney=$github_token
GITHUB_HOST_disney=github.disney.com
GITHUB_DEFAULT_REMOTE=disney
GHEOF
                echo "  ✓ Saved to github-mcp/.env"
            else
                echo "  ⏭ Skipped"
            fi
            echo ""
        fi
        
        echo "✅ MCP servers ready"
        ;;
    rules)
        shift
        subcmd="${1:-list}"
        shift 2>/dev/null || true
        
        case "$subcmd" in
            list)
                echo "📋 Available rules:"
                echo ""
                for rule in "$STEER_ROOT"/common/rules/*.md; do
                    if [ -f "$rule" ] && [ "$(basename "$rule")" != "README.md" ]; then
                        name=$(basename "$rule" .md)
                        echo "  • $name"
                    fi
                done
                ;;
            install)
                project_dir=""
                rules=()
                install_all=false
                
                while [ $# -gt 0 ]; do
                    case "$1" in
                        --project)
                            shift
                            project_dir="$1"
                            shift
                            ;;
                        --all)
                            install_all=true
                            shift
                            ;;
                        *)
                            rules+=("$1")
                            shift
                            ;;
                    esac
                done
                
                target_root=$(get_target_dir "$project_dir")
                mkdir -p "$target_root/rules"
                
                if [ "$install_all" = true ]; then
                    echo "📦 Installing all rules to $target_root/rules/"
                    for rule in "$STEER_ROOT"/common/rules/*.md; do
                        if [ -f "$rule" ] && [ "$(basename "$rule")" != "README.md" ]; then
                            cp "$rule" "$target_root/rules/"
                            echo "  ✓ $(basename "$rule")"
                        fi
                    done
                else
                    for rule_name in "${rules[@]}"; do
                        rule_file="$STEER_ROOT/common/rules/${rule_name}.md"
                        if [ -f "$rule_file" ]; then
                            cp "$rule_file" "$target_root/rules/"
                            echo "✓ Installed $rule_name"
                        else
                            echo "❌ Rule not found: $rule_name"
                        fi
                    done
                fi
                echo "✅ Rules installed"
                ;;
            *)
                echo "❌ Unknown rules subcommand: $subcmd"
                echo "Usage: ./setup.sh rules [list|install] [--all|<rule-names>] [--project <dir>]"
                exit 1
                ;;
        esac
        ;;
        
    prompts)
        shift
        subcmd="${1:-list}"
        shift 2>/dev/null || true
        
        case "$subcmd" in
            list)
                echo "📋 Available prompts:"
                echo ""
                for prompt in "$STEER_ROOT"/common/prompts/*.md; do
                    if [ -f "$prompt" ] && [ "$(basename "$prompt")" != "README.md" ]; then
                        name=$(basename "$prompt" .md)
                        echo "  • $name"
                    fi
                done
                ;;
            install)
                prompts=()
                install_all=false
                
                while [ $# -gt 0 ]; do
                    case "$1" in
                        --all)
                            install_all=true
                            shift
                            ;;
                        *)
                            prompts+=("$1")
                            shift
                            ;;
                    esac
                done
                
                mkdir -p "$KIRO_ROOT/prompts"
                
                if [ "$install_all" = true ]; then
                    echo "📦 Installing all prompts to $KIRO_ROOT/prompts/"
                    for prompt in "$STEER_ROOT"/common/prompts/*.md; do
                        if [ -f "$prompt" ] && [ "$(basename "$prompt")" != "README.md" ]; then
                            cp "$prompt" "$KIRO_ROOT/prompts/"
                            echo "  ✓ $(basename "$prompt")"
                        fi
                    done
                else
                    for prompt_name in "${prompts[@]}"; do
                        prompt_file="$STEER_ROOT/common/prompts/${prompt_name}.md"
                        if [ -f "$prompt_file" ]; then
                            cp "$prompt_file" "$KIRO_ROOT/prompts/"
                            echo "✓ Installed $prompt_name"
                        else
                            echo "❌ Prompt not found: $prompt_name"
                        fi
                    done
                fi
                echo "✅ Prompts installed"
                ;;
            *)
                echo "❌ Unknown prompts subcommand: $subcmd"
                echo "Usage: ./setup.sh prompts [list|install] [--all|<prompt-names>]"
                exit 1
                ;;
        esac
        ;;
        
    init-memory)
        shift
        if [ $# -eq 0 ]; then
            echo "❌ Project directory required"
            echo "Usage: ./setup.sh init-memory <project-dir> [--from <known-project>]"
            exit 1
        fi
        
        project_dir="${1/#\~/$HOME}"
        shift
        from_project=""
        
        while [ $# -gt 0 ]; do
            case "$1" in
                --from)
                    shift
                    from_project="$1"
                    shift
                    ;;
                *)
                    shift
                    ;;
            esac
        done
        
        if [ ! -d "$project_dir" ]; then
            echo "❌ Directory does not exist: $project_dir"
            exit 1
        fi
        
        project_name=$(basename "$project_dir")
        target_mb="$project_dir/.kiro/rules/memory-bank"
        
        mkdir -p "$target_mb"
        
        # Determine source
        if [ -n "$from_project" ]; then
            source_mb="$STEER_ROOT/Projects/$from_project/.kiro/rules/memory-bank"
            if [ ! -d "$source_mb" ]; then
                echo "❌ Unknown project: $from_project"
                echo "Available: $(ls "$STEER_ROOT/Projects" 2>/dev/null | tr '\n' ' ')"
                exit 1
            fi
            echo "📦 Copying memory bank from $from_project..."
            cp "$source_mb"/*.md "$target_mb/"
        elif [ -d "$STEER_ROOT/Projects/$project_name/.kiro/rules/memory-bank" ]; then
            echo "📦 Found known project: $project_name"
            cp "$STEER_ROOT/Projects/$project_name/.kiro/rules/memory-bank"/*.md "$target_mb/"
        else
            echo "📦 Generating memory bank from templates..."
            for tmpl in "$STEER_ROOT"/common/memory-bank-templates/*.template; do
                out_name=$(basename "$tmpl" .template)
                sed "s/{{PROJECT_NAME}}/$project_name/g" "$tmpl" > "$target_mb/$out_name"
                echo "  ✓ $out_name"
            done
        fi
        
        echo "✅ Memory bank initialized at $target_mb"
        ;;
        
    configure)
        echo "🔧 Configure MCP tokens"
        echo ""
        
        env_file="$KIRO_ROOT/.env"
        touch "$env_file"
        
        tokens=(
            "JIRA_PERSONAL_TOKEN"
            "CONFLUENCE_PERSONAL_TOKEN"
            "GITHUB_PERSONAL_ACCESS_TOKEN"
            "HARNESS_API_KEY"
            "SONARQUBE_TOKEN"
        )
        
        for token in "${tokens[@]}"; do
            current=$(grep "^$token=" "$env_file" 2>/dev/null | cut -d= -f2 || echo "")
            if [ -n "$current" ]; then
                status="set"
            else
                status="not set"
            fi
            
            echo -n "$token [$status]: "
            read -r value
            
            if [ -n "$value" ]; then
                # Remove existing and add new
                grep -v "^$token=" "$env_file" > "$env_file.tmp" 2>/dev/null || true
                echo "$token=$value" >> "$env_file.tmp"
                mv "$env_file.tmp" "$env_file"
                echo "  ✓ Updated"
            else
                echo "  ⏭ Skipped"
            fi
        done
        
        echo ""
        echo "✅ Configuration saved to $env_file"
        echo "💡 Source this file or export variables before using MCP servers"
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
