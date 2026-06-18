#!/bin/bash
FILE_PATH="${KIRO_TOOL_INPUT_path:-}"
if [[ -n "$FILE_PATH" && ! "$FILE_PATH" == *.feature ]]; then
  echo "BLOCKED: Only .feature files can be written. Attempted: $FILE_PATH"
  exit 1
fi
exit 0
