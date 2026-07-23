---
name: implement-android-ticket
description: Full SDLC workflow for Android/Kotlin POS tickets — spec approval through implementation, testing, quality review, and PR
agents: [android_arch_agent, android_dev_agent, android_test_agent, android_quality_agent, android_pr_agent]
---

# Implement Android Ticket

End-to-end development workflow for ActivateX (DSP Go) Android features and fixes.

## Prerequisites

- Jira MCP configured (POS-* tickets accessible)
- Git repository with clean working tree on `main` branch
- Gradle build working locally (`./gradlew assembleDebug`)

## Mandatory Clean Code Principles

> ⚠️ **These principles are MANDATORY for all implementation work.** All agents (Dev, Test, Quality) must follow and validate adherence to these principles during Steps 6–9.

### Principle 1: Meaningful Names

- **Intentionality:** Choose names that reveal your intent and avoid misleading clues. A variable, function, or class name should answer: why it exists, what it does, and how it is used.
- **Pronounceable:** Use pronounceable names and searchable constants instead of magic numbers. Replace `val d = 7` with `val DAYS_IN_WEEK = 7`.
- **Consistency:** Use the same vocabulary for the same concept throughout the codebase. If you use `fetch` in one place, do not use `get` or `retrieve` for the same operation elsewhere.

### Principle 2: Write Focused Functions

- **Size:** Keep functions incredibly short. If they are longer than 20 lines, break them down into smaller, well-named helper functions.
- **Single Responsibility:** Functions must do one thing, and do it well. If a function name requires "and" to describe it, split it.
- **Arguments:** Keep arguments to a minimum (ideally 0 to 2). Avoid boolean flags as they indicate a function is doing multiple things. Use parameter objects or builder patterns for complex inputs.
- **Abstraction:** Ensure all statements inside a function are at the same level of abstraction (Step-Down rule). High-level orchestration should not mix with low-level implementation details.

### Principle 3: Eliminate Comments

- **Self-Documenting Code:** Clean code should mostly explain itself. Code changes; comments often lie. Prefer renaming a variable or extracting a function over adding a comment.
- **Last Resort:** Only use comments to explain complex business logic, legal requirements, or as warnings of consequences (e.g., `// WARNING: Changing this order breaks the payment flow`).
- **No Redundancy:** Do not add obvious noise comments, closing brace comments, or commented-out code. Just delete dead code — version control preserves history.

### Principle 4: Formatting and Structure

- **Readability:** Maintain a structured outline from top to bottom. Public API first, then private helpers.
- **Vertical Formatting:** Keep files short. Separate concepts vertically with blank lines and group dependent/similar functions together. Declare variables close to where they are used.
- **Horizontal Formatting:** Keep lines short (max 100 to 120 characters). Use whitespace to associate related items and disassociate weakly related ones. Consistent indentation is non-negotiable.

### Principle 5: Clean Error Handling

- **Exceptions over Codes:** Throw exceptions rather than returning error codes, which clutter the caller's logic. Use Kotlin's `Result` type or sealed classes for expected failure states.
- **Error Context:** Provide enough context with your exceptions (e.g., what operation failed, what input caused it, where it happened). Include the operation name and relevant parameters.

### Principle 6: Robust Unit Testing

- **Pragmatic TDD:** Prefer writing unit tests before production code when feasible. In legacy areas where TDD is impractical (no existing test infrastructure, tightly coupled code), write tests immediately after implementation instead.
- **New Code is Testable:** All NEW classes and functions must be designed for testability (injectable dependencies, clear interfaces). Legacy code without tests does not excuse untestable new code.
- **F.I.R.S.T. (when tests are written):** Ensure tests are:
  - **F**ast — run quickly, no I/O or network calls
  - **I**ndependent — no test depends on another test's state
  - **R**epeatable — produce the same result every time, in any environment
  - **S**elf-validating — pass or fail with no manual interpretation
  - **T**imely — written as close to implementation time as possible
- **Progressive Coverage:** You are not required to add tests to untouched legacy code, but any code you write or significantly modify must have test coverage.
- **Refactor Continuously:** Clean code is not written perfectly the first time. Write it, get it to work, then refactor. When a test suite exists, use it as a safety net to refactor aggressively.

## Workflow

### Step 1: Fetch & Understand Ticket

1. Ask user for the ticket ID if not provided (e.g., `POS-5897`)
2. Fetch ticket via Jira MCP: summary, description, ACs, priority, components
3. Check GitLab history for the epic/ticket for context on past failures
4. Review `context/memory-bank/learnings.md` for related past learnings
5. Identify affected business model(s): Merchandise, QSR, Table Service
6. Check `context/features/` for related feature specs

**Agent:** `android_dev_agent` (understand phase)

### Step 2: Feature Context Loading

**Agent:** `android_arch_agent`

**Purpose:** Load relevant feature context on demand (only if the ticket relates to a documented feature).

**Actions:**
1. Check the ticket number prefix against the feature index in `context/features/README.md`
2. If the ticket belongs to or relates to a documented feature (matching by ticket number or feature description), read the full feature file:
   ```
   fs_read context/features/{matching-feature-file}.md
   ```
