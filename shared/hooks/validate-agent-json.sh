#!/bin/bash
# preToolUse hook: validate agent JSON structure before writing
# Checks required fields when writing to agents/*.json

FILE="$KIRO_FILE_PATH"
[ -z "$FILE" ] && exit 0

# Only validate agent JSON files
case "$FILE" in
  */agents/*.json) ;;
  *) exit 0 ;;
esac

echo "## Agent JSON Validation"
echo ""

# Read the file being written (from stdin or the file itself)
if [ -f "$FILE" ]; then
  CONTENT=$(cat "$FILE")
else
  exit 0
fi

MISSING=""
for field in name description prompt tools resources; do
  if ! echo "$CONTENT" | grep -q "\"$field\""; then
    MISSING="$MISSING $field"
  fi
done

if [ -n "$MISSING" ]; then
  echo "\u26a0\ufe0f Missing required fields:$MISSING"
  echo "Required: name, description, prompt, tools, resources"
else
  echo "\u2713 All required fields present"
fi

# Check name matches filename
BASENAME=$(basename "$FILE" .json)
NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$FILE" | head -1 | sed 's/.*: *"//;s/"//')
if [ -n "$NAME" ] && [ "$NAME" != "$BASENAME" ]; then
  echo "\u26a0\ufe0f name field \"$NAME\" does not match filename \"$BASENAME\""
fi
