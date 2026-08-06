---
name: coda-setup
description: Configure and use Globant's CODA AI coding agent — installation, provider setup, MCP configuration, plugins, skills, headless mode, and troubleshooting. Use when asked about coda setup, coda configuration, coda providers, or coda marketplace.
---

# Skill: CODA Setup & Configuration

## When to use

- User asks to install or configure coda
- User asks about coda providers (GEAI, OpenAI-compat, Ollama)
- User asks about coda MCP configuration
- User asks about coda plugins or marketplace
- User asks about coda headless mode or CI integration
- User asks about coda skills or AGENTS.md
- User asks to troubleshoot coda errors (401, quota, model not found)

## Quick reference

### Installation

```bash
# macOS / Linux
curl -fsSL 'https://docs.globant.ai/en/filedownload?4622,12' | bash

# Windows (PowerShell)
irm 'https://docs.globant.ai/en/filedownload?5346,6' | iex

# Alternative (requires Globant npm registry)
npm i -g @globant/coda

# Verify
coda --version
```

### Provider setup (GEAI with API key)

Edit `~/.coda/config.json`:

```json
{
  "profiles": {
    "geai": {
      "provider": "glob-ai",
      "instance": "clients",
      "baseUrl": "https://api.clients.globant.com",
      "signInUrl": "https://console.clients.globant.com",
      "auth": { "method": "apikey", "secretRef": "GEAI_API_KEY" },
      "authDefaults": {
        "gamClientId": "glob-ai-clients",
        "gamRedirectUri": "http://localhost:9876/callback"
      },
      "model": "anthropic/claude-sonnet-4-6"
    }
  },
  "activeProfile": "geai"
}
```

Ensure `GEAI_API_KEY` is set in your environment.

### Provider setup (OpenAI-compatible)

```json
{
  "profiles": {
    "my-api": {
      "provider": "openai-compat",
      "baseUrl": "https://api.example.com/v1",
      "auth": { "method": "apikey", "secretRef": "MY_API_KEY" },
      "model": "my-model"
    }
  }
}
```

### Common commands

```bash
coda                              # Interactive mode
coda -p "say hi"                  # Headless (single prompt)
coda --model anthropic/claude-sonnet-4-6 -p "..."  # Specific model
coda --reconfigure                # Re-run setup wizard
coda marketplace install <url>    # Install plugin from repo
coda plugin install <path>        # Install local plugin
coda upgrade                      # Update to latest version
```

### MCP configuration

Add MCP servers in `~/.coda/mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

Or inline in `~/.coda/config.json` under `mcp.servers`.

### Slash commands (interactive)

| Command | Purpose |
|---------|---------|
| `/help` | List commands |
| `/switch-model` | Change model |
| `/switch-profile` | Change provider |
| `/providers` | Add/update provider |
| `/skills` | Manage skills |
| `/mcp` | Manage MCP servers |
| `/extensions` | Extension commands |

### Headless mode (CI/scripts)

```bash
coda -p "fix the failing test" --output json --timeout 120000
coda -p "refactor auth module" --auto-approve all --model anthropic/claude-sonnet-4-6
```

### Troubleshooting

| Error | Fix |
|-------|-----|
| "Invalid model name" | Use `provider/model` format (e.g., `anthropic/claude-sonnet-4-6`) |
| "Quota exceeded" | Wait for reset or try different model |
| "No OAuth configuration" | Add `authDefaults` block to profile (see provider setup above) |
| 401 Unauthorized | Check API key is valid and not expired |
| "argument list too long" | Agent prompts too large — reduce context or use lighter agents |

## Full reference

For complete documentation (1,678 lines covering all features, configuration fields, tools, keyboard shortcuts, FAQ, and release history), see: `references/coda-full-reference.md`
