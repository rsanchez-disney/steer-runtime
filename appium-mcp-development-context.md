# Appium MCP + Mobile Test Executor Agent — Development Context

> Technical reference for building the Appium MCP server and mobile_test_executor_agent. Use this as the base context when starting development.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Appium MCP Server Spec](#appium-mcp-server-spec)
3. [Agent Spec](#agent-spec)
4. [Discovery Strategy](#discovery-strategy)
5. [Integration Points](#integration-points)
6. [Test Cases for Pilot](#test-cases-for-pilot)
7. [Technical Decisions](#technical-decisions)
8. [Development Phases](#development-phases)

---

## Architecture Overview

```
User: "Execute test cases for PAS2-17"
  │
  ▼
mobile_test_executor_agent
  │
  ├── jira-mcp: jira_get_issue("PAS2-649") + xray_cloud_get_test_steps("PAS2-649")
  │   → Returns test case + structured steps
  │
  ├── appium-mcp: appium_create_session({caps})
  │   → Connects to device
  │
  ├── For each Gherkin step:
  │   ├── appium_get_page_source() → Analyze UI tree
  │   ├── appium_find_element()    → Locate target
  │   ├── appium_tap() / type()    → Execute action
  │   └── appium_screenshot()      → Capture evidence
  │
  ├── xray_cloud_create_execution() + xray_cloud_update_run()
  │   → Reports results back to XRay Cloud
  │
  └── Report: PASS/FAIL with screenshots + XRay execution key
```

---

## Appium MCP Server Spec

### Technology Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Language | TypeScript | Same as jira-mcp, team familiarity |
| Build | esbuild → single `index.cjs` | Same pattern as other MCP servers |
| Protocol | MCP (stdio) | Standard for Kiro tools |
| Appium Client | HTTP calls to Appium REST API | No extra dependencies, full control |
| Appium Protocol | W3C WebDriver | Standard, supported by Appium 2.x |

### Server Configuration

```json
{
  "appium-mcp": {
    "command": "node",
    "args": ["~/.kiro/tools/mcp-servers/appium-mcp/dist/index.cjs"],
    "env": {
      "APPIUM_URL": "http://localhost:4723",
      "DEFAULT_PLATFORM": "ios",
      "SCREENSHOT_DIR": "/tmp/appium-screenshots"
    }
  }
}
```

### Tools Definition

#### Session Management

```typescript
// appium_create_session
{
  name: "appium_create_session",
  description: "Create a new Appium session on a connected device",
  params: {
    platformName: "iOS" | "Android",       // required
    deviceName: string,                     // e.g., "iPhone 15" or device UDID
    app: string,                            // optional: path to .app/.apk or bundle ID
    bundleId: string,                       // iOS bundle ID (if app already installed)
    appPackage: string,                     // Android package (if app already installed)
    appActivity: string,                    // Android activity
    automationName: "XCUITest" | "UiAutomator2",  // auto-detected from platform
    noReset: boolean                        // default: true (don't reinstall app)
  },
  returns: { sessionId: string, capabilities: object }
}

// appium_end_session
{
  name: "appium_end_session",
  params: {},
  returns: { success: boolean }
}

// appium_get_session_info
{
  name: "appium_get_session_info",
  params: {},
  returns: { sessionId, platform, device, app }
}
```

#### Element Discovery

```typescript
// appium_get_page_source
{
  name: "appium_get_page_source",
  description: "Get the full UI tree as XML. Use for element discovery.",
  params: {
    format: "xml" | "json"   // default: xml
  },
  returns: { source: string }
}

// appium_find_element
{
  name: "appium_find_element",
  description: "Find a single element on screen",
  params: {
    strategy: "accessibility id" | "id" | "xpath" | "class name" | "-ios predicate string" | "-android uiautomator",
    value: string
  },
  returns: { elementId: string, type: string, label: string, visible: boolean }
}

// appium_find_elements
{
  name: "appium_find_elements",
  description: "Find multiple elements matching criteria",
  params: {
    strategy: string,
    value: string
  },
  returns: { elements: Array<{elementId, type, label, visible}> }
}
```

#### Actions

```typescript
// appium_tap
{
  name: "appium_tap",
  description: "Tap on an element",
  params: {
    elementId: string,       // from find_element
    // OR find inline:
    strategy: string,
    value: string
  }
}

// appium_type
{
  name: "appium_type",
  description: "Type text into a field",
  params: {
    elementId: string,
    text: string,
    clear: boolean           // clear field before typing (default: true)
  }
}

// appium_swipe
{
  name: "appium_swipe",
  description: "Swipe in a direction",
  params: {
    direction: "up" | "down" | "left" | "right",
    duration: number,        // ms, default: 800
    elementId: string        // optional: swipe within element bounds
  }
}

// appium_back
{
  name: "appium_back",
  description: "Press the back/navigation button"
}

// appium_long_press
{
  name: "appium_long_press",
  params: { elementId: string, duration: number }
}
```

#### Verification

```typescript
// appium_screenshot
{
  name: "appium_screenshot",
  description: "Take a screenshot of the current screen",
  params: {
    filename: string         // optional: custom filename
  },
  returns: { path: string, base64: string }
}

// appium_get_element_attribute
{
  name: "appium_get_element_attribute",
  params: { elementId: string, attribute: string },
  returns: { value: string }
}

// appium_is_element_displayed
{
  name: "appium_is_element_displayed",
  params: { elementId: string },
  returns: { displayed: boolean }
}
```

#### Waits

```typescript
// appium_wait_for_element
{
  name: "appium_wait_for_element",
  description: "Wait until an element appears on screen",
  params: {
    strategy: string,
    value: string,
    timeout: number          // ms, default: 10000
  },
  returns: { found: boolean, elementId: string }
}
```

### Appium REST API Reference

Base URL: `http://localhost:4723`

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create session | POST | `/session` |
| Delete session | DELETE | `/session/{id}` |
| Get page source | GET | `/session/{id}/source` |
| Find element | POST | `/session/{id}/element` |
| Find elements | POST | `/session/{id}/elements` |
| Click element | POST | `/session/{id}/element/{eid}/click` |
| Send keys | POST | `/session/{id}/element/{eid}/value` |
| Get attribute | GET | `/session/{id}/element/{eid}/attribute/{name}` |
| Screenshot | GET | `/session/{id}/screenshot` |
| Back | POST | `/session/{id}/back` |
| Execute script | POST | `/session/{id}/execute` |

### W3C Capabilities Examples

**iOS (Flutter app via TestFairy):**
```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15",
  "appium:udid": "auto",
  "appium:bundleId": "com.disney.wdpro.dlr",
  "appium:noReset": true
}
```

**Android (Flutter app via TestFairy):**
```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "auto",
  "appium:appPackage": "com.disney.wdpro.dlr",
  "appium:appActivity": "com.disney.wdpro.dlr.MainActivity",
  "appium:noReset": true
}
```

---

## Agent Spec

### Reference: `web_discovery_agent` (same profile, use as structural base)

The `web_discovery_agent` in `profiles/qa/` does for web what our agent does for mobile — discovers testable elements and maps interactions. Use its file structure and JSON config pattern as a base:
- Config: `profiles/qa/agents/web_discovery_agent.json`
- Prompt: `profiles/qa/prompts/web_discovery_agent.md`

Key differences from web_discovery_agent:
- Our agent **executes** on real devices (not just analyzes source code)
- Our agent needs MCP access (`@appium/*`, `@jira/*`) + `includeMcpJson: true`
- Our agent has a much more detailed prompt (discovery, error handling, reporting)

### Agent: `mobile_test_executor_agent`

**File:** `profiles/qa/agents/mobile_test_executor_agent.json`

```json
{
  "name": "mobile_test_executor_agent",
  "description": "Executes XRay Gherkin test cases on real devices via Appium MCP",
  "allowedTools": [
    "@appium-mcp/*",
    "@jira/*"
  ],
  "model": "auto"
}
```

### Full Agent Prompt (`profiles/qa/prompts/mobile_test_executor_agent.md`)

```markdown
# Mobile Test Executor Agent

## Identity

- **Name:** Mobile Test Executor Agent
- **Profile:** qa
- **Role:** Executes XRay Gherkin test cases on real mobile devices via Appium MCP without pre-written automation code.

## Rules

- ALWAYS call appium_get_page_source() before attempting to find elements on a new screen
- NEVER assume element locations — always discover dynamically
- NEVER abort an entire test on a single step failure — complete all steps
- Take a screenshot AFTER each verification (Then) step
- For Scenario Outline tests, execute ALL iterations even if one fails
- Report results in the structured format defined below
- If an element is not found after retry, mark the step as FAIL and continue

## Capabilities

- Read Gherkin test cases from XRay via jira-mcp
- Connect to real devices (iOS/Android) via Appium MCP
- Interpret Given/When/Then steps and map them to device actions
- Discover UI elements dynamically from the accessibility tree
- Handle Scenario Outlines by iterating through Examples tables
- Take screenshots as evidence at verification points
- Report structured PASS/FAIL results per step and per iteration

## Workflow

1. **Receive input**: Story key (e.g., PAS2-17) or Test Case key (e.g., PAS2-649)
2. **Fetch test cases**: Use xray_get_test_case_full() or xray_search_test_cases()
3. **Parse Gherkin**: Extract steps from customfield_20102. If Scenario Outline, parse Examples table.
4. **Create session**: Use appium_create_session() with platform capabilities
5. **Execute each step**:
   a. Read current screen: appium_get_page_source()
   b. Identify target element based on step text
   c. Execute action: appium_tap() / appium_type() / appium_swipe()
   d. For Then steps: verify condition and take screenshot
6. **Handle iterations**: For Scenario Outline, repeat steps 5a-5d for each Examples row
7. **Report results**: Output structured report with per-step and per-iteration results

## Discovery Strategy

When a step says "tap Upload Photo CTA" or "verify placeholder is displayed":

1. Call appium_get_page_source() to get the UI tree
2. Search the tree for elements matching the step text:
   - Priority 1: accessibility ID containing relevant keywords
   - Priority 2: visible text matching the step
   - Priority 3: widget type + position analysis
3. If found → execute action
4. If not found → wait 2s → retry get_page_source() → search again
5. If still not found → screenshot → mark FAIL → continue

## Gherkin Step Interpretation

Map step keywords to Appium actions:

| Gherkin pattern | Appium action |
|----------------|---------------|
| "navigate to {screen}" | Find and tap navigation element for that screen |
| "tap on {element}" | appium_find_element() → appium_tap() |
| "views {screen/element}" | Verify element/screen is visible via page source |
| "enters {text}" | appium_find_element(input) → appium_type(text) |
| "swipes {direction}" | appium_swipe(direction) |
| "is displayed" / "is present" | appium_is_element_displayed() → assert true |
| "is not displayed" / "not present" | appium_is_element_displayed() → assert false |
| "is disabled" / "greyed out" | appium_get_element_attribute("enabled") → assert false |

## Error Recovery

| Situation | Action |
|-----------|--------|
| Element not found | Screenshot → wait 2s → retry → if still fail → FAIL step → continue |
| Unexpected dialog/popup | Try dismiss (back or tap outside) → retry action |
| App crash (empty page source) | Report → try appium_launch_app() → if recovered, continue |
| Loading spinner | Wait up to 15s for disappearance → then proceed |

## Scenario Outline Execution

1. Parse Examples table from Gherkin text (after "Examples:" keyword)
2. For each row:
   - Replace all `<placeholder>` in steps with row values
   - Execute substituted steps
   - Record PASS/FAIL for this iteration
3. Continue all iterations regardless of individual failures
4. Overall status: PASS only if ALL iterations pass

## Output Format

After execution, output this report:

### Single Scenario:
```
## Test Execution Report
**Test Case:** {KEY}
**Title:** {title}
**Device:** {device name} ({platform} {version})
**Date:** {timestamp}

| # | Step | Status | Evidence |
|---|------|--------|----------|
| 1 | {step text} | ✅ PASS / ❌ FAIL | {screenshot filename} |

**Overall: ✅ PASS / ❌ FAIL**
```

### Scenario Outline:
```
## Test Execution Report
**Test Case:** {KEY}
**Title:** {title}
**Type:** Scenario Outline ({N} iterations)

| Iteration | Parameters | Status |
|-----------|-----------|--------|
| 1 | param=value | ✅ PASS |
| 2 | param=value | ❌ FAIL |

**Overall: {passed}/{total} iterations passed → ✅ PASS / ❌ FAIL**

### Failures:
- Iteration {N}, Step {M}: {failure reason}
```
```
4. Report final PASS/FAIL with summary of each step

## Discovery Strategy

When looking for an element:
1. First try accessibility ID matching the logical name
2. If not found, search by visible text
3. If not found, analyze the page source XML for matching widgets
4. If still not found, take a screenshot and report the element was not located

## Scenario Outline Handling

When the test case is a Scenario Outline with Examples table:
1. Parse the Examples table from the Gherkin (customfield_20102)
2. For each row in the Examples table:
   a. Substitute placeholders (<paramName>) with the row values
   b. Execute all steps with the substituted values
   c. Report PASS/FAIL per iteration
3. The overall test PASSES only if ALL iterations pass
4. If one iteration fails, continue with remaining iterations

Example:
```
Scenario Outline: Photo display based on photo state
  Given the photo readback feature is toggled ON
  And the entitlement has "<photoState>"
  When the guest views the entitlement in Tickets and Passes
  Then "<expected>" on the entitlement brick

Examples:
| photoState       | expected                           |
| no photo linked  | A generic placeholder is displayed |
| photo linked     | The guest photo is displayed       |
```

Agent execution:
- Iteration 1: photoState="no photo linked", expected="A generic placeholder is displayed"
- Iteration 2: photoState="photo linked", expected="The guest photo is displayed"
- Report: "Iteration 1: PASS | Iteration 2: PASS → Overall: PASS"

## Error Handling & Recovery

| Situation | Action |
|-----------|--------|
| Element not found after discovery | Take screenshot → mark step FAIL → continue next step |
| Element found but not tappable | Wait 2s → retry once → if still fails, mark FAIL |
| App crash detected (no page source) | Report FAIL → attempt relaunch → if recovered, continue |
| Unexpected dialog/popup | Dismiss it (tap outside or back) → retry original action |
| Loading state (spinner visible) | Wait up to 15s for it to disappear → then proceed |
| Step ambiguous (multiple matching elements) | Pick the most visible/prominent one → log which was selected |
| Timeout waiting for element | After 10s → mark step FAIL → screenshot → continue |

Recovery flow:
```
try action → 
  fail? → screenshot → wait 2s → retry once →
    still fail? → mark FAIL → continue next step
```

NEVER abort the entire test on a single step failure. Always complete all steps and report which passed/failed.

## Screenshots Strategy

| When to screenshot | Purpose |
|-------------------|---------|
| After each THEN step (verification) | Evidence of pass/fail |
| When element not found | Debug: what's on screen |
| After navigation (new screen loaded) | Confirm correct screen |
| On step failure | Evidence of failure state |

Screenshot naming: `{test_key}_{step_number}_{status}_{timestamp}.png`

Example: `PAS2-649_step3_PASS_20260617T143022.png`

Storage: `/tmp/appium-screenshots/{test_key}/`

## Reporting Format

After executing a test case, the agent must output a structured report:

```
## Test Execution Report

**Test Case:** PAS2-649
**Title:** Photo display based on photo state
**Device:** iPhone 15 (iOS 18.0)
**Date:** 2026-06-17 14:30

### Results

| # | Step | Status | Screenshot |
|---|------|--------|-----------|
| 1 | Given the photo readback feature is toggled ON | ✅ PASS | step1_PASS.png |
| 2 | And the entitlement has "no photo linked" | ✅ PASS | step2_PASS.png |
| 3 | When the guest views the entitlement in T&P | ✅ PASS | step3_PASS.png |
| 4 | Then "A generic placeholder is displayed" | ✅ PASS | step4_PASS.png |

### Scenario Outline Iterations (if applicable)

| Iteration | Parameters | Status |
|-----------|-----------|--------|
| 1 | photoState=no photo linked | ✅ PASS |
| 2 | photoState=photo linked | ✅ PASS |
| 3 | photoState=photo replaced | ❌ FAIL (element not found) |
| 4 | photoState=photo deleted | ✅ PASS |

### Overall: ❌ FAIL (3/4 iterations passed)

### Failures Detail
- Iteration 3, Step 4: Expected "The new photo is displayed" but element not found on screen
  - Screenshot: PAS2-649_iter3_step4_FAIL.png
```

## Rules
- ALWAYS call get_page_source() before attempting to find elements
- NEVER assume element locations — always discover dynamically
- Take a screenshot AFTER each verification step
- If a step fails, continue executing remaining steps but mark the test as FAIL
- Report results in a structured format with step-by-step outcomes
- For Scenario Outline: execute ALL iterations, report per-iteration results
- Use Jira wiki format if posting results as a comment on the test execution
```

---

## Discovery Strategy

### Hybrid Approach: Dynamic Discovery + Cached Locators

```
Step: "When the guest taps on Upload Photo CTA"

1. Check cache → locator_cache.get("Upload Photo CTA")
   ├── Found → try appium_find_element(cached_strategy, cached_value)
   │   ├── Success → use it
   │   └── Fail → go to step 2 (cache stale)
   │
   └── Not found → go to step 2

2. Discovery:
   a. appium_get_page_source() → XML tree
   b. Analyze XML for:
      - accessibilityId containing "upload" or "photo"
      - text matching "Upload Photo"
      - button/CTA type elements with relevant labels
   c. Select best match
   d. Cache: locator_cache.set("Upload Photo CTA", {strategy, value})
   e. Execute action on found element
```

### Locator Priority (Flutter apps)

1. `accessibilityId` (from Semantics widget) — most reliable
2. `text` content — readable but can change with i18n
3. `resource-id` (Android) / `name` (iOS) — from Key widget
4. `xpath` — last resort, fragile

### Flutter-Specific Considerations

- Flutter renders its own widgets, not native — Appium sees the accessibility tree
- Widgets with `Semantics(label: "...")` expose accessibility IDs
- Widgets with `Key("...")` may expose resource-id on Android
- `appium_get_page_source()` returns the accessibility tree, not the widget tree
- Scrollable lists need `appium_swipe()` to reveal off-screen elements

---

## Integration Points

### Reading Test Cases from XRay Cloud

```
jira-mcp tools used:
- jira_get_issue(testKey) → Get the test case Jira issue (summary, status, links)
- xray_cloud_get_test_steps(testKey) → Get structured steps (action, data, expected)
- jira_search(jql: "issuetype = Test AND ...") → Find tests linked to a story
- xray_cloud_get_test_runs(testKey) → Check existing execution history
```

### Reporting Results to XRay Cloud

```
jira-mcp tools used:
- xray_cloud_create_execution(tests, environment) → Create a test execution with associated tests
- xray_cloud_update_run(executionKey, testKey, steps[]) → Report PASS/FAIL per step
- xray_cloud_get_test_runs(testKey) → Check previous run history
```

### Screenshots

- Saved to `/tmp/appium-screenshots/{test_key}_{step}_{timestamp}.png`
- Can be attached to XRay test runs or Jira comments

---

## Test Cases for Pilot

Use these existing test cases for the first pilot run:

### PAS2-17 (2 active tests)

| Key | Scenario | Type | Steps to execute |
|-----|----------|------|-----------------|
| PAS2-649 | Photo display based on photo state | Scenario Outline (4 iterations) | Navigate to T&P → verify photo/placeholder per state |
| PAS2-646 | No photo when feature OFF | Scenario | Verify no photo or placeholder visible |

### PAS2-6 (3 active tests)

| Key | Scenario | Type | Steps to execute |
|-----|----------|------|-----------------|
| PAS2-703 | CTA state based on conditions | Scenario Outline (4 iterations) | Navigate to T&P → verify CTA per condition |
| PAS2-706 | Tapping CTA navigates to upload flow | Scenario | Tap CTA → verify upload screen |
| PAS2-707 | CTA text loaded from CMS | Scenario | Verify CTA text matches Couchbase |

### Why these for pilot:
- Simple navigation flows
- Clear visual verifications (element present/absent)
- Multiple iterations to test Scenario Outline handling
- Both stories have TestFairy builds available

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| MCP language | TypeScript | Same as jira-mcp, consistent ecosystem |
| Appium version | 2.x | W3C protocol, plugin architecture |
| Session management | Single session per MCP instance | Simpler, one device at a time |
| Page source format | XML | Standard Appium output, parseable |
| Screenshot storage | Local `/tmp/` | Simple, accessible for Kiro image analysis |
| Locator cache | In-memory (per session) | No persistence needed, discovery is fast |
| Error handling | Continue on step failure | Don't abort entire test on single step fail |
| Platform detection | From capabilities | Agent knows iOS vs Android from session |

---

## Development Phases

### Phase 1: MCP Server Core (2 days)

**Day 1:**
- [ ] Scaffold project (package.json, tsconfig, esbuild config)
- [ ] Implement MCP server boilerplate (stdio transport)
- [ ] Implement session management (create/end/info)
- [ ] Implement `appium_get_page_source`
- [ ] Implement `appium_find_element` / `appium_find_elements`
- [ ] Implement `appium_tap`

**Day 2:**
- [ ] Implement `appium_type`
- [ ] Implement `appium_swipe`
- [ ] Implement `appium_screenshot`
- [ ] Implement `appium_back`
- [ ] Implement `appium_wait_for_element`
- [ ] Implement `appium_is_element_displayed`
- [ ] Implement `appium_get_element_attribute`
- [ ] Bundle and deploy to `~/.kiro/tools/mcp-servers/appium-mcp/dist/index.cjs`

### Phase 2: Agent (0.5 day)

- [ ] Create `mobile_test_executor_agent.json` config
- [ ] Write agent prompt with Gherkin interpretation logic
- [ ] Define discovery strategy instructions
- [ ] Define reporting format
- [ ] Register in qa profile

### Phase 3: Integration (0.5 day)

- [ ] Configure MCP in `mcp.json`
- [ ] Test jira-mcp → appium-mcp flow (read test case → execute)
- [ ] Screenshot handling (save + reference in output)

### Phase 4: Testing & Iteration (2 days)

- [ ] Install Appium + drivers on dev machine
- [ ] Connect test device
- [ ] Install app build
- [ ] Run pilot: PAS2-649 (photo display)
- [ ] Run pilot: PAS2-703 (CTA states)
- [ ] Iterate on discovery strategy based on real UI tree
- [ ] Handle edge cases (loading states, animations, popups)
- [ ] Document findings and adjust agent prompt

---

## Prerequisites Checklist

- [ ] `npm install -g appium`
- [ ] `appium driver install xcuitest` (iOS)
- [ ] `appium driver install uiautomator2` (Android)
- [ ] Device connected and recognized (`adb devices` / Xcode)
- [ ] App build installed on device
- [ ] Verify accessibility labels exist: `appium_get_page_source()` on a Passport screen
- [ ] Appium server starts without errors: `appium server`

---

## File Structure

### MCP Server

```
~/.kiro/tools/mcp-servers/appium-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── session.ts        # create/end/info
│   │   ├── discovery.ts      # get_page_source, find_element(s)
│   │   ├── actions.ts        # tap, type, swipe, back, long_press
│   │   ├── verification.ts   # screenshot, is_displayed, get_attribute
│   │   └── waits.ts          # wait_for_element
│   ├── appium-client.ts      # HTTP client for Appium REST API
│   └── config.ts             # Environment config
├── dist/
│   └── index.cjs             # Bundled output
└── README.md
```

### Agent (in steer-runtime repo)

Location: `profiles/qa/agents/mobile_test_executor_agent.json`

```json
{
  "name": "mobile_test_executor_agent",
  "description": "Executes XRay Gherkin test cases on real mobile devices via Appium MCP",
  "prompt": "prompts/mobile_test_executor_agent.md",
  "tools": [
    "fs_read",
    "execute_bash",
    "thinking",
    "todo_list"
  ],
  "resources": [],
  "allowedTools": [
    "@appium/*",
    "@jira/*"
  ],
  "includeMcpJson": true,
  "welcomeMessage": "📱 Mobile Test Executor ready!\n\nI can execute XRay Gherkin test cases on connected devices via Appium.\n\nGive me a story key or test case key and I'll run it."
}
```

Prompt: `profiles/qa/prompts/mobile_test_executor_agent.md`

### Workspace (in steer-runtime repo)

Location: `workspaces/passport-team/`

```
workspaces/passport-team/
├── workspace.json
└── context/
    ├── team_context.md
    └── xray-test-creation-context.md   # Our playbook
```

```json
{
  "name": "passport-team",
  "description": "Passport Phase 2 QA team — Photo Upload, Management, and Display",
  "team": "Passport Phase 2",
  "profiles": ["qa", "dev-mobile"],
  "default_agent": "qa_orchestrator_agent",
  "jira_prefix": "PAS2-",
  "rules": [],
  "enable_tools": true,
  "projects": [
    {
      "name": "park-apps-monorepo",
      "repo": "dx-park-apps/park-apps-monorepo",
      "host": "github.disney.com",
      "path": "${WORKSPACE_ROOT}/park-apps-monorepo"
    }
  ]
}
```

### MCP Registration

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "appium-mcp": {
    "command": "node",
    "args": ["~/.kiro/tools/mcp-servers/appium-mcp/dist/index.cjs"],
    "env": {
      "APPIUM_URL": "http://localhost:4723",
      "SCREENSHOT_DIR": "/tmp/appium-screenshots"
    }
  }
}
```

MCP tool pattern: `@appium/*`

---

## Steer-Runtime Conventions Reference

### Agent Naming
- Use `snake_case` with `_agent` suffix: `mobile_test_executor_agent`
- JSON filename must match name field exactly
- Prompt filename must match: `mobile_test_executor_agent.md`

### Required Agent JSON Fields
- `name` (string)
- `description` (string, one-line)
- `prompt` (string, path to prompt .md)
- `tools` (array)
- `resources` (array)

### Workspace Naming
- Directory: `kebab-case` (e.g., `passport-team`)
- Suffix convention: `{name}-team` for team workspaces
- Config file always named `workspace.json`

### Required Workspace JSON Fields
- `name` (string, matches directory)
- `description` (string)
- `team` (string)
- `profiles` (string[])
- `default_agent` (string)

### Valid Profile IDs
`dev-core`, `dev-web`, `dev-mobile`, `dev-python`, `dev-infra`, `ba`, `qa`, `ops`, `pm`, `steer-master`

### After Creating
- [ ] Agent JSON validates against schema
- [ ] Prompt file exists at specified path
- [ ] All resources paths exist
- [ ] Workspace JSON has all required fields
- [ ] Update AGENTS.md if global agent
- [ ] Test with `koda workspace apply passport-team` (for workspace)
