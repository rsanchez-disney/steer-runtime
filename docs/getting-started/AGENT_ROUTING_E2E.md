# Agent Routing in Kiro IDE — End-to-End Examples

This document shows how the agent routing mechanism works in practice. It covers the one-time
setup and then walks through real delegation scenarios across different profiles.

---

## Prerequisites

Agents are installed globally via Koda:

```bash
koda install dev-core dev-web qa   # or whatever profiles you need
```

This places agent JSONs in `~/.kiro/agents/` and prompts in `~/.kiro/prompts/`.

---

## One-Time Setup: Sync Agents to Steering

Open Kiro IDE in any project and run the sync skill:

**You say:**
> sync my agents

**Kiro does:**
1. Reads every `~/.kiro/agents/*.json`
2. Reads `~/.kiro/settings/profiles.json` to group agents by profile
3. Generates `~/.kiro/steering/70-agent-routing.md` (always-included routing table)
4. Generates `~/.kiro/steering/agent-{name}.md` for each agent (manual-inclusion, full prompt)

**Kiro responds:**
> Synced 42 agents:
> - 42 per-agent steering files created
> - 3 skipped (unchanged)
> - Routing file generated with 42 agents across 7 profiles
>
> The routing table is now always loaded. I can delegate to any specialist agent when your
> request matches their domain.

After this, every new Kiro IDE conversation automatically loads the routing table. No further
setup needed unless you install new profiles.

---

## Example 1: Create a Pull Request (dev-core → pr_creator_agent)

A developer finishes a feature and wants a PR. Without routing, Kiro IDE has no idea
`pr_creator_agent` exists. With routing, it delegates automatically.

**You say:**
> Create a PR for PROJ-4521. The branch is feature/PROJ-4521-add-export-progress targeting
> main. Include the Jira link and list the changed files.

**Kiro thinks:**
> The user wants to create a PR. The routing table maps this to `pr_creator_agent` (trigger
> keywords: PR, pull request, create PR). I'll read its prompt and delegate.

**Kiro does:**
```
readFile("~/.kiro/prompts/pr_creator_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of pr_creator_agent.md>

  Task: Create a PR for PROJ-4521.
  Branch: feature/PROJ-4521-add-export-progress → main
  Include the Jira link and list the changed files.
  """,
  contextFiles: [{ path: "~/.kiro/prompts/pr_creator_agent.md" }]
)
```

**Sub-agent executes:**
- Fetches PROJ-4521 from Jira for the story title and priority
- Runs `git log main..feature/PROJ-4521-add-export-progress --oneline` to get commit list
- Runs `git diff main --stat` to get changed files
- Creates a **draft** PR via GitHub MCP
- Adds labels `feature` and `P1`

