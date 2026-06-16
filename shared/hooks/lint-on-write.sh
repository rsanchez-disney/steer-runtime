#!/bin/bash
# postToolUse hook: auto-run linter after file writes
INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx)
    npx eslint --fix "$FILE" 2>/dev/null && echo "✓ Linted $FILE" || true ;;
  *.java)
    command -v google-java-format >/dev/null && google-java-format -i "$FILE" 2>/dev/null && echo "✓ Formatted $FILE" || true ;;
  *.py)
    command -v ruff >/dev/null && ruff format "$FILE" 2>/dev/null && echo "✓ Formatted $FILE" || true ;;
  *.dart)
    command -v dart >/dev/null && dart format "$FILE" 2>/dev/null && echo "✓ Formatted $FILE" || true ;;
  *.kt|*.kts)
    command -v ktlint >/dev/null && ktlint --format "$FILE" 2>/dev/null && echo "✓ Formatted $FILE" || true ;;
esac
exit 0
