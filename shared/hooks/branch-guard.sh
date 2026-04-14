#!/bin/bash
# preToolUse hook: block direct commits/pushes to main/master
INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

BRANCH=$(git branch --show-current 2>/dev/null)
case "$BRANCH" in
  main|master)
    case "$CMD" in
      *git\ commit*|*git\ push*|*git\ merge*)
        echo "Blocked: direct $CMD on '$BRANCH' — use a feature branch" >&2
        exit 2
        ;;
    esac
    ;;
esac
exit 0
