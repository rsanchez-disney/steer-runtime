# Plan: Add dev-backoffice Profile to pos-team Workspace

## Target Location
```
steer-runtime/workspaces/pos-team/profiles/dev-backoffice/
```

## Directory Structure

```
pos-team/
├── profiles/
│   ├── dev-mobile/                    ← existing (Android/ActivateX)
│   └── dev-backoffice/                ← NEW
│       ├── README.md
│       ├── agents/
│       │   ├── pos_backoffice_orchestrator.json
│       │   ├── pos_php_agent.json
│       │   ├── pos_go_agent.json
│       │   ├── pos_react_agent.json
│       │   ├── pos_planner_agent.json
│       │   ├── pos_architecture_agent.json
│       │   ├── pos_test_runner_agent.json
│       │   ├── pos_work_documenter_agent.json
│       │   ├── pos_story_analyzer_agent.json
│       │   ├── pos_codebase_explorer_agent.json
│       │   ├── pos_code_review_agent.json
│       │   └── pos_security_scanner_agent.json
│       └── prompts/
│           ├── pos_backoffice_orchestrator.md
│           ├── pos_php_agent.md
│           ├── pos_go_agent.md
│           ├── pos_react_agent.md
│           ├── pos_planner_agent.md
│           ├── pos_architecture_agent.md
│           ├── pos_test_runner_agent.md
│           ├── pos_work_documenter_agent.md
│           ├── pos_story_analyzer_agent.md
│           ├── pos_codebase_explorer_agent.md
│           ├── pos_code_review_agent.md
│           └── pos_security_scanner_agent.md
├── context/
│   ├── ... existing Android files (untouched) ...
│   ├── backoffice_golden_rules.md     ← NEW (copy of ~/.kiro/context/golden_rules.md)
│   ├── security_golden_rules.md       ← NEW (copy of ~/.kiro/context/security_golden_rules.md)
│   ├── backoffice_sdlc_workflow.md    ← NEW (copy of ~/.kiro/context/backoffice-sdlc-workflow.md)
│   └── project_mappings.md            ← NEW (copy of ~/.kiro/context/project_mappings.md)
└── workspace.json                     ← UPDATE
```

## Task 1: Create Directories

```bash
mkdir -p steer-runtime/workspaces/pos-team/profiles/dev-backoffice/{agents,prompts}
```

## Task 2: Copy Agent JSONs

Source: `~/.kiro/agents/pos_*.json`

**Modifications applied during copy:**
- Hooks: `/Users/juan.ocaranza/.kiro/hooks/` → `$HOME/.kiro/hooks/`
- Everything else stays the same (prompt paths, resources, tools)

| File | Has hooks to update? |
|------|---------------------|
| `pos_backoffice_orchestrator.json` | Yes (agentSpawn, stop) |
| `pos_php_agent.json` | Yes (preToolUse, postToolUse) |
| `pos_go_agent.json` | Yes (preToolUse, postToolUse) |
| `pos_react_agent.json` | Yes (preToolUse, postToolUse) |
| `pos_planner_agent.json` | No hooks |
| `pos_architecture_agent.json` | No hooks |
| `pos_test_runner_agent.json` | No hooks |
| `pos_work_documenter_agent.json` | No hooks |
| `pos_story_analyzer_agent.json` | No hooks |
| `pos_codebase_explorer_agent.json` | No hooks |
| `pos_code_review_agent.json` | No hooks |
| `pos_security_scanner_agent.json` | No hooks |

## Task 3: Copy Prompts

Source: `~/.kiro/prompts/pos_*.md`

**No modifications** — copied as-is.

## Task 4: Add Context Files

| Destination (in `pos-team/context/`) | Source |
|--------------------------------------|--------|
| `backoffice_golden_rules.md` | `~/.kiro/context/golden_rules.md` |
| `security_golden_rules.md` | `~/.kiro/context/security_golden_rules.md` |
| `backoffice_sdlc_workflow.md` | `~/.kiro/context/backoffice-sdlc-workflow.md` |
| `project_mappings.md` | `~/.kiro/context/project_mappings.md` |

**No modifications** — copied as-is.

## Task 5: Update workspace.json

Add `"dev-backoffice"` to profiles array and add Connect projects:

```json
{
  "name": "pos-team",
  "description": "ActivateX (DSP Go & Check-Sync) and DSP Back Office (Connect) — Disney POS platform",
  "team": "POS Team",
  "profiles": [
    "dev-core",
    "dev-mobile",
    "dev-backoffice",
    "ba",
    "pm"
  ],
  "default_agent": "android_arch_agent",
  "projects": [
    {
      "name": "activatex",
      "path": "activatex",
      "repo": "DisneyPaymentsOrg/activatex",
      "host": "github.disney.com"
    },
    {
      "name": "connect",
      "path": "connect",
      "repo": "DisneyPaymentsOrg/connect",
      "host": "github.disney.com"
    },
    {
      "name": "connect-frontend",
      "path": "connect-frontend",
      "repo": "DisneyPaymentsOrg/connect-frontend",
      "host": "github.disney.com"
    }
  ],
  "rules": [
    "conventional_commit"
  ],
  "enable_tools": true,
  "jira_prefix": "POS-",
  "workspace_path": "~/Development"
}
```

## Task 6: Create README.md

Profile documentation with agent table, workflow diagram, and quick start.

---

## What is NOT touched

- `profiles/dev-mobile/` — no changes
- `context/team_context.md` — Android-specific, untouched
- `context/golden_rules.md` — Android-specific, untouched (backoffice gets its own)
- `context/testing_conventions.md` — Android-specific, untouched
- Other existing context files — untouched
