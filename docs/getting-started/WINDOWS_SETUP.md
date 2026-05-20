# Windows Setup Guide

> **First time here?** Start with [Getting Started](GETTING_STARTED.md) to request access and sign in with Disney SSO before following this guide.
>
> **On macOS / Linux?** See [Setup](SETUP.md) instead.

---

## Prerequisites

- Windows 10 (version 2004+) or Windows 11
- Git
- Node.js (LTS recommended) — 👉 [https://nodejs.org/](https://nodejs.org/)
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
If this command returns nothing, check the [Kiro CLI silent failure on Windows](#kiro-cli-silent-failure-on-windows) section below.


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

### Generate a GitHub Personal Access Token

Before installing the CLI, generate a token you'll use to authenticate:

👉 [https://github.disney.com/settings/tokens](https://github.disney.com/settings/tokens)

When creating the token, make sure the following scopes are checked:

- **repo** (full control of private repositories)
- **admin:org** (read and write org and team membership)
- **user** (update all user data)

Save the token somewhere safe — you'll need it in the next step.

### Install and authenticate

Download and install `gh` from:

👉 [https://cli.github.com/](https://cli.github.com/)

Verify:

```powershell
gh --version
```

Authenticate with Disney GitHub Enterprise:

```powershell
gh auth login --hostname github.disney.com
```

When prompted, use the personal access token you generated above.

---

## 4. Verify SSH Connection to GitHub

Koda uses SSH to communicate with GitHub. Make sure your SSH key is configured:

```powershell
ssh -T git@github.disney.com
```

You should see a message like `Hi <username>! You've been authenticated...`. If not, follow [GitHub's SSH setup guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh).

> If you have problems using PowerShell, use Git Bash.

---

## 5. Install Koda

Open **PowerShell** as administrator and run:

```powershell
irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex
```

Verify:

```powershell
koda version
```

---

## 6. Setup Koda and Install Agents

Run the interactive setup:

```powershell
koda setup
```

During setup:
1. Press **f** and select the fork: `wdpr-parkops-opsheet-suite/steer-runtime`
2. Press **p** and select the profile you need (e.g. `dev-web`, `qa`, etc.)

Then install agents and verify:

```powershell
koda install dev
koda mcp-install
koda doctor
```

> `koda doctor` runs a health check to verify everything is configured correctly.

For detailed MCP server configuration, see [MCP Setup](../reference/MCP_SETUP.md).

Or launch the interactive dashboard:

```powershell
koda                              # TUI — press [p] for profiles, [t] for tokens
```

---

## 7. Sync Agents to Steering (Kiro IDE)

If you are using **Kiro IDE**, you need to sync the installed agents to steering files so Kiro can use them.

Open the Kiro IDE (or kiro-cli chat) and send the following message:

```
sync agents using \.kiro\steer-runtime\common\skills\sync-agents-to-steering.md
```

### Loading agent skills

Once an agent is installed (e.g. `#agent-ui`), ask Kiro for the available skills:

```
What skills are available?
```

If the skill you need is not listed, ask Kiro to load them from the global skills directory:

```
use the skills from ~/.kiro/skills/
```

---

## 8. Start Chatting

```powershell
koda chat --agent orchestrator           # Dev orchestrator
koda chat --agent qa_orchestrator_agent  # QA orchestrator
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `kiro-cli: command not found` | Close and reopen PowerShell, or check that the install path is in your system PATH. See [environment variables note](#environment-variables) below. |
| `koda: command not found` | Close and reopen PowerShell, or re-run the Koda install script. See [environment variables note](#environment-variables) below. |
| Browser doesn't open for login | Copy the URL from the terminal and paste it into your browser manually |
| SSH connection fails | Run `ssh-keygen` to generate a key, then add it to your GitHub account under Settings → SSH keys |
| `gh` not recognized | Restart PowerShell after installing GitHub CLI |
| Content renders outside the terminal (visualization issues) | Switch to **Git Bash** instead of PowerShell/CMD. Git Bash handles ANSI escape codes and wide content better. |

### Environment Variables

If `kiro-cli` or `koda` commands are not recognized after installation, the most common cause is that their install directories are not in your system `PATH` environment variable.

To check and fix:

1. Open **Start** → search for **"Environment Variables"** → click **"Edit the system environment variables"**
2. Click **Environment Variables…**
3. Under **User variables**, select `Path` and click **Edit**
4. Verify these paths are present (adjust username as needed):
   - `C:\Users\<username>\AppData\Local\Kiro-Cli`
   - The Koda install directory (shown during installation)
5. If missing, click **New** and add them
6. Click **OK**, close all dialogs, and **restart your terminal**

---

## Can I add images to a Markdown file?

Yes. Markdown supports images with the following syntax:

```markdown
![Alt text](path/to/image.png)
```

You can use relative paths (e.g. `../../assets/screenshot.png`) or absolute URLs. Most Markdown renderers (GitHub, VS Code preview, Kiro) will display them inline.

---

### Kiro CLI silent failure on Windows

After running the installer, if `kiro-cli --version` returns nothing or is not recognized, follow these steps.

#### Step 1: Verify the binary exists

Run in PowerShell:

    where.exe kiro-cli

- **Returns a path** (e.g. `C:\Users\<username>\AppData\Local\Kiro-Cli\kiro-cli.exe`): the binary is installed and on your PATH. Skip to **Step 3**.
- **Returns nothing**: the binary isn't on your PATH. Continue to **Step 2**.

#### Step 2: Add Kiro CLI to your PATH

First, confirm the binary was installed:

    Test-Path "$env:LOCALAPPDATA\Kiro-Cli\kiro-cli.exe"

If this returns `True`, add the folder to your user PATH:

    $kiroPath = "$env:LOCALAPPDATA\Kiro-Cli"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$kiroPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$kiroPath", "User")
    }

Close and reopen PowerShell, then run `kiro-cli --version` again. If it still returns nothing, continue to **Step 3**.

#### Step 3: Check for missing dependencies

Run the binary directly and check the exit code:

    & "$env:LOCALAPPDATA\Kiro-Cli\kiro-cli.exe" --version
    $LASTEXITCODE

If `$LASTEXITCODE` returns **-1073741515**, the Microsoft Visual C++ Redistributable is missing on your machine.

#### Step 4: Install the Visual C++ Redistributable

Check if it's already installed:

    Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" -ErrorAction SilentlyContinue | Select-Object Version

If nothing is returned, download and install it from:

👉 [https://aka.ms/vs/17/release/vc_redist.x64.exe](https://aka.ms/vs/17/release/vc_redist.x64.exe)

> On company-managed machines you may need administrator privileges or IT approval to install this.

After installation, restart PowerShell and verify:

    kiro-cli --version

You should see output like `kiro-cli-chat 2.0.1` (version may vary).

#### Quick Reference: Exit Codes

| Exit Code     | Hex          | Meaning       | Fix                                |
|---------------|--------------|---------------|------------------------------------|
| `-1073741515` | `0xC0000135` | DLL not found | Install Visual C++ Redistributable |
| `0`           | `0x0`        | Success       | No action needed                   |

---

Back to [README](../README.md)
