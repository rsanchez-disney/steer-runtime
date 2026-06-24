# Appium MCP Server

MCP server for mobile test execution on iOS and Android via Appium's W3C WebDriver protocol.

## Prerequisites

```bash
npm install -g appium
appium driver install xcuitest      # iOS
appium driver install uiautomator2  # Android
```

Verify device is connected:
```bash
adb devices          # Android
xcrun simctl list    # iOS simulators
```

Start Appium before using:
```bash
appium server
```

## Installation

```bash
cd ~/.kiro/tools/mcp-servers/appium-mcp
npm install && npm run prepare
```

## MCP Configuration

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "appium-mcp": {
    "command": "node",
    "args": ["~/.kiro/tools/mcp-servers/appium-mcp/dist/index.cjs"],
    "env": {
      "APPIUM_URL": "http://localhost:4723",
      "SCREENSHOT_DIR": "/tmp/appium-screenshots"
    }
  }
}
```

## Tools (18)

### Session
| Tool | Description |
|------|-------------|
| `appium_create_session` | Connect to device with W3C capabilities |
| `appium_end_session` | Disconnect from device |
| `appium_get_session_info` | Get current session details |

### Discovery
| Tool | Description |
|------|-------------|
| `appium_get_page_source` | Get full UI tree as XML |
| `appium_find_element` | Find element by strategy (accessibility id, xpath, etc.) |
| `appium_find_elements` | Find multiple matching elements |

### Actions
| Tool | Description |
|------|-------------|
| `appium_tap` | Tap on an element |
| `appium_type` | Type text into a field |
| `appium_swipe` | Swipe in a direction |
| `appium_back` | Press back button |
| `appium_long_press` | Long press on element |
| `appium_scroll_to` | Scroll until element found |
| `appium_launch_app` | Launch or relaunch the app |
| `appium_set_permission` | Accept or dismiss permission dialogs |

### Verification
| Tool | Description |
|------|-------------|
| `appium_screenshot` | Capture screen (saves PNG to SCREENSHOT_DIR) |
| `appium_is_element_displayed` | Check element visibility |
| `appium_get_element_attribute` | Read element attribute |

### Waits
| Tool | Description |
|------|-------------|
| `appium_wait_for_element` | Poll until element appears (default 10s timeout) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APPIUM_URL` | `http://localhost:4723` | Appium server URL |
| `SCREENSHOT_DIR` | `/tmp/appium-screenshots` | Where to save screenshots |

## Example: Create Session

> Device capabilities are defined in `workspaces/passport-team/context/devices.json`. The agent reads them automatically. Below are examples of the format:

**iOS:**
```json
{
  "platformName": "iOS",
  "deviceName": "iPhone 15",
  "bundleId": "com.disney.wdpro.dlr"
}
```

**Android:**
```json
{
  "platformName": "Android",
  "deviceName": "auto",
  "appPackage": "com.disney.wdpro.dlr",
  "appActivity": "com.disney.wdpro.dlr.MainActivity"
}
```
