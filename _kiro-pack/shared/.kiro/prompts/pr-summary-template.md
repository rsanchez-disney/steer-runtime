# PR Summary Generator Template

You are reviewing code changes to prepare a Pull Request summary.

## Goal

Produce a PR description that is accurate, reviewable, and safe for
production.

------------------------------------------------------------------------

## Instructions

Based strictly on the provided git diff:

1.  Summarize intent (1--2 sentences)
    -   What problem is being solved and why this change exists.
2.  Describe key changes grouped by area:
    -   Backend (Java)
    -   Web API (Node)
    -   UI (Angular)
    -   Infra/Config/Build
    -   Tests
    -   Docs
3.  API / Contract Impact (MANDATORY)
    -   List modified endpoints (paths, methods)
    -   List request/response model changes
    -   State explicitly: Backward compatible? (Yes/No) and why
    -   If none: say "No API/contract changes."
4.  Data / Schema / Migrations (MANDATORY)
    -   Mention schema changes or migration scripts
    -   Include migration filenames
    -   Note if backfill is required
5.  Testing (MANDATORY)
    -   Tests added/updated
    -   Coverage changes if relevant
    -   If no tests added, explain why
6.  Risks / Rollout
    -   Concurrency risks
    -   Atomicity concerns
    -   Performance implications
    -   Feature flags or rollout steps
7.  Reviewer Checklist (4--8 bullets)
    -   Contract safety
    -   Migration correctness
    -   Concurrency correctness
    -   Logging
    -   Edge cases

------------------------------------------------------------------------

## Output Format

## Summary

...

## Changes

### Backend

-   ...

### Web API

-   ...

### UI

-   ...

### Infra/Config/Build

-   ...

### Tests

-   ...

### Docs

-   ...

## API / Contract Impact

...

## Data / Migrations

...

## Tests

...

## Risks / Rollout

...

## Reviewer Checklist

-   ...

## Notes

-   ...

------------------------------------------------------------------------

## Constraints

-   Do NOT invent changes not present in the diff.
-   If something cannot be verified from the diff, state: "Not
    verifiable from diff."
-   Prefer accuracy over completeness.
-   Output ONLY the final PR body in Markdown (no commentary outside the
    template).
