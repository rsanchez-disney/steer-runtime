# Installation Guide — Koda + Kiro

Step-by-step guide to install all the tools you need.
No prior technical experience required.

---

## 1. Install a Package Manager

A package manager lets you install tools from the command line instead of hunting for downloads.

### macOS

Install **Homebrew**. Open the **Terminal** app (press `Cmd + Space`, type "Terminal", hit Enter)
and paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. When it finishes, **close and reopen Terminal**.

Verify it worked:

```bash
brew --version
```

### Windows

TBD.

---

## 2. Install GitHub CLI (`gh`)

GitHub CLI lets you authenticate with GitHub from the command line.

### macOS

```bash
brew install gh
```

### Windows

TBD.

## 3. Set Up Environment Variables

We need to tell `gh` to default to the Disney GitHub Enterprise instance.

### macOS (zsh — default shell)

```bash
echo '' >> ~/.zshrc
echo '# GitHub CLI — Disney GitHub Enterprise' >> ~/.zshrc
echo 'export GH_HOST=github.disney.com' >> ~/.zshrc
```

Apply without restarting Terminal:

```bash
source ~/.zshrc
```

> If you use **bash** instead of zsh, replace `~/.zshrc` with `~/.bashrc` in the commands above.

### Windows

TBD.

---

## 4. Generate a `github.disney.com` Token

You need a Personal Access Token (PAT) so the tools can access internal repositories.

1. Open your browser and go
   to: [https://github.disney.com/settings/tokens](https://github.disney.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. In **Note**, type something descriptive, e.g. `koda-cli`
4. In **Expiration**, pick a duration (90 days is a good default)
5. Check at least these scopes:
    - `read:org`
    - `repo` (full repository access)
6. Click **Generate token**
7. **Copy the token** — it is only shown once

Save the token somewhere safe (e.g. a password manager). You will need it in the next step.

---

## 5. Authenticate with `gh auth login`

This links your terminal session to your `github.disney.com` account.

Run this on both macOS and Windows:

```
gh auth login --hostname github.disney.com
```

When prompted, choose:

```
? What is your preferred protocol for Git operations?  → HTTPS
? How would you like to authenticate GitHub CLI?       → Paste an authentication token
? Paste your authentication token:                     → (paste the token from step 4)
```

Verify:

```
gh auth status --hostname github.disney.com
```

You should see your username and an active token.

---

## 6. Install `kiro-cli`

`kiro-cli` is the agent runtime engine that Koda depends on for chat and agent teams. It is **not**
bundled with Koda — you need to install it separately.

### macOS

```bash
curl -fsSL https://cli.kiro.dev/install | bash
```

### Windows

TBD.

---

## 7. (Optional) Install Kiro IDE

Kiro IDE is the visual editor in the Kiro ecosystem. It is not required to use Koda from the
terminal, but it provides a full graphical experience.

Download from: [https://kiro.dev](https://kiro.dev)

### macOS

Open the `.dmg` file and drag Kiro into **Applications**.

### Windows

TBD.

---

## 8. Install Koda

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash
```

If the terminal tells you to add something to your PATH:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Windows

TBD.

### Verify (both platforms)

```
koda version
```

---

## Getting Started

Once everything is installed, run the initial setup:

```
koda setup              # Checks that all dependencies are present
koda install {profile}  # Installs the development agent profiles
koda mcp-install        # Installs the available mcp servers 
koda                    # Opens the interactive TUI dashboard
```

---

## Quick Reference

| Step               | macOS                                         | Windows |
|--------------------|-----------------------------------------------|---------|
| 1. Package manager | `brew` (install via script)                   |         |
| 2. GitHub CLI      | `brew install gh`                             |         |
| 3. Env vars        | Add `GH_HOST` to `~/.zshrc`                   |         |
| 4. Token           | Generate at github.disney.com/settings/tokens | TBD     |
| 5. Auth            | `gh auth login --hostname github.disney.com`  |         |
| 6. kiro-cli        | `curl` one-liner                              |         |
| 7. Kiro IDE        | `.dmg` installer                              |         |
| 8. Koda            | `curl` one-liner                              |         |

---

## Troubleshooting

**`command not found: brew`** — Close and reopen Terminal after installing Homebrew. If it still
fails, run the "Next steps" commands that Homebrew printed during installation.

**`winget` not recognized** — Install "App Installer" from the Microsoft Store, or update Windows to
the latest version.

**`command not found: gh`** — Make sure the package manager install succeeded, then reopen your
terminal.

**`gh auth login` fails** — Double-check that your token has the `read:org` and `repo` scopes and
has not expired.

**`command not found: koda`** — Add the install directory to your PATH as shown in step 8, then
reopen your terminal.

**`koda setup` shows missing dependencies** — Run `koda setup` and answer `y` to auto-install
whatever is missing.
