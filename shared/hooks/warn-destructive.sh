#!/bin/bash
# postToolUse hook: log destructive bash commands
INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

case "$CMD" in
  *rm\ -rf*|*DROP\ TABLE*|*DELETE\ FROM*|*force\ push*|*--force*)
    echo "⚠️  Destructive command detected: $CMD"
    ;;
esac
exit 0
