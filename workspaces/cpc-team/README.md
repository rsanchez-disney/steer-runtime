# CPC — Core Platform Capabilities

Parent workspace for the CPC vertical. Provides shared context, skills taxonomy, and governance for all CPC domains.

## What's Inherited

All child workspaces get:
- **Profiles**: dev-core, dev-web, dev-mobile, pm, qa
- **Rules**: conventional_commit
- **Workspace path**: `${CPC_WORKSPACE_PATH}` (set via environment variable)

## Domains

| Domain | Description |
|--------|-------------|
| **Mobile Parks Apps** | Native iOS, Android, and Flutter apps for WDW, DLR, HKDL |
| **Web Global Components** | Navigation UI, global nav, search autocomplete, OneID integration |
| **Finders** | Guest Context Service, Discovery Service, Explorer Service, search |
| **Profile / GAC** | TXP Party Profile, GAM Services, Profile Web & Mobile |
| **Shield** | Core app sustainment, crash management, release management |
| **Connected Products** | Big Belly, Native Wallet, IoT integrations |

## Setup

### 1. Set Workspace Path

Add the environment variable pointing to your repositories root folder (e.g., in `~/.zshrc`):

```bash
export CPC_WORKSPACE_PATH=<path-to-repositories-root-folder>
```

### 2. Apply the Workspace

```bash
koda workspace apply cpc-team
```

Or launch the TUI and press `[w]` to select the workspace.

### 3. Configure Tokens

| Token | For |
|-------|-----|
| **Jira PAT** | myjira.disney.com |
| **GitHub PAT** | github.disney.com |

## Workspace Structure

```
workspaces/cpc-team/
├── README.md               ← This file
├── workspace.json          ← Workspace configuration
├── context/
│   ├── team_context.md     ← Team roster, domains, workstreams
│   └── governance.md       ← Standards, Jira hygiene, review processes
└── skills/
    ├── skills.md           ← Human-readable skill inventory
    ├── skills.json         ← Machine-readable taxonomy
    ├── capabilities.md     ← Domain capabilities matrix
    ├── delivery/
    │   └── SKILL.md        ← Delivery workflows, reporting, intake
    ├── technology/
    │   └── SKILL.md        ← Engineering automation, CI/CD, crash analysis
    └── operations/
        └── SKILL.md        ← Capacity, billing summaries, governance
```
