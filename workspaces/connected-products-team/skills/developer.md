---
name: developer
description: Development workflow skill enforcing branch discipline, changelog documentation, build validation, and test discipline. Use when making code changes to any project.
---

# Developer Skill

## Workspace Structure

This workspace contains multiple independent git projects in separate folders. Each folder is its own repository with its own remotes, branches, and changelog. Projects are interrelated but independently versioned and deployed.

When receiving a request:
1. Identify which project(s) the change applies to
2. If the request spans multiple projects, confirm with the user before proceeding
3. If unsure which project is the target, ask the user first
4. Apply all development rules (remotes, changelog, build, tests) independently per project
5. Each project has its own `agents-playground/` folder for project-specific metadata (e.g., `base-branch.json`)

## Workflow Sequence

For every code change request, follow this order:
1. Detect remote setup (fork-based or direct-push)
2. Identify/confirm base branch
3. Ensure working branch is not the base branch (create or switch to a feature branch)
4. Make the code changes
5. Update `CHANGELOG.md`
6. Run full build with tests
7. Commit and push
8. Create PR (if requested)

## Remote Setup Detection

Before making any code modification, detect the project's git workflow:

1. Check remotes: `git remote -v`
2. Classify the setup:

### Fork-based setup (origin = user fork, upstream = org repo)
- `origin` points to the user's personal namespace (fork)
- `upstream` points to the org/team repo
- Push to `origin`, create PRs against `upstream`

### Direct-push setup (origin = org repo, no upstream)
- `origin` points directly to the org/team repo (e.g., `EDT/my-service`)
- No `upstream` remote exists
- Push feature branches to `origin`, create PRs against base branch on `origin`

### How to decide:
- If `origin` contains the user's personal namespace → fork-based
- If `origin` contains the org namespace (e.g., `EDT/`, `cpx/`) → direct-push
- If uncertain, ask the user: "Is this a fork or do you push directly to the org repo?"

**Rules:**
- In fork-based mode: never push directly to upstream
- In direct-push mode: never push directly to the base branch (only feature branches)
- Save the detected mode in `agents-playground/base-branch.json`

## Base Branch Identification

1. On first interaction with a repo, check for `agents-playground/base-branch.json`
2. If it doesn't exist, ask the user to confirm the base branch and save it:
   ```json
   {
     "baseBranch": "<branch-name>",
     "remote": "<remote-name-for-PRs>",
     "mode": "fork" | "direct",
     "upstream": "<upstream-remote-url (fork mode only)>"
   }
   ```
3. Ensure `agents-playground/` is in `.gitignore`
4. Use this base branch when creating PRs

## Branch Discipline

- Never commit directly to the base branch
- Before starting work, verify the current branch is a feature branch (not the base branch)
- If on the base branch, create a new branch before making changes

### Branch Naming Convention

Branches must include the Jira ticket ID at the beginning:

```
<type>/<TICKET-ID>_<short_description>
```

**Types:** `feature`, `fix`, `refactor`, `chore`, `test`

**Examples:**
- `feature/SHOWREADY-466_zone_index_auto_assign`
- `fix/SARG-154_createdBy_header`
- `refactor/SHOWREADY-470_notification_pattern`

The ticket ID is extracted from the Jira URL (e.g., `https://disneyexperiences.atlassian.net/browse/SHOWREADY-466` → `SHOWREADY-466`).

### Ticket Tracking

When starting a new change:
1. Ask the user for the related Jira ticket (URL or ID)
2. Save the ticket-branch relationship in `agents-playground/current-work.json`:
   ```json
   {
     "active": "SHOWREADY-562",
     "wip": [
       {
         "ticket": "SHOWREADY-546",
         "ticketUrl": "https://disneyexperiences.atlassian.net/browse/SHOWREADY-546",
         "branch": "feature/SHOWREADY-546_multitenant_support",
         "description": "Multitenant support"
       },
       {
         "ticket": "SHOWREADY-562",
         "ticketUrl": "https://disneyexperiences.atlassian.net/browse/SHOWREADY-562",
         "branch": "feature/SHOWREADY-562_unify_comments",
         "description": "Unify task comments and action comments"
       }
     ]
   }
   ```
3. Use this information when creating commits and PRs

**Multitasking rules:**
- Multiple tickets can be in WIP simultaneously, but only one is `active` at a time
- The `active` field indicates which ticket is currently being worked on
- When the user switches context to another ticket, update `active` and checkout the corresponding branch
- Each ticket has its own branch — never mix changes across tickets on the same branch

## Changelog Discipline

Every code change must be accompanied by a changelog entry in `CHANGELOG.md` (at the project root) with this table format:

| Date | Change | Breaks Tests | Signed-off-by |
|------|--------|:---:|---|
| YYYY-MM-DD | Description of the change | ✓ (if applicable) | @username |

- Only add `✓` in "Breaks Tests" if the change required modifying existing tests
- One entry per logical change (no duplicates)
- Entries are added in reverse chronological order (newest first)
- **When a test breaks due to a code change, a changelog entry is mandatory** — document the code change that caused the test to break, not the test fix itself

