#!/bin/bash
# Unified setup for steer-runtime (multi-profile support)

set -e

STEER_ROOT="$(cd "$(dirname "$0")" && pwd)"
KIRO_ROOT="$HOME/.kiro"

# Clean macOS resource fork files (._*) from a directory
clean_resource_forks() {
    find "$1" -name "._*" -delete 2>/dev/null || true
}

# Discover GitHub remotes from tokens.env by scanning for GITHUB_TOKEN_{remote} keys
# Outputs one remote name per line, sorted and deduplicated
discover_github_remotes() {
    local tokens_file="$1"
    [ -f "$tokens_file" ] || return
    grep -o 'GITHUB_TOKEN_[a-zA-Z0-9_]*' "$tokens_file" | sed 's/GITHUB_TOKEN_//' | sort -u
}

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
  init-manifest <dir>                    Generate project.yaml from codebase analysis
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
  ./setup.sh init-manifest ~/myapp          # Generate project.yaml

  # Team Workspaces
  ./setup.sh workspace list                # List available workspaces
  ./setup.sh workspace list --fetch        # Pull latest, then list
  ./setup.sh workspace show payments-core  # View workspace details
  ./setup.sh workspace apply payments-core # Apply team config
  ./setup.sh workspace create my-team      # Scaffold + commit + push
  ./setup.sh workspace sync payments-core   # Pull all workspace repos
  ./setup.sh workspace sync payments-core --push  # Push all workspace repos
  ./setup.sh workspace create my-team --local  # Scaffold only (no git)

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
    for dir in "$STEER_ROOT"/profiles/*; do
        if [ -d "$dir" ]; then
            profile=$(basename "$dir")
            agent_count=$(find "$dir/agents" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
            echo "  • $profile ($agent_count agents)"
        fi
    done
    # Workspace-local profiles
    local ws_profiles_found=false
    for ws_dir in "$STEER_ROOT"/workspaces/*/profiles/*; do
        if [ -d "$ws_dir/agents" ]; then
            if [ "$ws_profiles_found" = false ]; then
                echo ""
                echo "  Workspace profiles:"
                ws_profiles_found=true
            fi
            local profile=$(basename "$ws_dir")
            local ws_name=$(basename "$(dirname "$(dirname "$ws_dir")")")
            local agent_count=$(find "$ws_dir/agents" -name "*.json" ! -name "._*" 2>/dev/null | wc -l | tr -d ' ')
            echo "  • $profile ($agent_count agents) [workspace: $ws_name]"
        fi
    done
}

# Expand profile aliases (e.g., dev → dev-core dev-web dev-mobile)
expand_profile_aliases() {
    local expanded=()
    for p in "${profiles[@]}"; do
        case "$p" in
            dev) expanded+=(dev-core dev-web dev-mobile) ;;
            *)   expanded+=("$p") ;;
        esac
    done
    # Deduplicate while preserving order
    local seen=()
    profiles=()
    for p in "${expanded[@]}"; do
        local dup=false
        for s in "${seen[@]}"; do
            [ "$s" = "$p" ] && dup=true && break
        done
        if [ "$dup" = false ]; then
            seen+=("$p")
            profiles+=("$p")
        fi
    done
}

detect_installed_profiles() {
    local target_dir=$1
    local installed=()
    
    if [ ! -d "$target_dir/agents" ]; then
        return
    fi
    
    # Check global profiles
    for dir in "$STEER_ROOT"/profiles/*; do
        if [ -d "$dir" ]; then
            profile=$(basename "$dir")
            local first_agent=$(find "$dir/agents" -name "*.json" ! -name "._*" -print -quit 2>/dev/null)
            if [ -n "$first_agent" ]; then
                local agent_name=$(basename "$first_agent" .json)
                if [ -f "$target_dir/agents/${agent_name}.json" ]; then
                    installed+=("$profile")
                fi
            fi
        fi
    done

    # Check workspace-local profiles (skip if same name already found globally)
    for ws_dir in "$STEER_ROOT"/workspaces/*/profiles/*; do
        if [ -d "$ws_dir/agents" ]; then
            local profile=$(basename "$ws_dir")
            local dup=false
            for i in "${installed[@]}"; do [ "$i" = "$profile" ] && dup=true && break; done
            [ "$dup" = true ] && continue
            local first_agent=$(find "$ws_dir/agents" -name "*.json" ! -name "._*" -print -quit 2>/dev/null)
            if [ -n "$first_agent" ]; then
                local agent_name=$(basename "$first_agent" .json)
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
    local source_dir="$STEER_ROOT/profiles/$profile"
    
    if [ ! -d "$source_dir/agents" ]; then
        return
    fi
    
    find "$source_dir/agents" -name "*.json" -exec basename {} .json \;
}

inject_agent_tokens() {
    local target_dir=$1
    local tokens_file="$KIRO_ROOT/tokens.env"
    
    if [ ! -f "$tokens_file" ]; then
        echo "⚠️  No tokens.env found — skipping token injection"
        return
    fi
    
    _read_token() { grep -s "^$1=" "$tokens_file" | head -1 | cut -d= -f2-; }
    
    local jira_pat=$(_read_token "JIRA_PAT")
    local confluence_pat=$(_read_token "CONFLUENCE_PAT")
    
    # Discover GitHub remotes for per-remote injection
    local github_remotes
    github_remotes=$(discover_github_remotes "$tokens_file")
    
    for agent_json in "$target_dir/agents/"*.json; do
        [ -f "$agent_json" ] || continue
        python3 - "$agent_json" "$jira_pat" "$confluence_pat" "$github_remotes" "$tokens_file" << 'INJECT_PY'
import json, sys, os

path = sys.argv[1]
jira = sys.argv[2]
conf = sys.argv[3]
remotes_raw = sys.argv[4]
tokens_file = sys.argv[5]

def read_tok(key):
    try:
        with open(tokens_file) as f:
            for line in f:
                if line.startswith(key + '='):
                    return line.strip().split('=', 1)[1]
    except FileNotFoundError:
        pass
    return ''

with open(path) as f:
    d = json.load(f)

servers = d.get("mcpServers", {})
if not servers:
    sys.exit(0)

changed = False

# Inject Jira token
if jira and jira != "YOUR_TOKEN":
    env = servers.get("jira", {}).get("env", {})
    if "JIRA_PAT" in env:
        env["JIRA_PAT"] = jira
        changed = True

# Inject Confluence token
if conf and conf != "YOUR_TOKEN":
    env = servers.get("confluence", {}).get("env", {})
    if "CONFLUENCE_PAT" in env:
        env["CONFLUENCE_PAT"] = conf
        changed = True

# GitHub: per-remote injection or legacy fallback
if "github" in servers:
    remotes = [r for r in remotes_raw.strip().split('\n') if r.strip()]
    github_entry = servers.pop("github")

    if remotes:
        # Replace single "github" entry with N "github-{remote}" entries
        for remote in remotes:
            token = read_tok('GITHUB_TOKEN_' + remote)
            host = read_tok('GITHUB_HOST_' + remote)
            api_path = read_tok('GITHUB_API_PATH_' + remote)
            if not token or not host:
                continue
            entry = dict(github_entry)
            entry["env"] = {
                "GITHUB_REMOTE": remote,
                "GITHUB_HOST": host,
                "GITHUB_TOKEN": token,
            }
            if api_path:
                entry["env"]["GITHUB_API_PATH"] = api_path
            servers["github-" + remote] = entry
        changed = True
    else:
        # Fallback: legacy single github entry with GITHUB_TOKEN_disney
        gh_token = read_tok('GITHUB_TOKEN_disney')
        if gh_token and gh_token != "YOUR_TOKEN":
            env = github_entry.get("env", {})
            if "GITHUB_TOKEN_disney" in env:
                env["GITHUB_TOKEN_disney"] = gh_token
        servers["github"] = github_entry
        changed = True

if changed:
    with open(path, "w") as f:
        json.dump(d, f, indent=2)
        f.write("\n")
INJECT_PY
    done
}

install_profile() {
    local profile=$1
    local target_dir=$2
    local source_dir="$STEER_ROOT/profiles/$profile"
    
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

install_profile_from() {
    local source_dir=$1
    local profile=$2
    local target_dir=${3:-$KIRO_ROOT}

    if [ ! -d "$source_dir" ]; then
        echo "❌ Workspace profile not found: $source_dir"
        return 1
    fi

    mkdir -p "$target_dir/agents" "$target_dir/prompts"

    for agent_json in "$source_dir/agents/"*.json; do
        [ -f "$agent_json" ] || continue
        [[ "$(basename "$agent_json")" == ._* ]] && continue
        sed "s|\$HOME|$HOME|g" "$agent_json" > "$target_dir/agents/$(basename "$agent_json")"
    done

    # Copy subdirs, excluding macOS ._ resource fork files
    for subdir in prompts context powers skills steering; do
        if [ -d "$source_dir/$subdir" ]; then
            mkdir -p "$target_dir/$subdir"
            find "$source_dir/$subdir" -maxdepth 1 -type f ! -name '._*' -exec cp {} "$target_dir/$subdir/" \;
        fi
    done

    local agent_count=$(find "$source_dir/agents" -name "*.json" ! -name "._*" 2>/dev/null | wc -l | tr -d ' ')
    inject_agent_tokens "$target_dir"
    echo "  ✓ $profile ($agent_count agents)"
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
for d in sorted(glob.glob('$STEER_ROOT/profiles/*')):
    if not os.path.isdir(d): continue
    pid = os.path.basename(d)
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
    
    if [ -d "$STEER_ROOT/shared/tools/mcp-servers" ]; then
        echo "📦 Installing MCP server bundles..."
        for mcp_dir in "$STEER_ROOT/shared/tools/mcp-servers"/*/; do
            local name=$(basename "$mcp_dir")
            local bundle="$mcp_dir/dist/index.cjs"
            if [ -f "$bundle" ]; then
                mkdir -p "$target_dir/tools/mcp-servers/$name/dist"
                cp "$bundle" "$target_dir/tools/mcp-servers/$name/dist/index.cjs"
            fi
        done
        echo "✓ Installed MCP server bundles"
    fi
    
    if [ -d "$STEER_ROOT/shared/context" ]; then
        echo "📦 Installing shared context..."
        mkdir -p "$target_dir/context"
        cp "$STEER_ROOT/shared/context/"*.md "$target_dir/context/" 2>/dev/null || true
        echo "✓ Installed shared context files"
    fi

    if [ -d "$STEER_ROOT/shared/hooks" ]; then
        echo "📦 Installing hooks..."
        mkdir -p "$target_dir/hooks"
        cp "$STEER_ROOT/shared/hooks/"*.sh "$target_dir/hooks/" 2>/dev/null || true
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
        expand_profile_aliases
        
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
        clean_resource_forks "$target_dir"
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
        expand_profile_aliases
        
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
        # Install context7 from public npm (blocked by corporate proxy via npx)
        echo "📦 Installing context7-mcp from public registry..."
        if [ -f "$KIRO_ROOT/tools/mcp-servers/context7-mcp/package.json" ]; then
            (cd "$KIRO_ROOT/tools/mcp-servers/context7-mcp" && npm install --registry https://registry.npmjs.org --silent 2>/dev/null)
            echo "  ✓ context7"
        fi
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
            
            
            # GitHub remotes (multi-remote loop)
            echo "━━━ GitHub Remotes ━━━"
            echo "Configure one or more GitHub remotes (e.g., disney, public, espn_code)"
            echo ""
            _add_github_remote=true
            while [ "$_add_github_remote" = true ]; do
                read -r -p "Remote name (e.g., disney): " _gh_remote
                if [ -z "$_gh_remote" ]; then
                    echo "  ⏭ Skipped GitHub configuration"
                    break
                fi
                read -r -p "GitHub host for '$_gh_remote' (e.g., github.disney.com): " _gh_host
                if [ -z "$_gh_host" ]; then
                    echo "  ⚠️  Host is required, skipping remote '$_gh_remote'"
                    continue
                fi
                read -r -p "GitHub token for '$_gh_remote': " _gh_token
                if [ -z "$_gh_token" ]; then
                    echo "  ⚠️  Token is required, skipping remote '$_gh_remote'"
                    continue
                fi
                read -r -p "API path for '$_gh_remote' (default: /api/v3, Enter to skip): " _gh_api_path

                # Write to github-mcp .env for backward compat
                github_env="$KIRO_ROOT/tools/mcp-servers/github-mcp/.env"
                # Append (or create) — don't overwrite previous remotes
                if [ ! -f "$github_env" ]; then
                    : > "$github_env"
                fi
                # Remove old entries for this remote if present
                grep -v "^GITHUB_TOKEN_${_gh_remote}=" "$github_env" 2>/dev/null | grep -v "^GITHUB_HOST_${_gh_remote}=" | grep -v "^GITHUB_API_PATH_${_gh_remote}=" > "$github_env.tmp" || true
                echo "GITHUB_TOKEN_${_gh_remote}=$_gh_token" >> "$github_env.tmp"
                echo "GITHUB_HOST_${_gh_remote}=$_gh_host" >> "$github_env.tmp"
                [ -n "$_gh_api_path" ] && echo "GITHUB_API_PATH_${_gh_remote}=$_gh_api_path" >> "$github_env.tmp"
                mv "$github_env.tmp" "$github_env"
                echo "  ✓ Saved remote '$_gh_remote' (host: $_gh_host)"

                read -r -p "Add another GitHub remote? (y/N): " _more
                if [[ ! "$_more" =~ ^[Yy]$ ]]; then
                    _add_github_remote=false
                fi
            done
            echo ""
        fi
        
        # Generate centralized tokens.env
        echo ""
        echo "🔧 Generating ~/.kiro/tokens.env..."
        tokens_file="$KIRO_ROOT/tokens.env"
        cat > "$tokens_file" << 'TOKHEADER'
# Kiro Agent Tokens — Single Source of Truth
# Run: ./setup.sh mcp-install   to configure interactively
# Or edit this file directly, then: ./setup.sh install <profiles>
TOKHEADER
        # Read from individual .env files (backward compat) or use just-entered values
        _tok() { grep -s "^$1=" "$2" 2>/dev/null | head -1 | cut -d= -f2-; }
        jp=$(_tok "JIRA_PAT" "$KIRO_ROOT/tools/mcp-servers/jira-mcp/.env")
        cp=$(_tok "CONFLUENCE_PAT" "$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env")
        [ -n "$jp" ] && echo "JIRA_PAT=$jp" >> "$tokens_file"
        [ -n "$cp" ] && echo "CONFLUENCE_PAT=$cp" >> "$tokens_file"
        # Copy all GITHUB_TOKEN_{remote}, GITHUB_HOST_{remote}, GITHUB_API_PATH_{remote} from github-mcp/.env
        github_env="$KIRO_ROOT/tools/mcp-servers/github-mcp/.env"
        if [ -f "$github_env" ]; then
            grep -E '^GITHUB_(TOKEN|HOST|API_PATH)_[a-zA-Z0-9_]+=' "$github_env" >> "$tokens_file" 2>/dev/null || true
        fi
        echo "  ✓ $tokens_file"
        
        # Resolve $HOME in installed agent configs
        for agent_json in "$KIRO_ROOT/agents/"*.json; do
            if [ -f "$agent_json" ] && grep -q '\$HOME' "$agent_json" 2>/dev/null; then
                sed -i '' "s|\$HOME|$HOME|g" "$agent_json"
                echo "🔧 Resolved \$HOME in $(basename "$agent_json")"
            fi
        done
        
        inject_agent_tokens "$KIRO_ROOT"
        
        # Generate ~/.kiro/settings/mcp.json
        echo ""
        echo "🔧 Generating ~/.kiro/settings/mcp.json..."
        mkdir -p "$HOME/.kiro/settings"
        mcp_settings="$HOME/.kiro/settings/mcp.json"
        
        # Read tokens from centralized tokens.env
        _tok() { grep -s "^$1=" "$KIRO_ROOT/tokens.env" 2>/dev/null | head -1 | cut -d= -f2-; }
        jira_pat=$(_tok "JIRA_PAT")
        confluence_pat=$(_tok "CONFLUENCE_PAT")
        
        # Discover GitHub remotes from tokens.env
        _github_remotes=$(discover_github_remotes "$KIRO_ROOT/tokens.env")
        
        # Preserve existing powers section if present
        existing_powers="{}"
        if [ -f "$mcp_settings" ]; then
            existing_powers=$(python3 -c "import json; d=json.load(open('$mcp_settings')); print(json.dumps(d.get('powers',{})))" 2>/dev/null || echo "{}")
        fi
        
        python3 -c "
import json, sys, os

tokens_file = '$KIRO_ROOT/tokens.env'
remotes_raw = '''$_github_remotes'''.strip()
home = '$HOME'

def read_tok(key):
    try:
        with open(tokens_file) as f:
            for line in f:
                if line.startswith(key + '='):
                    return line.strip().split('=', 1)[1]
    except FileNotFoundError:
        pass
    return ''

mcp = {
    'mcpServers': {
        'jira': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs'],
            'env': {'JIRA_PAT': '${jira_pat}'}
        },
        'confluence': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs'],
            'env': {'CONFLUENCE_URL': 'https://confluence.disney.com', 'CONFLUENCE_PAT': '${confluence_pat}'}
        },
    }
}

