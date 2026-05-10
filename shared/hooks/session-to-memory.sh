#!/bin/bash
# agentComplete hook: summarize session into active-context.md
# Only triggers if session >60s AND >5 tool calls
# Stdin: {"agent","sessionId","duration_ms","tool_calls","context_usage_pct"}

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
ACTIVE_CTX="$KIRO_DIR/memory-bank/active-context.md"

META=$(cat)
[ -z "$META" ] && exit 0

# Check thresholds
python3 -c "
import json, sys, os
from datetime import datetime, timedelta

d = json.load(sys.stdin)
if d.get('duration_ms', 0) < 60000: sys.exit(0)
if d.get('tool_calls', 0) < 5: sys.exit(0)

ctx_file = '$ACTIVE_CTX'
if not os.path.isfile(ctx_file): sys.exit(0)

agent = d.get('agent', 'unknown')
duration = d.get('duration_ms', 0) // 1000
tools = d.get('tool_calls', 0)
ctx_pct = d.get('context_usage_pct', 0)
date = datetime.now().strftime('%Y-%m-%d %H:%M')

entry = f'\n- {date} — {agent}: {duration}s, {tools} tools, {ctx_pct:.0%} context\n'

# Append
with open(ctx_file, 'a') as f:
    f.write(entry)

# Trim entries older than 7 days
cutoff = datetime.now() - timedelta(days=7)
import re
lines = open(ctx_file).readlines()
kept = []
for line in lines:
    m = re.match(r'^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) —', line)
    if m:
        try:
            ts = datetime.strptime(m.group(1), '%Y-%m-%d %H:%M')
            if ts < cutoff: continue
        except: pass
    kept.append(line)
open(ctx_file, 'w').writelines(kept)
" <<< "$META" 2>/dev/null
