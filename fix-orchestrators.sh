#!/bin/bash

echo "🔧 Fixing orchestrator agents..."
echo ""

# Fix BA orchestrator
if [ -f ~/.kiro/agents/ba_orchestrator_agent.json ]; then
  echo "Fixing ba_orchestrator_agent.json..."
  # Remove the role line
  sed -i.bak '/"role":/d' ~/.kiro/agents/ba_orchestrator_agent.json
  echo "✅ Fixed ba_orchestrator_agent.json"
else
  echo "⚠️  ba_orchestrator_agent.json not found"
fi

# Fix QA orchestrator
if [ -f ~/.kiro/agents/qa_orchestrator_agent.json ]; then
  echo "Fixing qa_orchestrator_agent.json..."
  # Remove the role line
  sed -i.bak '/"role":/d' ~/.kiro/agents/qa_orchestrator_agent.json
  echo "✅ Fixed qa_orchestrator_agent.json"
else
  echo "⚠️  qa_orchestrator_agent.json not found"
fi

echo ""
echo "✅ Done! Try running your agent again."
echo ""
echo "Backup files saved as *.bak"
