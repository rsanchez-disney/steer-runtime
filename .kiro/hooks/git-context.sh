#!/bin/bash
# agentSpawn hook: inject git context into agent
echo "## Current Git Context"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
echo "Status: $(git status --short 2>/dev/null | head -10)"
dirty=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
[ "$dirty" -gt 0 ] && echo "($dirty uncommitted changes)" || echo "(clean)"
