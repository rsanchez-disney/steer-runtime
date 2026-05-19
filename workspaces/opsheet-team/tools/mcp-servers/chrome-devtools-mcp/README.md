# Chrome DevTools MCP Bundle

Thin wrapper around the official [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) server with team-standard defaults.

## Default Flags

| Flag | Value | Purpose |
|------|-------|---------|
| `--isolated` | `true` | Temporary user-data-dir, auto-cleaned on close |
| `--headless` | `true` | No UI — suitable for CI and agent use |
| `--no-usage-statistics` | — | Opt-out of Google telemetry |

## Build

```bash
npm install
npm run build
```

## MCP Configuration

### Basic (launches its own Chrome)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "node",
      "args": ["/path/to/chrome-devtools-mcp/dist/index.cjs"]
    }
  }
}
```

### With remote Chrome (WebSocket + auth token)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "node",
      "args": ["/path/to/chrome-devtools-mcp/dist/index.cjs"],
      "env": {
        "CHROME_WS_ENDPOINT": "ws://127.0.0.1:9222/devtools/browser/<id>",
        "CHROME_WS_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

> **Note:** The token is valid for ~8 hours. Rotate it manually in your `mcp.json` when it expires.

### Direct args override (alternative)

If you prefer not to use env vars, pass args directly:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y", "chrome-devtools-mcp@latest",
        "--isolated=true",
        "--headless=true",
        "--wsEndpoint=ws://127.0.0.1:9222/devtools/browser/<id>",
        "--wsHeaders={\"Authorization\":\"Bearer YOUR_TOKEN_HERE\"}"
      ]
    }
  }
}
```

## Tools Provided

All tools from [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md) are available:

- **Input**: click, drag, fill, fill_form, hover, press_key, type_text, upload_file, handle_dialog, click_at
- **Navigation**: navigate_page, new_page, close_page, list_pages, select_page, wait_for
- **Debugging**: evaluate_script, take_screenshot, take_snapshot, list_console_messages, get_console_message
- **Network**: list_network_requests, get_network_request
- **Performance**: performance_start_trace, performance_stop_trace, performance_analyze_insight
- **Emulation**: emulate, resize_page

## Security Notes

- The server launches Chrome in isolated mode — no persistent profile data
- `--no-usage-statistics` disables Google telemetry
- WebSocket tokens expire after ~8 hours — never commit real tokens to source control
