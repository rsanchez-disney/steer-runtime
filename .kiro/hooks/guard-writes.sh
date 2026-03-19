#!/bin/bash
# preToolUse hook: block writes to sensitive paths
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

# Block writes to node_modules, dist, .git
case "$FILE" in
  */node_modules/*|*/dist/*|*/.git/*)
    echo "Blocked: writing to $FILE is not allowed" >&2
    exit 2
    ;;
esac
exit 0
