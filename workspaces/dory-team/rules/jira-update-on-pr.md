# Jira Update on PR Submission

After a successful PR review, update the associated Jira ticket with PR link, status transition, and label.

## When This Rule Activates

- After the code review agent produces a verdict of ✅ APPROVED or 🟡 APPROVED WITH WARNINGS
- The user confirms they want to update Jira

**Never activate when:**
- Verdict is 🔴 CHANGES REQUESTED (tell user to fix issues first)
- User explicitly says "skip Jira" or "no ticket"

---

## Process

### Step 1: Extract Ticket ID

Search for `COM-\d+` in this order:

1. **Branch name:** `git branch --show-current` → extract `COM-XXXXX`
   - Patterns: `feature/COM-63500-description`, `COM-63500/fix-login`, `COM-63500`
2. **PR title:** If using GitHub MCP, check PR title
3. **Ask user:** If not found, ask: "What COM ticket is this PR for? (or 'skip' to proceed without Jira update)"

### Step 2: Confirm with User

Present the planned actions:

```
Review passed. Update Jira ticket COM-63500?

Actions:
  1. Add comment with PR link
  2. Transition ticket to "Review" status
  3. Add label "pr-submitted"

Proceed? (yes/no/skip)
```

**Wait for explicit confirmation.** Never update Jira without user approval.

### Step 3: Execute Jira Updates

On user confirmation, execute in this order:

#### 3a. Add PR Comment

Use `@jira-cloud/*` (for `disneyexperiences.atlassian.net`) or `@jira/*` tools:

**Comment format:**
```
*PR:* https://github.disney.com/wdpro-automation/{repo}/pull/{number}
```

Where:
- `{repo}` = `standalone_tickets` or `jenkins-config` (detected from the files in the diff)
- `{number}` = PR number (from GitHub MCP) or ask user

If PR number is not available (local review without GitHub MCP):
```
*PR:* https://github.disney.com/wdpro-automation/{repo}/pull/{branch_name}
```

Or ask the user for the PR URL.

#### 3b. Transition to "Review" Status

Use the Jira transition tool to move the ticket:

```
Transition issue COM-XXXXX to "Review"
```

**Notes:**
- The target status name is "Review" — the Jira MCP will find the correct transition ID
- If the transition fails (ticket already in Review, or status doesn't exist), report the error gracefully
- Do NOT fail the entire flow if transition fails — still add comment and label

#### 3c. Add Label `pr-submitted`

Add the label `pr-submitted` to the ticket:

```
Add label "pr-submitted" to COM-XXXXX
```

**Notes:**
- If the label already exists on the ticket, this is a no-op (safe to re-run)
- Do NOT remove existing labels — only add

### Step 4: Report Result

After all three actions:

```
✓ Jira updated: COM-63500
  • Comment added: PR link
  • Status: → Review
  • Label: + pr-submitted
```

If any action failed:

```
⚠️ Jira partially updated: COM-63500
  • Comment added: ✓
  • Status transition: ✗ (ticket may already be in Review)
  • Label: ✓
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Ticket not found | Ask user to verify ticket ID |
| Jira MCP unavailable | Print the comment text for manual paste: "Add this to COM-XXXXX: *PR:* ..." |
| Transition fails | Report warning, continue with other updates |
| Permission denied | Report error, suggest user update manually |
| Already in Review | Report as info (no-op), continue |

---

## MCP Tool Selection

| Jira Instance | Tools to Use |
|---------------|-------------|
| `disneyexperiences.atlassian.net` | `@jira-cloud/*` (Atlassian Cloud) |
| `jira.disney.com` | `@jira/*` (Data Center) |

The Dory team uses **Atlassian Cloud** (`disneyexperiences.atlassian.net`), so prefer `@jira-cloud/*` tools.

---

## When Verdict is CHANGES REQUESTED

Do NOT update Jira. Instead, report:

```
🔴 Review: Changes requested — {N} critical issues must be fixed before PR submission.

Jira update skipped. Fix the issues and re-run the review.
```

---

## Language

Always write Jira-related messages in English.
