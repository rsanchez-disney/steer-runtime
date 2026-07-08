#!/bin/bash
# preToolUse hook: block commands that access browser databases, credential stores,
# or perform queries that trigger EDR/XDR endpoint protection alerts.
#
# Exit 2 = block the command (kiro-cli will not execute it)
# Exit 0 = allow

INPUT=$(cat)
CMD=$(echo "$INPUT" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)

# Normalize to lowercase for matching
CMD_LOWER=$(echo "$CMD" | tr '[:upper:]' '[:lower:]')

# --- Browser databases (Chrome, Firefox, Safari, Edge) ---
# Accessing these files triggers credential-theft EDR signatures
if echo "$CMD_LOWER" | grep -qE "sqlite3.*(chrome|firefox|safari|edge|brave|opera)"; then
  echo "🚫 BLOCKED: Accessing browser databases triggers EDR alerts and will lock your laptop." >&2
  echo "   Command: $CMD" >&2
  echo "   Alternative: Use 'git config user.email' for identity, or ask the user directly." >&2
  exit 2
fi

if echo "$CMD_LOWER" | grep -qE "sqlite3.*(web.data|login.data|cookies|history|places\.sqlite|formhistory)"; then
  echo "🚫 BLOCKED: Accessing browser databases triggers EDR alerts and will lock your laptop." >&2
  echo "   Command: $CMD" >&2
  exit 2
fi

# --- OS credential stores ---
if echo "$CMD_LOWER" | grep -qE "security.*(find-generic-password|find-internet-password|dump-keychain)"; then
  echo "🚫 BLOCKED: Accessing macOS Keychain triggers EDR alerts." >&2
  echo "   Command: $CMD" >&2
  echo "   Alternative: Use environment variables or ask the user for credentials." >&2
  exit 2
fi

if echo "$CMD_LOWER" | grep -qE "cat.*/etc/shadow|cat.*/etc/passwd"; then
  echo "🚫 BLOCKED: Accessing system credential files triggers EDR alerts." >&2
  echo "   Command: $CMD" >&2
  exit 2
fi

# --- Credential harvesting patterns ---
if echo "$CMD_LOWER" | grep -qE "findstr.*(password|credential|secret|token)"; then
  echo "🚫 BLOCKED: Credential search pattern triggers EDR alerts." >&2
  echo "   Command: $CMD" >&2
  exit 2
fi

if echo "$CMD_LOWER" | grep -qE "grep.*(password|credential|secret).*/users/|grep.*(password|credential|secret).*(/home/|/root/)"; then
  echo "🚫 BLOCKED: Searching user directories for credentials triggers EDR alerts." >&2
  echo "   Command: $CMD" >&2
  echo "   Alternative: Use 'git config' or environment variables for configuration values." >&2
  exit 2
fi

# --- Windows credential tools ---
if echo "$CMD_LOWER" | grep -qE "cmdkey|vaultcmd|mimikatz|lazagne|credential.manager"; then
  echo "🚫 BLOCKED: Credential extraction tools trigger EDR alerts." >&2
  echo "   Command: $CMD" >&2
  exit 2
fi

# --- Network credential sniffing ---
if echo "$CMD_LOWER" | grep -qE "tcpdump.*(-w|port.*(80|443))|wireshark|tshark.*-f"; then
  echo "🚫 BLOCKED: Network capture triggers EDR alerts." >&2
  echo "   Command: $CMD" >&2
  exit 2
fi

exit 0
