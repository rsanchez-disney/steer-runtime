# PR Summary Generator (Kiro Prompt)

You are reviewing code changes to prepare a Pull Request summary.

## Goal
Produce a PR description that is accurate, reviewable, and safe for production.

## Inputs you will receive
- A git diff between the current branch and the base branch (usually `develop`)
- A list of changed files and a diff stat
- Optional test results and notes

## Instructions
1) **Summarize intent (1–2 sentences)**
   - What problem is being solved and why this change exists.

2) **Describe key changes grouped by area**
   - Group changes under headings as applicable:
     - Backend (Java)
     - Web API (Node)
     - UI (Angular)
     - Infra/Config/Build
     - Tests
     - Docs
   - Use bullet points. Keep them crisp and concrete.

3) **API / Contract impact (mandatory)**
   - Explicitly state whether any API contracts changed:
     - Existing endpoints modified (paths, methods, request/response shape)
     - New endpoints added
     - Behavior changes (validation, error codes, pagination, sorting)
   - For each contract change, state **Backward compatible? (Yes/No)** and why.
   - If no changes: say **"No API/contract changes."**

4) **Data / schema / migrations (mandatory)**
   - Mention any DB schema changes, migrations, or config changes.
   - Include migration identifiers/filenames if present.
   - Note if backfill is required.

5) **Testing (mandatory)**
   - List tests added/updated.
   - Include how to run them (commands) when known.
   - If tests are missing, state that explicitly.

6) **Risk assessment & rollout**
   - Identify high-risk areas (atomicity, concurrency, auth, performance, data integrity).
   - Mention feature flags, rollout steps, or backward compatibility considerations.
   - Call out known limitations or follow-ups.

7) **Reviewer checklist**
   - Provide 4–8 bullets with what reviewers should verify.
   - Include at least: correctness, contract safety, tests, logging, and edge cases.

## Output format (copy/paste into GitHub PR)

## Summary
...

## Changes
### Backend
- ...
### Web API
- ...
### UI
- ...
### Infra/Config/Build
- ...
### Tests
- ...
### Docs
- ...

## API/Contract Impact
- ...

## Data / Migrations
- ...

## Tests
- ...

## Risks / Rollout
- ...

## Reviewer Checklist
- ...

## Notes
- ...

## Constraints (do not violate)
- Do **not** invent changes not shown in the diff.
- If something cannot be verified from the diff, say: **"Not verifiable from diff."**
- Prefer accuracy over completeness.
- If large refactors are present, explain the motivation and highlight any behavior changes.
