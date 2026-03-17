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

---

> 🪟 **Windows users:** See [Windows Setup Guide](WINDOWS_SETUP.md) for PowerShell equivalents.

Back to [README](../README.md)
