#!/usr/bin/env bash
# context-inject.sh — agentSpawn hook
# Scans on-demand context files and injects those matching the current task.
# Reads task description from KIRO_PROMPT or first argument.

set -euo pipefail

KIRO_ROOT="${KIRO_HOME:-$HOME/.kiro}"
CONTEXT_DIR="$KIRO_ROOT/context"
TASK="${KIRO_PROMPT:-${1:-}}"

# If no task description available, skip
if [ -z "$TASK" ]; then
  exit 0
fi

# Convert task to lowercase for matching
TASK_LOWER=$(echo "$TASK" | tr '[:upper:]' '[:lower:]')

INJECTED=""

# Scan all context files for on-demand inclusion
for file in "$CONTEXT_DIR"/*.md; do
  [ -f "$file" ] || continue

  # Read frontmatter (between --- markers)
  INCLUSION=$(sed -n '/^---$/,/^---$/p' "$file" | grep "^inclusion:" | head -1 | sed 's/inclusion: *//')
  TRIGGER=$(sed -n '/^---$/,/^---$/p' "$file" | grep "^trigger:" | head -1 | sed 's/trigger: *"//' | sed 's/"$//')

  # Only process on-demand files
  if [ "$INCLUSION" != "on-demand" ]; then
    continue
  fi

  # Skip if no trigger defined
  if [ -z "$TRIGGER" ]; then
    continue
  fi

  # Check if task matches any trigger keyword (regex pattern)
  if echo "$TASK_LOWER" | grep -qiE "$TRIGGER"; then
    BASENAME=$(basename "$file")
    INJECTED="${INJECTED:+$INJECTED, }$BASENAME"
    # Output the file content as injected context
    echo "<!-- on-demand: $BASENAME (matched trigger) -->"
    cat "$file"
    echo ""
  fi
done

# Report what was injected
if [ -n "$INJECTED" ]; then
  echo "📎 On-demand context loaded: $INJECTED" >&2
fi

exit 0
