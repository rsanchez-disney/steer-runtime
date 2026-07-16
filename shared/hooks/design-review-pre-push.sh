#!/usr/bin/env bash
# design-review-pre-push.sh — pre-push git hook
# Compares committed changes against the approved plan in session-state.md.
# Non-blocking: prints warnings but does not prevent the push.

set -euo pipefail

SESSION_STATE=".kiro/session-state.md"

# Skip if no session state exists
if [ ! -f "$SESSION_STATE" ]; then
  exit 0
fi

# Skip if session is not in-progress
if ! grep -q "Status: in-progress" "$SESSION_STATE" 2>/dev/null; then
  exit 0
fi

echo "🔍 Design review: checking plan alignment..."

# Extract planned key files from session state
PLANNED_FILES=$(grep -A 50 "## Context" "$SESSION_STATE" | grep "^- " | grep -oE '[a-zA-Z0-9_/.-]+\.[a-z]+' | sort -u)

# If no planned files listed, skip check
if [ -z "$PLANNED_FILES" ]; then
  exit 0
fi

# Get actual changed files (committed, not yet pushed)
REMOTE="${1:-origin}"
REMOTE_REF=$(git rev-parse "@{upstream}" 2>/dev/null || echo "")
if [ -z "$REMOTE_REF" ]; then
  exit 0
fi

ACTUAL_FILES=$(git diff --name-only "$REMOTE_REF"..HEAD | sort -u)

if [ -z "$ACTUAL_FILES" ]; then
  exit 0
fi

# Find files changed but not in plan
UNPLANNED=$(comm -13 <(echo "$PLANNED_FILES") <(echo "$ACTUAL_FILES"))

# Find planned files not changed
MISSING=$(comm -23 <(echo "$PLANNED_FILES") <(echo "$ACTUAL_FILES"))

# Report
WARNINGS=0

if [ -n "$UNPLANNED" ]; then
  echo "⚠️  Files not in plan:"
  echo "$UNPLANNED" | sed 's/^/   /'
  WARNINGS=$((WARNINGS + 1))
fi

if [ -n "$MISSING" ]; then
  echo "⚠️  Planned files not modified:"
  echo "$MISSING" | sed 's/^/   /'
  WARNINGS=$((WARNINGS + 1))
fi

if [ "$WARNINGS" -eq 0 ]; then
  echo "✅ Implementation aligns with plan"
else
  echo ""
  echo "💡 This is informational — push continues. Review if drift is intentional."
fi

# Never block the push
exit 0
