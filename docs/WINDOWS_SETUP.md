# Windows Setup Guide

> **⚠️ Deprecated:** `setup.ps1` is deprecated. Use [Koda](https://github.disney.com/SANCR225/Koda) instead.

---

## Prerequisites

- Windows 10 (version 2004+) or Windows 11
- [Node.js](https://nodejs.org) (includes npm)
- Git

---

## 1. Install WSL

Kiro CLI does not have a native Windows binary yet (expected mid-April 2026). The official way to run it on Windows is through the **Windows Subsystem for Linux (WSL)**.

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

Restart your computer when prompted. On reboot, WSL will finish setting up Ubuntu and ask you to create a Linux username and password.

Verify WSL is working:

```powershell
wsl --version
```

> All remaining steps run **inside the WSL terminal** (search "Ubuntu" in the Start menu).

---

## 2. Install Kiro CLI (inside WSL)

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

If the script fails, download the Universal Linux zip manually:

```bash
# Download and extract
curl -fsSL -o kiro-cli.zip https://kiro.dev/downloads/kiro-cli-linux.zip
unzip kiro-cli.zip
./install.sh
```

Verify:

```bash
kiro-cli --version
```

### Authenticate

```bash
kiro-cli login
```

This opens a URL in your Windows browser. Sign in with your AWS Builder ID (Disney SSO — see [Getting Started](GETTING_STARTED.md) for details).

---

## 3. Install Koda (inside WSL)

```bash
curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash
```

Verify:

```bash
koda version
```

---

## 4. Install Agents

```bash
koda setup                        # Check dependencies
koda install dev                  # Install dev agents
koda mcp-install                  # Setup MCP servers + tokens
```

Or launch the interactive dashboard:

```bash
koda                              # TUI — press [p] for profiles, [t] for tokens
```

---

## 5. Start Chatting

```bash
koda chat --agent orchestrator           # Dev orchestrator
koda chat --agent qa_orchestrator_agent  # QA orchestrator
```

---

## Tips for WSL Users

- **Access Windows files** from WSL at `/mnt/c/Users/<your-name>/`
- **Clone repos inside WSL** (e.g., `~/steer-runtime`) for best performance — avoid `/mnt/c/` for git repos
- **VS Code** integrates with WSL natively — install the [WSL extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) and run `code .` from WSL
- **Node.js** — install inside WSL, not on Windows, to avoid path issues:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `wsl --install` fails | Ensure virtualization is enabled in BIOS. Run `dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart` then restart |
| `kiro-cli: command not found` | Re-run the install script, or add `~/.local/bin` to your PATH: `export PATH="$HOME/.local/bin:$PATH"` |
| Browser doesn't open for login | Copy the URL from the terminal and paste it into your Windows browser manually |
| Slow git/npm in `/mnt/c/` | Move your repos to the Linux filesystem (`~/`) instead of the Windows mount |
| `koda: command not found` | Re-run the Koda install script, or check `~/.local/bin/koda` exists |

---

## Legacy: setup.ps1

<details>
<summary>Click to expand (deprecated)</summary>

The `setup.ps1` PowerShell script ran natively on Windows without WSL. It is now deprecated.

```powershell
.\setup.ps1 list                     # List profiles
.\setup.ps1 install dev              # Install dev profile
.\setup.ps1 mcp-install              # Setup MCP servers + tokens
.\setup.ps1 check                    # Verify installation
```

</details>

---

Back to [README](../README.md)
