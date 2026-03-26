# Getting Started

First-time setup guide for Disney Payments team members.

---

## 1. Request Access

- Visit: https://developer.disney.com/ai-tools
- Request access to **AmazonQ (Kiro)**
- Wait for approval (typically 1-2 business days)

## 2. Download Kiro

- Visit: https://kiro.dev/downloads/
- Download for your operating system

## 3. Sign in with Disney SSO

1. Click "Sign in with your organization identity"
2. Select region: **us-east-1**
3. Input Start URL: `https://twdc-qdeveloper.awsapps.com/start`
4. Sign in using your **@disney.com** email address
5. Click "Allow" to grant Kiro IDE access

## 4. Verify Kiro

```bash
kiro-cli --version
```

---

## 5. Install Koda (recommended)

Koda is the interactive terminal companion for steer-runtime. It replaces `setup.sh` with a cross-platform binary.

**macOS / Linux:**
```bash
cd ~/steer-runtime && bash tools/install-koda.sh
```

**Windows (PowerShell):**
```powershell
cd ~\steer-runtime; .\tools\install-koda.ps1
```

Verify:
```bash
koda version
```

---

## 6. Install Agent Profiles

```bash
koda setup                        # Check & install dependencies (node, git, kiro-cli)
koda install dev                  # Install all dev agents
koda mcp-install                  # Setup MCP servers + tokens
```

Or use the interactive dashboard:
```bash
koda                              # Launch TUI — press [p] for profiles, [t] for tokens
```

---

## 7. Start Chatting

```bash
koda chat                         # Chat with last-used agent
koda chat --agent orchestrator    # Dev orchestrator
koda chat --agent qa_orchestrator_agent  # QA orchestrator
koda chat --agent ba_orchestrator_agent  # BA orchestrator
```

Or use Kiro CLI directly:
```bash
kiro-cli chat --agent orchestrator
```

---

## 8. Join a Team Workspace (optional)

```bash
koda workspace list               # See available team configs
koda workspace apply payments-core  # Apply your team's config
```

This installs the right profiles, rules, and memory banks for your team in one command.

---

## 9. Enable Advanced Tools (optional)

```bash
koda enable-tools
```

Enables **thinking**, **todo**, and **knowledge** tools used by orchestrators.

---

## GitHub CLI (optional, recommended)

```bash
brew install gh                          # macOS
gh auth login --hostname github.disney.com
```

Enables PR creation and repo management from agents.

---

## Alternative: setup.sh

If you prefer bash over Koda:

```bash
git clone <repo-url> ~/steer-runtime
cd ~/steer-runtime
./setup.sh install dev
./setup.sh mcp-install
```

> 🪟 Windows users: see [Windows Setup](WINDOWS_SETUP.md)

---

Return to the [README](../README.md) for more.
