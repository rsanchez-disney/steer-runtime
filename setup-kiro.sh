#!/bin/bash
# Setup steer-runtime agents in Kiro
# Copies agents and prompts without replacing existing Kiro content
# Use --sync to update existing files

set -e

STEER_ROOT="$HOME/steer-runtime"
KIRO_ROOT="$HOME/.kiro"
SYNC_MODE=false

# Check for --sync flag
if [ "$1" = "--sync" ]; then
    SYNC_MODE=true
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           Setup steer-runtime Agents in Kiro                ║"
if [ "$SYNC_MODE" = true ]; then
echo "║                    (SYNC MODE)                               ║"
fi
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# Dependency Validation
# ============================================================================

echo "🔍 Checking dependencies..."
echo ""

MISSING_DEPS=()

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "✗ Node.js: Not found"
    MISSING_DEPS+=("node")
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "✗ npm: Not found"
    MISSING_DEPS+=("npm")
fi

# Check kiro-cli
if command -v kiro-cli &> /dev/null; then
    KIRO_VERSION=$(kiro-cli --version 2>/dev/null || echo "unknown")
    echo "✓ kiro-cli: $KIRO_VERSION"
else
    echo "✗ kiro-cli: Not found"
    MISSING_DEPS+=("kiro-cli")
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo "✓ git: $GIT_VERSION"
else
    echo "✗ git: Not found"
    MISSING_DEPS+=("git")
fi

echo ""

# ============================================================================
# Install Missing Dependencies
# ============================================================================

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo "⚠️  Missing dependencies: ${MISSING_DEPS[*]}"
    echo ""
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
    else
        OS="Unknown"
    fi
    
    echo "📋 Installation instructions for $OS:"
    echo ""
    
    for dep in "${MISSING_DEPS[@]}"; do
        case $dep in
            node|npm)
                if [[ "$OS" == "macOS" ]]; then
                    echo "Node.js & npm:"
                    echo "  brew install node"
                    echo "  OR download from: https://nodejs.org/"
                elif [[ "$OS" == "Linux" ]]; then
                    echo "Node.js & npm:"
                    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
                    echo "  sudo apt-get install -y nodejs"
                fi
                ;;
            kiro-cli)
                echo "kiro-cli:"
                echo "  npm install -g @kiro/cli"
                echo "  OR follow: https://kiro.dev/docs/installation"
                ;;
            git)
                if [[ "$OS" == "macOS" ]]; then
                    echo "git:"
                    echo "  brew install git"
                    echo "  OR install Xcode Command Line Tools"
                elif [[ "$OS" == "Linux" ]]; then
                    echo "git:"
                    echo "  sudo apt-get install git"
                fi
                ;;
        esac
        echo ""
    done
    
    # Offer to install if possible
    if [[ "$OS" == "macOS" ]] && command -v brew &> /dev/null; then
        read -p "Attempt to install missing dependencies with Homebrew? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for dep in "${MISSING_DEPS[@]}"; do
                case $dep in
                    node|npm)
                        echo "Installing Node.js..."
                        brew install node
                        ;;
                    git)
                        echo "Installing git..."
                        brew install git
                        ;;
                    kiro-cli)
                        echo "Installing kiro-cli..."
                        npm install -g @kiro/cli
                        ;;
                esac
            done
            echo ""
            echo "✅ Dependencies installed. Please restart your terminal and run this script again."
            exit 0
        fi
    fi
    
    echo "Please install missing dependencies and run this script again."
    exit 1
fi

echo "✅ All dependencies satisfied"
echo ""

# ============================================================================
# Agent Installation
# ============================================================================

# Check if steer-runtime exists
if [ ! -d "$STEER_ROOT/.kiro" ]; then
    echo "❌ Error: $STEER_ROOT/.kiro not found"
    echo "   Please ensure steer-runtime is cloned to ~/steer-runtime"
    exit 1
fi

# Create Kiro directories if they don't exist
echo "📁 Creating Kiro directories..."
mkdir -p "$KIRO_ROOT/agents"
mkdir -p "$KIRO_ROOT/prompts"
mkdir -p "$KIRO_ROOT/context"

# Copy agents
echo ""
echo "📦 Copying agents..."
for agent in "$STEER_ROOT/.kiro/agents"/*.json; do
    agent_name=$(basename "$agent")
    if [ -f "$KIRO_ROOT/agents/$agent_name" ] && [ "$SYNC_MODE" = false ]; then
        echo "  ⊙ $agent_name (already exists, skipping)"
    else
        cp "$agent" "$KIRO_ROOT/agents/"
        if [ "$SYNC_MODE" = true ]; then
            echo "  ↻ $agent_name (updated)"
        else
            echo "  ✓ $agent_name"
        fi
    fi
done

# Copy prompts
echo ""
echo "📝 Copying prompts..."
for prompt in "$STEER_ROOT/.kiro/prompts"/*.md; do
    prompt_name=$(basename "$prompt")
    if [ -f "$KIRO_ROOT/prompts/$prompt_name" ] && [ "$SYNC_MODE" = false ]; then
        echo "  ⊙ $prompt_name (already exists, skipping)"
    else
        cp "$prompt" "$KIRO_ROOT/prompts/"
        if [ "$SYNC_MODE" = true ]; then
            echo "  ↻ $prompt_name (updated)"
        else
            echo "  ✓ $prompt_name"
        fi
    fi
done

# Copy context
echo ""
echo "📚 Copying context..."
for context in "$STEER_ROOT/.kiro/context"/*.md; do
    context_name=$(basename "$context")
    if [ -f "$KIRO_ROOT/context/$context_name" ] && [ "$SYNC_MODE" = false ]; then
        echo "  ⊙ $context_name (already exists, skipping)"
    else
        cp "$context" "$KIRO_ROOT/context/"
        if [ "$SYNC_MODE" = true ]; then
            echo "  ↻ $context_name (updated)"
        else
            echo "  ✓ $context_name"
        fi
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
if [ "$SYNC_MODE" = true ]; then
    echo "✅ Sync complete!"
else
    echo "✅ Setup complete!"
fi
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Available agents:"
echo "  • orchestrator_agent"
echo "  • story_analyzer_agent"
echo "  • codebase_explorer_agent"
echo "  • discussion_agent"
echo "  • planner_agent"
echo "  • backend_agent"
echo "  • ui_agent"
echo "  • webapi_agent"
echo "  • test_runner_agent"
echo "  • pr_creator_agent"
echo "  • code_review_agent"
echo "  • security_scanner_agent"
echo "  • performance_agent"
echo "  • compliance_agent"
echo "  • architecture_agent"
echo ""
echo "Usage:"
echo "  cd ~/my-project"
echo "  kiro-cli chat --agent orchestrator_agent"
echo ""
if [ "$SYNC_MODE" = false ]; then
    echo "💡 Tip: Use './setup-kiro.sh --sync' to update existing files"
    echo ""
fi

echo "⚙️  MCP Server Configuration"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "steer-runtime requires 2 MCP servers:"
echo "  • Jira MCP (for story_analyzer_agent)"
echo "  • GitHub MCP (for pr_creator_agent)"
echo ""
echo "To configure for CLI:"
echo "  ./setup-mcp-cli.sh"
echo ""
echo "See MCP_SETUP.md for detailed instructions"
echo ""
