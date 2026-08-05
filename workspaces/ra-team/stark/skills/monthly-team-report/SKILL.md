---
name: monthly-team-report
description: Generates a consolidated monthly team report from Jira tickets. Searches all team members' closed tickets for a given month (by assignee only), groups work by theme with dynamic categories, and produces a concise executive summary ordered by feature relevance.
---

# Monthly Team Report

## Golden Rules

1. **English-only output**: The report output MUST always be written in English, regardless of the language used in the user's request. This applies to all sections: header, bullets, ticket reference table, and any expanded detail sections. Never translate the report to match the request language.

## When to use

- End of month/sprint to summarize team accomplishments
- Preparing status updates for stakeholders or leadership
- Documenting delivered work for a specific time period
- Generating input for retrospectives or planning meetings

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Team members | Yes | List of Jira usernames or emails to include |
| Month/Period | Yes | The time range to query (e.g., "July 2026") |
| Project prefix | No | Jira project key filter (e.g., "GEW"). Defaults to all projects |

## Tools

The following Jira Cloud MCP tools are available for gathering data:

| Tool | Purpose | Example |
|------|---------|----------|
| `cloud_jira_search_issues` | JQL search for tickets by assignee, status, and date range | Main query for gathering team work |
| `cloud_jira_get_issue` | Read full ticket details (description, acceptance criteria) | Clarify ticket scope for grouping |
| `cloud_jira_get_boards` | List boards to find project board ID | Board GEW → ID 3720 |
| `cloud_jira_get_sprints` | Resolve sprint IDs for a board | Sprint 139/140/141 |
| `cloud_jira_get_sprint_issues` | Get all issues in a specific sprint | Detailed sprint breakdown |

### Usage pattern

1. `cloud_jira_get_boards` → find board ID (e.g., GEW board = 3720)
2. `cloud_jira_get_sprints` → resolve sprint IDs for the target period (e.g., 139, 140, 141)
3. `cloud_jira_search_issues` → JQL query filtered by assignee and resolution date
4. `cloud_jira_get_issue` → read descriptions when ticket summaries are ambiguous for grouping

## Workflow

### Step 1: Gather tickets per team member

For each team member, search Jira Cloud using:

```
assignee = '<user>'
  AND status WAS "Done" DURING ('<month-start>', '<month-end>')
  AND project = '<project-prefix>'
  ORDER BY resolved DESC
```

**Important rules:**
- Query by **assignee only** — do NOT include reporter in the filter
- Use `status WAS "Done" DURING` to capture tickets that were **closed during** the requested period, not just tickets that are currently closed
- If `status WAS` is not supported, use: `resolved >= '<month-start>' AND resolved <= '<month-end>'`

### Step 2: Filter by status

Only include tickets that were **closed/resolved during the requested period**.

**Include:**
- Tickets with `resolutiondate` within the requested month
- Tickets whose status transitioned to Done/Closed during the period

**Exclude:**
- Open tickets or in-development tickets (these are NOT part of the report)
- Backlog items
- Tickets only updated by comments but not actually completed
- Tickets closed before or after the requested period

### Step 3: Deduplicate

If multiple team members participated on the same ticket, count it only once.

### Step 4: Group by theme

Analyze ticket summaries and group into logical themes. Current known categories:

- Generator / Scaffolding updates
- Library releases or fixes
- Infrastructure / CI/CD
- AI / Chatbot features
- Authentication
- Documentation
- Bug fixes
- Migrations / Upgrades
- Performance improvements
- Testing / QA
- Accessibility / WCAG compliance

**Dynamic category rule:** If tickets do not fit any existing category above, create a new category that accurately describes the work. After generating the report, **self-update this SKILL.md file** by adding the new category to the list above so it is available for future reports.

### Step 4.1: Technology grouping rule

When the same feature or fix was implemented across multiple technologies (e.g., Angular, Astro, NestJS), **group them into a single bullet** with the technologies listed in parentheses.

**Rule:** If two or more tickets describe the same logical work but for different tech stacks, combine them:

```markdown
✔️ - Added AI chatbot panel with SSE streaming (Angular, Astro, NestJS)
✔️ - Fixed loading states and animated border in chatbot UI (Angular, Astro)
❌ - Added AI chatbot panel to Angular generator
❌ - Added AI chatbot panel to Astro generator
❌ - Added AI chatbot panel to NestJS generator
```

### Step 4.2: Product family deduplication rule

Some tickets belong to the same **product family** even if their summaries emphasize different layers (UI vs WebAPI). These must be merged into a single bullet.

**Known product families:**

| Family | Packages / Generators | Layer keywords |
|--------|----------------------|----------------|
| RA Generators | `@wdpr/ra-schematics-angular-spa` (Angular), `@wdpr/generator-ra-ui` (Astro), NestJS WebAPI generator | "Generator Update", "SPA", "WebAPI", "fullstack" |

**Rule:** When tickets reference different layers of the same product family (e.g., "Generator Update for Angular", "Generator Update for Astro", "Angular + NestJS WebAPI", "Astro + NestJS WebAPI"), combine ALL of them into a **single bullet** describing the generator release. Do NOT produce separate bullets for "SPA generators" and "fullstack/WebAPI integration" — they are the same deliverable.

