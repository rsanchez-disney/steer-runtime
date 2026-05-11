#!/bin/bash
# agentComplete/agentFailed hook: emit structured telemetry
# Stdin: {"agent","sessionId","duration_ms","tool_calls","context_usage_pct"} or {"agent","sessionId","error","duration_ms","last_tool"}

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
LOG_DIR="$KIRO_DIR/logs"
LOG_FILE="$LOG_DIR/telemetry.jsonl"
MAX_SIZE=5242880  # 5MB

mkdir -p "$LOG_DIR"

META=$(cat)
[ -z "$META" ] && exit 0

TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ENTRY=$(echo "$META" | python3 -c "
import json, sys
d = json.load(sys.stdin)
d['ts'] = '$TS'
d.setdefault('event', 'complete' if 'error' not in d else 'failed')
print(json.dumps(d, separators=(',', ':')))" 2>/dev/null)

[ -z "$ENTRY" ] && exit 0

# Rotate at 5MB
if [ -f "$LOG_FILE" ] && [ "$(wc -c < "$LOG_FILE")" -gt "$MAX_SIZE" ]; then
  mv "$LOG_FILE" "$LOG_FILE.old"
fi

echo "$ENTRY" >> "$LOG_FILE"
