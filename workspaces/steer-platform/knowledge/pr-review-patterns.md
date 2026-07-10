# PR review patterns — lessons learned

## Common blocker patterns in steer-runtime PRs

### 1. Global profile pollution

**Pattern:** A workspace team adds a `file://` resource to `profiles/<shared>/agents/*.json` that points to their workspace-specific skill or context.

**Why it breaks:** Every other team using that profile gets a file-not-found error because the path only resolves from the POS/Beast/etc workspace.

**Example (PR #582):**

```json
// profiles/ba/agents/requirements_analyst_agent.json
"resources": [
  "file://.kiro/context/ba_guidelines.md",
  "file://../../../skills/epic-qa-workflow/SKILL.md"  // ← POS-specific, breaks everyone else
]
```

**Fix:** Use workspace-level agent overrides instead of modifying shared profiles.

### 2. Path mismatch (underscores vs hyphens)

**Pattern:** Agent JSON references a path with underscores but the actual directory uses hyphens (or vice versa).

**Example (PR #582):**

```json
"file://../../../skills/automate_pos_scenarios/SKILL.md"
// Actual: skills/automate-pos-scenarios/SKILL.md
```

**Why it breaks:** Linux/macOS filesystems are case-sensitive and literal about characters. Windows might work but CI won't.

### 3. Fork PRs with source branch "main"

External contributors fork the repo and their PR shows `main → main`. This is normal.

**Key rule:** After merging, do NOT delete the source branch — it's `main` on their fork. Use `--admin` for merge if branch protection blocks it, but never `--delete-branch` on fork PRs.

## Review workflow

1. Check files changed — are they scoped to one workspace?
2. If touches `profiles/` — is it team-agnostic?
3. Validate `file://` paths mentally (count `../` depth from agent JSON location)
4. Look for missing newlines at EOF
5. Approve if no blockers; comment nits without blocking

## Tone examples

Good:

> Hey team! Great work on this. One thing to fix before merge: the path in sdet_agent.json uses underscores but the directory uses hyphens — this will fail on Linux. Quick fix and we're good to go! 🚀

Bad:

> REJECTED. Path is wrong. Fix it.
