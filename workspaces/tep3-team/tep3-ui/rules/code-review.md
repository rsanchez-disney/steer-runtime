# Process to Create a Pull Request (UI)

**Follow these steps in order:**

1. Prompt for the Jira ticket number (the "original ticket").
2. The Jira ticket may be a "Task" type. Search for "implements" linked issues.
   - If there is an "implements" linked issue of type "Story", read its Description for the full ACs/BRs.
   - Otherwise, use the original ticket.
3. Create a branch with the name of the original "Task" type Jira ticket number if the branch does not exist. Don't check remote branches.
4. Display local file changes and prompt me to confirm which to include. Do not stage empty files. Ignore untracked files.
5. Add confirmed changes to the branch, commit, and push. Do not commit unapproved files.
6. Run the project's lint and test commands:
   - **uc-spa / cart-ui (Angular):** `npm run lint` then `npm run test`
   - **com-uc-ui-components (Polymer):** `npm run lint` then `npm run test`
   - **cart-api (Node/Restify):** `npm run lint` then `npm run test`
   - **uc-api (Node/TS):** `npm run lint` then `npm run test`
   - If issues occur, list them. For each, ask if I want to address or skip.
   - If addressing: show proposed changes, wait for my approval before modifying code.
   - Once all issues are resolved, re-run to confirm clean.
7. Prompt for the target branch (usually `develop`).
8. Review the code changes compared to the target branch. Look for:
   - Accessibility compliance (WCAG 2.2 AA)
   - Null/undefined handling
   - Missing or inadequate unit tests
   - Code style consistency with existing patterns
   - Proper error handling and propagation
   - Security issues (XSS, input validation)
   - Newly added, unused code
   - Backward compatibility (will this break existing non-TEP3 flows?)
   - For each issue found, ask if I want to address or skip.
   - Show proposed changes, wait for explicit approval.
9. Determine the repo owner for the PR target:
   - **uc-spa:** `wdpr-unified-checkout/wdpr-ecommerce-uc-spa`
   - **com-uc-ui-components:** `dprd-web-components-cart/com-uc-ui-components`
   - **cart-ui:** `wdprd-development/wdpr-ecommerce-wdpr-cart-ui`
   - **cart-api:** `wdprd-development/wdpr-ecommerce-wdpr-cart-api`
   - **uc-api:** `wdpr-unified-checkout/wdpr-ecommerce-uc-api`
10. Create a draft pull request with this structure:

```markdown
# [Ticket title from Jira]

## What
- [Concise bullet points of what changed and why]

### Note
- [Any caveats, things left unchanged, or context] (Suggest and prompt for additional comments)

## Jira ticket
- https://disneyexperiences.atlassian.net/browse/TEP3-XXXXX

## Evidence
[Screenshots showing the fix/feature working — before/after if applicable]

## Related PRs
- [Links to PRs in other repos if cross-repo change]

## Lint
[Screenshot of clean lint output]

## Test
[Screenshot of passing tests]

## How to Test
[Instructions for QA — use tep3-qa-instructions skill to generate these]
```

11. Add a code review comment titled "Review by Kiro" with:
    - Potential bugs or issues identified
    - Suggestions for improvements
    - Missing tests or documentation
    - Approval or rejection with reasons
    - Do not submit the review.
12. Update the original Jira ticket:
    - Add the PR link to "Pull Request" field (customfield_21707), or "Evidence of Completion" (customfield_20800) if unavailable.
    - Transition to "In Review" (or "Peer Review").
    - Add comment indicating PR is ready for review.
    - Add "AI-Peer-Reviewed" label.
    - Add "Kiro" to "AI Tools Used" field (customfield_27202).
13. Prompt for AI metrics:
    - Ask for AI Assisted Effort (show current Story Points as reference).
    - Update "AI Assisted Effort" field (customfield_27200).
    - Ask for AI Usage Level (Low / Medium / High).
    - Update "AI Usage Level" field (customfield_27201).
14. Open the PR link in the browser.

---

## For com-uc-ui-components PRs specifically:

Before step 5, also ensure:
- `CHANGELOG.md` is updated with the change description
- `package.json` version is bumped
- Demo page updated if new visual behavior is introduced

---

## Updating an existing PR:

1. Display local changes, prompt to confirm.
2. Review changes vs target branch (same checks as step 8).
3. Commit and push to the existing branch.
4. Update the PR description if scope changed.
