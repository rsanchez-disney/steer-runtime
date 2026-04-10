#!/bin/bash
# postToolUse hook: check that references in agent JSON still resolve
# Runs after writing any file under profiles/

FILE="$KIRO_FILE_PATH"
[ -z "$FILE" ] && exit 0

# Only check files under profiles/
case "$FILE" in
  */profiles/*) ;;
  *) exit 0 ;;
esac

# Find the profile root (profiles/{name}/)
PROFILE_DIR=$(echo "$FILE" | sed 's|\(profiles/[^/]*/\).*|\1|')
[ -d "$PROFILE_DIR" ] || exit 0

echo "## Cross-Reference Check"
echo ""

BROKEN=0
for agent_json in "$PROFILE_DIR"agents/*.json; do
  [ -f "$agent_json" ] || continue
  AGENT=$(basename "$agent_json" .json)

  # Check prompt reference
  PROMPT=$(grep -o '"prompt"[[:space:]]*:[[:space:]]*"[^"]*"' "$agent_json" | head -1 | sed 's/.*: *"//;s/"//')
  if [ -n "$PROMPT" ] && [ ! -f "$PROFILE_DIR$PROMPT" ]; then
    echo "\u2717 $AGENT: prompt \"$PROMPT\" not found"
    BROKEN=$((BROKEN + 1))
  fi

  # Check resource references (process substitution to avoid subshell)
  while read -r res; do
    if [ -n "$res" ] && [ ! -f "$PROFILE_DIR$res" ]; then
      echo "\u2717 $AGENT: resource \"$res\" not found"
      BROKEN=$((BROKEN + 1))
    fi
  done < <(grep -o '"context/[^"]*"' "$agent_json" 2>/dev/null | tr -d '"')
done

if [ "$BROKEN" -eq 0 ]; then
  echo "\u2713 All references resolve"
fi
