# TxP Team Standards

## Code Review SLA

- PRs reviewed within 4 business hours
- At least 2 peer approvals + 1 lead approval required (3 total)
- Automated review (f-thumper) runs on every push

## Branch Naming

- Feature: `ROS-{ticket}` (e.g., `ROS-105051`)
- Bugfix: `fix/ROS-{ticket}-{short-description}`
- Hotfix: `hotfix/ROS-{ticket}-{short-description}`

## Commit Convention

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`
- Include JIRA ticket in PR title: `[ROS-{ticket}] type: description`

## Deployment

- Dev: auto-deploy on merge to `develop`
- Stage: manual trigger via Harness
- Prod: requires 2 approvals + QA sign-off

## PR Requirements

- All PRs must reference a JIRA ticket in branch name, title, or description
- 722+ tests passing (current baseline)
- 0 lint errors, 0 build errors
- 90%+ statement/line coverage on new code
- Verified with real `roomForm_jar` cookies from latest environment when touching cookie logic

## Package Management

- Always use `npm` (never `npx`)
- `@wdpr/` scoped packages: use `^` (caret) for minor updates
- All other packages: use `~` (tilde) for patch-only updates
