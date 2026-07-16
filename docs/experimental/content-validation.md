# Content validation

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime)

Pre-write hook that validates JSON, YAML, and Markdown content before it reaches disk — prevents broken files from agents.

## Quick start

Automatically registered via `global-hooks.json` for all agents with `fs_write`. No setup needed after `koda sync`.

## What it validates

| File type | Check | On failure |
|-----------|-------|-----------|
| JSON | Parse validation | ❌ Reject write |
| YAML | safe_load validation | ❌ Reject write |
| Markdown | Unclosed code blocks (odd ``` count) | ❌ Reject write |
| Markdown | Mismatched brackets in Mermaid | ⚠️ Warning |
| All | Trailing whitespace | ⚠️ Warning (non-blocking) |
| All | Missing EOF newline | ⚠️ Warning (non-blocking) |

## How it works

```text
Agent calls fs_write("file.json", content)
    │
    ▼  preToolUse hook: validate-content.sh
Does content parse as valid JSON?
    │
    ├── Yes → allow write (exit 0)
    └── No → reject write (exit 1, error message returned to agent)
              Agent sees: "❌ JSON parse error: invalid syntax"
              Agent fixes content and retries
```

## Hook registration

Registered globally in `shared/global-hooks.json`:

```json
{
  "matcher": "fs_write",
  "command": "$HOME/.kiro/hooks/validate-content.sh",
  "description": "Validate JSON, YAML, and Markdown content before writing",
  "condition": "has_tool:fs_write"
}
```

## Extending

Add new validation rules to `shared/hooks/validate-content.sh`:

```bash
# Example: validate TOML files
if [ "$EXT" = "toml" ]; then
  if ! python3 -c "import tomllib,sys; tomllib.load(sys.stdin.buffer)" <<< "$CONTENT" 2>/dev/null; then
    ERRORS="TOML parse error"
  fi
fi
```
