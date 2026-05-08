#!/bin/bash
# Unified setup for steer-runtime (multi-profile support)

set -e

# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ⚠️  DEPRECATED — This script is deprecated. Use Koda instead.     ║
# ║                                                                      ║
# ║  Install Koda:                                                       ║
# ║    curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/\    ║
# ║         Koda/main/install.sh | bash                                  ║
# ║                                                                      ║
# ║  Then run: koda install dev                                          ║
# ║  Docs: https://github.disney.com/SANCR225/Koda                      ║
# ╚══════════════════════════════════════════════════════════════════════╝

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║  ⚠️  DEPRECATED — This script is deprecated. Use Koda instead.     ║"
echo "║                                                                      ║"
echo "║  Install:  curl -fsSL https://raw.githubusercontent.com/            ║"
echo "║            rsanchez-disney/Koda/main/install.sh | bash              ║"
echo "║  Then:     koda install dev                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""


STEER_ROOT="$(cd "$(dirname "$0")" && pwd)"
KIRO_ROOT="$HOME/.kiro"

# Clean macOS resource fork files (._*) from a directory
clean_resource_forks() {
    find "$1" -name "._*" -delete 2>/dev/null || true
}

# Detect WSL and provide path conversion for Windows UNC format
_is_wsl=false
_wsl_distro=""
if [ -n "$WSL_DISTRO_NAME" ] || grep -qi microsoft /proc/version 2>/dev/null; then
    _is_wsl=true
    _wsl_distro="${WSL_DISTRO_NAME:-Ubuntu}"
fi

# Convert a Linux path to a Windows UNC path when running in WSL.
# On non-WSL systems, returns the path unchanged.
to_win_path() {
    if [ "$_is_wsl" = true ]; then
        if command -v wslpath &>/dev/null; then
            wslpath -w "$1"
        else
            echo "\\\\wsl.localhost\\${_wsl_distro}$(echo "$1" | sed 's|/|\\|g')"
        fi
    else
        echo "$1"
    fi
}

# Pre-compute MCP server paths (WSL-aware)
precompute_mcp_paths() {
    _p_jira="$(to_win_path "$HOME/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs")"
    _p_confluence="$(to_win_path "$HOME/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs")"
    _p_github="$(to_win_path "$HOME/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs")"
    _p_mermaid="$(to_win_path "$HOME/.kiro/tools/mcp-servers/mermaid-diagram-mcp/dist/index.cjs")"
    _p_bruno="$(to_win_path "$HOME/.kiro/tools/mcp-servers/bruno-mcp/dist/index.cjs")"
    _p_splunk="$(to_win_path "$HOME/.kiro/tools/mcp-servers/splunk-mcp/dist/index.cjs")"
    _p_appdynamics="$(to_win_path "$HOME/.kiro/tools/mcp-servers/appdynamics-mcp/dist/index.cjs")"
    _p_servicenow="$(to_win_path "$HOME/.kiro/tools/mcp-servers/servicenow-mcp/dist/index.cjs")"
    _p_mywiki="$(to_win_path "$HOME/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs")"
    _p_figma="$(to_win_path "$HOME/.kiro/tools/mcp-servers/figma-mcp/dist/index.cjs")"
    _p_qtest="$(to_win_path "$HOME/.kiro/tools/mcp-servers/qtest-mcp/dist/index.cjs")"
    _p_sharepoint="$(to_win_path "$HOME/.kiro/tools/mcp-servers/sharepoint-mcp/dist/index.cjs")"
    _node_cmd="node"
    if [ "$_is_wsl" = true ]; then
        _node_cmd="wsl.exe -d $_wsl_distro node"
    fi
}

# Discover GitHub remotes from tokens.env by scanning for GITHUB_TOKEN_{remote} keys
# Outputs one remote name per line, sorted and deduplicated
discover_github_remotes() {
    local tokens_file="$1"
    [ -f "$tokens_file" ] || return
    grep -o 'GITHUB_TOKEN_[a-zA-Z0-9_]*' "$tokens_file" | sed 's/GITHUB_TOKEN_//' | sort -u
}

# Discover Confluence instances from tokens.env by scanning for CONFLUENCE_PAT_{instance} keys
# Outputs one instance name per line, sorted and deduplicated
discover_confluence_instances() {
    local tokens_file="$1"
    [ -f "$tokens_file" ] || return
    grep -o 'CONFLUENCE_PAT_[a-zA-Z0-9_]*' "$tokens_file" | sed 's/CONFLUENCE_PAT_//' | sort -u
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
  kiro-ide <subcmd> <dir>                Manage Kiro IDE steering, skills, hooks + MCP
  cursor <subcmd> <dir>                  Manage Cursor IDE rules + MCP config
  amazonq <subcmd> <dir>                 Manage Amazon Q Developer rules
  amazonq-sync [full|rules|mcp|status]   Sync Kiro dev config to Amazon Q plugin
  help                                   Show this help message

PROFILES:
  dev                 All dev agents (alias → dev-core + dev-web + dev-mobile + dev-python + dev-ai + dev-infra + dev-dotnet + dev-php + dev-ui)
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
  ./setup.sh workspace sync payments-core   # Pull all workspace repos
  ./setup.sh workspace sync payments-core --push  # Push all workspace repos

  # Kiro IDE
  ./setup.sh kiro-ide install ~/myapp      # Install .kiro/steering, skills, hooks
  ./setup.sh kiro-ide sync ~/myapp         # Update from latest profiles
  ./setup.sh kiro-ide remove ~/myapp       # Remove .kiro/steering, skills, hooks

  # Cursor IDE
  ./setup.sh cursor install ~/myapp        # Install .cursor/rules + MCP config
  ./setup.sh cursor sync ~/myapp           # Update rules from latest templates
  ./setup.sh cursor remove ~/myapp         # Remove .cursor/ directory

  # Amazon Q Developer
  ./setup.sh amazonq install ~/myapp       # Install .amazonq/rules/
  ./setup.sh amazonq sync ~/myapp          # Update rules from latest templates
  ./setup.sh amazonq remove ~/myapp        # Remove .amazonq/ directory
  ./setup.sh amazonq-sync                    # Sync Kiro rules + MCP to Amazon Q plugin
  ./setup.sh amazonq-sync mcp                # Sync MCP servers only
  ./setup.sh amazonq-sync status ~/myapp     # Check sync status
USAGE
}

