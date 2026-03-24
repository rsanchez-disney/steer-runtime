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
./setup.sh install dev ba qa ops pm
```

## MCP Servers Not Working

```bash
# Check tokens are configured
cat ~/.kiro/tokens.env

# Reconfigure tokens interactively
./setup.sh configure

# Full MCP reinstall + token setup
./setup.sh mcp-install
```

## MCP Tool Name Collisions

If you see "tools rejected because they conflict in names" for mywiki:

```bash
# mywiki-mcp must have unique tool names (get_mywiki_page, not get_confluence_page)
cd ~/.kiro/tools/mcp-servers/mywiki-mcp && npm run build
```

## Mermaid MCP Init Failure

If mermaid shows "connection closed: initialize response":

```bash
cd ~/.kiro/tools/mcp-servers/mermaid-diagram-mcp && npm run build
```

## MCP Bundle Missing

If `mcp-install` reports missing bundles:

```bash
git pull origin main
./setup.sh mcp-install
```

## Tokens Showing YOUR_TOKEN

After installing profiles, tokens may show as `YOUR_TOKEN` if `tokens.env` doesn't exist yet:

```bash
# 1. Configure tokens first
./setup.sh mcp-install

# 2. Then reinstall profiles (injects tokens from tokens.env)
./setup.sh install dev ba qa ops pm
```

## Delegation Timeout

If delegated agents time out with MCP auth errors:
- The global `~/.kiro/settings/mcp.json` only applies to direct sessions
- Delegated sessions use the agent JSON's `mcpServers.env` block
- Fix: ensure `~/.kiro/tokens.env` has real tokens, then re-install profiles

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
./setup.sh install dev ba qa ops pm
```

## Advanced Tools Not Working

If `thinking`, `todo`, or `knowledge` tools don't appear:

```bash
./setup.sh enable-tools
```

## Hooks Not Running

```bash
ls -la ~/.kiro/hooks/
./setup.sh sync
```

Use `/hooks` in a chat session to inspect active hooks.

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