3. If no feature matches, skip this step and proceed without feature context

**Output:** Feature context loaded into conversation (or skipped if not applicable)

**Gate:** None — proceed immediately

### Step 3: Architecture Decision

1. Determine pattern:
   - **New feature** → MVVM + Compose + Coroutines
   - **Extending existing MVP** → Continue MVP for consistency
   - **Domain logic** → Interactor/UseCase classes
2. Identify affected modules (`gc/AppetizeActivate`, `domain`, feature modules)
3. Check module dependency rules:
   - `domain` must NOT depend on Android framework
   - Feature modules depend on `domain` and `dataModel`, not on `AppetizeActivate`
4. Evaluate DI needs (Hilt `@Module` + `@Provides`/`@Binds`)
5. Check `FeaturesManager` for feature flag requirements

**Agent:** `android_arch_agent` (architecture phase)

### Step 4: Present Spec (BLOCKING GATE)

Present the implementation spec to the user:

```
## 📋 Spec — [Brief title]

### Architecture Decision
- Module placement, pattern, key decisions

### Files to Create/Modify
| Action | File | Description |

### Task Assignments
| # | Sub-task | Agent | Complexity |

### Impact Analysis
- Affected business models, dependencies, feature flags

### Risks & Considerations
```

**⏸ GATE — User must explicitly approve the spec before any code is written**

### Step 5: Create Branch

```bash
git fetch origin
git checkout -b {type}/POS-XXXXX/description origin/main
```

Types:
- Task → `chore`
- Story → `feature`
- Bug → `fix`
- Spike → `chore`

### Step 6: Implement

Delegate implementation tasks to the Dev agent:

- Kotlin idiomatic code (when, let, apply, extension functions)
- Null safety (no `!!` — safe calls, Elvis operator)
- Complete import statements (no wildcard imports)
- No hardcoded strings/dimensions/colors — use resources
- Structured concurrency with injectable dispatchers
- DI setup (Hilt modules) for new dependencies
- Consider all three business models
- **Extend existing solutions, don't modify** where possible

> 📐 **All implementation code MUST comply with the [Mandatory Clean Code Principles](#mandatory-clean-code-principles) section above.** Pay special attention to Principles 1 (Meaningful Names), 2 (Focused Functions), 4 (Formatting), and 5 (Error Handling).

**Agent:** `android_dev_agent`

### Step 7: Write Tests

After implementation is complete, delegate test creation:

- MockK-based unit tests following project conventions
- Test file naming: `{ClassName}Test.kt`
- Cover happy path, edge cases, and error scenarios
- Injectable dispatchers for coroutine testing
- Proper RxJava scheduler reset in tearDown
- Target ≥90% coverage on new code

> 📐 **All test code MUST comply with the [Mandatory Clean Code Principles](#mandatory-clean-code-principles) section above.** Pay special attention to Principle 6 (Robust Unit Testing) and Principle 2 (Focused Functions — each test should test one thing).

**Agent:** `android_test_agent`

### Step 8: Quality Review (MANDATORY)

Delegate ALL code (implementation + tests) to the Quality agent:

- Code quality assessment
- Test quality assessment
- Architecture compliance check
- Pattern consistency verification

> 📐 **The Quality agent MUST validate compliance with the [Mandatory Clean Code Principles](#mandatory-clean-code-principles) as part of the review.** Any violation of these principles is grounds for REJECTED or APPROVED WITH WARNINGS verdict.

Verdicts:
- **APPROVED** → proceed to delivery
- **APPROVED WITH WARNINGS** → apply fixes, re-review
- **REJECTED** → apply fixes, re-review until APPROVED

**Agent:** `android_quality_agent`

### Step 9: Fix Loop (if needed)

If Quality rejects:
1. Apply fixes directly to the affected files
2. Re-run Quality review on ONLY modified files
3. Repeat until APPROVED with zero issues

**Agents:** `android_dev_agent` / `android_test_agent` → `android_quality_agent`

### Step 10: Generate PR Content

Create merge request description with:
- Solution summary
- Changes strategy
- Files modified table
- Testing checklist
- Impact on business models

**Agent:** `android_pr_agent`

### Step 11: Commit & Ship

1. Stage changes
2. Commit with conventional format:
   - `fix: description - Amazon Q [POS-XXXXX]` (bug)
   - `feat: description - Amazon Q [POS-XXXXX]` (story)
   - `chore: description - Amazon Q [POS-XXXXX]` (task/spike)
3. Push branch
4. Transition Jira ticket to appropriate status

## Delivery Summary

```
## 📊 Modifications Summary
| Agent | File | Action | Description |
```

## Important Rules

- **Never write code before spec approval** (Step 4 is a blocking gate)
- **Quality review is mandatory** — never deliver without APPROVED verdict
- **Clean Code is mandatory** — all code must comply with the Mandatory Clean Code Principles section
- **One pass per file** — write once, move on (no self-review loops during implementation)
- **Extend, don't modify** — prefer extending existing solutions over modifying them
- **All three business models** — always consider Merchandise, QSR, and Table Service impact
- **Feature flags** — check FeaturesManager before adding conditional behavior
