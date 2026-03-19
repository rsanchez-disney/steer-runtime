# Troubleshooting

Common issues and solutions for steer-runtime.

---

## General

```bash
./setup.sh              # Show help
./setup.sh check        # Verify installation
./setup.sh list         # List available profiles
```

## Agents Not Found

```bash
# Verify installation
ls ~/.kiro/agents/

# Reinstall
./setup.sh install dev ba
```

## MCP Servers Not Working

```bash
# Reconfigure tokens
./setup.sh configure

# Verify .env files exist
ls ~/.kiro/tools/mcp-servers/*/.env

# Full MCP reinstall
./setup.sh mcp-install
```

## MCP Bundle Missing

If `mcp-install` reports missing bundles, ensure you have the latest code:

```bash
git pull origin main
./setup.sh mcp-install
```

## Token Expired

Regenerate tokens and reconfigure:

| Service | Token URL |
|---------|-----------|
| Jira | https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens |
| Confluence | https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action |
| MyWiki | https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action |
| GitHub | https://github.disney.com/settings/tokens |

Then run:
```bash
./setup.sh configure
```

## Advanced Tools Not Working

If `thinking`, `todo`, or `knowledge` tools don't appear in an agent session:

```bash
# Enable the required settings
./setup.sh enable-tools

# Or manually:
kiro-cli settings chat.enableThinking true
kiro-cli settings chat.enableTodoList true
kiro-cli settings chat.enableKnowledge true
```

## Hooks Not Running

Verify hook scripts are installed and executable:

```bash
ls -la ~/.kiro/hooks/
# Should show git-context.sh, guard-writes.sh, warn-destructive.sh

# Reinstall hooks
./setup.sh sync
```

Use `/hooks` in a chat session to inspect active hooks for the current agent.

## Agent fails with "unknown field `welcomeMessage`"

If you see:

```bash
Error: Json supplied at ~/.kiro/agents/x_orchestrator_agent.json is invalid: unknown field `welcomeMessage`, expected one of `$schema`, `name`, `description`, `prompt`, `mcpServers`, `tools`, `toolAliases`, `allowedTools`, `resources`, `hooks`, `toolsSettings`, `includeMcpJson`, `useLegacyMcpJson`, `model` at line 70 column 18
```

**Root cause:** steer-runtime added `welcomeMessage` to orchestrator agent configs. Older kiro-cli versions (<1.24.1) don't recognize this field and reject the JSON. Verify your version with:

```bash
kiro-cli --version
```

**Fix:** Reinstall to get an updated kiro version.

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```
Reference: [Kiro CLI Website](https://kiro.dev/docs/cli/)

---

> 🪟 **Windows users:** See [Windows Setup Guide](WINDOWS_SETUP.md) for PowerShell equivalents.

Back to [README](../README.md)
