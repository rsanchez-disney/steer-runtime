#!/bin/bash
# share-agent.sh — Share a workspace agent to common/agents/contributed/
# Usage: ./scripts/share-agent.sh <workspace-name> <agent-name>
# This validates the agent, copies it, and creates a PR-ready contribution.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WORKSPACES_DIR="$ROOT_DIR/workspaces"
CONTRIB_DIR="$ROOT_DIR/common/agents/contributed"

usage() {
  echo "Usage: $0 <workspace-name> <agent-name>"
  echo ""
  echo "Shares an agent from a workspace to common/agents/contributed/"
  echo "for org-wide availability after review."
  echo ""
  echo "Example: $0 dps-team demo_generator_agent"
  exit 1
}

[ $# -lt 2 ] && usage

WORKSPACE="$1"
AGENT_NAME="$2"

# Find workspace directory
WS_DIR=""
for candidate in "$WORKSPACES_DIR/$WORKSPACE" "$WORKSPACES_DIR"/*/"$WORKSPACE"; do
  if [ -f "$candidate/workspace.json" ]; then
    WS_DIR="$candidate"
    break
  fi
done

if [ -z "$WS_DIR" ]; then
  echo "❌ Workspace '$WORKSPACE' not found in $WORKSPACES_DIR/"
  exit 1
fi

echo "📂 Found workspace: $WS_DIR"

# Find agent JSON in workspace profiles
AGENT_FILE=""
for f in "$WS_DIR"/profiles/*/agents/"${AGENT_NAME}.json" "$WS_DIR"/agents/"${AGENT_NAME}.json"; do
  if [ -f "$f" ]; then
    AGENT_FILE="$f"
    break
  fi
done

if [ -z "$AGENT_FILE" ]; then
  echo "❌ Agent '$AGENT_NAME' not found in workspace '$WORKSPACE'"
  echo "   Searched: $WS_DIR/profiles/*/agents/ and $WS_DIR/agents/"
  exit 1
fi

echo "📄 Found agent: $AGENT_FILE"

# Validate agent JSON
PROMPT_REF=$(python3 -c "
import json
with open('$AGENT_FILE') as f:
    d = json.load(f)
print(d.get('prompt', ''))
" 2>/dev/null)

if [ -z "$PROMPT_REF" ]; then
  echo "⚠️  Agent has no prompt field — sharing anyway"
  PROMPT_FILE=""
else
  # Find the prompt file (handles both "file.md" and "prompts/file.md")
  AGENT_DIR="$(dirname "$AGENT_FILE")"
  PROFILE_DIR="$(dirname "$AGENT_DIR")"
  PROMPT_FILE="$PROFILE_DIR/$PROMPT_REF"
  if [ ! -f "$PROMPT_FILE" ]; then
    # Try under prompts/ subdir
    PROMPT_FILE="$PROFILE_DIR/prompts/$PROMPT_REF"
  fi
  if [ ! -f "$PROMPT_FILE" ]; then
    echo "❌ Prompt file not found: $PROMPT_FILE"
    exit 1
  fi
  echo "📝 Found prompt: $PROMPT_FILE"
fi

# Run validation
echo ""
echo "🔍 Validating agent..."
python3 -c "
import json, sys
with open('$AGENT_FILE') as f:
    d = json.load(f)
issues = []
if not d.get('name'): issues.append('missing name')
if not d.get('description'): issues.append('missing description')
if not d.get('tools') and d.get('tools') != []: issues.append('missing tools')
if issues:
    print(f'❌ Validation failed: {issues}')
    sys.exit(1)
print(f'  ✅ name: {d[\"name\"]}')
print(f'  ✅ description: {d[\"description\"][:60]}...')
print(f'  ✅ tools: {len(d.get(\"tools\",[]))} tools')
"

if [ $? -ne 0 ]; then
  exit 1
fi

# Copy to contributed
echo ""
echo "📦 Copying to $CONTRIB_DIR/"
mkdir -p "$CONTRIB_DIR"
cp "$AGENT_FILE" "$CONTRIB_DIR/${AGENT_NAME}.json"
echo "  ✅ Copied agent JSON"

if [ -n "$PROMPT_FILE" ] && [ -f "$PROMPT_FILE" ]; then
  PROMPT_BASENAME="$(basename "$PROMPT_FILE")"
  cp "$PROMPT_FILE" "$CONTRIB_DIR/${PROMPT_BASENAME}"
  echo "  ✅ Copied prompt: $PROMPT_BASENAME"
fi

# Create contribution metadata
python3 -c "
import json, os
from datetime import datetime
meta = {
    'agent': '$AGENT_NAME',
    'source_workspace': '$WORKSPACE',
    'contributed_at': datetime.now().isoformat(),
    'status': 'pending_review',
    'suggested_profile': 'TBD'
}
with open('$CONTRIB_DIR/${AGENT_NAME}.meta.json', 'w') as f:
    json.dump(meta, f, indent=2)
"
echo "  ✅ Created metadata"

echo ""
echo "✅ Agent '$AGENT_NAME' shared from '$WORKSPACE' → common/agents/contributed/"
echo ""
echo "Next steps:"
echo "  1. Review the agent in common/agents/contributed/"
echo "  2. Create a PR: git add common/agents/contributed/ && git commit -m 'feat: contribute $AGENT_NAME from $WORKSPACE'"
echo "  3. Maintainer assigns to a profile and merges"
