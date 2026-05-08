# PR Description Generator

Generate pull request descriptions following the DPE PULL_REQUEST_TEMPLATE.md format based on git changes.

## When This Rule Activates

- User asks to "create a PR description", "generate PR description", or "write PR description"
- User asks to "prepare for PR" or "get this ready for review"
- Code review agent completes a review and the verdict is ✅ Approve

## Instructions

1. **Read the PR template**: Locate and read `.github/PULL_REQUEST_TEMPLATE.md` in the current repo. If not found, use the standard DPE template below.

2. **Get changes**: Collect the full diff using both:
   - `git diff --cached` — staged changes
   - `git diff origin/master...HEAD` — all commits in current branch vs remote master
   Merge both outputs to get the complete picture of what this PR introduces.

3. **Extract ticket context**: Look for ticket number (PPODPE-XXXX) in branch name, commit messages, or user's request.

4. **Generate PR description** with:
   - **Title**: Conventional Commits format: `<type>[scope]: [PPODPE-XXXX] <description>`
   - **Description**: What changed, why, and motivation. Include BEFORE/AFTER for behavioral changes.
   - **Related Issues**: Jira ticket links (`https://myjira.disney.com/browse/PPODPE-XXXX`)
   - **Execution**: Confirm `mvn clean verify` status
   - **Checklist**: Mark relevant items based on changes
   - **Cross-Impact Integration Tests**: Identify indirect consumers of the changed behavior using the `integration-test-cross-impact` rule. Fill the impact table if the change touches shared components (calculators, data loaders, cache, DTOs, schema). Mark N/A if the change is isolated.
   - **Acceptance Criteria Coverage**: If a Jira ticket is linked, retrieve ACs (via MCP or PR description) and map each to its implementation file and test. Mark status per AC (✅/⚠️/❌). Mark N/A if no ticket or ACs are defined.
   - **Design Repo Changes**: Flag if DB schema, Swagger, or API contracts changed
   - **PR Dependencies**: List dependent PRs if any
   - **Files Changed**: List added/modified/deleted files with brief descriptions

5. **Output format**:
   - If `PR_DESCRIPTION.md` does not exist, create it
   - If it already exists, create `PR_DESCRIPTION_<ticket>_<description>.md`

## Conventional Commit Types

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style/formatting |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |
| `perf` | Performance improvements |

## DPE PR Template (fallback)

```markdown
## 📋 PR Title Format (Conventional Commits Required)

**Title:** <type>[scope]: [PPODPE-XXXX] <description>

---

## 📦 Description

<What changed, why, and motivation. Include BEFORE/AFTER for behavioral changes.>

---

## 🔗 Related Issues

- [ ] https://myjira.disney.com/browse/PPODPE-XXXX
- [ ] No Jira tickets are associated with this PR.

---

## 🛠 Execution

- [ ] I ran `mvn clean verify` and the build succeeded (`BUILD SUCCESS`).

---

## ✅ Checklist

- [ ] PR title follows Conventional Commits format
- [ ] All existing and new tests are passing.
- [ ] I updated/added relevant documentation.
- [ ] There are no exposed secrets or keys in this change.
- [ ] I started a thread in the Bluey Command Center channel with a link to this PR.

---

## 🧪 Cross-Impact Integration Tests

- [ ] Identified indirect consumers of the changed behavior (see `integration-test-cross-impact` rule)
- [ ] Integration tests cover non-obvious downstream impacts
- [ ] Multi-product/multi-calculator scenarios tested where applicable
- [ ] N/A — change is isolated with no cross-service or cross-component impact

**Impacted areas (if any):**

| Changed Area | Indirect Consumer | Test Added/Existing |
|---|---|---|
| <e.g., rate resolution> | <e.g., bundle calculators> | <test name or "existing"> |

---

## ✅ Acceptance Criteria Coverage

- [ ] All ACs from the Jira ticket are implemented and tested
- [ ] Partial coverage — gaps documented below
- [ ] N/A — no Jira ticket or ACs defined

| AC | Status | Implementation | Test |
|---|---|---|---|
| AC1: <short description> | ✅ / ⚠️ / ❌ | `File.java` L## | `TestFile.java#method` |

---

## 🗂 Design Repo Changes

- [ ] Yes, this impacts the designs, and I've updated the documentation.
- [ ] No, this PR does not affect the designs.

---

## 🔗 PR Dependencies

- [ ] Yes, the relevant PRs are listed below.
- [ ] No, this PR stands on its own.

---

## 📁 Files Changed

| File | Change | Description |
|------|--------|-------------|
| `path/to/file` | Modified | Brief description |
```

## Language

Always write PR descriptions in English.
