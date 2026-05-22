# Getting Started

First-time setup guide for Disney Payments team members.

---

## 1. Request Access

- Visit: <https://developer.disney.com/ai-tools>
- Request access to **AmazonQ (Kiro)**
- Wait for approval (typically 1-2 business days)

## 2. Download Kiro

- Visit: <https://kiro.dev/downloads/>
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

## 5. Install Tools & Agents

Follow the platform-specific setup guide to install Koda, GitHub CLI, kiro-cli, and agent profiles:

- **macOS / Linux:** [Setup Guide](SETUP.md)
- **Windows:** [Windows Setup Guide](WINDOWS_SETUP.md)

---

## 6. Add a Project Manifest (optional)

Drop a `project.yaml` in your project root so agents know your stack, commands, and integrations:

```bash
cp ~/steer-runtime/common/templates/project.yaml ~/my-project/project.yaml
# Edit with your project's details
```

See [project.yaml reference](../reference/REFERENCE.md#project-manifest-projectyaml) for all fields. Agents work without it (they fall back to memory banks), but it's the fastest way to get accurate results.

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

Back to [README](../index.md)
