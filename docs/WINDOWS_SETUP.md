# Windows Setup Guide

> **First time here?** Start with [Getting Started](GETTING_STARTED.md) to request access and sign in with Disney SSO before following this guide.
>
> **On macOS / Linux?** See [Setup](SETUP.md) instead.

---

## Prerequisites

- Windows 10 (version 2004+) or Windows 11
- Git
- SSH connection to GitHub configured (required for Koda)

---

## 1. Install Kiro CLI

Open **PowerShell** and run:

```powershell
irm 'https://cli.kiro.dev/install.ps1' | iex
```

Verify:

```powershell
kiro-cli --version
```

### Authenticate

```powershell
kiro-cli login
```

This opens a URL in your browser. Sign in with your AWS Builder ID (Disney SSO — see [Getting Started](GETTING_STARTED.md) for details).

---

## 2. Install Kiro IDE

Download and install the native Windows IDE from:

👉 [https://kiro.dev/docs/](https://kiro.dev/docs/)

---

## 3. Install GitHub CLI

Download and install `gh` from:

👉 [https://cli.github.com/](https://cli.github.com/)

Verify:

```powershell
gh --version
```

run gh auth login --hostname github.disney.com

---

## 4. Verify SSH Connection to GitHub

Koda uses SSH to communicate with GitHub. Make sure your SSH key is configured:

```powershell
ssh -T git@github.disney.com
```

You should see a message like `Hi <username>! You've been authenticated...`. If not, follow [GitHub's SSH setup guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

---

## 5. Install Koda

Open **PowerShell** and run:

```powershell
irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex
```

Verify:

```powershell
koda version
```

---

## 6. Setup Koda and Install Agents

Select the fork `wdpr-parkops-opsheet-suite/steer-runtime`, then select the workspace `opsheet-team` and install the `dev-web` profile:

```powershell
koda setup
koda install dev
koda mcp-install
```

For detailed MCP server configuration, see [MCP Setup](MCP_SETUP.md).

Or launch the interactive dashboard:

```powershell
koda                              # TUI — press [p] for profiles, [t] for tokens
```

---

## 7. Start Chatting

```powershell
koda chat --agent orchestrator           # Dev orchestrator
koda chat --agent qa_orchestrator_agent  # QA orchestrator
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `kiro-cli: command not found` | Close and reopen PowerShell, or check that the install path is in your system PATH |
| Browser doesn't open for login | Copy the URL from the terminal and paste it into your browser manually |
| `koda: command not found` | Close and reopen PowerShell, or re-run the Koda install script |
| SSH connection fails | Run `ssh-keygen` to generate a key, then add it to your GitHub account under Settings → SSH keys |
| `gh` not recognized | Restart PowerShell after installing GitHub CLI |

---

Back to [README](../README.md)
