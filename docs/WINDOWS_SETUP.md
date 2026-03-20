# Windows Setup Guide

Windows users use `setup.ps1` (PowerShell) instead of `setup.sh`. All commands are identical.

---

## Prerequisites

- PowerShell 5.1+ (included in Windows 10/11) or PowerShell 7+
- [Node.js](https://nodejs.org) (includes npm)
- Git
- Kiro CLI (`kiro-cli`)

### Install Kiro CLI

Download from https://kiro.dev/downloads/, or install via npm:

```powershell
npm install -g @kiro/cli
kiro-cli --version            # Verify installation
```

If script execution is blocked, run once:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Quick Start

```powershell
git clone <repo-url> C:\steer-runtime
cd C:\steer-runtime

.\setup.ps1 list                     # List profiles
.\setup.ps1 install dev              # Install dev profile
.\setup.ps1 install dev ba qa        # Install multiple
.\setup.ps1 install dev --project C:\my-project   # Project-specific
.\setup.ps1 mcp-install              # Setup MCP servers + tokens
```

---

## Commands

```powershell
.\setup.ps1                          # Show help
.\setup.ps1 list                     # List available profiles
.\setup.ps1 install <profiles>       # Install one or more profiles
.\setup.ps1 sync                     # Update installed profiles
.\setup.ps1 remove <profiles>        # Remove specific profiles
.\setup.ps1 check                    # Verify installation
.\setup.ps1 mcp-install              # Setup MCP servers + configure tokens
.\setup.ps1 rules list               # List available coding rules
.\setup.ps1 rules install --all      # Install rules to project
.\setup.ps1 prompts list             # List available prompts
.\setup.ps1 init-memory C:\myapp     # Initialize project memory bank
.\setup.ps1 configure                # Configure MCP tokens
```

---

## Key Differences from macOS/Linux

| | macOS/Linux | Windows |
|---|---|---|
| Script | `./setup.sh` | `.\setup.ps1` |
| Home dir | `~/.kiro` | `%USERPROFILE%\.kiro` |
| Path separator | `/` | `\` |
| File copy | `rsync` | `robocopy` |

---

## Troubleshooting

```powershell
# Check installation
.\setup.ps1 check

# Verify agents installed
Get-ChildItem $env:USERPROFILE\.kiro\agents\*.json

# Reinstall
.\setup.ps1 install dev ba

# MCP servers not working
.\setup.ps1 mcp-install

# Verify .env files
Get-ChildItem $env:USERPROFILE\.kiro\tools\mcp-servers\*\.env

# Reconfigure tokens only
.\setup.ps1 configure
```

---

Back to [README](../README.md)
