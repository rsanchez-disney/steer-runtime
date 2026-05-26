# Cart & Checkout TEP3 Team Standards

## Code Review SLA
- PRs reviewed within 4 business hours
- At least 1 approval required from senior dev

## Branch Naming
- Feature: `feat/TEP3-{ticket}`
- Bugfix: `fix/TEP3-{ticket}`
- Hotfix: `hotfix/TEP3-{ticket}`

## Deployment
- Dev: auto-deploy on merge to `develop`
- Stage: manual trigger via Harness
- Prod: requires 2 approvals + QA sign-off
