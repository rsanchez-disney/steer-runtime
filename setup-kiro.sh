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
echo ""
echo "Usage:"
echo "  cd ~/my-project"
echo "  kiro-cli chat --agent orchestrator_agent"
echo ""
if [ "$SYNC_MODE" = false ]; then
    echo "💡 Tip: Use './setup-kiro.sh --sync' to update existing files"
    echo ""
fi
