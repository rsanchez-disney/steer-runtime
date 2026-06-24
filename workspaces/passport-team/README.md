# Passport Team Workspace

QA workspace for the Passport Phase 2 team — Photo Upload, Management, and Display.

## Quick Start

```bash
koda workspace apply passport-team
```

## Available Agents

| Agent | Use for |
|-------|---------|
| `qa_orchestrator_agent` (default) | Multi-step QA workflows |
| `mobile_test_executor_agent` | Execute Gherkin tests on real devices via Appium |
| `api_test_executor_agent` | Execute Gherkin tests against service APIs via Bruno |

## Running Mobile Tests

### 1. Start Appium

```bash
appium server
```

### 2. Connect a device or start a simulator

### 3. Launch the agent

```bash
kiro-cli chat --agent mobile_test_executor_agent
```

### 4. Give it a story or test case key

```
Execute test cases for PAS2-17
```

or target a specific test:

```
Run PAS2-649 on iOS iPhone 15
```

The agent will:
1. Fetch the Gherkin from XRay
2. Connect to the device via Appium
3. Interpret and execute each step
4. Take screenshots at verification points
5. Report PASS/FAIL per step

## Context Files

| File | Purpose |
|------|---------|
| `context/team_context.md` | Project config, pilot test cases |
| `context/devices.json` | Device profiles with Appium capabilities (iOS & Android) |
| `context/xray-test-creation-context.md` | XRay playbook — how test cases are structured |

## Project

- **Jira:** PAS2
- **Epic:** PAS2-1
- **Repo:** `dx-park-apps/park-apps-monorepo`
- **Stack:** Flutter (iOS + Android)

## Device Configuration

Devices are configured in `context/devices.json`. Each device profile includes:
- `id` / `name` — for selection
- `platform` — iOS or Android
- `default` — whether it's the default for its platform
- `capabilities` — full W3C capabilities passed to Appium

When you don't specify a device, the agent lists all available options and asks you to pick one.

To add a new device, add an entry to `devices.json`:
```json
{
  "id": "my-device",
  "name": "My Device Name",
  "platform": "iOS",
  "default": false,
  "capabilities": {
    "platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "My Device",
    "appium:udid": "auto",
    "appium:bundleId": "com.disney.wdpro.dlr",
    "appium:noReset": true
  }
}
```

## Running API Tests

### 1. Ensure Bruno CLI is available

```bash
npm install -g @usebruno/cli
```

### 2. Launch the agent

```bash
kiro-cli chat --agent api_test_executor_agent
```

### 3. Give it a story or test case key

```
Execute test cases for PAS2-25
```

or target a specific test:

```
Run PAS2-710 against staging
```

The agent will:
1. Fetch the Gherkin from XRay
2. Interpret steps as HTTP requests
3. Execute via Bruno (matching collection or building requests)
4. Validate response status, body, headers
5. Report PASS/FAIL per step with request/response evidence