list_profiles() {
    echo "📋 Available profiles:"
    echo ""
    echo "  • dev (alias → all dev-* profiles)"
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

# Expand profile aliases (e.g., dev → all dev-* profiles)
expand_profile_aliases() {
    local expanded=()
    for p in "${profiles[@]}"; do
        case "$p" in
            dev) expanded+=(dev-core dev-web dev-mobile dev-python dev-ai dev-infra dev-dotnet dev-php dev-ui) ;;
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

# Inject qTest tokens
qtest_token = read_tok("QTEST_BEARER_TOKEN")
qtest_project = read_tok("QTEST_PROJECT_ID")
if "qtest" in servers:
    env = servers["qtest"].get("env", {})
    if qtest_token and "QTEST_BEARER_TOKEN" in env:
        env["QTEST_BEARER_TOKEN"] = qtest_token
        changed = True
    if qtest_project and "QTEST_PROJECT_ID" in env:
        env["QTEST_PROJECT_ID"] = qtest_project
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
        
        # Expand aliases (dev → all dev-* profiles)
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
        
        # Expand aliases (dev → all dev-* profiles)
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
                errors=0
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
        
        # Sync shared MCP bundles to ~/.kiro
        install_shared "$KIRO_ROOT"
        echo ""

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
        echo "  qTest:"
        echo "  Your qTest instance → Profile → API Token"
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
            # qTest token
            echo "━━━ qTest ━━━"
            read -r -p "Paste your qTest Bearer Token (or Enter to skip): " qtest_token
            read -r -p "Enter your qTest Project ID (or Enter to skip): " qtest_project_id
            if [ -n "$qtest_token" ]; then
                qtest_env="$KIRO_ROOT/tools/mcp-servers/qtest-mcp/.env"
                cat > "$qtest_env" << QTESTEOF
QTEST_BEARER_TOKEN=$qtest_token
QTESTEOF
                if [ -n "$qtest_project_id" ]; then
                    echo "QTEST_PROJECT_ID=$qtest_project_id" >> "$qtest_env"
                fi
                echo "  ✓ Saved to qtest-mcp/.env"
            else
                echo "  ⏭ Skipped"
            fi
            echo ""
        
            # Merge newly entered tokens into ~/.kiro/tokens.env (preserves existing tokens from koda)
            echo ""
            echo "🔧 Updating ~/.kiro/tokens.env..."
            tokens_file="$KIRO_ROOT/tokens.env"
            
            # Create tokens.env with header if it doesn't exist
            if [ ! -f "$tokens_file" ]; then
                cat > "$tokens_file" << 'TOKHEADER'
# Kiro Agent Tokens — Single Source of Truth
# Run: ./setup.sh mcp-install   to configure interactively
# Or edit this file directly, then: ./setup.sh install <profiles>
TOKHEADER
            fi
            
            # Helper: upsert a key=value into tokens_file (update if exists, append if not)
            _upsert_token() {
                local key="$1" val="$2"
                [ -z "$val" ] && return
                if grep -q "^${key}=" "$tokens_file" 2>/dev/null; then
                    sed -i '' "s|^${key}=.*|${key}=${val}|" "$tokens_file"
                else
                    echo "${key}=${val}" >> "$tokens_file"
                fi
            }
            
            # Read from individual .env files written by the prompts above
            _tok() { grep -s "^$1=" "$2" 2>/dev/null | head -1 | cut -d= -f2-; }
            
            jp=$(_tok "JIRA_PAT" "$KIRO_ROOT/tools/mcp-servers/jira-mcp/.env")
            [ -n "$jp" ] && _upsert_token "JIRA_PAT" "$jp"
            
            cp=$(_tok "CONFLUENCE_PAT" "$KIRO_ROOT/tools/mcp-servers/confluence-mcp/.env")
            [ -n "$cp" ] && _upsert_token "CONFLUENCE_PAT" "$cp"
            
            # GitHub remotes from github-mcp/.env
            github_env="$KIRO_ROOT/tools/mcp-servers/github-mcp/.env"
            if [ -f "$github_env" ]; then
                while IFS='=' read -r key val; do
                    [[ "$key" =~ ^GITHUB_(TOKEN|HOST|API_PATH)_ ]] && _upsert_token "$key" "$val"
                done < "$github_env"
            fi
            
            # qTest tokens from qtest-mcp/.env
            qtest_env="$KIRO_ROOT/tools/mcp-servers/qtest-mcp/.env"
            if [ -f "$qtest_env" ]; then
                while IFS='=' read -r key val; do
                    [[ "$key" =~ ^QTEST_(BEARER_TOKEN|PROJECT_ID) ]] && _upsert_token "$key" "$val"
                done < "$qtest_env"
            fi
            
            echo "  ✓ $tokens_file"
        fi
        
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
        
        # Discover Confluence instances from tokens.env
        _confluence_instances=$(discover_confluence_instances "$KIRO_ROOT/tokens.env")
        
        # Preserve existing powers section if present
        existing_powers="{}"
        if [ -f "$mcp_settings" ]; then
            existing_powers=$(python3 -c "import json; d=json.load(open('$mcp_settings')); print(json.dumps(d.get('powers',{})))" 2>/dev/null || echo "{}")
        fi
        
        # Pre-compute WSL-aware MCP paths
        precompute_mcp_paths
        if [ "$_is_wsl" = true ]; then
            echo "  ℹ️  WSL detected ($_wsl_distro) — using Windows UNC paths in mcp.json"
        fi
        
        python3 -c "
import json, sys, os

tokens_file = '$KIRO_ROOT/tokens.env'
remotes_raw = '''$_github_remotes'''.strip()
confluence_instances_raw = '''$_confluence_instances'''.strip()

p_jira = r'$_p_jira'
p_confluence = r'$_p_confluence'
p_github = r'$_p_github'
p_mermaid = r'$_p_mermaid'
p_bruno = r'$_p_bruno'
p_splunk = r'$_p_splunk'
p_appdynamics = r'$_p_appdynamics'
p_servicenow = r'$_p_servicenow'
p_qtest = r'$_p_qtest'
p_sharepoint = r'$_p_sharepoint'

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
            'args': [p_jira],
            'env': {'JIRA_PAT': '${jira_pat}'}
        },
    }
}