# GitHub entries: per-remote with flat env vars, or legacy fallback
remotes = [r for r in remotes_raw.split('\n') if r.strip()]
if remotes:
    for remote in remotes:
        token = read_tok('GITHUB_TOKEN_' + remote)
        host = read_tok('GITHUB_HOST_' + remote)
        api_path = read_tok('GITHUB_API_PATH_' + remote)
        if not token or not host:
            continue
        entry = {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
            'env': {
                'GITHUB_REMOTE': remote,
                'GITHUB_HOST': host,
                'GITHUB_TOKEN': token,
            }
        }
        if api_path:
            entry['env']['GITHUB_API_PATH'] = api_path
        mcp['mcpServers']['github-' + remote] = entry
else:
    # Fallback: legacy single github entry
    legacy_token = read_tok('GITHUB_TOKEN')
    legacy_url = read_tok('GITHUB_URL')
    mcp['mcpServers']['github'] = {
        'command': 'node',
        'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
        'env': {
            'GITHUB_URL': legacy_url or 'https://github.disney.com',
            'GITHUB_TOKEN': legacy_token or 'YOUR_TOKEN',
        }
    }

# Non-GitHub MCP servers
mcp['mcpServers']['mermaid'] = {
    'command': 'node',
    'args': [home + '/.kiro/tools/mcp-servers/mermaid-diagram-mcp/dist/index.cjs']
}
mcp['mcpServers']['bruno'] = {
    'command': 'node',
    'args': [home + '/.kiro/tools/mcp-servers/bruno-mcp/dist/index.cjs']
}

