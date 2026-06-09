# Android Logcat MCP Server

MCP server that reads Android logcat output via `adb`. Designed for the dcl-android profile.

## Prerequisites

1. **ADB** must be installed and in PATH (comes with Android SDK)
2. A connected Android device or running emulator
3. USB debugging enabled on the device

## Tools

| Tool | Description |
|------|-------------|
| `logcat_read` | Read recent logcat with filters (tag, priority, grep, PID, time) |
| `logcat_clear` | Clear the logcat buffer |
| `logcat_crash` | Read crash/ANR buffer |
| `logcat_app` | Read logs for a specific app package (auto-finds PID) |
| `logcat_errors` | Get only ERROR/FATAL level logs |
| `adb_devices` | List connected devices/emulators |
| `adb_shell` | Run an adb shell command |

## Usage Examples

- Read last 200 lines of errors: `logcat_errors` with lines=200
- Read logs for DCL app: `logcat_app` with package="com.disney.cruise.guestapp"
- Filter by tag: `logcat_read` with tag="OkHttp" priority="D"
- Search for crashes: `logcat_crash`
- Grep for network issues: `logcat_read` with grep="timeout|connection refused"

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADB_PATH` | `adb` | Path to adb executable |

## Configuration

Add to your workspace `mcp.json`:

```json
{
  "logcat": {
    "command": "node",
    "args": ["shared/tools/mcp-servers/logcat-mcp/dist/index.cjs"],
    "env": {
      "ADB_PATH": "adb"
    }
  }
}
```

## Development

```bash
npm install
npm run build
```

Produces `dist/index.cjs` - single-file bundle for Node.js.