# Depth calibration

> 🧪 **Status:** Experimental
> **Since:** v0.2.160 (steer-runtime)

Adapts output detail level based on task complexity — prevents verbose 50-line plans for one-line fixes and terse 3-bullet plans for architectural changes.

## Quick start

Automatic — the orchestrator assesses complexity before planning and announces:

```
Depth: standard (3 files, clear approach)
```

Override with: "keep it short" → minimal, "be thorough" → detailed.

## Depth levels

| Level         | Trigger                                            | Plan output                              | Gate behavior           |
|---------------|----------------------------------------------------|------------------------------------------|-------------------------|
| Minimal       | Single file, <10 lines, config/typo/version bump   | 1-2 sentences, skip plan gate            | Quality gate only       |
| Standard      | 2-5 files, clear approach, tests needed            | 3-5 bullet plan                          | Normal gates            |
| Detailed      | 5+ files, new patterns, cross-layer changes        | Full plan with file list + test strategy | Normal gates            |
| Comprehensive | Architecture, new service, migration, 3+ layers    | Auto-selects propose-judge strategy      | All gates + Gate 0      |

## Auto-detection rules

The orchestrator evaluates:

- Number of files likely affected
- Whether tests are needed
- Whether new patterns/dependencies are introduced
- Number of architectural layers touched (UI, API, backend, DB)

## User override

```
"just do it"          → minimal (skip plan gate)
"keep it short"       → minimal
"be thorough"         → detailed
"propose options"     → comprehensive (triggers propose-judge)
```

## Relationship to strategies

| Depth | Strategy |
|-------|----------|
| Minimal | Standard (abbreviated — skips plan gate) |
| Standard | Standard |
| Detailed | Standard |
| Comprehensive | Propose-judge (auto-selected) |
