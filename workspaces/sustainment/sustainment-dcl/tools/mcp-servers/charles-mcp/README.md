# Charles Proxy MCP Server

MCP server that controls a running Charles Proxy instance via its Web Interface API.

## Prerequisites

1. **Charles Proxy** must be running.
2. **Web Interface** must be enabled:
   - Go to Proxy > Web Interface Settings
   - Check "Enable Web Interface"
   - Select "Allow anonymous access" (or configure credentials)
3. Charles must be listening on the default port 8888 (or configure via env vars).

## Tools

| Tool | Description |
|------|-------------|
| charles_recording_start | Start recording traffic |
| charles_recording_stop | Stop recording traffic |
| charles_recording_status | Get current recording status |
| charles_throttling_activate | Activate throttling (optional preset) |
| charles_throttling_deactivate | Deactivate throttling |
| charles_throttling_status | Get current throttling status |
| charles_tool_enable | Enable a Charles tool |
| charles_tool_disable | Disable a Charles tool |
| charles_tool_status | Get status of a Charles tool |
| charles_session_clear | Clear the current session |
| charles_status | Get overall Charles status summary |

### Available Charles Tools

breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process

### Throttling Presets

56 kbps Modem, 256 kbps ISDN/DSL, 512 kbps ISDN/DSL, 2 Mbps ADSL, 8 Mbps ADSL2, 16 Mbps ADSL2+, 32 Mbps VDSL, 32 Mbps Fibre, 100 Mbps Fibre, 3G, 4G

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| CHARLES_HOST | 127.0.0.1 | Charles Proxy host |
| CHARLES_PORT | 8888 | Charles Proxy port |

## Development

```bash
npm install
npm run build
```

The build produces dist/index.cjs - a single-file bundle ready to run with Node.js.
