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
  enable-tools                           Enable advanced kiro-cli tool settings
  workspace <subcmd>                     Manage team workspaces (create, list, apply, show)
  cursor <subcmd> <dir>                  Manage Cursor IDE rules + MCP config
  amazonq <subcmd> <dir>                 Manage Amazon Q Developer rules
  help                                   Show this help message

PROFILES:
  dev                 All dev agents (alias → dev-core + dev-web + dev-mobile)
  dev-core            Orchestrator + planning + quality + workflow (13 agents)
  dev-web             Backend + WebAPI + UI + UX specialist (4 agents)
  dev-mobile          Flutter + Android + iOS (3 agents)
  ba                  BA/PO (4 agents)
  qa                  QA/Testing (6 agents)
  ops                 Operations (5 agents)
  pm                  PM/Scrum Master (6 agents)

OPTIONS:
  --project <dir>     Target project directory (for Kiro UI)
                      Default: ~/.kiro (for Kiro CLI)

EXAMPLES:
  # Install
  ./setup.sh install dev                    # Install ALL dev (core+web+mobile)
  ./setup.sh install dev-core dev-web       # Fullstack web developer
  ./setup.sh install dev-core dev-mobile    # Mobile developer
  ./setup.sh install ba qa                  # Install multiple profiles
  ./setup.sh install dev --project ~/myapp  # Install to project (Kiro UI)
  
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

  # Team Workspaces
  ./setup.sh workspace list                # List available workspaces
  ./setup.sh workspace show payments-core  # View workspace details
  ./setup.sh workspace apply payments-core # Apply team config
  ./setup.sh workspace create my-team      # Scaffold new workspace

  # Cursor IDE
  ./setup.sh cursor install ~/myapp        # Install .cursor/rules + MCP config
  ./setup.sh cursor sync ~/myapp           # Update rules from latest templates
  ./setup.sh cursor remove ~/myapp         # Remove .cursor/ directory

  # Amazon Q Developer
  ./setup.sh amazonq install ~/myapp       # Install .amazonq/rules/
  ./setup.sh amazonq sync ~/myapp          # Update rules from latest templates
  ./setup.sh amazonq remove ~/myapp        # Remove .amazonq/ directory

USAGE
}

list_profiles() {
    echo "📋 Available profiles:"
    echo ""
    echo "  • dev (alias → dev-core + dev-web + dev-mobile, 20 agents total)"
    for dir in "$STEER_ROOT"/.kiro-*; do
        if [ -d "$dir" ]; then
            profile=$(basename "$dir" | sed 's/^\.kiro-//')
            agent_count=$(find "$dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
            echo "  • $profile ($agent_count agents)"
        fi
    done
}

# Expand profile aliases (e.g., dev → dev-core dev-web dev-mobile)
expand_profile_aliases() {
    local -n _profiles=$1
    local expanded=()
    for p in "${_profiles[@]}"; do
        case "$p" in
            dev) expanded+=(dev-core dev-web dev-mobile) ;;
            *)   expanded+=("$p") ;;
        esac
    done
    # Deduplicate while preserving order
    local seen=()
    _profiles=()
    for p in "${expanded[@]}"; do
        local dup=false
        for s in "${seen[@]}"; do
            [ "$s" = "$p" ] && dup=true && break
        done
        if [ "$dup" = false ]; then
            seen+=("$p")
            _profiles+=("$p")
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

