# Config Studio Feature Implementation - Practical Prompt Guide

A practical guide showing how to use the orchestrator and specialized agents to implement features in Config Studio.

## Understanding the Agent System

**Orchestrator** - Routes work and enforces compatibility
- Use for: Planning, coordination, cross-repo analysis
- Has: Read and shell tools

**Backend Agent** - Java services specialist
- Use for: wdpr-config-services, API changes
- Has: Read, write, shell tools
- Restricted to: src/**, pom.xml, application*.yml

**WebAPI Agent** - BFF/API layer specialist  
- Use for: wdpr-payment-controls-api (Node.js/TypeScript)
- Has: Read, write, shell tools

**UI Agent** - Angular frontend specialist
- Use for: wdpr-payment-controls-client
- Has: Read, write, shell tools

---

## Feature Implementation Workflow

### Phase 1: Story Analysis & Planning

**Prompt to Orchestrator:**
```
Review JIRA story DPAY-14561 and create an implementation plan covering:
- Acceptance criteria breakdown
- Required changes per repository (backend, webapi, ui)
- Integration points between layers
- Backward compatibility considerations
- Testing approach

Coordinate with specialized agents to validate technical feasibility.
```

**What happens:**
- Orchestrator analyzes requirements
- Delegates technical validation to backend/webapi/ui agents
- Returns comprehensive plan with agent-specific tasks

---

### Phase 2: Code Discovery

#### Finding Components

**Prompt to UI Agent:**
```
In wdpr-payment-controls-client, locate the component that handles 
the Client About section where SOR field is displayed. Show me:
- Component file path
- Template structure
- Related service dependencies
```

**Prompt to Backend Agent:**
```
In wdpr-config-services, find where Client entities are defined and 
show me:
- Entity class structure
- Database schema mapping
- Repository methods
```

**Prompt to WebAPI Agent:**
```
In wdpr-payment-controls-api, locate the Client interface definition 
and show me:
- Interface structure at src/api-server/resources/interfaces.ts
- How it maps to backend responses
- Where it's used in controllers
```

#### Understanding Existing Patterns

**Prompt to UI Agent:**
```
Review the existing Debug Info panel implementation in ToolnavComponent 
to understand:
- UI patterns and component structure
- Styling approach (dark theme)
- Data display methods
- How it integrates with the app

Show me code examples I should follow for consistency.
```

**Prompt to Backend Agent:**
```
Review the existing feature for role impersonation (impersonateCustom 
and impersonatePreset). Show me:
- How it works end-to-end
- Storage mechanism (localStorage pattern)
- Integration points with authentication
- Error handling approach
```

---

### Phase 3: Implementation

#### Backend Changes

**Prompt to Backend Agent:**
```
Add clientIdPrefix field to the Client entity in wdpr-config-services:
1. Add field to Client.java entity class
2. Update database schema/migration
3. Ensure field is captured on client creation
4. Add validation to prevent SOR changes when prefix exists
5. Return error code 400110054 when validation fails

Follow existing patterns and maintain backward compatibility.
```

#### WebAPI/BFF Changes

**Prompt to WebAPI Agent:**
```
Add clientIdPrefix field to the Client interface in wdpr-payment-controls-api 
at src/api-server/resources/interfaces.ts:
1. Add field to Client interface
2. Ensure it's mapped from backend responses
3. Include in API responses to frontend

Follow existing interface patterns.
```

**Prompt to WebAPI Agent (Error Handling):**
```
Modify client-configs.service.ts to properly extract and forward error 
codes from backend responses. The backend returns errors in format:
err.error.status.errors[0].errorCode

Ensure error code 400110054 reaches the frontend with proper HTTP status.
```

#### Frontend Changes

**Prompt to UI Agent:**
```
Implement Client ID prefix locking in wdpr-payment-controls-client:

1. Add clientIdPrefix to ClientValues interface and Client model
2. Add isSorLocked() method to ConfigClientAboutComponent that returns 
   true when clientIdPrefix has a value
3. Update config-client-about.component.html to:
   - Conditionally disable SOR field when locked
   - Show lock icon (glyph uniE201) with message
   - Add tooltip explaining the lock
4. Enhance stageUpdateClient() error handling to detect error code 
   400110054 and display specific message

Follow existing patterns for locked fields and error display.
```

#### UI Enhancements

**Prompt to UI Agent:**
```
Add role impersonation UI to Debug Panel with:
- Preset dropdown from available ROLE_PRESETS
- Hub ID input for user impersonation  
- Custom roles JSON textarea with validation
- Apply buttons for both modes
- Error handling and user feedback
- Dark theme styles matching existing debug panel (VS Code theme)

Follow the existing ToolnavComponent patterns for structure and styling.
```

---

### Phase 4: Cross-Layer Validation

**Prompt to Orchestrator:**
```
Validate the implementation for DPAY-14561 across all layers:
1. Backend: Verify Client entity has clientIdPrefix field
2. WebAPI: Verify Client interface includes clientIdPrefix
3. UI: Verify component properly handles locked state
4. Error flow: Trace error code 400110054 from backend → BFF → UI

Check for contract compatibility issues between layers.
```

**What happens:**
- Orchestrator coordinates with all specialized agents
- Each agent validates their layer
- Orchestrator reports any compatibility issues

---

### Phase 5: Testing

#### Creating Test Scripts

**Prompt to Backend Agent:**
```
Create a functional test script for Client ID prefix locking that:
- Verifies database schema has clientIdPrefix column
- Tests prefix capture on client creation
- Tests SOR change blocking when prefix exists
- Tests backward compatibility with existing clients
- Validates API error responses (400110054)

Use existing test patterns from the codebase.
```

**Prompt to UI Agent:**
```
Create a manual testing checklist for the SOR locking feature covering:
- UI verification (lock icon, disabled field, tooltip)
- Error message display
- Keyboard navigation and accessibility
- Different client states (with/without prefix)
- Browser compatibility
```

#### Integration Testing

**Prompt to Orchestrator:**
```
Create an end-to-end test scenario for DPAY-14561 that validates:
1. Backend captures clientIdPrefix on creation
2. WebAPI properly forwards the field
3. UI displays lock when prefix exists
4. Error handling works when user tries to change locked SOR
5. Backward compatibility with clients without prefix

Coordinate with agents to implement tests at each layer.
```

---

### Phase 6: Documentation & Delivery

**Prompt to Orchestrator:**
```
Create implementation summary for DPAY-14561 including:
- Checklist of completed items per repository
- Technical details of changes
- Testing results
- PR links (to be filled)
- Deployment notes

Format for Confluence page following Story 2.1 template.
```

**Prompt to UI Agent:**
```
Create PR for DPAY-14561 UI changes with:
- Summary of changes to components, services, models
- Testing notes and checklist
- Screenshots of UI changes
- Links to related backend/webapi PRs
- Acceptance criteria verification
```

---

## Common Scenarios

### Scenario 1: Adding a New Field Across All Layers

**Step 1 - Plan (Orchestrator):**
```
I need to add a new field "clientIdPrefix" to Client entity that flows 
from backend → webapi → ui. Create a coordinated implementation plan 
showing what each agent needs to do.
```

**Step 2 - Backend (Backend Agent):**
```
Add clientIdPrefix field to Client entity with proper database mapping 
and validation.
```

**Step 3 - WebAPI (WebAPI Agent):**
```
Add clientIdPrefix to Client interface and ensure it's included in 
API responses.
```

**Step 4 - UI (UI Agent):**
```
Add clientIdPrefix to Client model and display it in the About section.
```

**Step 5 - Validate (Orchestrator):**
```
Verify clientIdPrefix flows correctly from backend through webapi to ui. 
Check all interfaces match.
```

---

### Scenario 2: Implementing Conditional UI Logic

**Prompt to UI Agent:**
```
Implement conditional logic in ConfigClientAboutComponent:
- Add isSorLocked() method that checks if clientIdPrefix exists
- Update template to show locked state with icon when true
- Show editable field when false
- Follow existing patterns for conditional UI in the codebase
```

---

### Scenario 3: Error Handling Across Layers

**Step 1 - Define Error (Backend Agent):**
```
Add error code 400110054 for "Cannot change SOR when clientIdPrefix is set" 
in the validation logic. Return it in the standard error format.
```

**Step 2 - Forward Error (WebAPI Agent):**
```
Ensure error code 400110054 from backend is properly extracted and 
forwarded to frontend with appropriate HTTP status.
```

**Step 3 - Handle Error (UI Agent):**
```
In stageUpdateClient() error handler, detect error code 400110054 and 
display user-friendly message: "Cannot change SOR because Client ID 
prefix is locked."
```

**Step 4 - Validate Flow (Orchestrator):**
```
Trace error code 400110054 from backend validation through webapi to 
UI display. Verify the error message reaches the user correctly.
```

---

### Scenario 4: Following Existing Patterns

**Prompt to UI Agent:**
```
I need to add a new debug control to the Debug Panel. Show me the 
existing pattern from ToolnavComponent for:
- Component structure
- Styling (dark theme)
- Form controls
- Button actions
- Error display

Then help me implement a similar control for role impersonation.
```

---

### Scenario 5: Troubleshooting Integration Issues

**Prompt to Orchestrator:**
```
The error code from backend is not reaching the UI. Review the error 
flow from:
1. Backend: wdpr-config-services validation
2. WebAPI: wdpr-payment-controls-api error handling
3. UI: wdpr-payment-controls-client error extraction

Identify where the error code is lost and coordinate fixes with agents.
```

**What happens:**
- Orchestrator asks Backend Agent to show error response format
- Orchestrator asks WebAPI Agent to show error forwarding logic
- Orchestrator asks UI Agent to show error extraction code
- Orchestrator identifies the gap and coordinates the fix

---

## Advanced Patterns

### Pattern 1: Bulk Updates Across Files

**Prompt to UI Agent:**
```
Update all components in src/app/config-client/ to import and use the 
new ClientIdPrefixService. Follow the existing service injection pattern.
```

### Pattern 2: Cross-Repository Search

**Prompt to Orchestrator:**
```
Search across wdpr-config-services, wdpr-payment-controls-api, and 
wdpr-payment-controls-client for all usages of "clientIdPrefix" to 
ensure consistent naming and typing.
```

### Pattern 3: Refactoring with Safety

**Prompt to Backend Agent:**
```
Refactor the Client validation logic to extract it into a separate 
validator class. Ensure all existing tests still pass and behavior 
is unchanged.
```

### Pattern 4: Performance Analysis

**Prompt to Backend Agent:**
```
Review the Client query performance when filtering by clientIdPrefix. 
Check if we need database indexes and recommend optimizations.
```

---

## Best Practices for Prompts

### Be Specific About Context
❌ Bad: "Add a field to Client"
✅ Good: "Add clientIdPrefix field to Client entity in wdpr-config-services with String type and database mapping"

### Reference Existing Patterns
❌ Bad: "Add a lock icon"
✅ Good: "Add lock icon using glyph uniE201 following the pattern in existing locked fields"

### Specify Validation Needs
❌ Bad: "Add error handling"
✅ Good: "Add error handling to detect error code 400110054 and display message 'Cannot change SOR when prefix is locked'"

### Request Backward Compatibility
❌ Bad: "Update the interface"
✅ Good: "Update the interface ensuring backward compatibility - check for null/undefined before using new field"

### Ask for Coordination
❌ Bad: "Make this change in all repos"
✅ Good: "Orchestrator: coordinate this change across backend, webapi, and ui ensuring interfaces match"

---

## Troubleshooting Guide

### Issue: Agent doesn't understand the codebase

**Solution:**
```
First, ask agent to explore:
"Review the structure of [repository] focusing on [area]. Show me the 
key files and patterns I should know about."
```

### Issue: Changes break existing functionality

**Solution:**
```
"Review my changes in [file] and check for:
- Backward compatibility issues
- Breaking changes to interfaces
- Missing null checks
- Test coverage gaps"
```

### Issue: Inconsistent patterns across layers

**Solution:**
```
"Orchestrator: review the [field/feature] implementation across backend, 
webapi, and ui. Identify inconsistencies in naming, typing, or patterns."
```

### Issue: Build or test failures

**Solution:**
```
"Help me debug this error:
[paste error]

Review the related code and identify:
- Root cause
- Suggested fix
- Related files that might need updates"
```

---

## Quick Reference

### Start a New Feature
```
Orchestrator: Review story [JIRA-ID] and create implementation plan 
coordinating backend, webapi, and ui agents.
```

### Find Existing Code
```
[Agent]: Locate [component/class/interface] that handles [functionality] 
and show me its structure.
```

### Implement Changes
```
[Agent]: Implement [specific change] following existing patterns in 
[file/directory]. Ensure backward compatibility.
```

### Validate Integration
```
Orchestrator: Validate [feature] implementation across all layers and 
check for contract compatibility issues.
```

### Create Tests
```
[Agent]: Create test script for [feature] covering [scenarios] using 
existing test patterns.
```

### Generate Documentation
```
Orchestrator: Create implementation summary for [JIRA-ID] with checklist, 
technical details, and PR template.
```

---

**Generated**: March 11, 2026  
**Based on**: config-studio-prompts.md  
**For**: Config Studio multi-agent development workflow

---

## Mobile Development Scenarios

### Scenario 1: Flutter-Only Feature

**Prompt to Orchestrator:**
```
Add a payment form with validation to the Flutter app using Provider for state management
```

**Orchestrator delegates to Flutter Agent:**
- Create form widget
- Add validation logic
- Implement Provider for state
- Add tests

---

### Scenario 2: Cross-Platform Native Feature

**Prompt to Orchestrator:**
```
Add biometric authentication to the Flutter app
```

**Orchestrator coordinates:**
1. **Flutter Agent**: Create BiometricAuth interface + MethodChannel
2. **Android Native Agent**: Implement BiometricPrompt
3. **iOS Native Agent**: Implement LocalAuthentication
4. **Validate**: Method names and types match across platforms

---

### Scenario 3: Platform-Specific Feature

**Prompt to Android Native Agent:**
```
Add Android home screen widget for quick payment actions
```

**Android Native Agent:**
- Implement widget
- Configure AndroidManifest.xml
- Document usage

---

### Scenario 4: Platform Channel Implementation

**Step 1 - Define Interface (Flutter Agent):**
```
Create a LocationService interface using MethodChannel for getting device location
```

**Step 2 - Android Implementation (Android Native Agent):**
```
Implement the location platform channel for Android using FusedLocationProviderClient
```

**Step 3 - iOS Implementation (iOS Native Agent):**
```
Implement the location platform channel for iOS using CoreLocation
```

**Step 4 - Validate (Orchestrator):**
```
Verify the location platform channel contracts match across Flutter, Android, and iOS
```

---

## Mobile Agent Quick Reference

### Flutter Agent
**Use for:**
- Dart/Flutter code
- Widget development
- State management (Provider, Riverpod, Bloc)
- Platform channel interfaces (Flutter side)
- Monorepo package management

**Example prompts:**
```
Create a payment form widget with validation
Implement Provider for cart state management
Add navigation using GoRouter
Create a custom widget for displaying transactions
```

### Android Native Agent
**Use for:**
- Kotlin/Java code
- Platform channels (Android side)
- Native Android APIs
- Gradle configuration
- Android permissions

**Example prompts:**
```
Implement biometric authentication using BiometricPrompt
Add camera permission handling
Configure ProGuard rules for release build
Implement platform channel for device info
```

### iOS Native Agent
**Use for:**
- Swift/Objective-C code
- Platform channels (iOS side)
- Native iOS APIs
- CocoaPods configuration
- iOS permissions

**Example prompts:**
```
Implement biometric authentication using LocalAuthentication
Add camera permission to Info.plist with usage description
Configure app signing for distribution
Implement platform channel for device info
```

---

## Mobile Coordination Patterns

### Pattern: Ensure Platform Channel Compatibility

**Prompt to Orchestrator:**
```
Review the biometric authentication implementation across Flutter, Android, and iOS.
Verify that:
- Method names match exactly
- Parameter types are compatible
- Return types are consistent
- Error handling is aligned
```

### Pattern: Monorepo Package Management

**Prompt to Flutter Agent:**
```
Create a new package in packages/payment_core/ with:
- Payment models
- Validation utilities
- API client interfaces

Ensure it follows the monorepo structure and has proper exports.
```

### Pattern: Provider State Management

**Prompt to Flutter Agent:**
```
Implement a CartProvider using ChangeNotifierProvider that:
- Manages cart items
- Calculates totals
- Persists to local storage
- Notifies listeners on changes

Follow existing Provider patterns in the codebase.
```

---

**Updated:** March 12, 2026  
**Mobile Agents Added:** flutter, android_native, ios_native

---

## Execution Modes

The orchestrator supports two execution modes:

- **Review mode** (default): Pauses after each specialist completes a task. Shows the diff and waits for your approval before continuing.
- **Autopilot mode**: Runs all tasks without pausing. Only stops at the plan approval gate and the quality report gate.

Select at the start of your prompt:
```
Implement DPAY-1234 in review mode
Implement DPAY-1234 in autopilot mode
```

Switch mid-session:
```
Switch to autopilot
Switch to review mode
```

---

## Spec-Driven Implementation

Use the `spec-driven-implementation` skill to generate a structured spec (requirements, design, tasks) before any code is written. The agent will stop and wait for your approval before implementing.

### Activation

Reference the skill directly:
```
#spec-driven-implementation OPS-123
```

Or use natural language:
```
Generate a spec for OPS-123
Spec out DPAY-456 before implementing
Plan the implementation for WDPR-789
```

### Example Prompts

**Basic — spec only:**
```
#spec-driven-implementation OPS-22371
```
→ Agent fetches Jira, explores codebase, generates requirements.md + design.md + tasks.md, stops for approval.

**With context hints:**
```
#spec-driven-implementation OPS-22371
Focus on the payment validation layer. The fix should not change the API contract.
```

**Approve and implement:**
```
approved
```
→ Agent proceeds with implementation following the tasks.md plan.

**Request changes before approving:**
```
Move the validation logic to a shared utility instead of the controller. Also add an integration test.
```
→ Agent updates the spec files and presents again.

**Full lifecycle in one session:**
```
#spec-driven-implementation DPAY-456
```
1. Agent generates spec → stops
2. You review → "approved"
3. Agent implements → creates PR
4. Metrics auto-captured via post-PR hook

### What Gets Generated

| File | Contents |
|------|----------|
| `~/.kiro/.specs/<TICKET>/requirements.md` | Functional/non-functional requirements, acceptance criteria, scope |
| `~/.kiro/.specs/<TICKET>/design.md` | Approach, files to modify, interfaces, test scenarios, risks |
| `~/.kiro/.specs/<TICKET>/tasks.md` | Ordered implementation checklist with verification steps |

### Tips

- Works with any Jira prefix (OPS, DPAY, WDPR, etc.)
- Specs persist across sessions — re-run to update, or reference later
- Combine with execution modes: `#spec-driven-implementation OPS-123` then `Switch to autopilot` after approval
- The orchestrator may delegate exploration to `codebase_explorer_agent` and implementation to specialist agents (backend, ui, etc.)