# Confluence: per-instance with CONFLUENCE_INSTANCE_PREFIX, or legacy fallback
conf_instances = [i for i in confluence_instances_raw.split('\\n') if i.strip()]
if conf_instances:
    for instance in conf_instances:
        token = read_tok('CONFLUENCE_PAT_' + instance)
        url = read_tok('CONFLUENCE_URL_' + instance)
        if not token or not url:
            continue
        mcp['mcpServers']['confluence-' + instance] = {
            'command': 'node',
            'args': [p_confluence],
            'env': {
                'CONFLUENCE_INSTANCE_PREFIX': instance + '_',
                'CONFLUENCE_URL': url,
                'CONFLUENCE_PAT': token,
            }
        }
else:
    # Fallback: legacy single confluence entry
    mcp['mcpServers']['confluence'] = {
        'command': 'node',
        'args': [p_confluence],
        'env': {'CONFLUENCE_URL': 'https://confluence.disney.com', 'CONFLUENCE_PAT': '${confluence_pat}'}
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
            'args': [p_github],
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
        'args': [p_github],
        'env': {
            'GITHUB_URL': legacy_url or 'https://github.disney.com',
            'GITHUB_TOKEN': legacy_token or 'YOUR_TOKEN',
        }
    }

# Non-GitHub MCP servers
mcp['mcpServers']['mermaid'] = {
    'command': 'node',
    'args': [p_mermaid]
}
mcp['mcpServers']['bruno'] = {
    'command': 'node',
    'args': [p_bruno]
}

# SharePoint — conditional on Azure AD credentials
sp_tenant = read_tok('SHAREPOINT_TENANT_ID')
sp_client = read_tok('SHAREPOINT_CLIENT_ID')
sp_secret = read_tok('SHAREPOINT_CLIENT_SECRET')
sp_site   = read_tok('SHAREPOINT_SITE_URL')
if sp_tenant and sp_client and sp_secret:
    sp_env = {'SHAREPOINT_TENANT_ID': sp_tenant, 'SHAREPOINT_CLIENT_ID': sp_client, 'SHAREPOINT_CLIENT_SECRET': sp_secret}
    if sp_site:
        sp_env['SHAREPOINT_SITE_URL'] = sp_site
    mcp['mcpServers']['sharepoint'] = {
        'command': 'node',
        'args': [p_sharepoint],
        'env': sp_env
    }

# NOTE: Splunk, AppDynamics, and ServiceNow MCP registration below is handled
# automatically by Koda (v0.4.66+) via GenerateMcpJson. These blocks remain
# for non-Koda installs. If using Koda, configure tokens in the TUI (press m).

splunk_user = read_tok('SPLUNK_API_USERNAME')
splunk_pass = read_tok('SPLUNK_API_PASSWORD')
splunk_url = read_tok('SPLUNK_BASE_URL')
if splunk_user and splunk_pass:
    mcp['mcpServers']['splunk-mcp'] = {
        'command': 'node',
        'args': [p_splunk],
        'env': {
            'SPLUNK_BASE_URL': splunk_url or 'https://splunk.wdprapps.disney.com:8089',
            'SPLUNK_API_USERNAME': splunk_user,
            'SPLUNK_API_PASSWORD': splunk_pass,
        }
    }

appd_id = read_tok('APPD_CLIENT_ID')
appd_secret = read_tok('APPD_CLIENT_SECRET')
appd_url = read_tok('APPD_CONTROLLER_URL')
if appd_id and appd_secret:
    mcp['mcpServers']['appdynamics-mcp'] = {
        'command': 'node',
        'args': [p_appdynamics],
        'env': {
            'APPD_CONTROLLER_URL': appd_url or 'https://disney-prod.saas.appdynamics.com',
            'APPD_CLIENT_ID': appd_id,
            'APPD_CLIENT_SECRET': appd_secret,
        }
    }

