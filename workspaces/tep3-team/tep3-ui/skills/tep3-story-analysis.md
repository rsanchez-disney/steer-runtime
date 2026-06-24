---
name: tep3-story-analysis
description: Analyzes a TEP3 Jira ticket and explores UI repos to produce a file map and scope summary. Use when the user asks to "analyze", "explore", or mentions a TEP3-XXXXX ticket for initial investigation. Focused on UI repos (uc-spa, com-uc-ui-components, cart-ui). Also used as Step 1 of tep3-spec-flow.
---

# TEP3 Story Analysis (UI)

Analyzes a TEP3 Jira ticket and produces a codebase map focused on UI repositories.

---

## Step 1 — Fetch Jira Ticket

Query `myjira.disney.com` for the ticket:
- Summary, description, acceptance criteria
- Story points, sprint, status, assignee
- Parent story / epic links
- Linked tickets (blocks, is-blocked-by, relates-to, **implements**)

**Important:** If the ticket type is a **Task** (not a Bug), the full acceptance criteria and business rules will be in the **parent Story** linked via "implements". Always fetch that parent story for the complete ACs/BRs.

---

## Step 2 — Determine Ticket Nature

Based on the ticket summary and description, classify the work:

### If the ticket is a **Validation** task:
- The feature is **already implemented** — the goal is to verify it works correctly using TEP3 product structure.
- Skip codebase exploration (Steps 3-4) and instead produce **test scenarios** (go to Step 5).

### If the ticket is a **Development** task:
- Continue with Steps 3-4 (codebase exploration + file map).

### If the ticket is a **Bug**:
- Continue with Steps 3-4, focused on identifying the root cause.

---

## Step 3 — Identify Impacted Repos (Development/Bug only)

Based on the ticket description and ACs, determine which UI repos are impacted:
- `wdpr-ecommerce-uc-spa` — Angular SPA (checkout flow)
- `com-uc-ui-components` — Polymer web components
- `wdpr-ecommerce-wdpr-cart-ui` — Angular Cart SPA

Also note if BFF repos are involved (for context only):
- `wdpr-ecommerce-uc-api` — Node BFF
- `wdpr-ecommerce-wdpr-cart-api` — Cart BFF

---

## Step 4 — Explore Codebase & Produce File Map (Development/Bug only)

For each impacted UI repo:
1. Search for keywords from the ticket (feature flags, component names, API endpoints)
2. Trace the data flow from entry point to render
3. Identify files that will need modification

Output:

```markdown
## TEP3-XXXXX: [Summary]

**Scope:** [1-sentence description]
**Story Points:** N | **Sprint:** SPXXX | **Status:** [status]
**Parent:** TEP3-YYYY (implements)

### Impacted Files

#### [repo-name]
| File | Reason |
|------|--------|
| path/to/file | [why] |

### Key Findings
- [finding 1]

### Open Questions
- [question 1]
```

---

## Step 5 — Produce Validation Scenarios (Validation only)

For each AC in the parent story, produce a test scenario:
- **Scenario name** — short descriptive name
- **ACs covered** — list which ACs this scenario validates (combine multiple ACs into one scenario when possible)
- **Product type needed** — what kind of product to set up (e.g. "2-day 1PPD adult+child, park-agnostic")
- **Setup** — how to get into the right state (cart setup, headers, debug page entry)
- **Steps** — what to do in the UI
- **Expected result** — what to verify

When scenarios require entering UC with specific product configurations, use the `uc-debug-payload` skill to generate the appropriate request body. Reference it in the Setup section.

Output:

```markdown
## TEP3-XXXXX: Validation Scenarios

**Parent Story:** TEP3-YYYY
**Total ACs:** N | **Scenarios:** M

### Scenario 1: [name]
**Covers:** AC1, AC3
**Product:** [description]
**Setup:** [use uc-debug-payload with params X, Y, Z]
**Steps:**
1. [step]
2. [step]
**Expected:** [what to verify]

### Scenario 2: [name]
...
```

---

## Step 6 — Save to Memory

Save the analysis to yax:
```
yax_save:
  title: "TEP3-XXXXX Analysis - [short summary]"
  project: "cart-checkout-tep3"
  session_id: "tep3-xxxxx-analysis-YYYYMMDD"
  type: "discovery"
```
