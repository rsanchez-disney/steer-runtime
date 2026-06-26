#!/bin/bash
# context-inject.sh — Dynamic context injection based on git diff
# Trigger: agentSpawn
# Output: JSON with recommended context files to load

set -euo pipefail

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
CONTEXT_DIR="$KIRO_DIR/context"
MAX_INJECT=3

# Get changed files (staged + unstaged + untracked)
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || git diff --name-only 2>/dev/null || echo "")
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")
ALL_FILES=$(printf "%s\n%s" "$CHANGED_FILES" "$STAGED_FILES" | sort -u | grep -v '^$' || true)

[ -z "$ALL_FILES" ] && echo '{"inject_context":[],"reason":"no changes detected"}' && exit 0

# Categorize files and collect context recommendations
RECOMMENDATIONS=()

has_pattern() {
  echo "$ALL_FILES" | grep -qE "$1" 2>/dev/null
}

# Java sources
if has_pattern '\.(java|kt)$|pom\.xml|build\.gradle'; then
  RECOMMENDATIONS+=("api_standards.md")
  RECOMMENDATIONS+=("performance_patterns.md")
fi

# TypeScript/JavaScript (non-test)
if echo "$ALL_FILES" | grep -E '\.(ts|js)$' | grep -vE '\.(spec|test)\.' | grep -q .; then
  RECOMMENDATIONS+=("api_standards.md")
fi

# Test files
if has_pattern '\.(spec|test)\.(ts|js|java)$'; then
  RECOMMENDATIONS+=("test_templates.md")
  RECOMMENDATIONS+=("automation_patterns.md")
fi

# Angular components
if has_pattern '\.component\.(ts|html|scss)$|\.module\.ts$'; then
  RECOMMENDATIONS+=("vista_web_components.md")
fi

# Infrastructure
if has_pattern 'Dockerfile|docker-compose|\.yaml$|\.yml$' && has_pattern 'k8s|deploy|helm|infra'; then
  RECOMMENDATIONS+=("ops_guidelines.md")
fi

# Documentation
if has_pattern '^docs/.*\.md$'; then
  RECOMMENDATIONS+=("domain_glossary.md")
fi

# Deduplicate and limit
UNIQUE_RECS=$(printf '%s\n' "${RECOMMENDATIONS[@]+"${RECOMMENDATIONS[@]}"}" 2>/dev/null | sort -u | head -n $MAX_INJECT)

# Filter to only existing files
FINAL_RECS=()
while IFS= read -r rec; do
  [ -z "$rec" ] && continue
  if [ -f "$CONTEXT_DIR/$rec" ]; then
    FINAL_RECS+=("\"$rec\"")
  fi
done <<< "$UNIQUE_RECS"

# Output JSON
if [ ${#FINAL_RECS[@]} -eq 0 ] 2>/dev/null || [ -z "${FINAL_RECS+x}" ]; then
  echo '{"inject_context":[],"reason":"no matching context for changed files"}'
else
  JOINED=$(IFS=,; echo "${FINAL_RECS[*]}")
  FILE_COUNT=$(echo "$ALL_FILES" | wc -l | tr -d ' ')
  echo "{\"inject_context\":[$JOINED],\"reason\":\"$FILE_COUNT files changed, matched ${#FINAL_RECS[@]} context files\"}"
fi
