
# Fix Version Audit — Agent Instructions

When this steering is active, you are performing a JIRA fix version validation audit for DLP service deployments.

## Context Files

Always read these files first:
- #[[file:audit/config/validation-context-database.json]] — persistent state, configuration, and history
- #[[file:audit/docs/process.md]] — step-by-step process

## Behavior

### Default Mode (no CHG number provided)

1. Read the context database
2. Query ServiceNow for production changes using the CI filters and date range from the database
3. Filter out infrastructure changes using `infrastructure_skip_patterns`
4. Filter out already-validated changes using `validated_changes`
5. For each remaining change (process as many as context allows):
   a. Get CTASKs and extract service names + versions
   b. Verify deployment in AWS ECS (use correct cluster from `cluster_routing`)
   c. Get previous version from task definition history
   d. Analyze code changes via GitHub MCP (`github_disney` server). If you need commit-level comparison between tags and GitHub MCP can't provide it, ask the user for the local repo path (default: `C:\Users\cristian.lm\Desktop\disney\apps`)
   e. Extract JIRA tickets from PRs/commits
   f. Get fix versions from JIRA (cloud ID: `b74e5abb-bafa-4a52-88a5-7fe9ba830b63`)
   g. Validate fix versions against expected release
   h. Generate report and save to `audit/reports/`
   i. Update the context database (add to `validation_history`, `validated_changes`, `pending_ticket_updates`)
6. After all validations, present a summary and ask: "Would you like me to update the JIRA fix versions for the tickets that need it?"

### Specific CHG Mode (CHG number provided)

Skip steps 2-4. Go directly to step 5 for the provided change request.

## Fix Version Validation Rules

A JIRA ticket must have one of:
- **NA** — no code changes
- **Release Backlog** — not yet deployed (only valid BEFORE deployment)
- **Actual release version** (e.g., "APP BACK 26.1.1.1 - Holley") — deployed to production

After deployment, "Release Backlog" is WRONG. It must be updated to the actual release.

## Validation Statuses

- ✅ **CORRECT** — fix version matches the release
- ⚠️ **RELEASE_BACKLOG** — still says "Release Backlog", needs update
- ❌ **MISSING** — no fix version assigned
- ❌ **INCORRECT** — has a different release version
- ℹ️ **NA** — marked as NA, verify no code changes exist

## AWS Cluster Routing

- **Most services** → `dlp-apps-S0001481-euw1-prd`
- **Ticket Management Service** → `dlp-apps-S0001479-euw1-prd`
- **Mobile BFF CORE** → `dlp-apps-B0245900-euw1-prd`

Always use profile `dlp-apps-prod` and region `eu-west-1`.

## Target Users

Track contributions from: HERRD090, RAMIL163, LOPEC462, DAKEP001, NIETE007, AMULM002, SANTR347, SUARK027, CALVA048, AREAS001, LUSTC011

**Important**: Only commits from these users should be analyzed. Commits from other users are outside the team's scope — note them in the report but don't flag their tickets for fix version updates.

## Report Format

Save reports to `audit/reports/{service-short-name}-{previous}-to-{current}.md`

Include:
1. Release information (CHG, release name, date)
2. Validation summary table (counts by status)
3. Compliance percentage
4. Tickets requiring action (with current and expected fix versions)
5. Correctly tagged tickets
6. Target users found with their tickets and commit counts

## Important Notes

- Never update JIRA tickets without explicit user confirmation
- Always update the context database after each validation
- If a service mapping is missing from the database, add it during the validation
- If GitHub MCP can't compare tags, ask for the local repo path before falling back to Git CLI