inject_agent_tokens() {
    local target_dir=$1
    _do_inject() {
        local mcp_name="$1" env_file="$2" env_key="$3" tdir="$4"
        if [ -f "$env_file" ]; then
            local token=$(grep "^${env_key}=" "$env_file" | cut -d= -f2-)
            if [ -n "$token" ] && [ "$token" != "YOUR_TOKEN" ]; then
                for agent_json in "$tdir/agents/"*.json; do
                    if [ -f "$agent_json" ] && grep -q "\"${mcp_name}\"" "$agent_json"; then
                        python3 -c "
import json
with open('$agent_json') as f: d=json.load(f)
m=d.get('mcpServers',{}).get('$mcp_name',{}).get('env',{})
if m: m['$env_key']='$token'
with open('$agent_json','w') as f: json.dump(d,f,indent=2); f.write('\\n')
" 2>/dev/null
                    fi
                done
            fi
        fi
    }
    _do_inject "jira"       "$KIRO_ROOT/tools/mcp-servers/jira-mcp/.env"              "JIRA_PAT"           "$target_dir"
    _do_inject "confluence" "$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env"         "CONFLUENCE_PAT"     "$target_dir"
    _do_inject "mywiki"     "$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env.mywiki"  "CONFLUENCE_PAT"     "$target_dir"
    _do_inject "github"     "$KIRO_ROOT/tools/mcp-servers/github-mcp/.env"            "GITHUB_TOKEN_disney" "$target_dir"
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
    
    # Copy agents with $HOME expansion (Kiro doesn't expand shell variables in JSON)
    for agent_json in "$source_dir/agents/"*.json; do
        [ -f "$agent_json" ] && sed "s|\$HOME|$HOME|g" "$agent_json" > "$target_dir/agents/$(basename "$agent_json")"
    done
    cp -r "$source_dir/prompts/"* "$target_dir/prompts/" 2>/dev/null || true
    
    for subdir in context powers skills steering; do
        if [ -d "$source_dir/$subdir" ]; then
            mkdir -p "$target_dir/$subdir"
            cp -r "$source_dir/$subdir/"* "$target_dir/$subdir/" 2>/dev/null || true
        fi
    done
    
    local agent_count=$(find "$source_dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    inject_agent_tokens "$target_dir"
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

write_profiles_manifest() {
    local target_dir=$1
    mkdir -p "$target_dir/settings"
    python3 -c "
import json, os, glob
profiles = []
for d in sorted(glob.glob('$STEER_ROOT/.kiro-*')):
    if not os.path.isdir(d): continue
    pid = os.path.basename(d).replace('.kiro-','')
    agents_dir = os.path.join(d, 'agents')
    agents = sorted([f[:-5] for f in os.listdir(agents_dir) if f.endswith('.json')]) if os.path.isdir(agents_dir) else []
    installed = any(os.path.exists(os.path.join('$target_dir','agents',a+'.json')) for a in agents)
    profiles.append({'id':pid,'agents':agents,'agent_count':len(agents),'installed':installed})
data={'steer_root':'$STEER_ROOT','profiles':profiles}
with open('$target_dir/settings/profiles.json','w') as f: json.dump(data,f,indent=2)
" 2>/dev/null && echo "✓ Updated profiles manifest"
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

    if [ -d "$STEER_ROOT/.kiro/hooks" ]; then
        echo "📦 Installing hooks..."
        mkdir -p "$target_dir/hooks"
        cp "$STEER_ROOT/.kiro/hooks/"*.sh "$target_dir/hooks/" 2>/dev/null || true
        chmod +x "$target_dir/hooks/"*.sh 2>/dev/null || true
        echo "✓ Installed hook scripts"
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
        
        # Expand aliases (dev → dev-core + dev-web + dev-mobile)
        expand_profile_aliases profiles
        
        target_root=$(get_target_dir "$project_dir")
        [ -n "$project_dir" ] && echo "🎯 Target: $target_root (Kiro UI)" || echo "🎯 Target: $target_root (Kiro CLI)"
        
        install_shared "$target_root"
        
        for profile in "${profiles[@]}"; do
            install_profile "$profile" "$target_root"
        done
        
        write_profiles_manifest "$target_root"
        
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
        
        write_profiles_manifest "$target_root"
        
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
        
        # Expand aliases (dev → dev-core + dev-web + dev-mobile)
        expand_profile_aliases profiles
        
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

            # Validate agent configs
            if command -v kiro-cli &> /dev/null; then
                local errors=0
                for agent_json in "$KIRO_ROOT/agents/"*.json; do
                    [ -f "$agent_json" ] || continue
                    if ! kiro-cli agent validate --path "$agent_json" 2>/dev/null; then
                        echo "  ❌ Invalid: $(basename "$agent_json")"
                        errors=$((errors + 1))
                    fi
                done
                if [ $errors -eq 0 ]; then
                    echo "✓ All agent configs valid"
                else
                    echo "⚠️  $errors agent(s) failed validation"
                fi
            fi
        else
            echo "❌ No CLI agents installed"
        fi
        ;;
        
    mcp-install)
        echo "📦 Installing MCP dependencies..."
        echo ""
        
        # Check node exists
        if ! command -v node &> /dev/null; then
            echo "❌ node not found. Please install Node.js first."
            exit 1
        fi
        
        # Verify pre-built bundles exist
        echo "🔍 Verifying MCP server bundles..."
        available_mcps=()
        for mcp in "$KIRO_ROOT/tools/mcp-servers"/*; do
            if [ -d "$mcp" ] && [ -f "$mcp/dist/index.cjs" ]; then
                available_mcps+=("$(basename "$mcp")")
                echo "  ✓ $(basename "$mcp")"
            fi
        done
        
        if [ ${#available_mcps[@]} -eq 0 ]; then
            echo "❌ No pre-built MCP bundles found in dist/"
            exit 1
        fi
        echo ""
        echo "✅ ${#available_mcps[@]} MCP servers ready (pre-built, no npm install needed)"
        echo "  ✓ context7 (npx-based, no bundle needed)"
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
            
            # MyWiki token
            echo "━━━ MyWiki (mywiki.disney.com) ━━━"
            echo "  Generate token: https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action"
            read -r -p "Paste your MyWiki Personal Access Token (or Enter to skip): " mywiki_token
            if [ -n "$mywiki_token" ]; then
                # MyWiki uses the same confluence-mcp binary via agent env block
                # Store token for reference and for the $HOME expansion step
                mywiki_env="$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env.mywiki"
                cat > "$mywiki_env" << MYWIKIEOF
CONFLUENCE_URL=https://mywiki.disney.com
CONFLUENCE_PAT=$mywiki_token
MYWIKIEOF
                echo "  ✓ Saved to confluence-mcp/.env.mywiki"
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
        
        # Resolve $HOME in installed agent configs
        for agent_json in "$KIRO_ROOT/agents/"*.json; do
            if [ -f "$agent_json" ] && grep -q '\$HOME' "$agent_json" 2>/dev/null; then
                sed -i '' "s|\$HOME|$HOME|g" "$agent_json"
                echo "🔧 Resolved \$HOME in $(basename "$agent_json")"
            fi
        done
        
        inject_agent_tokens "$KIRO_ROOT"
        
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
        
        
    enable-tools)
        echo "🔧 Enabling advanced kiro-cli tool settings..."
        echo ""

        settings=(
            "chat.enableThinking"
            "chat.enableTodoList"
            "chat.enableKnowledge"
        )

        for setting in "${settings[@]}"; do
            if kiro-cli settings "$setting" true 2>/dev/null; then
                echo "  ✓ $setting = true"
            else
                echo "  ⚠️  $setting — not supported in this kiro-cli version"
            fi
        done

        # delegate may not be available in all versions
        if kiro-cli settings chat.enableDelegate true 2>/dev/null; then
            echo "  ✓ chat.enableDelegate = true"
        else
            echo "  ⏭ chat.enableDelegate — not available yet (agents still work without it)"
        fi

        echo ""
        echo "✅ Advanced tools enabled for agents that use them"
        echo "   thinking  → orchestrators, architecture, planner"
        echo "   todo      → orchestrators, sprint_manager"
        echo "   knowledge → story_analyzer, architecture, test_planner, requirements_analyst"
        ;;

    cursor)
        shift
        cursor_subcmd="${1:-help}"
        shift 2>/dev/null || true
        cursor_dir="${1:-}"
        
        case "$cursor_subcmd" in
            install)
                if [ -z "$cursor_dir" ]; then
                    echo "❌ Usage: ./setup.sh cursor install <project-dir>"
                    exit 1
                fi
                cursor_dir="${cursor_dir/#\~/$HOME}"
                if [ ! -d "$cursor_dir" ]; then
                    echo "❌ Directory does not exist: $cursor_dir"
                    exit 1
                fi
                
                rules_dir="$cursor_dir/.cursor/rules"
                mkdir -p "$rules_dir"
                
                echo "🖱️  Installing Cursor rules to $rules_dir"
                echo ""
                
                count=0
                for mdc in "$STEER_ROOT"/.cursor-templates/*.mdc; do
                    [ -f "$mdc" ] || continue
                    cp "$mdc" "$rules_dir/"
                    echo "  ✓ $(basename "$mdc")"
                    count=$((count + 1))
                done
                
                echo ""
                echo "✅ Installed $count rules to $rules_dir"
                
                # Generate mcp.json if MCP servers are installed
                if [ -d "$HOME/.kiro/tools/mcp-servers" ]; then
                    mcp_json="$cursor_dir/.cursor/mcp.json"
                    echo ""
                    echo "🔌 Generating MCP config..."
                    
                    # Read tokens from existing .env files if available
                    jira_pat="YOUR_TOKEN"
                    confluence_pat="YOUR_TOKEN"
                    mywiki_pat="YOUR_TOKEN"
                    github_token="YOUR_TOKEN"
                    
                    [ -f "$HOME/.kiro/tools/mcp-servers/jira-mcp/.env" ] && \
                        jira_pat=$(grep -s '^JIRA_PAT=' "$HOME/.kiro/tools/mcp-servers/jira-mcp/.env" | cut -d= -f2- || echo "YOUR_TOKEN")
                    [ -f "$HOME/.kiro/tools/mcp-servers/confluence-mcp/.env" ] && \
                        confluence_pat=$(grep -s '^CONFLUENCE_PAT=' "$HOME/.kiro/tools/mcp-servers/confluence-mcp/.env" | cut -d= -f2- || echo "YOUR_TOKEN")
                    [ -f "$HOME/.kiro/tools/mcp-servers/confluence-mcp/.env.mywiki" ] && \
                        mywiki_pat=$(grep -s '^CONFLUENCE_PAT=' "$HOME/.kiro/tools/mcp-servers/confluence-mcp/.env.mywiki" | cut -d= -f2- || echo "YOUR_TOKEN")
                    [ -f "$HOME/.kiro/tools/mcp-servers/github-mcp/.env" ] && \
                        github_token=$(grep -s '^GITHUB_TOKEN_disney=' "$HOME/.kiro/tools/mcp-servers/github-mcp/.env" | cut -d= -f2- || echo "YOUR_TOKEN")
                    
                    cat > "$mcp_json" << MCPEOF
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs"],
      "env": { "JIRA_PAT": "$jira_pat" }
    },
    "confluence": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs"],
      "env": { "CONFLUENCE_URL": "https://confluence.disney.com", "CONFLUENCE_PAT": "$confluence_pat" }
    },
    "mywiki": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs"],
      "env": { "CONFLUENCE_URL": "https://mywiki.disney.com", "CONFLUENCE_PAT": "$mywiki_pat" }
    },
    "github": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs"],
      "env": { "GITHUB_TOKEN_disney": "$github_token", "GITHUB_HOST_disney": "github.disney.com", "GITHUB_DEFAULT_REMOTE": "disney" }
    },
    "mermaid": {
      "command": "node",
      "args": ["$HOME/.kiro/tools/mcp-servers/mermaid-diagram-mcp/dist/index.cjs"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
MCPEOF
                    echo "  ✓ $mcp_json"
                    
                    if echo "$jira_pat$confluence_pat$github_token" | grep -q "YOUR_TOKEN"; then
                        echo ""
                        echo "⚠️  Some MCP tokens are placeholders. Run ./setup.sh mcp-install first,"
                        echo "   then re-run ./setup.sh cursor install to pick up the tokens."
                    fi
                else
                    echo ""
                    echo "⚠️  MCP servers not found at ~/.kiro/tools/mcp-servers/"
                    echo "   Run ./setup.sh mcp-install first, then re-run cursor install."
                fi
                ;;
            
            sync)
                if [ -z "$cursor_dir" ]; then
                    echo "❌ Usage: ./setup.sh cursor sync <project-dir>"
                    exit 1
                fi
                cursor_dir="${cursor_dir/#\~/$HOME}"
                rules_dir="$cursor_dir/.cursor/rules"
                
                if [ ! -d "$rules_dir" ]; then
                    echo "❌ No Cursor rules found at $rules_dir"
                    echo "   Run: ./setup.sh cursor install $cursor_dir"
                    exit 1
                fi
                
                echo "🔄 Syncing Cursor rules in $rules_dir"
                echo ""
                
                count=0
                for mdc in "$STEER_ROOT"/.cursor-templates/*.mdc; do
                    [ -f "$mdc" ] || continue
                    cp "$mdc" "$rules_dir/"
                    echo "  ✓ $(basename "$mdc")"
                    count=$((count + 1))
                done
                
                echo ""
                echo "✅ Synced $count rules"
                ;;
            
            remove)
                if [ -z "$cursor_dir" ]; then
                    echo "❌ Usage: ./setup.sh cursor remove <project-dir>"
                    exit 1
                fi
                cursor_dir="${cursor_dir/#\~/$HOME}"
                
                if [ ! -d "$cursor_dir/.cursor" ]; then
                    echo "⚠️  No .cursor/ directory found in $cursor_dir"
                    exit 0
                fi
                
                echo "🗑️  Removing .cursor/ from $cursor_dir"
                rm -rf "$cursor_dir/.cursor"
                echo "✅ Removed"
                ;;
            
            
            init-memory)
                if [ -z "$cursor_dir" ]; then
                    echo "❌ Usage: ./setup.sh cursor init-memory <project-dir>"
                    exit 1
                fi
                cursor_dir="${cursor_dir/#\~/$HOME}"
                if [ ! -d "$cursor_dir" ]; then
                    echo "❌ Directory does not exist: $cursor_dir"
                    exit 1
                fi
                
                rules_dir="$cursor_dir/.cursor/rules"
                mkdir -p "$rules_dir"
                project_name=$(basename "$cursor_dir")
                
                echo "🧠 Generating project context for Cursor..."
                echo ""
                
                # Check for existing Kiro memory bank
                kiro_mb="$cursor_dir/.kiro/rules/memory-bank"
                known_mb="$STEER_ROOT/Projects/$project_name/.kiro/rules/memory-bank"
                
                if [ -d "$kiro_mb" ] && ls "$kiro_mb"/*.md &>/dev/null; then
                    echo "  Found existing Kiro memory bank at $kiro_mb"
                    source_dir="$kiro_mb"
                elif [ -d "$known_mb" ] && ls "$known_mb"/*.md &>/dev/null; then
                    echo "  Found known project: $project_name"
                    source_dir="$known_mb"
                else
                    echo "  No memory bank found — generating from templates"
                    source_dir=""
                fi
                
                # Generate 60-project-context.mdc
                mdc_file="$rules_dir/60-project-context.mdc"
                {
                    echo "---"
                    echo "description: Project context for $project_name — tech stack, patterns, guidelines"
                    echo "alwaysApply: true"
                    echo "---"
                    echo ""
                    echo "# Project Context: $project_name"
                    echo ""
                    
                    if [ -n "$source_dir" ]; then
                        for md in "$source_dir"/*.md; do
                            [ -f "$md" ] || continue
                            echo ""
                            cat "$md"
                            echo ""
                        done
                    else
                        for tmpl in "$STEER_ROOT"/common/memory-bank-templates/*.template; do
                            [ -f "$tmpl" ] || continue
                            echo ""
                            sed "s/{{PROJECT_NAME}}/$project_name/g" "$tmpl"
                            echo ""
                        done
                    fi
                } > "$mdc_file"
                
                echo "  ✓ 60-project-context.mdc"
                echo ""
                echo "✅ Project context generated at $mdc_file"
                ;;

            *)
                echo "Cursor IDE integration"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh cursor install <project-dir>   Install rules + MCP config"
                echo "  ./setup.sh cursor sync <project-dir>      Update rules from templates"
                echo "  ./setup.sh cursor remove <project-dir>    Remove .cursor/ directory"
                echo "  ./setup.sh cursor init-memory <project-dir>  Generate project context rule"
                ;;
        esac
        ;;

    amazonq)
        shift
        aq_subcmd="${1:-help}"
        shift 2>/dev/null || true
        aq_dir="${1:-}"
        
        case "$aq_subcmd" in
            install)
                if [ -z "$aq_dir" ]; then
                    echo "❌ Usage: ./setup.sh amazonq install <project-dir>"
                    exit 1
                fi
                aq_dir="${aq_dir/#\~/$HOME}"
                if [ ! -d "$aq_dir" ]; then
                    echo "❌ Directory does not exist: $aq_dir"
                    exit 1
                fi
                
                rules_dir="$aq_dir/.amazonq/rules"
                mkdir -p "$rules_dir"
                
                echo "🤖 Installing Amazon Q rules to $rules_dir"
                echo ""
                
                count=0
                for md in "$STEER_ROOT"/.amazonq-templates/*.md; do
                    [ -f "$md" ] || continue
                    name=$(basename "$md")
                    [ "$name" = "README.md" ] && continue
                    cp "$md" "$rules_dir/"
                    echo "  ✓ $name"
                    count=$((count + 1))
                done
                
                echo ""
                echo "✅ Installed $count rules to $rules_dir"
                ;;
            
            sync)
                if [ -z "$aq_dir" ]; then
                    echo "❌ Usage: ./setup.sh amazonq sync <project-dir>"
                    exit 1
                fi
                aq_dir="${aq_dir/#\~/$HOME}"
                rules_dir="$aq_dir/.amazonq/rules"
                
                if [ ! -d "$rules_dir" ]; then
                    echo "❌ No Amazon Q rules found at $rules_dir"
                    echo "   Run: ./setup.sh amazonq install $aq_dir"
                    exit 1
                fi
                
                echo "🔄 Syncing Amazon Q rules in $rules_dir"
                echo ""
                
                count=0
                for md in "$STEER_ROOT"/.amazonq-templates/*.md; do
                    [ -f "$md" ] || continue
                    name=$(basename "$md")
                    [ "$name" = "README.md" ] && continue
                    cp "$md" "$rules_dir/"
                    echo "  ✓ $name"
                    count=$((count + 1))
                done
                
                echo ""
                echo "✅ Synced $count rules"
                ;;
            
            remove)
                if [ -z "$aq_dir" ]; then
                    echo "❌ Usage: ./setup.sh amazonq remove <project-dir>"
                    exit 1
                fi
                aq_dir="${aq_dir/#\~/$HOME}"
                
                if [ ! -d "$aq_dir/.amazonq" ]; then
                    echo "⚠️  No .amazonq/ directory found in $aq_dir"
                    exit 0
                fi
                
                echo "🗑️  Removing .amazonq/ from $aq_dir"
                rm -rf "$aq_dir/.amazonq"
                echo "✅ Removed"
                ;;

            *)
                echo "Amazon Q Developer integration"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh amazonq install <project-dir>   Install rules"
                echo "  ./setup.sh amazonq sync <project-dir>      Update rules from templates"
                echo "  ./setup.sh amazonq remove <project-dir>    Remove .amazonq/ directory"
                ;;
        esac
        ;;

    workspace)
        shift
        ws_cmd="${1:-list}"
        shift 2>/dev/null || true
        ws_dir="$STEER_ROOT/workspaces"

        case "$ws_cmd" in
            list)
                echo "📋 Available team workspaces:"
                echo ""
                if [ ! -d "$ws_dir" ] || [ -z "$(ls -d "$ws_dir"/*/workspace.json 2>/dev/null)" ]; then
                    echo "  (none) — create one with: ./setup.sh workspace create <name>"
                    exit 0
                fi
                for ws in "$ws_dir"/*/workspace.json; do
                    ws_name=$(basename "$(dirname "$ws")")
                    ws_desc=$(python3 -c "import json; print(json.load(open('$ws')).get('description',''))" 2>/dev/null)
                    ws_profiles=$(python3 -c "import json; print(', '.join(json.load(open('$ws')).get('profiles',[])))" 2>/dev/null)
                    echo "  • $ws_name"
                    [ -n "$ws_desc" ] && echo "    $ws_desc"
                    [ -n "$ws_profiles" ] && echo "    Profiles: $ws_profiles"
                    echo ""
                done
                ;;

            show)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace show <name>"; exit 1; fi
                ws_file="$ws_dir/$ws_name/workspace.json"
                if [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

                python3 -c "
import json
ws = json.load(open('$ws_file'))
print(f\"╔{'═'*58}╗\")
print(f\"║  Team Workspace: {ws['name']:<39} ║\")
print(f\"╚{'═'*58}╝\")
print()
if ws.get('description'): print(f\"  Description:  {ws['description']}\")
if ws.get('team'):        print(f\"  Team:         {ws['team']}\")
if ws.get('jira_prefix'): print(f\"  Jira Prefix:  {ws['jira_prefix']}\")
print()
print('  Profiles:')
for p in ws.get('profiles', []): print(f\"    • {p}\")
if ws.get('default_agent'): print(f\"\n  Default Agent: {ws['default_agent']}\")
if ws.get('projects'):
    print('\n  Projects:')
    for proj in ws['projects']: print(f\"    • {proj['name']} ({proj.get('path','')})\")
if ws.get('rules'):
    print('\n  Rules:')
    for r in ws['rules']: print(f\"    • {r}\")
print(f\"\n  Enable Tools: {'yes' if ws.get('enable_tools') else 'no'}\")
"
                # Show extra files
                ws_path="$ws_dir/$ws_name"
                [ -d "$ws_path/rules" ] && [ -n "$(ls "$ws_path/rules"/*.md 2>/dev/null)" ] && {
                    echo ""
                    echo "  Custom Rules:"
                    for r in "$ws_path/rules"/*.md; do echo "    • $(basename "$r" .md)"; done
                }
                [ -d "$ws_path/context" ] && [ -n "$(ls "$ws_path/context"/*.md 2>/dev/null)" ] && {
                    echo ""
                    echo "  Context Files:"
                    for c in "$ws_path/context"/*.md; do echo "    • $(basename "$c")"; done
                }
                echo ""
                ;;

            apply)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace apply <name>"; exit 1; fi
                ws_file="$ws_dir/$ws_name/workspace.json"
                if [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

                echo "🚀 Applying workspace: $ws_name"
                echo ""

                # Parse workspace config
                profiles=$(python3 -c "import json; print(' '.join(json.load(open('$ws_file')).get('profiles',[])))")
                rules=$(python3 -c "import json; print(' '.join(json.load(open('$ws_file')).get('rules',[])))")
                enable_tools=$(python3 -c "import json; print('yes' if json.load(open('$ws_file')).get('enable_tools') else 'no')")
                default_agent=$(python3 -c "import json; print(json.load(open('$ws_file')).get('default_agent',''))")

                # 1. Install profiles
                if [ -n "$profiles" ]; then
                    echo "📦 Installing profiles: $profiles"
                    "$STEER_ROOT/setup.sh" install $profiles
                    echo ""
                fi

                # 2. Install rules
                if [ -n "$rules" ]; then
                    echo "📏 Installing rules..."
                    for rule in $rules; do
                        rule_file="$STEER_ROOT/common/rules/$rule.md"
                        if [ -f "$rule_file" ]; then
                            mkdir -p "$KIRO_ROOT/rules"
                            cp "$rule_file" "$KIRO_ROOT/rules/"
                            echo "  ✓ $rule"
                        fi
                    done
                    echo ""
                fi

                # 3. Copy workspace-specific rules
                ws_path="$ws_dir/$ws_name"
                if [ -d "$ws_path/rules" ] && [ -n "$(ls "$ws_path/rules"/*.md 2>/dev/null)" ]; then
                    echo "📏 Installing workspace rules..."
                    mkdir -p "$KIRO_ROOT/rules"
                    for r in "$ws_path/rules"/*.md; do
                        cp "$r" "$KIRO_ROOT/rules/"
                        echo "  ✓ $(basename "$r")"
                    done
                    echo ""
                fi

                # 4. Copy workspace-specific context
                if [ -d "$ws_path/context" ] && [ -n "$(ls "$ws_path/context"/*.md 2>/dev/null)" ]; then
                    echo "📄 Installing workspace context..."
                    mkdir -p "$KIRO_ROOT/context"
                    for c in "$ws_path/context"/*.md; do
                        cp "$c" "$KIRO_ROOT/context/"
                        echo "  ✓ $(basename "$c")"
                    done
                    echo ""
                fi

                # 5. Initialize project memory banks
                projects=$(python3 -c "
import json
for p in json.load(open('$ws_file')).get('projects',[]):
    mb = p.get('memory_bank','')
    path = p.get('path','')
    if path: print(f\"{path}|{mb}\")
")
                if [ -n "$projects" ]; then
                    echo "🧠 Initializing project memory banks..."
                    while IFS='|' read -r proj_path proj_mb; do
                        resolved="${proj_path/#\~/$HOME}"
                        if [ -d "$resolved" ]; then
                            if [ -n "$proj_mb" ]; then
                                "$STEER_ROOT/setup.sh" init-memory "$resolved" --from "$proj_mb" 2>/dev/null && echo "  ✓ $(basename "$resolved")" || echo "  ⚠ $(basename "$resolved") (template not found, using generic)"
                            else
                                "$STEER_ROOT/setup.sh" init-memory "$resolved" 2>/dev/null && echo "  ✓ $(basename "$resolved")"
                            fi
                        else
                            echo "  ⏭ $(basename "$resolved") (directory not found)"
                        fi
                    done <<< "$projects"
                    echo ""
                fi

                # 6. Enable tools
                if [ "$enable_tools" = "yes" ]; then
                    echo "🔧 Enabling advanced tools..."
                    "$STEER_ROOT/setup.sh" enable-tools 2>/dev/null || true
                    echo ""
                fi

                echo "✅ Workspace '$ws_name' applied"
                [ -n "$default_agent" ] && echo "   Default agent: $default_agent"
                echo ""
                echo "Next steps:"
                echo "  ./setup.sh mcp-install              # Configure MCP tokens"
                [ -n "$default_agent" ] && echo "  kiro-cli chat --agent $default_agent  # Start coding"
                ;;

            create)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace create <name>"; exit 1; fi
                ws_path="$ws_dir/$ws_name"
                if [ -d "$ws_path" ]; then echo "❌ Workspace already exists: $ws_name"; exit 1; fi

                echo "🏗️  Creating workspace: $ws_name"
                mkdir -p "$ws_path"/{rules,context,memory-banks}

                cat > "$ws_path/workspace.json" << WSEOF
{
  "name": "$ws_name",
  "description": "",
  "team": "",
  "profiles": ["dev-core", "dev-web"],
  "default_agent": "orchestrator",
  "projects": [],
  "rules": ["conventional_commit"],
  "enable_tools": true,
  "jira_prefix": ""
}
WSEOF

                echo "✅ Workspace scaffolded at workspaces/$ws_name/"
                echo ""
                echo "Next steps:"
                echo "  1. Edit workspaces/$ws_name/workspace.json"
                echo "  2. Add team rules to workspaces/$ws_name/rules/"
                echo "  3. Add team context to workspaces/$ws_name/context/"
                echo "  4. Apply: ./setup.sh workspace apply $ws_name"
                ;;

            *)
                echo "❌ Unknown workspace command: $ws_cmd"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh workspace list              List available workspaces"
                echo "  ./setup.sh workspace show <name>       Show workspace details"
                echo "  ./setup.sh workspace apply <name>      Apply workspace config"
                echo "  ./setup.sh workspace create <name>     Create new workspace"
                exit 1
                ;;
        esac
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
