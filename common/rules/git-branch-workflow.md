# Git Branch Workflow

Before making any changes to the codebase (fixes, features, refactors):

1. **Sync the default branch**: `git checkout main && git pull` (or `develop` if the repo uses that convention)
2. **Create a feature branch** following the workspace or repo naming convention. Common patterns:
   - `fix/{TICKET-ID}-description`
   - `feat/{TICKET-ID}-description`
   - `refactor/{TICKET-ID}-description`
   - `test/{TICKET-ID}-description`
3. Only then proceed with code changes

If the repo has a specific branch naming convention in its steering or README, follow that instead.

Do NOT make changes directly on the default branch.