## Build Validation

At the end of every development task:
1. Detect the build tool:
   - `pom.xml` → `mvn clean test -s settings.xml`
   - `package.json` → `npm test`
   - `Cargo.toml` → `cargo test`
   - `build.gradle` → `./gradlew test`
   - `*.csproj` / `*.sln` → `dotnet test`
   - `pubspec.yaml` → `flutter test`
2. Run a full local build with tests
3. All tests must pass before considering the task complete
4. If tests fail due to the change, fix them
5. Report the build result to the user

## Test Discipline

- **Modifying existing tests**: Only allowed when the implementation change makes the existing test invalid (e.g., method signature changed, behavior intentionally changed). Document in changelog with "Breaks Tests" marker.
- **New unit tests**: When requested, create new test cases covering all required scenarios. Do NOT modify existing tests when writing new ones.
- **Test-only PRs**: When the request is exclusively for adding tests, only new test files/methods are allowed. No modifications to existing tests or production code.

## Code Changes Only

- Only source code and configuration changes are accepted in PRs
- No IDE files (`.idea/`, `.vscode/`, `.classpath`, `.settings/`)
- No generated files or build artifacts (`target/`, `node_modules/`, `dist/`, `build/`)
- Ensure `.gitignore` covers IDE-specific and generated files
- Never use fully qualified class names in code — always add an import, even for a single use

## Commit Messages

Use conventional commit format with ticket ID:
```
<type>(<TICKET-ID>): <short description>

<optional body with details>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Example: `feat(SHOWREADY-466): add ZONE_ index for auto-assign lookup`

**Important:** Never commit or push unless the user explicitly requests it.

## PR Creation

When creating a PR:
1. Read `agents-playground/base-branch.json` for the target branch and mode
2. Push to `origin`
3. Create PR:
   - **Fork mode**: PR targets upstream's base branch
   - **Direct mode**: PR targets base branch on origin
4. Use a descriptive title (< 70 chars)
5. Include a summary of changes in the PR body
6. **Add a comment to the Jira ticket** with the PR title in heading format, linking both the ticket ID and the PR number.
   Use the `mcp_atlassian_addcommenttojiraissue` tool (NOT `cloud_jira_comment_on_issue`) with `contentFormat: "markdown"` and standard markdown syntax.
   The `cloudId` should be `disneyexperiences.atlassian.net`.

   Comment body (markdown format):
   ```
   # feat([TICKET-ID](https://disneyexperiences.atlassian.net/browse/TICKET-ID)): short description [#NN](https://github.disney.com/ORG/REPO/pull/NN)
   ```

   **Important:**
   - Use `mcp_atlassian_addcommenttojiraissue` with `contentFormat: "markdown"` — this renders headings and links correctly.
   - Do NOT use `cloud_jira_comment_on_issue` — it sends plain text without formatting.
   - Use standard markdown syntax (`# heading`, `[text](url)`) — NOT Jira wiki markup (`h1.`, `[text|url]`).
7. **Remind the user to fill out the AI Usage form**: https://docs.google.com/forms/d/e/1FAIpQLSeqlnsHZjIwxGxtVXmaKXBz584Nv4U7plbeY0UYOkxVp_bYBw/viewform

---

## Checklists

### Before Starting Work

| # | Check | Done |
|---|-------|:---:|
| 1 | Remote setup detected (fork or direct-push) | |
| 2 | Base branch identified (`agents-playground/base-branch.json` exists) | |
| 3 | Jira ticket identified and saved to `agents-playground/current-work.json` | |
| 4 | On a feature branch (not the base branch) | |
| 5 | Branch name follows convention (`<type>/<TICKET-ID>_<description>`) | |

### Before Committing

| # | Check | Done |
|---|-------|:---:|
| 1 | Code changes are complete | |
| 2 | `CHANGELOG.md` updated (with "Breaks Tests" if applicable) | |
| 3 | Full build with tests passes locally | |
| 4 | No IDE files or build artifacts staged | |
| 5 | Commit message follows convention (`<type>(<TICKET-ID>): <description>`) | |
| 6 | User explicitly requested the commit | |

### Before Creating PR

| # | Check | Done |
|---|-------|:---:|
| 1 | All "Before Committing" checks pass | |
| 2 | Branch pushed to origin | |
| 3 | PR targets the correct base branch (upstream for fork, origin for direct) | |
| 4 | PR title is descriptive (< 70 chars) | |
| 5 | PR body includes summary of changes | |
| 6 | No IDE/generated files in the diff | |
| 7 | Jira ticket commented with PR link | |
| 8 | User reminded to fill out AI Usage form | |

### When Tests Break

| # | Check | Done |
|---|-------|:---:|
| 1 | Test modification is justified by a code change (not arbitrary) | |
| 2 | Changelog entry added with "Breaks Tests" marker | |
| 3 | Only the minimum test changes needed are made | |
| 4 | Build still passes after test fix | |