```markdown
✔️ - Updated and released RA generators with chatbot panel and fullstack WebAPI integration (Angular, Astro, NestJS)
❌ - Updated and released SPA generators (Angular, Astro, NestJS)
❌ - Delivered fullstack integration packages combining UI generators with NestJS WebAPI scaffolding (Angular + NestJS, Astro + NestJS)
```

**Why:** The Angular SPA generator, Astro generator, and NestJS WebAPI generator are all part of the same release cycle. A "Generator Update for Angular" and an "Angular + NestJS WebAPI" ticket represent the same product being shipped — the generator includes both the SPA scaffolding and the WebAPI scaffolding as a single package.

### Step 5: Generate consolidated summary

Produce a report with:
1. **Header**: Month + team name (if known)
2. **Bullet summary**: Generate as many bullets as needed to cover all themes/features — no maximum or minimum limit
3. **Rules for bullets**:
   - Each bullet should combine related work across team members
   - Use action verbs ("Updated", "Released", "Implemented", "Fixed", "Migrated")
   - Include specific deliverable names (package names, tools, features)
   - Apply the technology grouping rule (Step 4.1) — list techs in parentheses
   - Be concise but specific — avoid vague statements
   - **No specific package/repo names in bullets**: Refer to technologies and blocks at a general level (e.g., "RA generators", "MyID login libraries", "logging infrastructure"). Do NOT include specific npm package names, repository names, or block identifiers like `ra-ui-generator`, `@wdpr/ra-schematics-angular-spa`, or `ra-angular-logger` in the bullet text. Package names belong only in the Ticket Reference table or in the optional detailed expansion sections.
   - Order bullets by feature relevance (most significant deliverables first)

## Output format

```markdown
## <Month Year> — Team Monthly Report

- Bullet: grouped accomplishment (tech1, tech2)
- Bullet: grouped accomplishment
- ...(as many as needed)
```

## Example output

```markdown
## July 2026 — Team Monthly Report

- Upgraded and released new versions of the SPA generators with AI chatbot panel integration and Node.js v24 migration (Angular, Astro, NestJS)
- Implemented real-time SSE streaming chatbot with conversation history and system prompt presets (Angular, Astro, NestJS)
- Fixed chatbot UI: loading indicators, animated border beam effects, auto-scroll, and text overflow handling (Angular, Astro)
- Added configurable localStorage key names for auth tokens in MyID login libraries (Angular, Agnostic)
- Improved logging infrastructure: structured JSON output to logasaurus, SSE support in HTTP library, and Trips Logger fix
- Delivered internal demo applications showcasing the full AI-powered chatbot experience end-to-end (Angular, Astro)
```

## Configuration options

### Detailed report (optional expansion)

If the user requests more detail, expand each bullet into a section with sub-bullets listing specific tickets:

```markdown
### Generators & Schematics
- Updated Angular SPA generator (GEW-1819)
- Updated Astro generator (GEW-1820)
- Updated NestJS generator (GEW-1821)
- Added Dockerfile support (GEW-1757)
```

### Per-person breakdown (optional)

If the user requests individual contributions, add a section per team member after the consolidated summary.

## Self-update rule

After generating a report, if any new category was created in Step 4 that does not exist in this file:

1. Read this SKILL.md file
2. Add the new category to the bullet list under "Step 4: Group by theme"
3. Write the updated file back

This ensures the skill evolves with the team's work patterns over time.

## Ticket reference table

After the consolidated summary, always include a reference table listing all tickets that were included in the report. This provides traceability and allows stakeholders to drill into specific items.

**Format:**

```markdown
### Ticket Reference

| Ticket | Title | Assignee | Theme |
|--------|-------|----------|-------|
| [GEW-1815](https://disneyexperiences.atlassian.net/browse/GEW-1815) | Add SSE chatbot to Angular SPA generator | user1 | AI / Chatbot |
| [GEW-1965](https://disneyexperiences.atlassian.net/browse/GEW-1965) | Chatbot UI fixes — loading, border, scroll, overflow | user2 | Bug fixes |
| ... | ... | ... | ... |
```

**Rules:**
- List ALL tickets that contributed to the report
- Sort by theme (same order as the grouped bullets above)
- Include clickable Jira links using the format `[KEY](https://disneyexperiences.atlassian.net/browse/KEY)`
- The Title column uses the ticket summary as-is from Jira
- The Theme column matches the category assigned in Step 4

## Checklist

- [ ] All team members' emails/usernames provided
- [ ] Correct month range confirmed
- [ ] Tickets queried by **assignee only** (not reporter)
- [ ] Only tickets **closed during the period** included
- [ ] Duplicates removed
- [ ] Grouped by logical theme (dynamic categories if needed)
- [ ] Same feature across techs grouped in single bullet with parenthetical tech list
- [ ] Bullets ordered by feature relevance (most significant deliverables first)
- [ ] Report output is in English (regardless of request language)
- [ ] Self-update SKILL.md if new categories were created
- [ ] Ticket reference table included at the bottom with all IDs and titles
