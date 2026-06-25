#!/bin/bash
# knowledge-pull.sh — Pull materialized team knowledge + memory-bank into local context
# Usage: koda knowledge pull (or runs automatically on koda sync)
# Fetches team_knowledge.md + team_learned.md + shared memory-bank files

set -euo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
STEER_DIR="${STEER_HOME:-$KIRO_DIR/steer-runtime}"
KNOWLEDGE_BRANCH="knowledge"
WORKSPACE=$(cat "$KIRO_DIR/active-workspace" 2>/dev/null || echo "")

if [ -z "$WORKSPACE" ]; then
  exit 0
fi

REMOTE_URL=$(git -C "$STEER_DIR" remote get-url origin 2>/dev/null || git -C "$STEER_DIR" remote get-url upstream 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  exit 0
fi

CONTEXT_DIR="$KIRO_DIR/context"
STEERING_DIR="$KIRO_DIR/steering"
MEMORY_BANK_DIR="$KIRO_DIR/memory-bank"
mkdir -p "$CONTEXT_DIR" "$STEERING_DIR" "$MEMORY_BANK_DIR"

# Fetch knowledge branch (shallow)
WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

if ! git clone --depth 1 --branch "$KNOWLEDGE_BRANCH" "$REMOTE_URL" "$WORK_DIR" 2>/dev/null; then
  # No knowledge branch yet
  exit 0
fi

WS_DIR="$WORK_DIR/$WORKSPACE"
if [ ! -d "$WS_DIR" ]; then
  # No knowledge for this workspace yet
  exit 0
fi

PULLED=0

# Pull team_knowledge.md → context/
if [ -f "$WS_DIR/team_knowledge.md" ]; then
  cp "$WS_DIR/team_knowledge.md" "$CONTEXT_DIR/team_knowledge.md"
  OBS_COUNT=$(grep -c "^-" "$CONTEXT_DIR/team_knowledge.md" 2>/dev/null || echo "0")
  echo "  📥 Team knowledge: $OBS_COUNT observations"
  PULLED=$((PULLED + 1))
fi

# Pull team_learned.md → steering/
if [ -f "$WS_DIR/team_learned.md" ]; then
  cp "$WS_DIR/team_learned.md" "$STEERING_DIR/99-team-learned.md"
  CONV_COUNT=$(grep -c "^-" "$STEERING_DIR/99-team-learned.md" 2>/dev/null || echo "0")
  echo "  📥 Team conventions: $CONV_COUNT items"
  PULLED=$((PULLED + 1))
fi

# Pull shared memory-bank files → memory-bank/team/
TEAM_BANK_DIR="$MEMORY_BANK_DIR/team"
BANKS_DIR="$WS_DIR/memory-banks"
if [ -d "$BANKS_DIR" ]; then
  mkdir -p "$TEAM_BANK_DIR"
  # Merge all member bank files (latest wins by filename)
  BANK_COUNT=0
  for member_dir in "$BANKS_DIR"/*/; do
    [ ! -d "$member_dir" ] && continue
    for bank_file in "$member_dir"*.md; do
      [ ! -f "$bank_file" ] && continue
      BASENAME=$(basename "$bank_file")
      # Copy (overwrite with latest — materialization handles dedup)
      cp "$bank_file" "$TEAM_BANK_DIR/$BASENAME"
      BANK_COUNT=$((BANK_COUNT + 1))
    done
  done
  if [ $BANK_COUNT -gt 0 ]; then
    echo "  📥 Memory bank: $BANK_COUNT shared files"
    PULLED=$((PULLED + BANK_COUNT))
  fi
fi

if [ $PULLED -eq 0 ]; then
  echo "  ℹ️  No team knowledge available yet for $WORKSPACE"
fi
