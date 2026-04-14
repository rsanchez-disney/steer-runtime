# Payments Core Team Standards

## Code Review SLA
- PRs reviewed within 4 business hours
- At least 1 approval required from senior dev

## Branch Naming
- Feature: `feat/DPAY-{ticket}-{short-description}`
- Bugfix: `fix/DPAY-{ticket}-{short-description}`
- Hotfix: `hotfix/DPAY-{ticket}-{short-description}`

## Deployment
- Dev: auto-deploy on merge to `develop`
- Stage: manual trigger via Harness
- Prod: requires 2 approvals + QA sign-off
