# Config Studio — AI Working Agreement (All Repos)

## Non-negotiables
- Do **not** break existing public backend endpoints or response schemas. Prefer additive changes or new endpoints.
- Avoid introducing new secrets or hard-coded tokens. Use env vars and documented local dev mechanisms.
- Preserve backwards compatibility across UI ↔ WebAPI ↔ Backend boundaries.

## Change hygiene
- Keep diffs minimal and intentional.
- Remove dead code and temporary debug scaffolding before finalizing.
- Keep logs useful: prefer structured logs; keep noisy logs at DEBUG.

## Testing expectations
- Any behavior change needs tests (or a documented justification).
- Ensure lint/unit tests run locally and in CI.


## Cross-repo coordination
- UI changes that assume new API fields must be additive + tolerant of missing fields.
- If a contract change is unavoidable, create a new versioned endpoint or feature-gated behavior.

## AI Skills

### Skill: Pull Request Summary Generator

Purpose:
Generate a production-ready Pull Request description based on the current branch diff against `develop`.

Usage:
1. From repository root, run:
   ```
   ./tools/pr-summary-input.sh develop
   ```
   (or manually run `git diff develop...HEAD` if the script is unavailable)

2. Paste the output into Kiro.
3. Instruct Kiro: "Generate PR summary using pr-summary.md template."

Requirements:
- Must not invent changes not present in the diff.
- Must explicitly state API/contract impact and backward compatibility.
- Must mention migrations, data changes, and concurrency impact if present.
- Must include reviewer checklist.
- Must follow the structured output format defined in `.kiro/prompts/pr-summary.md`.

This skill ensures consistent, high-quality PR descriptions across Config Studio repositories.

---

### Skill: Create Pull Request (GitHub CLI)

Purpose:
Create a Pull Request targeting `develop` using GitHub CLI (`gh`) with a structured body generated from the PR Summary skill.

Usage (recommended end-to-end flow):

1. Collect diff input:
   ```
   ./tools/pr-summary-input.sh develop > /tmp/pr-diff.txt
   ```

2. Paste `/tmp/pr-diff.txt` into Kiro.

3. Instruct:
   ```
   Generate PR summary using pr-summary.md template. Output ONLY the final PR body in Markdown (no extra commentary).
   ```

4. Save the output as:
   ```
   /tmp/pr-body.md
   ```

5. Create the PR:
   ```
   gh pr create \
     --base develop \
     --head "$(git branch --show-current)" \
     --title "$(git branch --show-current)" \
     --body-file /tmp/pr-body.md
   ```

Requirements:
- Must not be executed from the `develop` branch.
- Must ensure `gh auth login` has been completed.
- Must target `develop` unless explicitly overridden.
- PR body must be generated from the PR Summary skill (no manual free-form bodies).
- Must fail early if diff is empty.

Notes:
- Replace `--title` with Jira-style format when required (e.g., `DPAY-12345: Short description`).
- If repository uses a different base branch, replace `develop` accordingly.
- This skill enforces structured, review-ready Pull Requests.

### Skill: Jira Story Implementation Audit

Purpose:
Verify that a Jira story has been fully implemented according to its Acceptance Criteria and non-functional requirements.

Usage:
1. Provide the Jira story description (or link + copied content).
2. Instruct Kiro: "Audit this implementation against the Jira story using the Story Audit skill."
3. Provide relevant files or ask Kiro to inspect the repository.

Requirements:
- Must reconstruct all Acceptance Criteria explicitly.
- Must map each AC to concrete code locations.
- Must flag missing, partial, or risky implementations.
- Must assess production-readiness and concurrency risks.
- Must not assume implementation without verifying from code.

---

### Skill: Breaking Change Detector

Purpose:
Detect accidental API, contract, or schema breaking changes before merging.

Usage:
1. Generate a diff against `develop`.
2. Instruct Kiro: "Run Breaking Change Detector on this diff."
3. Provide the diff output.

Requirements:
- Must identify modified request/response models.
- Must detect endpoint signature changes.
- Must detect schema or migration changes.
- Must explicitly state backward compatibility impact.
- Must recommend mitigation (versioning, feature flags, additive change).

---

### Skill: Atomicity & Concurrency Review

Purpose:
Review code paths that modify shared state to ensure atomic correctness and absence of race conditions.

Usage:
1. Provide the relevant service/DAO classes.
2. Instruct Kiro: "Perform Atomicity & Concurrency Review on this implementation."

Requirements:
- Must verify transaction boundaries.
- Must detect select-then-update anti-patterns.
- Must evaluate connection-scoped operations (e.g., LAST_INSERT_ID usage).
- Must identify potential deadlocks or high-contention hotspots.
- Must recommend safer patterns if risk exists.

---

### Skill: Refactor Safety Check

Purpose:
Validate that refactors preserve behavior and do not introduce silent regressions.

Usage:
1. Provide diff of the refactor branch.
2. Instruct Kiro: "Run Refactor Safety Check."

Requirements:
- Must verify no logic behavior change unless explicitly stated.
- Must confirm tests still cover critical paths.
- Must detect removed validations or altered error handling.
- Must highlight risky deletions or renamed methods affecting contracts.

---

### Skill: Cross-Layer Impact Assessment

Purpose:
Evaluate how a backend or API change affects UI, WebAPI, and downstream consumers.

Usage:
1. Provide the change description or diff.
2. Instruct Kiro: "Perform Cross-Layer Impact Assessment."

Requirements:
- Must identify UI assumptions affected.
- Must verify additive vs breaking behavior.
- Must highlight required updates in sibling repos.
- Must recommend a safe rollout strategy.