powers = json.loads('$existing_powers')
if powers:
    mcp['powers'] = powers
with open('$mcp_settings', 'w') as f:
    json.dump(mcp, f, indent=2)
    f.write('\n')
"
        echo "  ✓ $mcp_settings"
        
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
            source_mb="$STEER_ROOT/workspaces/default/projects/$from_project/.kiro/rules/memory-bank"
            if [ ! -d "$source_mb" ]; then
                echo "❌ Unknown project: $from_project"
                echo "Available: $(ls "$STEER_ROOT/workspaces/default/projects" 2>/dev/null | tr '\n' ' ')"
                exit 1
            fi
            echo "📦 Copying memory bank from $from_project..."
            cp "$source_mb"/*.md "$target_mb/"
        elif [ -d "$STEER_ROOT/workspaces/default/projects/$project_name/.kiro/rules/memory-bank" ]; then
            echo "📦 Found known project: $project_name"
            cp "$STEER_ROOT/workspaces/default/projects/$project_name/.kiro/rules/memory-bank"/*.md "$target_mb/"
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

    init-manifest)
        shift
        if [ $# -eq 0 ]; then
            echo "❌ Project directory required"
            echo "Usage: ./setup.sh init-manifest <project-dir>"
            exit 1
        fi

        project_dir="${1/#\~//Users/ricardo.sanchez}"

        if [ ! -d "$project_dir" ]; then
            echo "❌ Directory does not exist: $project_dir"
            exit 1
        fi

        project_name=$(basename "$project_dir")
        manifest="$project_dir/project.yaml"

        if [ -f "$manifest" ]; then
            echo "⚠️  project.yaml already exists at $manifest"
            read -p "Overwrite? (y/N) " confirm
            [ "$confirm" != "y" ] && exit 0
        fi

        echo "🔍 Analyzing $project_dir..."

        # Detect stack
        stack=""
        [ -f "$project_dir/pom.xml" ] && stack="java"
        [ -f "$project_dir/build.gradle" ] && stack="java"
        [ -f "$project_dir/go.mod" ] && stack="go"
        [ -f "$project_dir/pubspec.yaml" ] && stack="flutter"
        [ -f "$project_dir/package.json" ] && {
            if grep -q "angular" "$project_dir/package.json" 2>/dev/null; then
                stack="angular"
            elif grep -q "react" "$project_dir/package.json" 2>/dev/null; then
                stack="react"
            else
                stack="node"
            fi
        }
        [ -f "$project_dir/requirements.txt" ] && stack="python"
        [ -f "$project_dir/setup.py" ] && stack="python"
        [ -z "$stack" ] && { echo "Could not detect stack."; read -p "Stack (java/node/angular/go/flutter/csharp/python/react): " stack; }

        # Detect base branch
        base_branch="main"
        if [ -d "$project_dir/.git" ]; then
            default_branch=$(cd "$project_dir" && git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||')
            [ -n "$default_branch" ] && base_branch="$default_branch"
        fi

        # Detect commands
        build_cmd="" test_cmd="" lint_cmd=""
        case "$stack" in
            java) build_cmd="mvn clean package -DskipTests"; test_cmd="mvn test"; lint_cmd="mvn checkstyle:check" ;;
            node|angular|react) build_cmd="npm run build"; test_cmd="npm test"; lint_cmd="npm run lint" ;;
            go) build_cmd="go build ./..."; test_cmd="go test ./..."; lint_cmd="go vet ./..." ;;
            flutter) build_cmd="flutter build"; test_cmd="flutter test"; lint_cmd="flutter analyze" ;;
            python) build_cmd="pip install -e ."; test_cmd="pytest"; lint_cmd="flake8" ;;
        esac

        # Detect GitHub org/repo
        gh_org="" gh_repo=""
        if [ -d "$project_dir/.git" ]; then
            remote_url=$(cd "$project_dir" && git remote get-url origin 2>/dev/null)
            if [ -n "$remote_url" ]; then
                gh_org=$(echo "$remote_url" | sed -E 's|.*[:/]([^/]+)/[^/]+(\.git)?$|\1|')
                gh_repo=$(echo "$remote_url" | sed -E 's|.*[:/][^/]+/([^/]+)(\.git)?$|\1|')
            fi
        fi

        # Prompt for Jira prefix
        read -p "Jira project key (e.g., DPAY) [skip]: " jira_key

        # Write manifest
        cat > "$manifest" << YAMLEOF
name: $project_name
stack: $stack
baseBranch: $base_branch

commands:
  build: "$build_cmd"
  test: "$test_cmd"
  lint: "$lint_cmd"
  format: ""

integrations:
  jira:
    projectKey: "$jira_key"
    statuses:
      inProgress: ""
      review: ""
      done: ""
  github:
    org: "$gh_org"
    repo: "$gh_repo"

workspace:
  specsDir: docs/specs/
  useSpecs: false
YAMLEOF

        echo ""
        echo "✅ project.yaml created at $manifest"
        echo "   stack: $stack"
        echo "   baseBranch: $base_branch"
        [ -n "$gh_org" ] && echo "   github: $gh_org/$gh_repo"
        [ -n "$jira_key" ] && echo "   jira: $jira_key"
        echo ""
        echo "Review and edit as needed. See: docs/REFERENCE.md#project-manifest-projectyaml"
        ;;
        
    configure)
        echo "🔧 Configure MCP tokens"
        echo ""
        echo "Tokens file: ~/.kiro/tokens.env"
        echo ""
        
        tokens_file="$KIRO_ROOT/tokens.env"
        touch "$tokens_file"
        
        # --- Non-GitHub tokens (simple key/value) ---
        tokens=(
            "JIRA_PAT"
            "CONFLUENCE_PAT"
            "SONARQUBE_TOKEN"
            "HARNESS_API_KEY"
        )
        
        labels=(
            "Jira PAT (myjira.disney.com)"
            "Confluence PAT (confluence.disney.com)"
            "SonarQube Token (optional)"
            "Harness API Key (optional)"
        )
        
        for i in "${!tokens[@]}"; do
            token="${tokens[$i]}"
            label="${labels[$i]}"
            current=$(grep "^$token=" "$tokens_file" 2>/dev/null | head -1 | cut -d= -f2-)
            if [ -n "$current" ]; then
                masked="${current:0:6}...${current: -4} (${#current}ch)"
                status="$masked"
            else
                status="not set"
            fi
            
            echo -n "$label [$status]: "
            read -r value
            
            if [ -n "$value" ]; then
                grep -v "^$token=" "$tokens_file" > "$tokens_file.tmp" 2>/dev/null || true
                echo "$token=$value" >> "$tokens_file.tmp"
                mv "$tokens_file.tmp" "$tokens_file"
                echo "  ✓ Updated"
            else
                echo "  ⏭ Kept"
            fi
        done
        
        # --- GitHub remotes (multi-remote management) ---
        echo ""
        echo "━━━ GitHub Remotes ━━━"
        
        # Discover existing remotes from tokens.env
        _existing_remotes=$(discover_github_remotes "$tokens_file")
        
        if [ -n "$_existing_remotes" ]; then
            echo "Existing remotes:"
            while IFS= read -r _remote; do
                _cur_token=$(grep "^GITHUB_TOKEN_${_remote}=" "$tokens_file" 2>/dev/null | head -1 | cut -d= -f2-)
                _cur_host=$(grep "^GITHUB_HOST_${_remote}=" "$tokens_file" 2>/dev/null | head -1 | cut -d= -f2-)
                if [ -n "$_cur_token" ]; then
                    _masked_tok="${_cur_token:0:4}***${_cur_token: -3}"
                else
                    _masked_tok="not set"
                fi
                echo "  $_remote: ${_cur_host:-no host} ($_masked_tok)"
            done <<< "$_existing_remotes"
            echo ""
            
            # Allow updating existing remotes
            while IFS= read -r _remote; do
                read -r -p "Update remote '$_remote'? (y/N): " _update
                if [[ "$_update" =~ ^[Yy]$ ]]; then
                    _cur_host=$(grep "^GITHUB_HOST_${_remote}=" "$tokens_file" 2>/dev/null | head -1 | cut -d= -f2-)
                    read -r -p "  Host for '$_remote' [${_cur_host:-not set}]: " _new_host
                    [ -z "$_new_host" ] && _new_host="$_cur_host"
                    read -r -p "  Token for '$_remote' (Enter to keep current): " _new_token
                    
                    if [ -n "$_new_host" ]; then
                        grep -v "^GITHUB_HOST_${_remote}=" "$tokens_file" > "$tokens_file.tmp" 2>/dev/null || true
                        echo "GITHUB_HOST_${_remote}=$_new_host" >> "$tokens_file.tmp"
                        mv "$tokens_file.tmp" "$tokens_file"
                    fi
                    if [ -n "$_new_token" ]; then
                        grep -v "^GITHUB_TOKEN_${_remote}=" "$tokens_file" > "$tokens_file.tmp" 2>/dev/null || true
                        echo "GITHUB_TOKEN_${_remote}=$_new_token" >> "$tokens_file.tmp"
                        mv "$tokens_file.tmp" "$tokens_file"
                    fi
                    echo "  ✓ Updated remote '$_remote'"
                else
                    echo "  ⏭ Kept"
                fi
            done <<< "$_existing_remotes"
        else
            echo "No GitHub remotes configured yet."
        fi
        
        # Allow adding new remotes
        echo ""
        _add_more=true
        while [ "$_add_more" = true ]; do
            read -r -p "Add a new GitHub remote? (y/N): " _add_yn
            if [[ ! "$_add_yn" =~ ^[Yy]$ ]]; then
                break
            fi
            read -r -p "  Remote name (e.g., disney): " _new_remote
            if [ -z "$_new_remote" ]; then
                echo "  ⚠️  Remote name is required"
                continue
            fi
            read -r -p "  GitHub host for '$_new_remote' (e.g., github.disney.com): " _new_host
            if [ -z "$_new_host" ]; then
                echo "  ⚠️  Host is required, skipping remote '$_new_remote'"
                continue
            fi
            read -r -p "  GitHub token for '$_new_remote': " _new_token
            if [ -z "$_new_token" ]; then
                echo "  ⚠️  Token is required, skipping remote '$_new_remote'"
                continue
            fi
            
            # Remove old entries for this remote if present, then write new ones
            grep -v "^GITHUB_TOKEN_${_new_remote}=" "$tokens_file" 2>/dev/null | grep -v "^GITHUB_HOST_${_new_remote}=" > "$tokens_file.tmp" || true
            echo "GITHUB_TOKEN_${_new_remote}=$_new_token" >> "$tokens_file.tmp"
            echo "GITHUB_HOST_${_new_remote}=$_new_host" >> "$tokens_file.tmp"
            mv "$tokens_file.tmp" "$tokens_file"
            echo "  ✓ Added remote '$_new_remote' (host: $_new_host)"
        done
        
        echo ""
        echo "✅ Tokens saved to $tokens_file"
        echo "💡 Run ./setup.sh install <profiles> to inject into agent configs"
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
                    
                    # Read from centralized tokens.env
                    if [ -f "$HOME/.kiro/tokens.env" ]; then
                        _tok() { grep -s "^$1=" "$HOME/.kiro/tokens.env" | head -1 | cut -d= -f2-; }
                        jira_pat=$(_tok "JIRA_PAT"); [ -z "$jira_pat" ] && jira_pat="YOUR_TOKEN"
                        confluence_pat=$(_tok "CONFLUENCE_PAT"); [ -z "$confluence_pat" ] && confluence_pat="YOUR_TOKEN"
                    fi
                    
                    # Discover GitHub remotes from tokens.env
                    _cursor_github_remotes=$(discover_github_remotes "$HOME/.kiro/tokens.env")
                    
                    python3 -c "
import json, sys, os

tokens_file = '$HOME/.kiro/tokens.env'
remotes_raw = '''$_cursor_github_remotes'''.strip()
home = '$HOME'
mcp_json_path = '$mcp_json'

def read_tok(key):
    try:
        with open(tokens_file) as f:
            for line in f:
                if line.startswith(key + '='):
                    return line.strip().split('=', 1)[1]
    except FileNotFoundError:
        pass
    return ''

mcp = {
    'mcpServers': {
        'jira': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs'],
            'env': {'JIRA_PAT': '${jira_pat}'}
        },
        'confluence': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs'],
            'env': {'CONFLUENCE_URL': 'https://confluence.disney.com', 'CONFLUENCE_PAT': '${confluence_pat}'}
        },
    }
}

# GitHub entries: per-remote with flat env vars, or fallback to single placeholder
remotes = [r for r in remotes_raw.split('\n') if r.strip()]
has_placeholder = False
if remotes:
    for remote in remotes:
        token = read_tok('GITHUB_TOKEN_' + remote)
        host = read_tok('GITHUB_HOST_' + remote)
        api_path = read_tok('GITHUB_API_PATH_' + remote)
        if not token or not host:
            continue
        entry = {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
            'env': {
                'GITHUB_REMOTE': remote,
                'GITHUB_HOST': host,
                'GITHUB_TOKEN': token,
            }
        }
        if api_path:
            entry['env']['GITHUB_API_PATH'] = api_path
        mcp['mcpServers']['github-' + remote] = entry
else:
    # Fallback: single github entry with placeholders
    has_placeholder = True
    mcp['mcpServers']['github'] = {
        'command': 'node',
        'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
        'env': {
            'GITHUB_TOKEN': 'YOUR_TOKEN',
        }
    }

# Non-GitHub MCP servers
mcp['mcpServers']['mermaid'] = {
    'command': 'node',
    'args': [home + '/.kiro/tools/mcp-servers/mermaid-diagram-mcp/dist/index.cjs']
}
mcp['mcpServers']['bruno'] = {
    'command': 'node',
    'args': [home + '/.kiro/tools/mcp-servers/bruno-mcp/dist/index.cjs']
}

with open(mcp_json_path, 'w') as f:
    json.dump(mcp, f, indent=2)
    f.write('\n')

# Signal placeholder status
if has_placeholder or '${jira_pat}' == 'YOUR_TOKEN' or '${confluence_pat}' == 'YOUR_TOKEN':
    sys.exit(2)
"
                    _cursor_mcp_rc=$?
                    echo "  ✓ $mcp_json"
                    
                    if [ "$_cursor_mcp_rc" -eq 2 ]; then
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
                known_mb="$STEER_ROOT/workspaces/default/projects/$project_name/.kiro/rules/memory-bank"
                
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
                # Fetch latest from remote if --fetch flag
                if [[ "$1" == "--fetch" ]]; then
                    echo "🔄 Fetching latest from remote..."
                    git -C "$STEER_ROOT" pull --rebase --quiet 2>/dev/null && echo "  ✓ Up to date" || echo "  ⚠ Fetch failed (offline?)"
                    echo ""
                fi
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

                # 1. Install profiles (workspace-local profiles take precedence)
                ws_path="$ws_dir/$ws_name"
                global_profiles=""
                if [ -n "$profiles" ]; then
                    for profile in $profiles; do
                        if [ -d "$ws_path/profiles/$profile" ]; then
                            echo "📦 Installing workspace profile: $profile"
                            install_profile_from "$ws_path/profiles/$profile" "$profile" "$KIRO_ROOT"
                        else
                            global_profiles="$global_profiles $profile"
                        fi
                    done
                    if [ -n "$global_profiles" ]; then
                        echo "📦 Installing global profiles:$global_profiles"
                        "$STEER_ROOT/setup.sh" install $global_profiles
                    fi
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

                # 4. Copy workspace-specific context (into repo .kiro/context/ where agents read from)
                if [ -d "$ws_path/context" ] && [ -n "$(ls "$ws_path/context"/*.md 2>/dev/null)" ]; then
                    echo "📄 Installing workspace context..."
                    mkdir -p "$STEER_ROOT/shared/context"
                    for c in "$ws_path/context"/*.md; do
                        cp "$c" "$STEER_ROOT/shared/context/"
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

                # Commit and push unless --local
                if [[ "$2" != "--local" ]]; then
                    echo ""
                    echo "📤 Publishing workspace to repository..."
                    git -C "$STEER_ROOT" add "workspaces/$ws_name/" 2>/dev/null
                    git -C "$STEER_ROOT" commit -m "feat: add $ws_name team workspace" --quiet 2>/dev/null &&                     git -C "$STEER_ROOT" push --quiet 2>/dev/null &&                         echo "  ✓ Committed and pushed" ||                         echo "  ⚠ Git push failed — commit locally, push manually"
                fi

                echo ""
                echo "Next steps:"
                echo "  1. Edit workspaces/$ws_name/workspace.json"
                echo "  2. Add team rules to workspaces/$ws_name/rules/"
                echo "  3. Add team context to workspaces/$ws_name/context/"
                echo "  4. Apply: ./setup.sh workspace apply $ws_name"
                ;;


            sync)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace sync <name> [--push]"; exit 1; fi
                ws_file="$ws_dir/$ws_name/workspace.json"
                if [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

                do_push=false
                [ "$2" = "--push" ] && do_push=true

                projects=$(python3 -c "
import json
for p in json.load(open('$ws_file')).get('projects',[]):
    path = p.get('path','')
    if path: print(path)
")
                if [ -z "$projects" ]; then
                    echo "⚠ No projects in workspace $ws_name"
                    exit 0
                fi

                echo "🔄 Syncing workspace: $ws_name"
                echo ""
                while IFS= read -r proj_path; do
                    resolved="${proj_path/#\~/$HOME}"
                    # Resolve relative paths from steer-runtime parent
                    if [[ "$resolved" == ../* ]]; then
                        resolved="$(cd "$STEER_ROOT/$resolved" 2>/dev/null && pwd || true)"
                    fi
                    name=$(basename "${resolved:-$proj_path}")
                    if [ -z "$resolved" ] || [ ! -d "$resolved/.git" ]; then
                        echo "  ⏭ $name (not found)"
                        continue
                    fi
                    if $do_push; then
                        git -C "$resolved" push --quiet 2>/dev/null && echo "  ✓ $name (pushed)" || echo "  ⚠ $name (push failed)"
                    else
                        git -C "$resolved" fetch --all --quiet 2>/dev/null
                        git -C "$resolved" pull --rebase --quiet 2>/dev/null && echo "  ✓ $name (pulled)" || echo "  ⚠ $name (pull failed — resolve conflicts)"
                    fi
                done <<< "$projects"
                echo ""
                echo "✅ Sync complete"
                ;;
            *)
                echo "❌ Unknown workspace command: $ws_cmd"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh workspace list              List available workspaces"
                echo "  ./setup.sh workspace show <name>       Show workspace details"
                echo "  ./setup.sh workspace apply <name>      Apply workspace config"
                echo "  ./setup.sh workspace create <name>     Create new workspace
                echo "  ./setup.sh workspace sync <name>       Fetch & pull all workspace repos
  ./setup.sh workspace sync <name> --push Push all workspace repos""
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
