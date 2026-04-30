# Chrome MCP Server

MCP server for browser automation using headless Chrome via Puppeteer.

## Tools

| Tool | Description |
|------|-------------|
| `chrome_navigate` | Navigate to a URL |
| `chrome_screenshot` | Capture page or element screenshot (base64 PNG) |
| `chrome_click` | Click an element by CSS selector |
| `chrome_type` | Type text into an input field |
| `chrome_get_text` | Extract visible text from page or element |
| `chrome_get_dom` | Get HTML content of page or element |
| `chrome_evaluate` | Execute JavaScript in the page context |
| `chrome_wait_for` | Wait for an element to appear |

## Authentication

No tokens required — runs a local headless Chrome instance.

## Prerequisites

Chrome or Chromium must be installed, or Puppeteer will download it on `npm install`.

## Build

```bash
npm install
npm run build
npm run bundle
```

## MCP Configuration

```json
{
  "mcpServers": {
    "chrome": {
      "command": "node",
      "args": ["/path/to/chrome-mcp/dist/index.cjs"]
    }
  }
}
```

## Usage Examples

```
Navigate to https://example.com and take a screenshot
Extract all heading text from the current page
Click the login button and type credentials
Execute JavaScript to override Date for time-travel testing
```

## Security Notes

- `chrome_navigate` only accepts `http://` and `https://` URLs (no `file://` or `javascript:`)
- `chrome_evaluate` executes arbitrary JavaScript in the page context — all invocations are logged to stderr for audit
- The browser runs headless with `--no-sandbox` (required for CI/Docker environments)
- Only agents with `@chrome/*` in their `allowedTools` can access these tools
