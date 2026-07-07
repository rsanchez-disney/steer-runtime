# Retail & Restaurant Engineering Workspace

DXT Mobile Retail & Restaurant Engineering — Mobile Order, Dine Booking, DiSCO (Dine Self Check-in), and Pay at Table across iOS, Android, and backend services.

## Studios

| Studio | Platform | Focus |
|--------|----------|-------|
| Studio Anglerfish | iOS | Mobile Order, Dine Booking, Park apps |
| Studio Proteus | Android | Mobile Order, Dine Booking, Park apps |
| Studio Lumiere | Web & Services | MOO, DiSCO, Arrival Windows, Pay at Table |

## Profiles

- `dev-core` — Orchestration, architecture, code review, planning, PR creation
- `dev-mobile` — iOS and Android native development
- `dev-web` — Backend services (Java/Spring Boot specialist)

## Agents

### dev-core (orchestration & quality)

| Agent | Role |
|-------|------|
| `orchestrator` | **Default** — decomposes tasks, delegates to sub-agents |
| `architecture_agent` | Architecture decisions and design |
| `planner_agent` | Implementation planning |
| `code_review_agent` | Code review gate |
| `test_runner_agent` | Test execution and validation |
| `pr_creator_agent` | Pull request creation |
| `story_analyzer_agent` | Jira story analysis |
| `codebase_explorer_agent` | Codebase navigation and discovery |
| `security_scanner_agent` | Security scanning |
| `splunk_query_agent` | Splunk log queries |
| `technical_writer_agent` | Documentation |
| `adr_writer_agent` | Architecture Decision Records |

### dev-mobile (native platforms)

| Agent | Role |
|-------|------|
| `ios_native` | iOS development (Swift, Objective-C) |
| `android_native` | Android development (Kotlin, Java) |
| `flutter` | Flutter/Dart (if needed for cross-platform) |

### dev-web (backend services)

| Agent | Role |
|-------|------|
| `backend` | **Java/Spring Boot specialist** — APIs, services, data access |

## Workflow

```
Analyze → Plan → 🚦 Gate 1 → Implement → Quality → 🚦 Gate 2 → Ship
```

Implementation routing:
- iOS tasks → `ios_native`
- Android tasks → `android_native`
- Java/Spring services → `backend`
- Architecture → `architecture_agent`

## Quick Start

```bash
koda workspace apply retail-restaurant
kiro-cli chat --agent orchestrator
```

## Projects

| Project | Org/Repo | Description |
|---------|----------|-------------|
| studio-anglerfish | github.disney.com/studio-anglerfish | iOS apps |
| wdpro-mobile | github.disney.com/wdpro-mobile | iOS shared platform |
| park-platform-android | github.disney.com/park-platform-android | Android platform |
| studio-proteus | github.disney.com/studio-proteus | Android studio repos |
| moo-service | github.disney.com | Mobile Ordering Orchestration |
| disco-service | github.disney.com | Dine Self Check-in service |

## Context Files

- `context/team_context.md` — Architecture guide, services overview, tech stack
- `context/studios.md` — Team members, Slack channels, on-call info

## Tech Stack

### iOS (Studio Anglerfish)
- Swift · Objective-C · Xcode · CocoaPods
- Charles (Mockingbird) · HockeyApp · New Relic

### Android (Studio Proteus)
- Kotlin · Java · Gradle · MVVM
- Mobile Order MDX · Dine Booking

### Web & Services (Studio Lumiere)
- Java · Spring Boot (implied from service architecture)
- Splunk monitoring · VenueNext integration · Disney APP (payments)

## Wiki

- [Studios Overview](https://disneyexperiences.atlassian.net/wiki/spaces/FBT/pages/793976187/Studios)
- Space: DXT - Mobile Retail & Restaurant Engineering (FBT)
