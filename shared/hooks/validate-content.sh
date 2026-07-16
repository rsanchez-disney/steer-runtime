#!/usr/bin/env bash
# validate-content.sh — preToolUse hook for fs_write/fs_create
# Validates markdown, JSON, YAML content before writing to disk.
# Returns exit 0 (allow) or exit 1 (reject with error message).

set -euo pipefail

# The file path being written (passed as arg or via KIRO_TOOL_INPUT)
FILE_PATH="${1:-${KIRO_FILE_PATH:-}}"
CONTENT="${KIRO_TOOL_CONTENT:-}"

# If no file path, allow (can't validate without knowing the target)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Extract extension
EXT="${FILE_PATH##*.}"
ERRORS=""

# --- JSON validation ---
if [ "$EXT" = "json" ]; then
  if [ -n "$CONTENT" ]; then
    if ! echo "$CONTENT" | python3 -c "import json,sys; json.load(sys.stdin)" 2>/dev/null; then
      ERRORS="JSON parse error: invalid JSON syntax"
    fi
  fi
fi

# --- YAML validation ---
if [ "$EXT" = "yaml" ] || [ "$EXT" = "yml" ]; then
  if [ -n "$CONTENT" ]; then
    if ! echo "$CONTENT" | python3 -c "import yaml,sys; yaml.safe_load(sys.stdin)" 2>/dev/null; then
      ERRORS="YAML parse error: invalid YAML syntax"
    fi
  fi
fi

# --- Markdown validation ---
if [ "$EXT" = "md" ]; then
  if [ -n "$CONTENT" ]; then
    # Check for unclosed code blocks (odd number of ```)
    FENCE_COUNT=$(echo "$CONTENT" | grep -c '^\s*```' || true)
    if [ $((FENCE_COUNT % 2)) -ne 0 ]; then
      ERRORS="${ERRORS:+$ERRORS\n}Markdown error: unclosed code block (odd number of \`\`\` fences)"
    fi

    # Check for Mermaid blocks with common syntax errors
    if echo "$CONTENT" | grep -q '```mermaid'; then
      # Check for unclosed brackets in mermaid
      MERMAID_CONTENT=$(echo "$CONTENT" | sed -n '/```mermaid/,/```/p')
      OPEN_BRACKETS=$(echo "$MERMAID_CONTENT" | tr -cd '[{(' | wc -c | tr -d ' ')
      CLOSE_BRACKETS=$(echo "$MERMAID_CONTENT" | tr -cd ']})' | wc -c | tr -d ' ')
      if [ "$OPEN_BRACKETS" -ne "$CLOSE_BRACKETS" ]; then
        ERRORS="${ERRORS:+$ERRORS\n}Mermaid warning: mismatched brackets in diagram ($OPEN_BRACKETS open, $CLOSE_BRACKETS close)"
      fi
    fi
  fi
fi

# --- Universal checks (all file types) ---
if [ -n "$CONTENT" ]; then
  # Check for trailing whitespace (auto-fixable, just warn)
  if echo "$CONTENT" | grep -q ' $'; then
    # This is a warning, not a block — let the agent know
    echo "⚠ Trailing whitespace detected (will be cleaned)" >&2
  fi

  # Check file ends with newline
  if [ -n "$CONTENT" ] && [ "${CONTENT: -1}" != $'\n' ]; then
    echo "⚠ File does not end with newline (will be added)" >&2
  fi
fi

# --- Report errors ---
if [ -n "$ERRORS" ]; then
  echo "❌ Content validation failed for $FILE_PATH:" >&2
  echo -e "$ERRORS" >&2
  exit 1
fi

exit 0
