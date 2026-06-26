#!/bin/bash
# secret-scan-autofix.sh — Enhanced secret scan with actionable fix suggestions
# Trigger: preToolUse (fs_write)
# Input: stdin JSON with file path and content
# Output: BLOCKED message with structured fix suggestion (or empty for pass)

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('path',''))" 2>/dev/null || echo "")

[ -z "$FILE_PATH" ] && exit 0

# Skip non-source files
case "$FILE_PATH" in
  *.json|*.yaml|*.yml|*.ts|*.js|*.java|*.py|*.env*|*.properties|*.xml|*.gradle)
    ;;
  *)
    exit 0
    ;;
esac

# Get content to scan
CONTENT=$(echo "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('content',''))" 2>/dev/null || echo "")

[ -z "$CONTENT" ] && exit 0

# Pattern detection with fix suggestions
python3 << 'PYTHON'
import re
import sys
import os
import json

content = os.environ.get("SCAN_CONTENT", "")
file_path = os.environ.get("SCAN_FILE", "")

# If env vars are empty, try reading from the variable
if not content:
    sys.exit(0)

patterns = [
    {
        "name": "API Key",
        "regex": r'(?:api[_-]?key|apikey)\s*[=:]\s*["\']?([A-Za-z0-9_\-]{20,})["\']?',
        "var_prefix": "API_KEY",
        "gitignore": ".env.local"
    },
    {
        "name": "Bearer Token",
        "regex": r'["\']Bearer\s+([A-Za-z0-9_\-\.]{20,})["\']',
        "var_prefix": "AUTH_TOKEN",
        "gitignore": ".env.local"
    },
    {
        "name": "Password",
        "regex": r'(?:password|passwd|pwd)\s*[=:]\s*["\']([^"\']{8,})["\']',
        "var_prefix": "DB_PASSWORD",
        "gitignore": ".env.local"
    },
    {
        "name": "AWS Key",
        "regex": r'(?:AKIA|ASIA)[A-Z0-9]{16}',
        "var_prefix": "AWS_ACCESS_KEY",
        "gitignore": ".env.local"
    },
    {
        "name": "Private Key",
        "regex": r'-----BEGIN (?:RSA |EC )?PRIVATE KEY-----',
        "var_prefix": "PRIVATE_KEY_PATH",
        "gitignore": "*.pem"
    },
    {
        "name": "Connection String",
        "regex": r'(?:mongodb|postgres|mysql|redis)://[^\s"\']+:[^\s"\']+@',
        "var_prefix": "DATABASE_URL",
        "gitignore": ".env.local"
    }
]

findings = []
lines = content.split("\n")

for i, line in enumerate(lines, 1):
    for p in patterns:
        if re.search(p["regex"], line, re.IGNORECASE):
            findings.append({
                "line": i,
                "type": p["name"],
                "var_name": p["var_prefix"],
                "gitignore_add": p["gitignore"],
                "line_content": line.strip()[:80]
            })
            break

if findings:
    print(f"BLOCKED: {len(findings)} potential secret(s) in {file_path}")
    print()
    for f in findings:
        print(f"  Line {f['line']}: {f['type']} detected")
        print(f"  FIX_SUGGESTION:")
        print(f"    action: move_to_env")
        print(f"    var_name: {f['var_name']}")
        print(f"    file: {file_path}")
        print(f"    line: {f['line']}")
        print(f"    replacement: process.env.{f['var_name']} (JS/TS) or System.getenv(\"{f['var_name']}\") (Java)")
        print(f"    gitignore_add: {f['gitignore_add']}")
        print()
    sys.exit(1)

PYTHON
