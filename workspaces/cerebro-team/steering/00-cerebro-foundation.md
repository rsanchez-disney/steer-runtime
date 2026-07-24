---
inclusion: always
---

# Cerebro Foundation — Studio Cerebro conventions

## Repositories

| Repo           | Stack   | Purpose                                |
|----------------|---------|----------------------------------------|
| profile-rac    | Angular | Reusable Angular Custom Elements       |
| profile-webapi | Node    | BFF / API gateway for profile services |
| profile-spa    | Angular | Full page profile applications         |

## Branch naming

- Format: `TICKET-ID` (e.g., `GCXPWS-11382`)
- No prefix needed — the ticket ID is the branch name
- One ticket per branch, one branch per ticket

## Commit messages

- Format: `[TICKET-ID] - Short description`
- Example: `[GCXPWS-11382] - Typeahead and form validation fixes`
- Keep the description under 72 characters
- One logical change per commit when possible

## Pull requests

- Target: always `upstream/develop`
- Title format: `[TICKET-ID] - {TICKET TITLE}` (e.g., `[GCXPWS-11382] - Typeahead and form validation fixes`)
- Require 1 approval minimum
- Use the repo's `PULL_REQUEST_TEMPLATE.md` if available

## Unit testing philosophy

- Tests are the **last step** — write and verify code first, then add tests
- Focus on **functionality and behavior**, not coverage percentage
- Coverage targets are guidance, not dogma — the developer decides what coverage is appropriate for the change
- Test what the component DOES (inputs → outputs, user interactions → effects), not implementation details
- Do not test Angular internals, lifecycle hooks in isolation, or private methods directly
- A test that only asserts `toBeTruthy()` without verifying behavior is not a valid test
- Do NOT delete existing tests without explicit justification (see repo-specific patterns for rules)

## Shared conventions

- All Angular repos use standalone components
- DI via `inject()`, not constructor injection
- Jira: `GCXPWS-` prefix
- Environments: latest (dev) → stage → prod

## Communication patterns

- SPA hosts RAC custom elements as web components
- RAC elements are framework-agnostic — no direct Angular service injection from host
- WebAPI provides REST endpoints consumed by both RAC and SPA
- Backend services are never called directly from the browser

## Spec-driven development

- Feature specs live in each repo at `.kiro/specs/`
- Specs describe flows, key behaviors, and architectural decisions
- The agent reads the relevant spec before implementing changes to a feature
- After implementation, update the spec if behavior changed (same PR)