snow_user = read_tok('SNOW_API_USERNAME')
snow_pass = read_tok('SNOW_API_PASSWORD')
snow_url = read_tok('SNOW_INSTANCE')
if snow_user and snow_pass:
    mcp['mcpServers']['servicenow-mcp'] = {
        'command': 'node',
        'args': [p_servicenow],
        'env': {
            'SNOW_INSTANCE': snow_url or 'https://disney.service-now.com',
            'SNOW_API_USERNAME': snow_user,
            'SNOW_API_PASSWORD': snow_pass,
        }
    }

qtest_token = read_tok('QTEST_BEARER_TOKEN')
qtest_project = read_tok('QTEST_PROJECT_ID')
if qtest_token:
    qtest_env = {'QTEST_BEARER_TOKEN': qtest_token}
    if qtest_project:
        qtest_env['QTEST_PROJECT_ID'] = qtest_project
    mcp['mcpServers']['qtest'] = {
        'command': 'node',
        'args': [p_qtest],
        'env': qtest_env
    }

compass_token = read_tok('COMPASS_TOKEN')
if compass_token:
    mcp['mcpServers']['compass'] = {
        'url': 'https://compass.wdprapps.disney.com/api/mcp/mcp-60d5792b-5ce9-469b-9a6b-b08216eb267e',
        'type': 'sse',
        'headers': {'Authorization': 'Bearer ' + compass_token}
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

    kiro-ide)
        shift
        kide_subcmd="${1:-help}"
        kide_dir="${2:-}"
        
        case "$kide_subcmd" in
            install)
                if [ -z "$kide_dir" ]; then
                    echo "❌ Usage: ./setup.sh kiro-ide install <project-dir>"
                    exit 1
                fi
                kide_dir="${kide_dir/#\~/$HOME}"
                if [ ! -d "$kide_dir" ]; then
                    echo "❌ Directory does not exist: $kide_dir"
                    exit 1
                fi
                
                echo "🔧 Installing Kiro IDE config to $kide_dir/.kiro/"
                echo ""
                
                # --- Steering ---
                steering_dir="$kide_dir/.kiro/steering"
                mkdir -p "$steering_dir"
                steering_count=0
                
                # Dev-core steering
                if [ -d "$STEER_ROOT/profiles/dev-core/steering" ]; then
                    for md in "$STEER_ROOT"/profiles/dev-core/steering/*.md; do
                        [ -f "$md" ] || continue
                        cp "$md" "$steering_dir/"
                        echo "  ✓ steering/$(basename "$md")"
                        steering_count=$((steering_count + 1))
                    done
                fi
                
                # Dev-web steering
                if [ -d "$STEER_ROOT/profiles/dev-web/steering" ]; then
                    for md in "$STEER_ROOT"/profiles/dev-web/steering/*.md; do
                        [ -f "$md" ] || continue
                        cp "$md" "$steering_dir/"
                        echo "  ✓ steering/$(basename "$md")"
                        steering_count=$((steering_count + 1))
                    done
                fi
                
                echo ""
                echo "✅ Installed $steering_count steering files"
                
                # --- Skills ---
                skills_dir="$kide_dir/.kiro/skills"
                mkdir -p "$skills_dir"
                skills_count=0
                
                # Common skills
                if [ -d "$STEER_ROOT/common/skills" ]; then
                    for md in "$STEER_ROOT"/common/skills/*.md; do
                        [ -f "$md" ] || continue
                        [ "$(basename "$md")" = "README.md" ] && continue
                        cp "$md" "$skills_dir/"
                        echo "  ✓ skills/$(basename "$md")"
                        skills_count=$((skills_count + 1))
                    done
                fi
                
                # Dev-web skills
                if [ -d "$STEER_ROOT/profiles/dev-web/skills" ]; then
                    for md in "$STEER_ROOT"/profiles/dev-web/skills/*.md; do
                        [ -f "$md" ] || continue
                        cp "$md" "$skills_dir/"
                        echo "  ✓ skills/$(basename "$md")"
                        skills_count=$((skills_count + 1))
                    done
                fi
                
                echo ""
                echo "✅ Installed $skills_count skills"
                
                # --- Hooks ---
                hooks_dir="$kide_dir/.kiro/hooks"
                mkdir -p "$hooks_dir"
                hooks_count=0
                
                # Guard writes
                cat > "$hooks_dir/guard-writes.kiro.hook" << 'HOOKEOF'
{
  "name": "Guard Sensitive Paths",
  "version": "1.0.0",
  "description": "Blocks file writes to node_modules/, dist/, and .git/ directories.",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Check if the file being written is inside node_modules/, dist/, or .git/ directories. If it is, REFUSE to proceed."
  }
}
HOOKEOF
                echo "  ✓ hooks/guard-writes.kiro.hook"
                hooks_count=$((hooks_count + 1))
                
                # Secret scan
                cat > "$hooks_dir/secret-scan.kiro.hook" << 'HOOKEOF'
{
  "name": "Secret Scan on Write",
  "version": "1.0.0",
  "description": "Scans for hardcoded secrets before writing files.",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Scan the content being written for potential hardcoded secrets. If a real secret is detected, REFUSE the write and instruct to use environment variables instead. Placeholders like YOUR_TOKEN or ${ENV_VAR} are fine."
  }
}
HOOKEOF
                echo "  ✓ hooks/secret-scan.kiro.hook"
                hooks_count=$((hooks_count + 1))
                
                # Branch guard
                cat > "$hooks_dir/branch-guard.kiro.hook" << 'HOOKEOF'
{
  "name": "Branch Guard",
  "version": "1.0.0",
  "description": "Blocks direct git commit, push, or merge on main/master branch.",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["shell"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Check if the shell command involves git commit, git push, or git merge. If the current branch is main or master, REFUSE and instruct to use a feature branch. Read-only git commands are always allowed."
  }
}
HOOKEOF
                echo "  ✓ hooks/branch-guard.kiro.hook"
                hooks_count=$((hooks_count + 1))
                
                # Warn destructive
                cat > "$hooks_dir/warn-destructive.kiro.hook" << 'HOOKEOF'
{
  "name": "Warn on Destructive Commands",
  "version": "1.0.0",
  "description": "Warns after destructive commands like rm -rf, DROP TABLE, or --force.",
  "when": {
    "type": "postToolUse",
    "toolTypes": ["shell"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "If the command contained destructive patterns like rm -rf, DROP TABLE, DELETE FROM, or --force, warn the user. Otherwise do nothing."
  }
}
HOOKEOF
                echo "  ✓ hooks/warn-destructive.kiro.hook"
                hooks_count=$((hooks_count + 1))
                
                echo ""
                echo "✅ Installed $hooks_count hooks"
                
                # --- Summary ---
                echo ""
                echo "🎉 Kiro IDE setup complete:"
                echo "   $steering_count steering files → $steering_dir/"
                echo "   $skills_count skills → $skills_dir/"
                echo "   $hooks_count hooks → $hooks_dir/"
                echo ""
                echo "💡 MCP servers are user-level. Run ./setup.sh mcp-install to configure them."
                ;;
            
            sync)
                if [ -z "$kide_dir" ]; then
                    echo "❌ Usage: ./setup.sh kiro-ide sync <project-dir>"
                    exit 1
                fi
                kide_dir="${kide_dir/#\~/$HOME}"
                
                if [ ! -d "$kide_dir/.kiro/steering" ] && [ ! -d "$kide_dir/.kiro/skills" ]; then
                    echo "❌ No Kiro IDE config found at $kide_dir/.kiro/"
                    echo "   Run: ./setup.sh kiro-ide install $kide_dir"
                    exit 1
                fi
                
                echo "🔄 Syncing Kiro IDE config in $kide_dir/.kiro/"
                echo ""
                
                count=0
                # Sync steering
                if [ -d "$kide_dir/.kiro/steering" ]; then
                    for profile_dir in "$STEER_ROOT"/profiles/dev-core/steering "$STEER_ROOT"/profiles/dev-web/steering; do
                        [ -d "$profile_dir" ] || continue
                        for md in "$profile_dir"/*.md; do
                            [ -f "$md" ] || continue
                            cp "$md" "$kide_dir/.kiro/steering/"
                            count=$((count + 1))
                        done
                    done
                fi
                
                # Sync skills
                if [ -d "$kide_dir/.kiro/skills" ]; then
                    for md in "$STEER_ROOT"/common/skills/*.md; do
                        [ -f "$md" ] || continue
                        [ "$(basename "$md")" = "README.md" ] && continue
                        cp "$md" "$kide_dir/.kiro/skills/"
                        count=$((count + 1))
                    done
                    if [ -d "$STEER_ROOT/profiles/dev-web/skills" ]; then
                        for md in "$STEER_ROOT"/profiles/dev-web/skills/*.md; do
                            [ -f "$md" ] || continue
                            cp "$md" "$kide_dir/.kiro/skills/"
                            count=$((count + 1))
                        done
                    fi
                fi
                
                echo "✅ Synced $count files"
                ;;
            
            remove)
                if [ -z "$kide_dir" ]; then
                    echo "❌ Usage: ./setup.sh kiro-ide remove <project-dir>"
                    exit 1
                fi
                kide_dir="${kide_dir/#\~/$HOME}"
                
                removed=0
                for subdir in steering skills hooks; do
                    if [ -d "$kide_dir/.kiro/$subdir" ]; then
                        rm -rf "$kide_dir/.kiro/$subdir"
                        echo "  🗑️  Removed .kiro/$subdir/"
                        removed=$((removed + 1))
                    fi
                done
                
                if [ "$removed" -eq 0 ]; then
                    echo "⚠️  Nothing to remove — no steering, skills, or hooks found in $kide_dir/.kiro/"
                else
                    echo "✅ Removed $removed directories"
                fi
                ;;
            
            *)
                echo ""
                echo "Kiro IDE — install steering, skills, and hooks into a project workspace"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh kiro-ide install <project-dir>   Install steering, skills, hooks"
                echo "  ./setup.sh kiro-ide sync <project-dir>      Update from latest profiles"
                echo "  ./setup.sh kiro-ide remove <project-dir>    Remove steering, skills, hooks"
                echo ""
                echo "MCP servers are user-level — use ./setup.sh mcp-install separately."
                exit 1
                ;;
        esac
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
                    _cursor_confluence_instances=$(discover_confluence_instances "$HOME/.kiro/tokens.env")
                    
                    # Pre-compute WSL-aware MCP paths
                    precompute_mcp_paths
                    
                    python3 -c "
import json, sys, os

tokens_file = '$HOME/.kiro/tokens.env'
remotes_raw = '''$_cursor_github_remotes'''.strip()
confluence_instances_raw = '''$_cursor_confluence_instances'''.strip()
mcp_json_path = '$mcp_json'

p_jira = r'$_p_jira'
p_confluence = r'$_p_confluence'
p_github = r'$_p_github'
p_mermaid = r'$_p_mermaid'
p_bruno = r'$_p_bruno'
p_splunk = r'$_p_splunk'
p_appdynamics = r'$_p_appdynamics'
p_servicenow = r'$_p_servicenow'
p_qtest = r'$_p_qtest'
p_sharepoint = r'$_p_sharepoint'

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
            'args': [p_jira],
            'env': {'JIRA_PAT': '${jira_pat}'}
        },
    }
}

# Confluence: per-instance with CONFLUENCE_INSTANCE_PREFIX, or legacy fallback
conf_instances = [i for i in confluence_instances_raw.split('\\n') if i.strip()]
if conf_instances:
    for instance in conf_instances:
        token = read_tok('CONFLUENCE_PAT_' + instance)
        url = read_tok('CONFLUENCE_URL_' + instance)
        if not token or not url:
            continue
        mcp['mcpServers']['confluence-' + instance] = {
            'command': 'node',
            'args': [p_confluence],
            'env': {
                'CONFLUENCE_INSTANCE_PREFIX': instance + '_',
                'CONFLUENCE_URL': url,
                'CONFLUENCE_PAT': token,
            }
        }
else:
    # Fallback: legacy single confluence entry
    mcp['mcpServers']['confluence'] = {
        'command': 'node',
        'args': [p_confluence],
        'env': {'CONFLUENCE_URL': 'https://confluence.disney.com', 'CONFLUENCE_PAT': '${confluence_pat}'}
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
            'args': [p_github],
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
        'args': [p_github],
        'env': {
            'GITHUB_TOKEN': 'YOUR_TOKEN',
        }
    }

# Non-GitHub MCP servers
mcp['mcpServers']['mermaid'] = {
    'command': 'node',
    'args': [p_mermaid]
}
mcp['mcpServers']['bruno'] = {
    'command': 'node',
    'args': [p_bruno]
}

# SharePoint — conditional on Azure AD credentials
sp_tenant = read_tok('SHAREPOINT_TENANT_ID')
sp_client = read_tok('SHAREPOINT_CLIENT_ID')
sp_secret = read_tok('SHAREPOINT_CLIENT_SECRET')
sp_site   = read_tok('SHAREPOINT_SITE_URL')
if sp_tenant and sp_client and sp_secret:
    sp_env = {'SHAREPOINT_TENANT_ID': sp_tenant, 'SHAREPOINT_CLIENT_ID': sp_client, 'SHAREPOINT_CLIENT_SECRET': sp_secret}
    if sp_site:
        sp_env['SHAREPOINT_SITE_URL'] = sp_site
    mcp['mcpServers']['sharepoint'] = {
        'command': 'node',
        'args': [p_sharepoint],
        'env': sp_env
    }

# NOTE: See comment at line ~1089 — these blocks are for non-Koda installs only.

splunk_user = read_tok('SPLUNK_API_USERNAME')
splunk_pass = read_tok('SPLUNK_API_PASSWORD')
splunk_url = read_tok('SPLUNK_BASE_URL')
if splunk_user and splunk_pass:
    mcp['mcpServers']['splunk-mcp'] = {
        'command': 'node',
        'args': [p_splunk],
        'env': {
            'SPLUNK_BASE_URL': splunk_url or 'https://splunk.wdprapps.disney.com:8089',
            'SPLUNK_API_USERNAME': splunk_user,
            'SPLUNK_API_PASSWORD': splunk_pass,
        }
    }

appd_id = read_tok('APPD_CLIENT_ID')
appd_secret = read_tok('APPD_CLIENT_SECRET')
appd_url = read_tok('APPD_CONTROLLER_URL')
if appd_id and appd_secret:
    mcp['mcpServers']['appdynamics-mcp'] = {
        'command': 'node',
        'args': [p_appdynamics],
        'env': {
            'APPD_CONTROLLER_URL': appd_url or 'https://disney-prod.saas.appdynamics.com',
            'APPD_CLIENT_ID': appd_id,
            'APPD_CLIENT_SECRET': appd_secret,
        }
    }

snow_user = read_tok('SNOW_API_USERNAME')
snow_pass = read_tok('SNOW_API_PASSWORD')
snow_url = read_tok('SNOW_INSTANCE')
if snow_user and snow_pass:
    mcp['mcpServers']['servicenow-mcp'] = {
        'command': 'node',
        'args': [p_servicenow],
        'env': {
            'SNOW_INSTANCE': snow_url or 'https://disney.service-now.com',
            'SNOW_API_USERNAME': snow_user,
            'SNOW_API_PASSWORD': snow_pass,
        }
    }
qtest_token = read_tok('QTEST_BEARER_TOKEN')
qtest_project = read_tok('QTEST_PROJECT_ID')
if qtest_token:
    qtest_env = {'QTEST_BEARER_TOKEN': qtest_token}
    if qtest_project:
        qtest_env['QTEST_PROJECT_ID'] = qtest_project
    mcp['mcpServers']['qtest'] = {
        'command': 'node',
        'args': [p_qtest],
        'env': qtest_env
    }

compass_token = read_tok('COMPASS_TOKEN')
if compass_token:
    mcp['mcpServers']['compass'] = {
        'url': 'https://compass.wdprapps.disney.com/api/mcp/mcp-60d5792b-5ce9-469b-9a6b-b08216eb267e',
        'type': 'sse',
        'headers': {'Authorization': 'Bearer ' + compass_token}
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


    amazonq-sync)
        shift
        aq_sync_subcmd="${1:-full}"
        shift 2>/dev/null || true
        aq_sync_dir="${1:-.}"

        aq_sync_dir="${aq_sync_dir/#\~/$HOME}"
        if [ ! -d "$aq_sync_dir" ]; then
            echo "❌ Directory does not exist: $aq_sync_dir"
            exit 1
        fi

        case "$aq_sync_subcmd" in
            full|rules|mcp)
                ;;
            status)
                echo "📋 Amazon Q Sync Status"
                echo ""
                rules_dir="$aq_sync_dir/.amazonq/rules"
                if [ -d "$rules_dir" ]; then
                    count=$(find "$rules_dir" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
                    echo "  Rules:  $count files in $rules_dir"
                else
                    echo "  Rules:  ❌ Not configured ($rules_dir missing)"
                fi
                aq_mcp="$HOME/.aws/amazonq/mcp.json"
                if [ -f "$aq_mcp" ]; then
                    servers=$(node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log(Object.keys(d.mcpServers||{}).length)' "$aq_mcp" 2>/dev/null || echo "?")
                    echo "  MCP:    $servers servers in $aq_mcp"
                else
                    echo "  MCP:    ❌ Not configured ($aq_mcp missing)"
                fi
                kiro_mcp="$HOME/.kiro/settings/mcp.json"
                if [ -f "$kiro_mcp" ]; then
                    echo "  Source: ✓ $kiro_mcp"
                else
                    echo "  Source: ❌ Run ./setup.sh mcp-install first"
                fi
                exit 0
                ;;
            *)
                echo "Amazon Q Sync — mirror Kiro dev config to Amazon Q plugin"
                echo ""
                echo "Usage:"
                echo "  ./setup.sh amazonq-sync [full|rules|mcp|status] [project-dir]"
                echo ""
                echo "Commands:"
                echo "  full     Sync rules + MCP (default)"
                echo "  rules    Sync .amazonq/rules/ only"
                echo "  mcp      Sync ~/.aws/amazonq/mcp.json only"
                echo "  status   Show current sync state"
                echo ""
                echo "Examples:"
                echo "  ./setup.sh amazonq-sync                    # Full sync for current dir"
                echo "  ./setup.sh amazonq-sync full ~/myproject   # Full sync for project"
                echo "  ./setup.sh amazonq-sync mcp                # MCP only"
                echo "  ./setup.sh amazonq-sync status ~/myproject # Check status"
                exit 0
                ;;
        esac

        # --- Sync rules ---
        if [ "$aq_sync_subcmd" = "full" ] || [ "$aq_sync_subcmd" = "rules" ]; then
            rules_dir="$aq_sync_dir/.amazonq/rules"
            mkdir -p "$rules_dir"
            echo "📝 Syncing Amazon Q rules to $rules_dir"
            echo ""

            count=0
            # Prefer curated templates from steer-runtime
            if [ -d "$STEER_ROOT/.amazonq-templates" ]; then
                for md in "$STEER_ROOT"/.amazonq-templates/*.md; do
                    [ -f "$md" ] || continue
                    name=$(basename "$md")
                    [ "$name" = "README.md" ] && continue
                    cp "$md" "$rules_dir/"
                    echo "  ✓ $name"
                    count=$((count + 1))
                done
            fi

            # Also copy profile-specific context if installed
            kiro_ctx="$HOME/.kiro/context"
            if [ -d "$kiro_ctx" ]; then
                for ctx in "$kiro_ctx"/*.md; do
                    [ -f "$ctx" ] || continue
                    name=$(basename "$ctx")
                    # Skip files already covered by templates
                    if ! ls "$rules_dir"/*"$name"* >/dev/null 2>&1; then
                        cp "$ctx" "$rules_dir/60-ctx-$name"
                        echo "  ✓ 60-ctx-$name (context)"
                        count=$((count + 1))
                    fi
                done
            fi

            echo ""
            echo "✅ Synced $count rules"
        fi

        # --- Sync MCP ---
        if [ "$aq_sync_subcmd" = "full" ] || [ "$aq_sync_subcmd" = "mcp" ]; then
            kiro_mcp="$HOME/.kiro/settings/mcp.json"
            aq_mcp="$HOME/.aws/amazonq/mcp.json"

            if [ ! -f "$kiro_mcp" ]; then
                echo "❌ No Kiro MCP config found at $kiro_mcp"
                echo "   Run: ./setup.sh mcp-install"
                exit 1
            fi

            mkdir -p "$HOME/.aws/amazonq"

            # Merge: preserve user-added servers in existing amazonq mcp.json
            node -e '
                const fs = require("fs");
                const kiroPath = process.argv[1], aqPath = process.argv[2];
                const kiro = JSON.parse(fs.readFileSync(kiroPath, "utf8"));
                const existing = fs.existsSync(aqPath) ? JSON.parse(fs.readFileSync(aqPath, "utf8")) : {};
                const merged = Object.assign({}, existing.mcpServers || {}, kiro.mcpServers || {});
                fs.writeFileSync(aqPath, JSON.stringify({ mcpServers: merged }, null, 2) + "\n");
                const kiroCount = Object.keys(kiro.mcpServers || {}).length;
                const mergedCount = Object.keys(merged).length;
                console.log("  ✓ " + kiroCount + " Kiro servers synced to " + aqPath);
                if (mergedCount > kiroCount) console.log("  ✓ " + (mergedCount - kiroCount) + " existing user server(s) preserved");
            ' "$kiro_mcp" "$aq_mcp"

            echo ""
            echo "✅ MCP servers synced to Amazon Q"
        fi
        ;;

    workspace)
        shift
        ws_cmd="${1:-list}"
        shift 2>/dev/null || true
        ws_dir="$STEER_ROOT/workspaces"

        # Resolve workspace.json path (supports nested folders)
        find_ws_file() {
            local name=$1
            if [ -f "$ws_dir/$name/workspace.json" ]; then
                echo "$ws_dir/$name/workspace.json"
                return
            fi
            python3 -c "
import json,os,sys
for r,d,f in os.walk(sys.argv[1]):
 if 'workspace.json' in f:
  p=os.path.join(r,'workspace.json')
  with open(p) as fh:
   if json.load(fh).get('name')==sys.argv[2]: print(p);sys.exit()
" "$ws_dir" "$name"
        }

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
                    echo "  (none)"
                    exit 0
                fi
                python3 - "$ws_dir" << 'LIST_PY'
import json, os, sys
ws_dir = sys.argv[1]
workspaces = {}
for root, dirs, files in os.walk(ws_dir):
    if "workspace.json" in files:
        with open(os.path.join(root, "workspace.json")) as f:
            ws = json.load(f)
            workspaces[ws["name"]] = ws

children = {}
roots = []
for name, ws in workspaces.items():
    parent = ws.get("extends", "")
    if parent and parent in workspaces:
        children.setdefault(parent, []).append(name)
    else:
        roots.append(name)

def print_tree(name, prefix="", last=True):
    ws = workspaces[name]
    tree = prefix
    if prefix:
        tree += "└─ " if last else "├─ "
    else:
        tree = "  • "
    desc = ws.get("description", "")
    profiles = ", ".join(ws.get("profiles", []))
    print(f"{tree}{name}")
    if desc:
        pad = prefix + ("   " if last else "│  ") if prefix else "    "
        print(f"{pad}{desc}")
    if profiles:
        pad = prefix + ("   " if last else "│  ") if prefix else "    "
        print(f"{pad}Profiles: {profiles}")
    kids = children.get(name, [])
    child_prefix = prefix + ("   " if last else "│  ") if prefix else "    "
    for i, kid in enumerate(kids):
        print_tree(kid, child_prefix, i == len(kids) - 1)

for name in roots:
    print_tree(name)
    print()
LIST_PY
                ;;

            show)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace show <name>"; exit 1; fi
                ws_file=$(find_ws_file "$ws_name")
                if [ -z "$ws_file" ] || [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

                python3 -c "
import json
ws = json.load(open('$ws_file'))
print(f\"╔{'═'*58}╗\")
print(f\"║  Team Workspace: {ws['name']:<39} ║\")
print(f\"╚{'═'*58}╝\")
print()
if ws.get('extends'):     print(f\"  Extends:      {ws['extends']}\")
if ws.get('description'): print(f\"  Description:  {ws['description']}\")
if ws.get('team'):        print(f\"  Team:         {ws['team']}\")
if ws.get('jira_prefix'):
    jp = ws['jira_prefix']
    print(f\"  Jira Prefix:  {', '.join(jp) if isinstance(jp, list) else jp}\")
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
                ws_file=$(find_ws_file "$ws_name")
                if [ -z "$ws_file" ] || [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

                echo "🚀 Applying workspace: $ws_name"
                echo ""

                # Parse workspace config
                profiles=$(python3 -c "import json; print(' '.join(json.load(open('$ws_file')).get('profiles',[])))")
                rules=$(python3 -c "import json; print(' '.join(json.load(open('$ws_file')).get('rules',[])))")
                enable_tools=$(python3 -c "import json; print('yes' if json.load(open('$ws_file')).get('enable_tools') else 'no')")
                default_agent=$(python3 -c "import json; print(json.load(open('$ws_file')).get('default_agent',''))")

                # 1. Install profiles (workspace-local profiles take precedence)
                ws_path="$(dirname "$ws_file")"
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

                # 3. Copy workspace-specific rules from chain
                for chain_ws in $ws_chain; do
                    chain_file=$(find_ws_file "$chain_ws")
                    chain_path="$(dirname "${chain_file:-$ws_dir/$chain_ws/workspace.json}")"
                    if [ -d "$chain_path/rules" ] && [ -n "$(ls "$chain_path/rules"/*.md 2>/dev/null)" ]; then
                        echo "📏 Installing rules from $chain_ws..."
                        mkdir -p "$KIRO_ROOT/rules"
                        for r in "$chain_path/rules"/*.md; do
                            cp "$r" "$KIRO_ROOT/rules/"
                            echo "  ✓ $(basename "$r")"
                        done
                    fi
                done
                echo ""

                # 4. Copy context from all workspaces in chain (root first)
                for chain_ws in $ws_chain; do
                    chain_file=$(find_ws_file "$chain_ws")
                    chain_path="$(dirname "${chain_file:-$ws_dir/$chain_ws/workspace.json}")"
                    if [ -d "$chain_path/context" ] && [ -n "$(ls "$chain_path/context"/*.md 2>/dev/null)" ]; then
                        echo "📄 Installing context from $chain_ws..."
                        mkdir -p "$KIRO_ROOT/context"
                        for c in "$chain_path/context"/*.md; do
                            cp "$c" "$KIRO_ROOT/context/"
                            echo "  ✓ $(basename "$c")"
                        done
                    fi
                done
                echo ""

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
                echo "❌ Workspace creation is managed through the Koda TUI."
                echo "   Run: koda → Workspaces → n=new or x=extend"
                exit 1
                ;;


            sync)
                ws_name="$1"
                if [ -z "$ws_name" ]; then echo "❌ Usage: ./setup.sh workspace sync <name> [--push]"; exit 1; fi
                ws_file=$(find_ws_file "$ws_name")
                if [ -z "$ws_file" ] || [ ! -f "$ws_file" ]; then echo "❌ Workspace not found: $ws_name"; exit 1; fi

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
