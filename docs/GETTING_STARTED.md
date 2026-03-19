# Getting Started with Kiro

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

## 4. Verify Installation

```bash
kiro-cli --version
```

You should now be able to use Kiro CLI and Kiro UI.

---


## 5. Install GitHub CLI (optional, recommended)

```bash
brew install gh                          # macOS
gh auth login --hostname github.disney.com
```

Select HTTPS, authenticate via browser. This enables PR creation and repo management from agents.

## 6. Enable Advanced Tools (optional)

After installing profiles, enable advanced kiro-cli features used by orchestrators and planning agents:

```bash
./setup.sh enable-tools
```

This enables:
- **thinking** — step-by-step reasoning for complex decisions
- **todo** — persistent task tracking across sessions
- **knowledge** — long-term semantic memory across conversations

Agents degrade gracefully if these aren't enabled — they just won't have access to those tools.

## Next Steps

Return to the [README](../README.md) to install agent profiles.
