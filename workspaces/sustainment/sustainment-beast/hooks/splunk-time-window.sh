#!/bin/bash
# Hook: splunk-time-window (preToolUse)
# Purpose: Enforce initial Splunk query time window to ±30min and maxresults=200
# Applies to: Any tool matching @compass/splunk* or @dlp-beast-mcp/*
#
# This hook validates that Splunk queries don't request excessively large time ranges
# on the first query. It ensures efficient resource usage and faster response times.
#
# Rules:
# 1. Initial queries should use earliest=-30m latest=+30m (relative to alert/event time)
# 2. If no time specified, default to last 30 minutes
# 3. maxresults should not exceed 200 on first pass
# 4. User can explicitly override by requesting a wider window
#
# Output: JSON with "allowed": true/false and optional "message" for warnings

TOOL_INPUT="$1"

# Check if this is a Splunk query tool call
if echo "$TOOL_INPUT" | grep -qi "splunk"; then
  # Check for dangerously wide time ranges (>2h without explicit user request)
  if echo "$TOOL_INPUT" | grep -qiE "earliest=-(([3-9][0-9]{2,}|[2-9][0-9])m|[2-9]h|[0-9]+d)"; then
    echo '{"allowed": true, "message": "⚠️ Wide time range detected. Consider starting with ±30min for faster results."}'
    exit 0
  fi
  
  # Check for missing maxresults
  if echo "$TOOL_INPUT" | grep -qi "splunk" && ! echo "$TOOL_INPUT" | grep -qi "maxresults"; then
    echo '{"allowed": true, "message": "📌 Remember: add maxresults=200 for initial queries to avoid timeouts."}'
    exit 0
  fi
fi

# Default: allow
echo '{"allowed": true}'
