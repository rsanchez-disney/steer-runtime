#!/bin/bash
# preToolUse hook: scan file content for potential secrets before writing
INPUT=$(cat)
CONTENT=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('content',''))" 2>/dev/null)

if echo "$CONTENT" | grep -qiE '(password|secret|api_key|apikey|token|private_key)\s*[:=]\s*["\x27][^"\x27]{8,}'; then
  echo "Blocked: potential secret detected in file content — use environment variables" >&2
  exit 2
fi
exit 0
