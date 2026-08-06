# Kite + GEAI Quick Start Guide

## What is Kite?

Kite is a desktop chat application for AI-assisted work. It connects to GEAI (Globant Enterprise AI) and gives you access to multiple AI models including GLM-4.6, Claude, GPT, and Gemini.

## Important: Usage policy

GEAI through Kite is intended for **general-purpose questions only**:

- ✅ General knowledge questions
- ✅ Writing assistance (emails, documentation, summaries)
- ✅ Learning and research
- ✅ Brainstorming and ideation
- ✅ Explaining concepts

**Do NOT use for:**

- ❌ Sharing sensitive or confidential information
- ❌ Pasting source code or proprietary code
- ❌ Client data, PII, or internal credentials
- ❌ Security-sensitive queries
- ❌ Anything covered by NDA or client restrictions

The model does not have access to internal systems, code repositories, or client environments. It is a general-purpose AI assistant only.

---

## Step 1: Install Kite

Run from your terminal (macOS, Linux, or Windows):

```bash
koda apps install kite
```

Then launch Kite:

```bash
koda apps start kite
```

---

## Step 2: Get your GEAI API Key

Check your email for a message with subject **"API Keys for Agentic Software Development"** — your API key is included there.

If you can't find the email:

1. Go to **[console.clients.globant.com](https://console.clients.globant.com)**
2. Log in with your Globant account
3. Navigate to **API Keys** (or Profile → API Settings)
4. Generate or copy your API Key (starts with `default__...`)

---

## Step 3: Configure GEAI in Kite

1. Launch Kite
2. Click the **Provider** dropdown in the top bar (shows "Kiro" by default)
3. Click **GEAI** (it will show "GEAI_API_KEY not configured")
4. A key input appears — paste your API key
5. Click **Save**
6. GEAI is now active (the dropdown shows "GEAI" with a globe icon)

---

## Step 4: Select GLM-4.6 model

1. With GEAI active, click the **model name** in the chat area (or type `/model`)
2. Select **globant_dgx/GLM-4.6** from the list
3. Start chatting

---

## Using Kite with GEAI

### Chat

Just type your question in the input area and press Enter. The AI responds inline.

### Switch models

Type `/model` and pick from available options:

| Model | Best for |
|-------|----------|
| `globant_dgx/GLM-4.6` | General questions, fast responses |
| `anthropic/claude-sonnet-4-6` | Complex reasoning, detailed answers |
| `vertex_ai/gemini-3.5-flash` | Quick factual queries |
| `openai/gpt-4o-mini` | Versatile general use |

### Check model availability

Type `/check-models` to see which models have remaining quota.

### Useful commands

| Command | What it does |
|---------|-------------|
| `/model` | Switch AI model |
| `/check-models` | Check which models are available |
| `/clear` | Clear chat history |
| `/help` | Show all commands |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "GEAI_API_KEY not configured" | Follow Step 3 above |
| "Quota exceeded" | Try a different model, or wait for quota reset |
| Blank screen on launch | Update Kite to the latest version (`koda apps update kite`) |
| Model not responding | Check `/check-models` — the model may be out of quota |

---

## Reminder

This tool is for **general-purpose AI assistance only**. Do not share confidential client information, source code, or sensitive data through this interface. The models are hosted externally and conversations may be logged for usage tracking.

For code-related AI assistance with full tool access (Jira, GitHub, file editing), use `koda chat --target geai` in your project workspace instead.