**You get:**
> PR created (draft): https://github.example.com/my-org/my-repo/pull/234
>
> **PROJ-4521: Add export progress indicator**
>
> - 6 files changed across `src/service/`, `src/controllers/`, `src/app/export/`
> - Linked to [PROJ-4521](https://jira.example.com/browse/PROJ-4521)
> - Labels: `feature`, `P1`
> - Status: Draft

---

## Example 2: Analyze a Defect (qa → defect_analyst_agent)

**You say:**
> Analyze the bug in PROJ-7823. Users report a 500 error when exporting reports with more
> than 1000 rows.

**Kiro thinks:**
> Keywords "analyze", "bug" match `defect_analyst_agent` (trigger: defect, bug analysis, root
> cause). Delegating.

**Kiro does:**
```
readFile("~/.kiro/prompts/defect_analyst_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of defect_analyst_agent.md>

  Task: Analyze the bug in PROJ-7823. Users report a 500 error when exporting
  reports with more than 1000 rows.
  """
)
```

**Sub-agent executes:**
- Fetches PROJ-7823 from Jira (description, attachments, comments)
- Searches the codebase for export-related code paths
- Identifies the failure point in the pagination logic
- Produces a root cause analysis

**You get:**
> **Root Cause Analysis — PROJ-7823**
>
> **Symptom:** 500 error on export with >1000 rows
>
> **Root Cause:** `ExportService.generateCsv()` loads all rows into memory before writing.
> At ~1000 rows the JVM heap is exhausted, causing an `OutOfMemoryError` caught as a generic
> 500 by the error handler.
>
> **Fix:** Switch to streaming writes using `StreamingResponseBody` — write rows in batches
> of 100 instead of buffering the full result set.
>
> **Affected files:** `ExportService.java` (line 87), `ExportController.java` (line 34)
>
> **Regression risk:** Low — streaming is additive, existing small exports unaffected.

---

## Example 3: Review Code (dev-core → code_review_agent)

**You say:**
> Review the changes in my current branch before I create a PR

**Kiro thinks:**
> "Review" + "changes" matches `code_review_agent` (trigger: review, code review). Delegating.

**Kiro does:**
```
readFile("~/.kiro/prompts/code_review_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of code_review_agent.md>

  Task: Review the changes in the current branch before PR creation.
  Run git diff against main and review for security, quality, performance, and testing issues.
  """
)
```

**Sub-agent executes:**
- Runs `git diff main --stat` to identify changed files
- Reads each changed file
- Checks for security issues, code quality, test coverage
- Produces a structured review

**You get:**
> **Code Review Summary — 8 files changed**
>
> 3 issues found:
>
> 1. **Security** — `src/service/ExportService.java:23`
>    Hardcoded timeout of 30s for the export HTTP client. Consider making this configurable
>    via application properties.
>
> 2. **Quality** — `src/controllers/ExportController.java:45`
>    The `export()` method catches `Exception` broadly. Catch specific exceptions
>    (`IOException`, `TimeoutException`) and return appropriate HTTP status codes.
>
> 3. **Testing** — No tests added for the new `StreamingExportService` class.
>    Coverage will drop below the 90% target.
>
> **Verdict:** Address items 2 and 3 before PR. Item 1 is a suggestion.

---

## Example 4: Generate Test Cases (qa → test_planner_agent)

**You say:**
> Generate test cases for the user authentication feature in PROJ-3310

**Kiro thinks:**
> "Generate test cases" matches `test_planner_agent` (trigger: test plan, test cases).

**Kiro does:**
```
readFile("~/.kiro/prompts/test_planner_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of test_planner_agent.md>

  Task: Generate test cases for the user authentication feature in PROJ-3310.
  """
)
```

**You get:**
> **Test Cases — PROJ-3310: User Authentication**
>
> | ID   | Scenario                                | Type     | Priority |
> |------|-----------------------------------------|----------|----------|
> | TC-1 | Successful login with valid credentials | Happy    | P1       |
> | TC-2 | Login fails with wrong password         | Negative | P1       |
> | TC-3 | Account locked after 5 failed attempts  | Edge     | P1       |
> | TC-4 | Session expires after 30 min inactivity | Edge     | P2       |
> | TC-5 | Password reset via email link           | Happy    | P1       |
> | TC-6 | Login with expired password             | Negative | P2       |
> | TC-7 | Concurrent sessions from two devices    | Edge     | P3       |

---

## Example 5: Plan Implementation (dev-core → planner_agent)

**You say:**
> Plan the implementation for adding push notification deep links to specific pages

**Kiro thinks:**
> "Plan" + "implementation" matches `planner_agent` (trigger: plan, implementation plan).

**Kiro does:**
```
readFile("~/.kiro/prompts/planner_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of planner_agent.md>

  Task: Plan the implementation for adding push notification deep links
  to specific pages in the application.
  """
)
```

**You get:**
> **Implementation Plan — Push Notification Deep Links**
>
> **Tasks:**
>
> 1. **Define deep link schema** (2h)
>    - Add route constants to the routing config
>    - Schema: `myapp://page/{pageId}?tab={tab}`
>
> 2. **Parse notification payload** (3h)
>    - Update the notification handler to extract `deepLink` from the FCM payload
>    - Add a `DeepLinkModel` for type-safe parsing
>
> 3. **Integrate with router** (4h)
>    - Handle deep link routes on cold start and background resume
>    - Add fallback for unknown routes
>
> 4. **Add tests** (3h)
>    - Unit: deep link parsing, route matching
>    - Integration: FCM payload → page navigation
>
> **Dependencies:** Notification payload format must be agreed with the backend team.
>
> **Total estimate:** 12h (~2 story points)

---

## Example 6: Simple Task — No Delegation Needed

Not every request needs delegation. When the routing table shows a match but the task is
straightforward code work that Kiro IDE can handle directly, it skips delegation.

**You say:**
> Add a loading spinner to the export button while the request is in progress

**Kiro thinks:**
> This is a simple UI change. The routing table shows matching agents, but this is a focused
> single-file change — I can handle it directly. No delegation needed.

**Kiro does:** Implements the spinner directly, no sub-agent call.

This is the "when to delegate" judgment from the routing file: delegate when the task benefits
from the specialist's focused prompt and constraints. Simple changes don't need it.

---

## Example 7: Using Manual Agent Steering for Deep Context

For complex tasks where you want the full agent prompt loaded into context (not just delegated),
use the per-agent manual steering files directly.

**You say:**
> #agent-estimation_agent Estimate the effort for migrating our auth service from v2 to v3

The `#agent-estimation_agent` reference loads the full estimation agent prompt (CCV + DRIFT
methodology) into the conversation context. Kiro IDE then uses that methodology directly
rather than delegating to a sub-agent.

This is useful when you want the agent's expertise applied within your current conversation
rather than in an isolated sub-agent execution.

---

## Re-syncing After Profile Changes

When you install or remove profiles:

```bash
koda install pm          # add PM profile
koda remove dev-web      # remove web profile
```

Open Kiro IDE and say:

> sync my agents

The routing table regenerates with the updated agent set. New agents appear, removed agents
disappear.

---

## Troubleshooting

**"I said 'create a PR' but Kiro didn't delegate"**
- Check that `~/.kiro/steering/70-agent-routing.md` exists. If not, run "sync my agents".
- Check that `~/.kiro/prompts/pr_creator_agent.md` exists. If not, run `koda install dev-core`.

**"The sub-agent can't access Jira/GitHub"**
- MCP servers are configured at user level in `~/.kiro/settings/mcp.json`.
- The `general-task-execution` sub-agent inherits the parent's MCP access.
- Verify with: `ls ~/.kiro/settings/mcp.json`

**"I want to see what agents are available"**
- Say: "list my installed agents" — Kiro reads the routing table and lists them.
- Or check directly: `ls ~/.kiro/agents/`

**"Delegation is slow for simple tasks"**
- The routing file includes guidance to handle simple tasks directly.
- Delegation adds overhead (reading prompt file, spawning sub-agent).
- For quick questions, Kiro should answer directly using its steering context.
