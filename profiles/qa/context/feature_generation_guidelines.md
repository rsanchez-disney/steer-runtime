# Feature Generation Guidelines

## Rules

- ONLY use steps that exist in the step catalog or repo. NEVER invent steps.
- If a step is not in the catalog, do NOT include it. Report it as missing.
- Every generated .feature file MUST pass `behave --dry-run` before being presented to the user.

## Dry Run (mandatory)

After generating each .feature file, run:

```
behave --dry-run {path_to_feature_file}
```

- If it passes → include in output
- If it fails (undefined steps) → remove the undefined steps, report them to the user, and retry
- Do NOT present a .feature file that fails dry-run

## Prerequisites / Background Steps

Some steps look like prerequisites (e.g., "I have a reservation with X", "I create a user with Y"). These are NOT regular Given steps — they require complex setup.

When you encounter a step that looks like a prerequisite:

1. **Search the repo** for how other scenarios handle it:
   - Look in existing `.feature` files for similar Background sections
   - Check if there's a dedicated setup step (e.g., `Given I create a ticket through serenity service`)
   - Check if it's handled via fixtures or environment.py

2. **Report to the user:**
   > "⚠️ Prerequisite detected: `{step_text}`
   > In the repo, this is handled by: `{how_other_scenarios_do_it}`
   > Should I use that approach or skip this step?"

3. **Wait for user response** before including the prerequisite.

## How to Identify Prerequisites

A step is likely a prerequisite if it:
- Creates data (users, tickets, reservations, bookings)
- Sets up state ("I have...", "I am logged in as...", "there exists a...")
- References external services (serenity, order VAS, booking service)
- Appears in Background sections of other features

## Output Format

```gherkin
@{EPIC-KEY}
Feature: {Feature name from TC summary}

  @{TC-KEY}
  Scenario: {TC summary}
    Given {step from catalog}
    When {step from catalog}
    Then {step from catalog}
```

- Tag feature level with epic/parent key
- Tag scenario level with TC key
- Use steps EXACTLY as they appear in the catalog (including parameters)
