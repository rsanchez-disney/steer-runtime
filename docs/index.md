# steer-runtime

AI agents for your entire team — devs, BAs, QA, ops, and PMs — running in any IDE.

**55+ agents, 9 profiles, one setup.** Define your standards once, run them everywhere.

!!! info "Requires an Amazon Q Developer license for Kiro CLI access."

---

## Quick start

### 1. Install Koda

=== "macOS / Linux"

    ```bash
    curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash
    ```

=== "Windows (PowerShell)"

    ```powershell
    irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex
    ```

### 2. Run setup

```bash
koda setup
```

### 3. Verify

```bash
koda doctor
```

### 4. Install profiles

Install only the profiles that match your role:

| Your Role                    | Command                            |
|------------------------------|------------------------------------|
| Developer                    | `koda install dev`                 |
| Fullstack Developer          | `koda install dev qa`              |
| .NET Developer               | `koda install dev dev-dotnet`      |
| Business Analyst / PO        | `koda install ba`                  |
| QA Engineer                  | `koda install qa dev-core`         |
| Ops / SRE                    | `koda install ops dev-core`        |
| Project Manager / Scrum Master | `koda install pm`                |
| Tech Director                | `koda install leadership`          |

### 5. Start chatting

```bash
koda chat                           # Default agent
koda chat --agent orchestrator      # Dev orchestrator
```

---

## Available profiles

| Profile        | Agents | Description                                              |
|----------------|:------:|----------------------------------------------------------|
| **dev-core**   |   21   | Code, review, test, security, PRs, architecture          |
| **dev-web**    |    5   | Angular UI, Node gateway, Astro SSR, UX, backend         |
| **dev-mobile** |    3   | Flutter, Android, iOS                                    |
| **ba**         |    8   | Requirements, scope, stories, PRDs, estimation           |
| **qa**         |   16   | Test planning, automation, defect analysis, coverage     |
| **ops**        |    9   | Infra, deployments, log analysis, releases               |
| **pm**         |    6   | Sprints, standups, retros, delivery reports              |
| **leadership** |    5   | Cross-studio analytics, quarterly reports, briefings     |

---

## Learn more

- [Getting Started](getting-started/GETTING_STARTED.md) — First-time setup
- [Architecture](architecture/ARCHITECTURE.md) — System design
- [MCP Setup](reference/MCP_SETUP.md) — Tokens and MCP servers
- [Team Workspaces](reference/TEAM_WORKSPACES.md) — Workspace hierarchy
- [Glossary](reference/GLOSSARY.md) — Terms and definitions
