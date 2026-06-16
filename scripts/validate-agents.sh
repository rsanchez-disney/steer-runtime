#!/usr/bin/env bash
# Validates all agent JSON files reference existing prompt files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
errors=0
warnings=0
total=0

# Scan all agent JSON files in profiles/ and workspaces/
while IFS= read -r agent_file; do
  total=$((total + 1))
  dir="$(dirname "$agent_file")"
  profile_root="$(dirname "$dir")"  # parent of agents/ dir

  # Parse prompt field
  prompt_ref=$(python3 -c "
import json, sys
try:
    d = json.load(open('$agent_file'))
    print(d.get('prompt', ''))
except: pass
" 2>/dev/null)

  if [ -z "$prompt_ref" ]; then
    echo "⚠  $agent_file — no 'prompt' field"
    warnings=$((warnings + 1))
    continue
  fi

  # Resolve prompt path: try relative to profile root, then in prompts/ dir
  prompt_path="$profile_root/$prompt_ref"
  prompts_dir_path="$profile_root/prompts/$(basename "$prompt_ref")"
  if [ ! -f "$prompt_path" ] && [ ! -f "$prompts_dir_path" ]; then
    echo "❌ $agent_file — prompt not found: $prompt_ref"
    echo "   Checked: $prompt_path"
    echo "   Checked: $prompts_dir_path"
    errors=$((errors + 1))
  fi

  # Validate JSON is parseable
  if ! python3 -c "import json; json.load(open('$agent_file'))" 2>/dev/null; then
    echo "❌ $agent_file — invalid JSON"
    errors=$((errors + 1))
  fi

  # Check name field exists
  name=$(python3 -c "import json; print(json.load(open('$agent_file')).get('name',''))" 2>/dev/null)
  if [ -z "$name" ]; then
    echo "⚠  $agent_file — missing 'name' field"
    warnings=$((warnings + 1))
  fi

  # Orchestrator tools guardrail: orchestrators should only have routing tools
  if echo "$agent_file" | grep -qi "orchestrator"; then
    ALLOWED_ORCH_TOOLS="subagent thinking todo_list @yax/*"
    bad_tools=$(python3 -c "
import json, os
d = json.load(open('$agent_file'))
allowed = {'subagent', 'thinking', 'todo_list', '@yax/*'}
# sustainment_orchestrator may have fs_read for catalog lookups
if 'sustainment' in os.path.basename('$agent_file'):
    allowed.add('fs_read')
tools = set(d.get('tools', []))
bad = tools - allowed
if bad: print(', '.join(sorted(bad)))
" 2>/dev/null)
    if [ -n "$bad_tools" ]; then
      echo "⚠  $agent_file — orchestrator has non-routing tools: $bad_tools"
      echo "   Orchestrators should only have: subagent, thinking, todo_list, @yax/*"
      echo "   Exception: sustainment_orchestrator may have fs_read (catalog lookups)"
      warnings=$((warnings + 1))
    fi
  fi
done < <(find "$ROOT/profiles" "$ROOT/workspaces" -path "*/agents/*.json" -type f 2>/dev/null)

echo ""
echo "📋 Agent Validation: $total agents scanned"
echo "   ✅ Valid: $((total - errors - warnings))"
[ "$warnings" -gt 0 ] && echo "   ⚠  Warnings: $warnings"
[ "$errors" -gt 0 ] && echo "   ❌ Errors: $errors"

exit $errors
