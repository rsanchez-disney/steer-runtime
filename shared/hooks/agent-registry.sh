#!/bin/bash
# agentSpawn hook: inject available agents registry as context
echo "## Agent Registry (auto-discovered)"
echo ""
for f in ~/.kiro/agents/*.json; do
  [ -f "$f" ] || continue
  [[ "$(basename "$f")" == ._* ]] && continue
  name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  desc=$(grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' "$f" | head -1 | sed 's/.*: *"//;s/"//')
  echo "- **$name**: $desc"
done
