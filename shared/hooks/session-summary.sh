#!/bin/bash
# agentComplete hook: append session telemetry to JSONL log
# Stdin: {"agent","sessionId","duration_ms","tool_calls","context_usage_pct"}

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
LOG_DIR="$KIRO_DIR/logs"
LOG_FILE="$LOG_DIR/session-history.jsonl"
MAX_SIZE=1048576  # 1MB

mkdir -p "$LOG_DIR"

# Read session metadata from stdin
META=$(cat)
[ -z "$META" ] && exit 0

# Add timestamp
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ENTRY=$(echo "$META" | python3 -c "
import json, sys
d = json.load(sys.stdin)
d['ts'] = '$TS'
print(json.dumps(d, separators=(',', ':')))" 2>/dev/null)

[ -z "$ENTRY" ] && exit 0

# Rotate if over max size
if [ -f "$LOG_FILE" ] && [ "$(wc -c < "$LOG_FILE")" -gt "$MAX_SIZE" ]; then
  mv "$LOG_FILE" "$LOG_FILE.old"
fi

echo "$ENTRY" >> "$LOG_FILE"
