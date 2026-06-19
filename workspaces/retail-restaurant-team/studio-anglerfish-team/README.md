# Studio Anglerfish Workspace

iOS development workspace for Studio Anglerfish — Mobile Order, Dine Check-in, Scan-and-Go, and Park app experiences.

## Overview

Studio Anglerfish owns the iOS native layer for guest-facing Food & Beverage and Merchandise features across Walt Disney World and Disneyland Resort. This workspace extends `retail-restaurant` (inheriting shared context like Splunk queries, Jira patterns, and team structure) and adds iOS-specific tooling.

## Team

| Name                           | Role             |
|--------------------------------|------------------|
| Kevin N. Fittro                | Senior Manager   |
| Roberto Patoni                 | Manager          |
| Norma Easter                   | Studio Tech Lead |
| Jorge A. Ramirez               | Developer        |
| Daniel X. Nieto                | Developer        |
| Juan Eduardo Garcia Montenegro | Developer        |

## Projects

| Acronym | Project                     | Repo                                  | Jira Prefix |
|---------|-----------------------------|---------------------------------------|-------------|
| MO      | Mobile Order                | `studio-anglerfish/wdpr-dine-opp`     | FNB-        |
| DMC     | Dine Mobile Check-in        | `studio-anglerfish/wdpr-dine-checkin` | FNB-        |
| MMC     | Merchandise Mobile Checkout | `studio-anglerfish/Scan-and-Go`       | MERCH-      |

### Supporting Repos

| Repo                               | Description                                   |
|------------------------------------|-----------------------------------------------|
| `studio-anglerfish/wdpr-bolton`    | Bolton iOS app                                |
| `studio-anglerfish/fnb-shared`     | Shared FNB code across apps                   |
| `studio-anglerfish/wdpr-bootstrap` | Bootstrap framework (login, finder, geofence) |

> **Note:** `wdpr-dine-reservations` lives in the `studio-anglerfish` org but is owned by a different team. It is not included in this workspace.

## Profiles

- `dev-core` — Orchestration, architecture, code review, planning, PR creation
- `dev-mobile` — iOS native development (`ios_native` agent)

## Agents

| Agent                | Role                                            |
|----------------------|-------------------------------------------------|
| `orchestrator`       | **Default** — task decomposition and delegation |
| `ios_native`         | iOS development (Swift, Objective-C)            |
| `architecture_agent` | Architecture decisions                          |
| `code_review_agent`  | Code review gate                                |
| `test_runner_agent`  | Test execution                                  |
| `pr_creator_agent`   | Pull request creation                           |

## Tech Stack

- Swift 5.9+ · Objective-C (legacy modules)
- Xcode 15+ · Swift Package Manager · swift-format
- XCTest · Protocol-based mocking · async/await
- Charles (Mockingbird) for API mocking
- TestFlight for distribution
- New Relic for monitoring

## Workflow

```
Analyze → Plan → 🚦 Gate 1 → Implement (ios_native) → Quality → 🚦 Gate 2 → Ship
```

## Quick Start

```bash
koda workspace apply studio-anglerfish-team
kiro-cli chat --agent orchestrator
```

## Inherited Context (from retail-restaurant)

- `context/studios.md` — Team members, Slack channels, on-call info
- `context/splunk_services.md` — Splunk indexes and query patterns
- `context/jira_query_context.md` — JQL patterns and components

## Anglerfish-Specific Context

- `context/team_context.md` — iOS architecture, patterns, coding conventions
- `context/build_commands.md` — Xcode build/test commands
- `context/testing_conventions.md` — Testing patterns (Swift Testing, XCTest)
- `context/swift_concurrency.md` — Swift concurrency conventions
- `context/swiftui_conventions.md` — SwiftUI conventions
- `context/git_branching.md` — Branching strategy and sandbox branches
- `context/service_repo_mapping.md` — Repo details and backend services
- `context/repo-*.md` — Per-repo architecture guides (MO, DMC, MMC, fnb-shared)

## Wiki

- [Studios Overview](https://mywiki.disney.com/spaces/FBT/pages/793976187/Studios)
- Space: DXT - Mobile Retail & Restaurant Engineering (FBT)
