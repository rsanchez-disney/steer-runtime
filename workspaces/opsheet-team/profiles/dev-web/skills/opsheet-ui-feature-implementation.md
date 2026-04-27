---
name: opsheet-ui-feature-implementation
description: End-to-end Angular UI feature workflow — Jira ticket to tested implementation with user checkpoints
---

# Skill: UI Feature Implementation (Angular)

Use this skill when implementing or refactoring UI behavior in Opsheet plus (wdpr-parkops-opsheet-suite).

## Prerequisites

- Jira MCP configured and accessible
- Working Angular 15 project with NGXS and Jasmine
- Steering file loaded: `ui-angular-opsheet.md`

---

## Workflow

### Step 0: Fetch Ticket from Jira

1. Ask the user for the ticket ID if not provided (e.g., `OPS-XXXXX`).
2. Fetch the ticket via Jira MCP — retrieve summary, description, acceptance criteria, priority, labels, linked issues, and attachments list.
3. Save the full ticket data as `.kiro/ticket-cache/<TICKET-ID>.json` with a `fetchedAt` ISO timestamp.
4. This file is the **source of truth** for the entire workflow. Every time you read it, remind the user: _"Using ticket data last fetched on {fetchedAt}. Say 'refresh ticket' if you need me to re-fetch."_
5. Do **not** re-fetch automatically — only when the user explicitly asks.

### Step 1: Confirm Feature Requirements

1. Summarize the ticket to the user in plain language:
   - What is being added/changed and why.
   - Acceptance criteria as a numbered list.
   - Any ambiguities, missing details, or assumptions you identified.
2. Ask the user to confirm, clarify, or adjust before proceeding.

**⏸ CHECKPOINT — User confirms requirements before planning**

### Step 2: Explore Codebase & Plan

1. Identify the feature surface: components, templates, services, state, models, and existing tests.
2. Check for related contracts (API models, shared interfaces) — note any fields that may be missing or optional.
3. Review existing patterns in the affected area for consistency.
4. Break the work into small, testable implementation steps. Each step should be independently verifiable.
5. Present the plan to the user, including:
   - Files to create or modify.
   - Contract assumptions (what fields exist, how to handle missing data).
   - Any risks or trade-offs.

**⏸ CHECKPOINT — User reviews and approves the plan before implementation**

### Step 3: Create Branch

1. Ensure the working tree is clean (`git status`).
2. Create a feature branch from the base branch:

```bash
git checkout main
git pull
git checkout -b feat/OPS-<number>-<short-description>
```

Branch naming must follow: `feat/OPS-{number}` or `feat/OPS-{number}-{short-description}`.

### Step 4: Implement

Follow the steering file `ui-angular-opsheet.md` for all conventions. Key rules:

**Architecture:**
- Keep components thin — business logic in services/facades.
- Smart (container) vs presentational (dumb) separation.
- Tolerate missing backend fields — default safely, never crash on undefined.
- Components under 400 lines; extract complex logic into services.

**TypeScript:**
- Strict types, explicit return types, no `any` without justification.
- Single-return style (no early return guard clauses).
- `interface` over `type` for object shapes.

**Angular:**
- OnPush change detection where possible.
- Async pipe over manual subscriptions; unsubscribe in OnDestroy.
- TrackBy in `*ngFor` loops.
- Component member order: decorator → public props → private props → constructor → lifecycle → public methods → private methods.

**NGXS:**
- Actions in separate `*.actions.ts` files with descriptive names: `[Context] Action Name`.
- Selectors in `*.selectors.ts` files with `@Selector()`.
- Immutable updates only (`ctx.patchState()` / `ctx.setState()` with spread).
- Error handling within action handlers using `catchError`.

**UX States:**
- Handle all states: loading, empty, error, success.
- For exports: bubble messages reflect report type + filters; staged messaging if no real progress (queued → generating → finalizing).

**General:**
- Minimal diff — change only what the ticket requires.
- Remove dead/debug code. No `console.log` in production.
- No breaking changes to shared API models.

**⏸ CHECKPOINT — User reviews implementation before testing**

### Step 5: Generate / Update Unit Tests

Follow the testing conventions from `ui-angular-opsheet.md`:

**Mocking strategy (CRITICAL):**
- Mock ALL dependencies — never use real services, pipes, directives, or child components.
- `jasmine.createSpyObj()` with **class reference** (not string): `jasmine.createSpyObj(MyService, [...])`.
- Prefer `withArgs()` over `callFake()` for conditional returns.
- Mock Store with `withArgs()` per selector: `mockStore.select.withArgs(MyState.items).and.returnValue(of([...]))`.
- Mock child components with stub `@Component` classes; mock pipes with stub `@Pipe` classes.
- No `NO_ERRORS_SCHEMA` — explicitly mock everything.

**NGXS testing split:**
- **State class tests** → use real Store (`NgxsModule.forRoot([...])`), mock only services.
- **Component/Service tests** → mock Store with `jasmine.createSpyObj(Store, ['dispatch', 'select', 'selectSnapshot'])`.

**Test structure:**
- AAA pattern: Arrange, Act, Assert.
- Descriptive test names explaining expected behavior.
- Configure default spy return values in `beforeEach`; clean up in `afterEach`.
- Test edge cases: null/undefined inputs, error responses, empty collections.
- Target ≥80% coverage on new/changed code.

**Run and verify:**

```bash
npm run test -- --watch=false
npm run lint-style
```

Fix any failures before proceeding. Prefer fixing source code over weakening tests.

### Step 6: Self-Review

1. Run `git diff main...HEAD` to review all changes.
2. Verify against the acceptance criteria from the cached ticket.
3. Check the self-review checklist:
   - [ ] No `console.log` / `console.warn` / `console.debug` in production code.
   - [ ] No `any` types without justification.
   - [ ] No imports from `src/tests/` in production code.
   - [ ] All observable subscriptions cleaned up.
   - [ ] State updates are immutable.
   - [ ] UX states handled: loading / empty / error / success.
   - [ ] Tests mock ALL dependencies (no real services/pipes/directives).
   - [ ] Component member order followed.
   - [ ] Single-return style used (no early return guard clauses).
   - [ ] New TODOs include ticket number: `// TODO(OPS-XXXXX): description`.
   - [ ] No unrelated changes in the diff.

**⏸ CHECKPOINT — User reviews final changes before shipping**

### Step 7: Commit & Push

1. Stage only relevant files (avoid `git add .`).
2. Commit with conventional commit format:

```bash
git add <files>
git commit -m "feat: OPS-<number> - <description>"
```

3. Push the branch:

```bash
git push -u origin feat/OPS-<number>-<short-description>
```

### Step 8: Cleanup

1. Remove the ticket cache file if the user confirms the feature is complete:

```bash
rm .kiro/ticket-cache/<TICKET-ID>.json
```

2. Summarize what was done: files changed, tests added, any follow-up items.

---

## Export-Related Checklist

When the feature involves export functionality, additionally verify:

- [ ] Bubble message matches report type + filters (inactive included, etc.).
- [ ] File naming aligns with report type and user selections.
- [ ] No UI blocking; async states handled with progress indicators.
- [ ] If no real progress available: staged messaging (queued → generating → finalizing).

---

## Important Rules

- **Never proceed past a checkpoint without explicit user approval.**
- **Ticket cache is the source of truth** — always remind the user of the fetch date when referencing it.
- **Minimal diff** — change only what the ticket requires.
- **No secrets in code or logs.**
- **Backward compatibility** — never break shared API models.
- **Follow `ui-angular-opsheet.md`** for all coding, testing, and architectural decisions.
