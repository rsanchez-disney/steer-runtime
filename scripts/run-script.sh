#!/bin/bash
# run-script.sh — Runs a Python script with dependencies via uv
# Usage: ./scripts/run-script.sh <script.py> [args...]
# Falls back to plain python3 if uv is unavailable.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="$1"
shift

if [ ! -f "$TARGET" ]; then
  TARGET="$SCRIPT_DIR/$TARGET"
fi

if [ ! -f "$TARGET" ]; then
  echo "❌ Script not found: $1"
  exit 1
fi

# Prefer uv for dependency management
if command -v uv >/dev/null 2>&1; then
  exec uv run --with pyyaml "$TARGET" "$@"
elif command -v uvx >/dev/null 2>&1; then
  exec uvx --with pyyaml python "$TARGET" "$@"
else
  # Fallback: try plain python3 (works if pyyaml already installed)
  if python3 -c "import yaml" 2>/dev/null; then
    exec python3 "$TARGET" "$@"
  else
    echo "⚠️  pyyaml not available and uv not installed."
    echo "   Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo "   Or: pip3 install pyyaml"
    exit 1
  fi
fi
