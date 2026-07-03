#!/bin/bash
# Hook: splunk-index-check (preToolUse)
# Purpose: Block index=* queries and validate index selection against known DLP indexes
# Applies to: Any tool matching @compass/splunk* or @dlp-beast-mcp/*
#
# Rules:
# 1. NEVER allow index=* (wildcard) - always require specific index
# 2. Warn if index is not in the known DLP index catalog
# 3. Primary indexes: wdpr_dlp_digital, wdpr_dlp_cme, wdpr_egalaxy_dlp
# 4. Secondary indexes: dlp_notification_service, dlp_mpg, dlp_inpark
#
# Output: JSON with "allowed": true/false and optional "message"

TOOL_INPUT="$1"

# Known valid indexes
VALID_INDEXES="wdpr_dlp_digital|wdpr_dlp_cme|wdpr_egalaxy_dlp|dlp_notification_service|dlp_mpg|dlp_inpark|wdpr_dlp_mobileorder|dlp_digital_perf"

# Block index=*
if echo "$TOOL_INPUT" | grep -qiE 'index\s*=\s*\*'; then
  echo '{"allowed": false, "message": "❌ Blocked: index=* is not allowed. Use a specific index (e.g., wdpr_dlp_digital, wdpr_dlp_cme). Check splunk-reference.md for the full index catalog."}'
  exit 0
fi

# Warn if index not in known catalog
if echo "$TOOL_INPUT" | grep -qiE 'index\s*=' ; then
  INDEX_USED=$(echo "$TOOL_INPUT" | grep -oiE 'index\s*=\s*[a-z_]+' | head -1 | sed 's/index\s*=\s*//')
  if [ -n "$INDEX_USED" ] && ! echo "$INDEX_USED" | grep -qiE "^($VALID_INDEXES)$"; then
    echo "{\"allowed\": true, \"message\": \"⚠️ Index '$INDEX_USED' is not in the standard DLP catalog. Verify it exists before running.\"}"
    exit 0
  fi
fi

# Default: allow
echo '{"allowed": true}'
