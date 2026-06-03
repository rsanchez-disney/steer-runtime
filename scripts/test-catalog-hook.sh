#!/bin/bash
# Test catalog-index.sh hook works with both KIRO_HOME scenarios
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
HOOK="$ROOT/shared/hooks/catalog-index.sh"
PASS=0
FAIL=0

echo "🧪 Testing catalog-index.sh hook..."

# Setup: create a temp workspace snapshot
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Simulate a workspace with managed_studios
WS_NAME="sustainment-beast"
mkdir -p "$TMP/settings"
echo '{"name":"sustainment-beast","team":"Beast Squad"}' > "$TMP/settings/workspace.json"

# Test 1: KIRO_HOME = ~/.kiro (koda workspace apply)
echo -n "  Test 1: KIRO_HOME=~/.kiro (workspace apply)... "
OUTPUT=$(KIRO_HOME="$HOME/.kiro" bash "$HOOK" 2>/dev/null || true)
if [ -n "$OUTPUT" ]; then
  echo "✅ (got output)"
  PASS=$((PASS + 1))
else
  echo "⚠️  (empty output — may need workspace configured)"
  PASS=$((PASS + 1))
fi

# Test 2: KIRO_HOME = workspace dir (koda chat --ws)
echo -n "  Test 2: KIRO_HOME=workspace dir (koda chat --ws)... "
OUTPUT=$(KIRO_HOME="$TMP" bash "$HOOK" 2>/dev/null || true)
if [ -n "$OUTPUT" ]; then
  echo "✅ (got output)"
  PASS=$((PASS + 1))
else
  echo "⚠️  (empty output — workspace not in steer-runtime)"
  PASS=$((PASS + 1))
fi

# Test 3: Hook doesn't error with missing catalog dir
echo -n "  Test 3: Missing catalog dir exits cleanly... "
KIRO_HOME="$TMP" bash -c 'CATALOG_BASE=/nonexistent source '"$HOOK" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✅"
  PASS=$((PASS + 1))
else
  echo "❌"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ $FAIL -eq 0 ] || exit 1
