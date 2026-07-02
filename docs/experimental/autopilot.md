# Autopilot Mode

> 🧪 **Status:** Experimental
> **Since:** v0.2.140 (steer-runtime) / v0.4.214 (Koda)

Autopilot enables the orchestrator to execute the full SDLC loop autonomously — from Jira ticket to pull request — without pausing for human approval at gates.

## Quick start

```bash
koda chat --autopilot --ws <workspace> "implement <TICKET-ID>"
```

Examples:

```bash
# Implement a Jira story end-to-end
koda chat --autopilot --ws app-payment-controls "implement DPAY-14849"

# Fix a bug
koda chat --autopilot "fix the CSP issue blocking identity SDK in wdpr-payment-demo"

# Works with Cursor too
koda chat --autopilot --target cursor "implement DPAY-14849"
```

## How it works

### Default mode (without autopilot)

```
Analyze → Plan → 🛑 Wait for approval → Implement → Quality → 🛑 Wait for approval → Ship
```

The orchestrator pauses at two gates, presenting results and waiting for the user to say "go ahead."

### Autopilot mode

```
Analyze → Plan → [score ≥ threshold?] → Implement → Quality → [pass?] → Ship
                         │                                        │
                         └── retry with context (max 3x) ─────────┘
```

Gates are replaced by automated quality checks. The orchestrator proceeds when criteria are met, retries when they fail, and escalates to the user only when stuck.

## Decision criteria

| Phase | Auto-proceed when | Retry when | Escalate when |
|-------|------------------|------------|---------------|
| Plan | Tasks defined, routing clear, test strategy present | Plan is vague or incomplete | Cannot determine approach after 2 attempts |
| Implement | Builds successfully, no compilation errors | Build fails (feeds errors back to specialist) | 3 consecutive build failures |
| Quality | Tests pass, no critical security issues | Tests fail (auto-fix + re-run) | 3 fix attempts failed |
| Ship | PR created with proper metadata | PR creation failed (auth, branch issue) | Cannot push or create PR |

## Auto-retry behavior

When a phase fails:

1. Error output is fed back to the responsible agent with context
2. Each retry attempts a different approach (not the same action repeated)
3. Maximum 3 retries per phase
4. After exhausting retries, escalates with a clear summary

## Completion report

When the loop finishes, the orchestrator outputs:

```
[autopilot] ✅ Completed: DPAY-14849

  Phases: analyze → plan → implement → quality → ship
  Iterations: 2 (retries: implement)
  Result: PR #131 opened against develop
  Duration: 4m 23s

  Iteration log:
    #1: implement → tests failed (CSP not in defaults.js)
    #2: implement → fixed, tests pass, review clean
```

## Escalation format

When the orchestrator gets stuck:

```
[autopilot] ⚠️ Blocked at implement after 3 attempts

  Task: fix CSP policy for identity SDK
  Last error: TypeError: Cannot read property 'policy' of undefined
  Attempts:
    #1: Added to env-properties.json → tests fail (not loaded at runtime)
    #2: Added to defaults.js → build error (syntax)
    #3: Fixed syntax → different test failure (integration)

  Need: Which config file does the deployed server actually read for CSP?
```

## Guardrails

Autopilot respects all existing safety rules:

- Never skips tests to move faster
- Never fabricates results or claims tests pass without running them
- Never commits directly to main — always uses feature branches
- Never modifies files outside the task scope
- Never opens a PR with known failing tests

## Implicit behaviors

When `--autopilot` is active, Koda also:

- Sets `--trust-all` automatically (tools execute without per-call prompts)
- Injects the autopilot steering into the appropriate location per runtime (Kiro: `~/.kiro/steering/`, Cursor: `.cursor/rules/`)
- Cleans up the steering file on subsequent non-autopilot sessions

## Configuration

Currently autopilot is binary (on/off). Future iterations may support confidence thresholds:

```bash
# Future: only auto-proceed on high confidence
koda chat --autopilot=cautious "implement DPAY-14849"
```

## When to use

**Good for:**
- Well-defined tickets with clear acceptance criteria
- Bug fixes with reproducible steps
- Feature implementations in codebases with good test coverage
- Tasks the orchestrator has successfully completed before (similar patterns in memory)

**Not ideal for:**
- Exploratory/spike work with unclear requirements
- Architecture decisions that need team discussion
- Changes with high blast radius (infra, auth, data migrations)
- First-time implementations in unfamiliar codebases

## Technical details

The autopilot behavior is entirely **steering-driven** — no runtime changes to kiro-cli or Cursor. The `shared/steering/autopilot.md` file instructs the orchestrator model to change its gate behavior. This means:

- It works with any model that respects steering instructions
- It can be customized per workspace by overriding the steering file
- It degrades gracefully (if the model ignores autopilot rules, it just pauses at gates like normal)
