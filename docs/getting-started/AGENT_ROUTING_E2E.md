# Agent Routing in Kiro IDE — End-to-End Examples

This document shows how the agent routing mechanism works in practice. It covers the one-time
setup and then walks through real delegation scenarios across different profiles.

---

## Prerequisites

Complete the one-time setup described in [Kiro IDE Agent Setup][ide-setup]:

```bash
koda install dev-core dev-web qa   # Install profiles
koda kiro-ide install              # Generate steering files, skills, and hooks
```

After this, Kiro IDE can delegate to specialist agents on demand using natural phrases like
"use sub agent for" or "delegate to". No further setup needed unless you install new profiles
(then run `koda kiro-ide sync`).

> **Note:** The examples below show delegation with the default Kiro IDE agent, which requires
> trigger phrases to load the routing table on demand. If you are using the **orchestrator
> agent** (via `kiro-cli` or the orchestrator steering file), it has its own intent
> classification and delegates based on task semantics — no trigger phrases needed. See
> [Example 8](#example-8-implicit-delegation-with-the-orchestrator) for that flow.

[ide-setup]: KIRO_IDE_AGENT_SETUP.md

---

## Example 1: Create a Pull Request (dev-core → pr_creator_agent)

A developer finishes a feature and wants a PR. The phrase "delegate to" triggers the agent to
load the routing table and find the right specialist.

**You say:**
> Delegate to the PR agent for PROJ-4521. The branch is
> feature/PROJ-4521-add-export-progress targeting main. Include the Jira link and list the
> changed files.

**Kiro thinks:**
> The user said "delegate to" — loading the routing table. The PR agent maps to
> `pr_creator_agent`. I'll read its prompt and delegate.

**Kiro does:**
```
readFile("~/.kiro/steering/70-agent-routing.md")   # Load routing table
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
> Use sub agent for analyzing the bug in PROJ-7823. Users report a 500 error when exporting
> reports with more than 1000 rows.

**Kiro thinks:**
> The user said "use sub agent for" — loading the routing table. "Analyze" + "bug" maps to
> `defect_analyst_agent`. Delegating.

**Kiro does:**
```
readFile("~/.kiro/steering/70-agent-routing.md")   # Load routing table
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
> Ask the code review agent to review the changes in my current branch before I create a PR

**Kiro thinks:**
> The user said "ask the … agent" — loading the routing table. `code_review_agent` matches.
> Delegating.

**Kiro does:**
```
readFile("~/.kiro/steering/70-agent-routing.md")   # Load routing table
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
> Delegate to the test planner agent to generate test cases for the user authentication
> feature in PROJ-3310

**Kiro thinks:**
> The user said "delegate to" — loading the routing table. `test_planner_agent` matches.

**Kiro does:**
```
readFile("~/.kiro/steering/70-agent-routing.md")   # Load routing table
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
> Use sub agent for planning the implementation for adding push notification deep links to
> specific pages

**Kiro thinks:**
> The user said "use sub agent for" — loading the routing table. `planner_agent` matches.

**Kiro does:**
```
readFile("~/.kiro/steering/70-agent-routing.md")   # Load routing table
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

Not every request needs delegation. When the user doesn't use a delegation phrase, Kiro handles
the task directly without loading the routing table.

**You say:**
> Add a loading spinner to the export button while the request is in progress

**Kiro thinks:**
> No delegation phrase detected. This is a simple UI change — I can handle it directly.

**Kiro does:** Implements the spinner directly, no sub-agent call. The routing table is never
loaded, keeping the context lean.

Reserve delegation for tasks that benefit from the specialist's focused prompt and constraints.
Simple changes don't need it.

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

## Example 8: Implicit Delegation with the Orchestrator

When the orchestrator agent is active, it has its own intent classification and the routing
table is part of its resources. No trigger phrases are needed — the orchestrator delegates
based on task semantics.

**You say:**
> Create a PR for PROJ-4521. The branch is feature/PROJ-4521-add-export-progress targeting
> main. Include the Jira link and list the changed files.

**Orchestrator thinks:**
> The user wants to create a PR. This matches `pr_creator_agent` in my agent registry.
> Delegating.

**Orchestrator does:**
```
readFile("~/.kiro/prompts/pr_creator_agent.md")

invokeSubAgent(
  name: "general-task-execution",
  prompt: """
  <content of pr_creator_agent.md>

  Task: Create a PR for PROJ-4521.
  Branch: feature/PROJ-4521-add-export-progress → main
  Include the Jira link and list the changed files.
  """
)
```

This is the same delegation flow as Example 1, but without the trigger phrase. The
orchestrator's intent classification handles the routing automatically because it always has
the agent registry in context.

> **When to use which:** If you have the orchestrator active, just describe what you need
> naturally. If you're using the default Kiro IDE agent, use a trigger phrase like "delegate
> to" or "use sub agent for" to activate on-demand routing.

---

## Re-syncing After Profile Changes

When you install or remove profiles:

```bash
koda install pm          # add PM profile
koda remove dev-web      # remove web profile
koda kiro-ide sync       # regenerate steering files
```

Or from inside Kiro IDE, say "sync my agents" to regenerate the routing table.

---

## Troubleshooting

**"I said 'delegate to the PR agent' but Kiro didn't delegate"**
- Check that `~/.kiro/steering/70-agent-routing.md` exists. If not, run `koda kiro-ide install`.
- Verify the `agent-delegation-trigger.md` rule is present in your rules.
- Try using a trigger phrase: "use sub agent for creating a PR" or "delegate to the PR agent".
- Check that `~/.kiro/prompts/pr_creator_agent.md` exists. If not, run `koda install dev-core`.

**"The sub-agent can't access Jira/GitHub"**
- MCP servers are configured at user level in `~/.kiro/settings/mcp.json`.
- The `general-task-execution` sub-agent inherits the parent's MCP access.
- Verify with: `ls ~/.kiro/settings/mcp.json`

**"I want to see what agents are available"**
- Say: "use sub agent for listing my installed agents" — Kiro reads the routing table on demand.
- Or load it manually: type `#70-agent-routing` in chat.
- Or check directly: `ls ~/.kiro/agents/`

**"Delegation is slow for simple tasks"**
- The routing file includes guidance to handle simple tasks directly.
- Delegation adds overhead (reading prompt file, spawning sub-agent).
- For quick questions, Kiro should answer directly using its steering context.
