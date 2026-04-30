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

Select the fork `wdpr-parkops-opsheet-suite/steer-runtime`, then select the workspace `opsheet-team` and install the `dev-web` profile:

```powershell
koda setup
koda install dev
koda mcp-install
```

For detailed MCP server configuration, see [MCP Setup](../reference/MCP_SETUP.md).

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

| Issue                          | Fix                                                                                              |
|--------------------------------|--------------------------------------------------------------------------------------------------|
| `kiro-cli: command not found`  | Close and reopen PowerShell, or check that the install path is in your system PATH               |
| Browser doesn't open for login | Copy the URL from the terminal and paste it into your browser manually                           |
| `koda: command not found`      | Close and reopen PowerShell, or re-run the Koda install script                                   |
| SSH connection fails           | Run `ssh-keygen` to generate a key, then add it to your GitHub account under Settings → SSH keys |
| `gh` not recognized            | Restart PowerShell after installing GitHub CLI                                                   |

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
