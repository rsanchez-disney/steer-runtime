---
name: implement-ios-ticket
description: Step-by-step workflow for implementing a Jira ticket in Studio Anglerfish iOS repos. Use when asked to implement a ticket, feature, or bug fix.
---

# Implement iOS Ticket

## Step 1 — Analyze the ticket

- Read the Jira ticket (FNB- or MERCH-)
- Identify acceptance criteria and scope
- Determine which repo: wdpr-dine-opp, wdpr-dine-checkin, Scan-and-Go, or fnb-shared

## Step 2 — Identify the module

- wdpr-dine-opp: check `Modules/` for the relevant VIPER module
- wdpr-dine-checkin: check `Modules/` for the feature area
- Scan-and-Go: check `Modules/` for the relevant Router/ViewModel
- fnb-shared: identify which domain (Network, Location, Logging, SwiftUI, Utils)

## Step 3 — Check FNBShared first

Before implementing new utilities, networking, location, logging, or UI helpers:
- Check `context/repo-fnb-shared.md` for existing public API
- If the functionality exists, use it
- If it could benefit multiple apps, add it to fnb-shared

## Step 4 — Plan implementation

- Follow the repo's architecture pattern:
  - wdpr-dine-opp: Modified VIPER (Wireframe → Presenter → Interactor → Worker)
  - wdpr-dine-checkin: Flexible VIPER-inspired (Wireframe/Builder → Controller → Worker)
  - Scan-and-Go: MVVM + Router (Router → ViewModel → OrchestrationService)
  - fnb-shared: Library (public protocols + implementations)
- Use constructor injection for dependencies
- New SwiftUI screens use MVVM with `@Observable`

## Step 5 — Implement

- Use schema generator for new Codable models (wdpr-dine-opp and wdpr-dine-checkin only)
- Follow Swift concurrency conventions (async/await, structured concurrency)
- Follow SwiftUI conventions (extract subviews, `.task()`, accessibility)
- Write tests using Swift Testing (`@Suite`, `@Test`, `#expect`)

## Step 6 — Run pre-build steps

Before building:

**wdpr-dine-opp / wdpr-dine-checkin:**
1. `xcrun swift-format format --in-place <changed-files>`
2. `swiftiermocky generate` (if AutoMockable protocols changed)
3. Run code generator (if schemas changed)

**Scan-and-Go / fnb-shared:**
1. `xcrun swift-format format --in-place <changed-files>`

## Step 7 — Build and test

```bash
xcodebuild clean test -project <PROJECT>.xcodeproj -scheme <SCHEME> -destination 'platform=iOS Simulator,name=iPhone 16,OS=latest'
```

## Step 8 — Prepare for PR

**PR title format:**
- For release branches: `<TICKET_NUMBER> Title - <Release version>`
- For feature branches: `<TICKET_NUMBER> Title - FB <Feature branch name>`

**Tags:** Ask the user which tags to apply (varies per repo).

**Branch naming:** `sandbox/<GITHUB_USER>/<TITLE>` or `sandbox/<GITHUB_USER>/<JIRA_TICKET>_<VERSION>` for versioned branches.
